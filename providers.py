"""
providers.py - AI provider catalog and universal API caller
Author: Sachin Chaudhary

Each entry contains rich metadata expected by the Streamlit UI:
- description        short marketing line
- free_tier          free / paid / mixed
- placeholder        text-input placeholder
- get_key_url        signup link
- local_only         True for Ollama / LM Studio / llama.cpp
- base_url           API endpoint
- type               transport: openai_compat | anthropic | gemini
- free_models        dict { display_label: model_id, ... }
- paid_models        dict { display_label: model_id, ... }
- needs_key          False for local servers
"""

import json
import urllib.request
import urllib.error
import time


def _error_hint(status, body, provider):
    try:
        body_text = json.dumps(body) if isinstance(body, (dict, list)) else str(body)
    except Exception:
        body_text = str(body)
    if status == 401:
        return f"{provider} says your API key is invalid or expired. Re-check the key in the sidebar."
    if status == 403:
        return f"{provider} reports a permission issue. Make sure your account is verified or the model is enabled."
    if status == 404:
        return f"The selected model could not be found on {provider}. Try another model - Auto Free Router is a safe pick."
    if status == 429:
        return f"{provider} rate limit reached. Wait a few seconds, switch to a free tier, or try a different model."
    if status in (500, 502, 503, 504):
        return f"{provider} is having a temporary outage. Retry shortly or switch providers."
    return f"{provider} returned HTTP {status}: {body_text[:300]}"


def _req(url, headers, payload, timeout):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8", errors="replace")
            return r.status, raw
    except urllib.error.HTTPError as e:
        raw = ""
        if hasattr(e, "read"):
            try:
                raw = e.read().decode("utf-8", errors="replace")
            except Exception:
                raw = ""
        return e.code, raw
    except urllib.error.URLError as e:
        return 0, str(e.reason)


def _call_openai_compat(base, api_key, model, messages, temperature, max_tokens, timeout):
    url = f"{base.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    status, raw = _req(url, headers, payload, timeout)
    if status >= 400 or status == 0:
        return False, f"HTTP {status}: {raw[:300]}", ""
    try:
        obj = json.loads(raw)
        reply = obj["choices"][0]["message"]["content"]
        return True, "", reply
    except Exception:
        return True, "", raw


def _call_anthropic(base, api_key, model, messages, temperature, max_tokens, timeout):
    url = f"{base.rstrip('/')}/v1/messages"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key or "",
        "anthropic-version": "2023-06-01",
    }
    sys_text = ""
    convo = []
    for m in messages:
        if m["role"] == "system":
            sys_text += m["content"] + "\n"
        else:
            convo.append({"role": m["role"], "content": m["content"]})
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": sys_text.strip(),
        "messages": convo,
    }
    status, raw = _req(url, headers, payload, timeout)
    if status >= 400 or status == 0:
        return False, f"HTTP {status}: {raw[:300]}", ""
    try:
        obj = json.loads(raw)
        reply = obj["content"][0]["text"]
        return True, "", reply
    except Exception:
        return True, "", raw


def _call_gemini(base, api_key, model, messages, temperature, max_tokens, timeout):
    url = f"{base.rstrip('/')}/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    sys_text = ""
    convo = []
    for m in messages:
        if m["role"] == "system":
            sys_text += m["content"] + "\n"
        else:
            role = "user" if m["role"] == "user" else "model"
            convo.append({"role": role, "parts": [{"text": m["content"]}]})
    payload = {
        "contents": convo,
        "systemInstruction": {"parts": [{"text": sys_text.strip()}]},
        "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens},
    }
    status, raw = _req(url, headers, payload, timeout)
    if status >= 400 or status == 0:
        return False, f"HTTP {status}: {raw[:300]}", ""
    try:
        obj = json.loads(raw)
        reply = obj["candidates"][0]["content"]["parts"][0]["text"]
        return True, "", reply
    except Exception:
        return True, "", raw


def call_api(provider, api_key, model, messages, temperature=0.4, max_tokens=2000):
    """
    Universal dispatcher. messages is a list of {role, content}.
    Returns (ok: bool, err: str, reply: str).
    """
    info = PROVIDERS.get(provider)
    if info is None:
        return False, f"Unknown provider: {provider}", ""

    needs_key = info.get("needs_key", True)
    if needs_key and (api_key is None or str(api_key).strip() == ""):
        return False, f"{provider} requires an API key.", ""

    transport = info.get("type", "openai_compat")
    base = info["base_url"]
    timeout = info.get("timeout", 60)

    try:
        if transport == "anthropic":
            ok, err, reply = _call_anthropic(base, api_key, model, messages, temperature, max_tokens, timeout)
        elif transport == "gemini":
            ok, err, reply = _call_gemini(base, api_key, model, messages, temperature, max_tokens, timeout)
        else:
            ok, err, reply = _call_openai_compat(base, api_key, model, messages, temperature, max_tokens, timeout)
    except Exception as e:
        return False, f"Network error: {e}", ""

    if not ok:
        try:
            status = int(err.split("HTTP ")[1].split(":")[0].strip())
        except (IndexError, ValueError, AttributeError):
            status = 0
        return False, _error_hint(status, err, provider), ""

    return True, "", reply


def list_models(provider):
    info = PROVIDERS.get(provider, {})
    fm = info.get("free_models", {})
    pm = info.get("paid_models", {})
    return list(fm.items()) + list(pm.items())


PROVIDERS = {
    "OpenRouter": {
        "description": "OpenRouter — one API key, 200+ models. Best for beginners.",
        "free_tier": "Free + Paid (Auto Free Router recommended)",
        "placeholder": "sk-or-v1-...",
        "get_key_url": "https://openrouter.ai/keys",
        "local_only": False,
        "base_url": "https://openrouter.ai/api/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "Auto Free Router": "openrouter/free",
            "Llama 4 Scout 109B": "meta-llama/llama-4-scout:free",
            "Llama 4 Maverick 400B": "meta-llama/llama-4-maverick:free",
            "DeepSeek R1 0528": "deepseek/deepseek-r1-0528:free",
            "Qwen3 235B A22B": "qwen/qwen3-235b-a22b:free",
            "Microsoft Phi-4": "microsoft/phi-4:free",
            "Gemini 2.0 Flash Exp": "google/gemini-2.0-flash-exp:free",
            "Gemma 4 31B": "google/gemma-4-31b-it:free",
            "Gemma 4 26B A4B": "google/gemma-4-26b-a4b-it:free",
            "Nemotron 3 Ultra 550B": "nvidia/nemotron-3-ultra-550b-a55b:free",
            "Nemotron 3 Super 120B": "nvidia/nemotron-3-super-120b-a12b:free",
            "Cohere North Mini Code": "cohere/north-mini-code:free",
            "Nex N2 Pro": "nex-agi/nex-n2-pro:free",
        },
        "paid_models": {
            "GPT-5.5 Pro": "openai/gpt-5.5-pro",
            "GPT-5.5": "openai/gpt-5.5",
            "GPT-5.4": "openai/gpt-5.4",
            "GPT-5.4 Mini": "openai/gpt-5.4-mini",
            "GPT-5.4 Nano": "openai/gpt-5.4-nano",
            "GPT-4.1": "openai/gpt-4.1",
            "GPT-4o": "openai/gpt-4o",
            "GPT-4o Mini": "openai/gpt-4o-mini",
            "Claude Fable 5": "anthropic/claude-fable-5",
            "Claude Opus 4.8": "anthropic/claude-opus-4.8",
            "Claude Opus 4.7": "anthropic/claude-opus-4.7",
            "Claude Sonnet 4.6": "anthropic/claude-sonnet-4.6",
            "Claude Haiku 4.5": "anthropic/claude-haiku-4-5-20251001",
            "DeepSeek V4 Pro": "deepseek/deepseek-v4-pro",
            "DeepSeek V4 Flash": "deepseek/deepseek-v4-flash",
            "Gemini 3.5 Flash": "google/gemini-3.5-flash",
            "Gemini 3.1 Pro Preview": "google/gemini-3.1-pro-preview",
            "Gemini 3.1 Flash Lite": "google/gemini-3.1-flash-lite",
            "Gemini 2.5 Pro": "google/gemini-2.5-pro",
            "Grok 4.3": "x-ai/grok-4.3",
            "Grok 4.20 Reasoning": "x-ai/grok-4.20-reasoning",
            "Grok 4.20 Multi-Agent": "x-ai/grok-4.20-multi-agent",
            "Qwen3.7 Max": "qwen/qwen3.7-max",
            "Qwen3.7 Plus": "qwen/qwen3.7-plus",
            "Qwen3.6 Max Preview": "qwen/qwen3.6-max-preview",
            "Mistral Medium 3.5": "mistralai/mistral-medium-3-5",
            "Mistral Small 4": "mistralai/mistral-small-4",
            "Kimi K2.6": "moonshotai/kimi-k2.6",
            "MiniMax M3": "minimax/minimax-m3",
            "Nemotron 3 Ultra 550B": "nvidia/nemotron-3-ultra-550b-a55b",
            "OpenRouter Fusion": "openrouter/fusion",
            "OpenRouter Auto Router": "openrouter/auto",
            "Mythos Preview": "anthropic/claude-mythos-preview",
        },
    },
    "NVIDIA Build": {
        "description": "NVIDIA NIM — enterprise-grade free inference on Llama, Gemma, Mistral, DeepSeek, Nemotron, Kimi, Qwen.",
        "free_tier": "Free (Llama, Gemma, DeepSeek, Nemotron, Mistral, Step, GLM, MiniMax, Moonshot)",
        "placeholder": "nvapi-...",
        "get_key_url": "https://build.nvidia.com",
        "local_only": False,
        "base_url": "https://integrate.api.nvidia.com/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "MiniMax M3 (Preview)": "minimax/minimax-m3",
            "MiniMax M2.7 (230B)": "minimax/minimax-m2.7",
            "Google DiffGemma 26B A4B": "google/diffusiongemma-26b-a4b-it",
            "Google Gemma 4 31B Instruct": "google/gemma-4-31b-it",
            "Google Gemma 3N E4B": "google/gemma-3n-e4b-it",
            "Google Gemma 3N E2B": "google/gemma-3n-e2b-it",
            "Google Gemma 2 2B": "google/gemma-2-2b-it",
            "Google Paligemma": "google/paligemma",
            "NVIDIA Nemotron 3 Ultra 550B A55B": "nvidia/nemotron-3-ultra-550b-a55b",
            "NVIDIA Nemotron 3 Super 120B A12B": "nvidia/nemotron-3-super-120b-a12b",
            "NVIDIA Nemotron 3 Nano Omni 30B A3B": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
            "NVIDIA Nemotron 3 Nano 30B A3B": "nvidia/nemotron-3-nano-30b-a3b",
            "NVIDIA Nemotron 3.5 Content Safety": "nvidia/nemotron-3.5-content-safety",
            "NVIDIA Nemotron 3 Content Safety": "nvidia/nemotron-3-content-safety",
            "NVIDIA Nemotron Content Safety Reasoning 4B": "nvidia/nemotron-content-safety-reasoning-4b",
            "NVIDIA Nemotron Cosmos Reason 2 8B (Partner)": "nvidia/cosmos-reason2-8b",
            "NVIDIA Cosmos 3 Nano Reasoner (VLM)": "nvidia/cosmos3-nano-reasoner",
            "NVIDIA Ising Calibration 1 35B A3B (VLM)": "nvidia/ising-calibration-1-35b-a3b",
            "NVIDIA Nemotron Nano 12B V2 VL (VLM)": "nvidia/nemotron-nano-12b-v2-vl",
            "NVIDIA Nemotron Nano 9B V2": "nvidia/nvidia-nemotron-nano-9b-v2",
            "NVIDIA Nemotron Mini 4B Instruct": "nvidia/nemotron-mini-4b-instruct",
            "NVIDIA Nemotron Parse (Partner)": "nvidia/nemotron-parse",
            "NVIDIA Nemoretriever Parse (Partner)": "nvidia/nemoretriever-parse",
            "NVIDIA Llama 3.3 Nemotron Super 49B V1.5": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
            "NVIDIA Llama 3.3 Nemotron Super 49B V1": "nvidia/llama-3.3-nemotron-super-49b-v1",
            "NVIDIA Llama 3.1 Nemotron Nano VL 8B V1": "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
            "NVIDIA Llama 3.1 Nemotron Nano 8B V1": "nvidia/llama-3.1-nemotron-nano-8b-v1",
            "NVIDIA Llama 3.1 Nemotron Safety Guard 8B V3": "nvidia/llama-3.1-nemotron-safety-guard-8b-v3",
            "NVIDIA NV Embed Code 7B V1": "nvidia/nv-embedcode-7b-v1",
            "NVIDIA NV Embed V1": "nvidia/nv-embed-v1",
            "NVIDIA Rerank QA Mistral 4B": "nvidia/rerank-qa-mistral-4b",
            "Meta Llama 3.3 70B Instruct": "meta/llama-3.3-70b-instruct",
            "Meta Llama 3.1 70B Instruct": "meta/llama-3.1-70b-instruct",
            "Meta Llama 3.1 8B Instruct": "meta/llama-3.1-8b-instruct",
            "Meta Llama 4 Maverick 17B 128E Instruct": "meta/llama-4-maverick-17b-128e-instruct",
            "Meta Llama Guard 4 12B": "meta/llama-guard-4-12b",
            "DeepSeek V4 Pro (671B MoE)": "deepseek-ai/deepseek-v4-pro",
            "DeepSeek V4 Flash (284B MoE)": "deepseek-ai/deepseek-v4-flash",
            "Mistral Medium 3.5 128B": "mistralai/mistral-medium-3.5-128b",
            "Mistral Small 4 119B 2603": "mistralai/mistral-small-4-119b-2603",
            "Mistral Large 3 675B Instruct 2512": "mistralai/mistral-large-3-675b-instruct-2512",
            "Mistral Ministral 14B Instruct 2512": "mistralai/ministral-14b-instruct-2512",
            "Mistral Nemotron": "mistralai/mistral-nemotron",
            "Mistral Mixtral 8x7B Instruct V0.1": "mistralai/mixtral-8x7b-instruct-v0.1",
            "Microsoft Phi 4 Mini Instruct": "microsoft/phi-4-mini-instruct",
            "Microsoft Phi 4 Multimodal Instruct": "microsoft/phi-4-multimodal-instruct",
            "OpenAI GPT OSS 20B": "openai/gpt-oss-20b",
            "OpenAI GPT OSS 120B": "openai/gpt-oss-120b",
            "Qwen 3.5 122B A10B": "qwen/qwen3.5-122b-a10b",
            "Qwen 3.5 397B A17B": "qwen/qwen3.5-397b-a17b",
            "Qwen 3 Next 80B A3B Instruct": "qwen/qwen3-next-80b-a3b-instruct",
            "Moonshot Kimi K2 (1T MoE)": "moonshotai/kimi-k2.6",
            "Stepfun Step 3.7 Flash": "stepfun-ai/step-3.7-flash",
            "Stepfun Step 3.5 Flash": "stepfun-ai/step-3.5-flash",
            "Z.ai GLM 5.1": "z-ai/glm-5.1",
            "ByteDance Seed OSS 36B Instruct": "bytedance/seed-oss-36b-instruct",
            "Stockmark Stockmark 2 100B Instruct": "stockmark/stockmark-2-100b-instruct",
            "Sarvam AI Sarvam M": "sarvamai/sarvam-m",
            "Abacus.AI Dracarys Llama 3.1 70B": "abacusai/dracarys-llama-3.1-70b-instruct",
            "Upstage Solar 10.7B Instruct": "upstage/solar-10.7b-instruct",
            "NVIDIA Llama Nemotron Rerank VL 1B V2 (Partner)": "nvidia/llama-nemotron-rerank-vl-1b-v2",
            "NVIDIA Llama Nemotron Rerank 1B V2 (Partner)": "nvidia/llama-nemotron-rerank-1b-v2",
        },
        "paid_models": {},
    },
    "Groq": {
        "description": "Groq — fastest LPU inference in the world. Best for speed-critical tasks.",
        "free_tier": "Free (Llama 3.3 70B, DeepSeek R1 Distill, GPT OSS)",
        "placeholder": "gsk_...",
        "get_key_url": "https://console.groq.com/keys",
        "local_only": False,
        "base_url": "https://api.groq.com/openai/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "Llama 3.3 70B Versatile": "llama-3.3-70b-versatile",
            "Llama 3.1 8B Instant": "llama-3.1-8b-instant",
            "DeepSeek R1 Distill 70B": "deepseek-r1-distill-llama-70b",
            "Mixtral 8x7B": "mixtral-8x7b-32768",
            "Llama Guard 4 12B": "llama-guard-4-12b",
            "GPT OSS 120B": "openai/gpt-oss-120b",
            "GPT OSS 20B": "openai/gpt-oss-20b",
            "Groq Compound": "groq/compound",
            "Groq Compound Mini": "groq/compound-mini",
        },
        "paid_models": {},
    },
    "Google Gemini": {
        "description": "Google Gemini — 2.5 Flash is free with generous limits. Strong multimodal.",
        "free_tier": "Free + Paid (2.5 Flash, 2.0 Flash free)",
        "placeholder": "AIza...",
        "get_key_url": "https://aistudio.google.com/apikey",
        "local_only": False,
        "base_url": "https://generativelanguage.googleapis.com",
        "type": "gemini",
        "needs_key": True,
        "free_models": {
            "Gemini 2.5 Flash": "gemini-2.5-flash",
            "Gemini 2.0 Flash": "gemini-2.0-flash",
            "Gemini 2.0 Flash-Lite": "gemini-2.0-flash-lite",
        },
        "paid_models": {
            "Gemini 2.5 Pro": "gemini-2.5-pro",
            "Gemini 1.5 Pro": "gemini-1.5-pro",
        },
    },
    "Anthropic": {
        "description": "Anthropic Claude — top-quality reasoning for nuanced resume work.",
        "free_tier": "Paid only",
        "placeholder": "sk-ant-...",
        "get_key_url": "https://console.anthropic.com",
        "local_only": False,
        "base_url": "https://api.anthropic.com",
        "type": "anthropic",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "Claude Fable 5": "claude-fable-5",
            "Claude Opus 4.8": "claude-opus-4-8",
            "Claude Opus 4.7": "claude-opus-4-7",
            "Claude Opus 4.6": "claude-opus-4-6",
            "Claude Sonnet 4.6": "claude-sonnet-4-6",
            "Claude Sonnet 4.5": "claude-sonnet-4-5-20250929",
            "Claude Haiku 4.5": "claude-haiku-4-5-20251001",
        },
    },
    "OpenAI": {
        "description": "OpenAI — GPT-5.5, GPT-5.4, o-series. Gold standard for many tasks.",
        "free_tier": "Paid only (credits included)",
        "placeholder": "sk-...",
        "get_key_url": "https://platform.openai.com/api-keys",
        "local_only": False,
        "base_url": "https://api.openai.com/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "GPT-5.5 Pro": "gpt-5.5-pro",
            "GPT-5.5": "gpt-5.5",
            "GPT-5.4": "gpt-5.4",
            "GPT-5.4 Mini": "gpt-5.4-mini",
            "GPT-5.4 Nano": "gpt-5.4-nano",
            "GPT-4.1": "gpt-4.1",
            "GPT-4o": "gpt-4o",
            "GPT-4o Mini": "gpt-4o-mini",
            "o4 Mini": "o4-mini",
            "o3 Mini": "o3-mini",
        },
    },
    "DeepSeek": {
        "description": "DeepSeek — V4 Pro + V4 Flash at very low cost. V3/R1 deprecating July 2026.",
        "free_tier": "Paid (very cheap)",
        "placeholder": "sk-...",
        "get_key_url": "https://platform.deepseek.com",
        "local_only": False,
        "base_url": "https://api.deepseek.com/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "DeepSeek V4 Pro": "deepseek-v4-pro",
            "DeepSeek V4 Flash": "deepseek-v4-flash",
            "DeepSeek Chat (V3, deprecated)": "deepseek-chat",
            "DeepSeek Reasoner (R1, deprecated)": "deepseek-reasoner",
        },
    },
    "Mistral": {
        "description": "Mistral — European frontier models: Medium 3.5, Small 4, Large 3, Codestral.",
        "free_tier": "Paid (free trial available)",
        "placeholder": "...",
        "get_key_url": "https://console.mistral.ai",
        "local_only": False,
        "base_url": "https://api.mistral.ai/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "Mistral Medium 3.5": "mistral-medium-3-5",
            "Mistral Large 3": "mistral-large-3",
            "Mistral Small 4": "mistral-small-4",
            "Ministral 3 14B": "ministral-3-14b",
            "Ministral 3 8B": "ministral-3-8b",
            "Ministral 3 3B": "ministral-3-3b",
            "Codestral": "codestral-latest",
            "Codestral Embed": "codestral-embed",
        },
    },
    "Together AI": {
        "description": "Together AI — fast open-model hosting with generous free tier.",
        "free_tier": "Free + Paid",
        "placeholder": "...",
        "get_key_url": "https://api.together.xyz",
        "local_only": False,
        "base_url": "https://api.together.xyz/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "Llama 3.3 70B Turbo": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "DeepSeek R1": "deepseek-ai/DeepSeek-R1",
            "Qwen 2.5 72B Turbo": "Qwen/Qwen2.5-72B-Instruct-Turbo",
            "Qwen3 32B": "Qwen/Qwen3-32B",
        },
        "paid_models": {
            "Mixtral 8x22B": "mistralai/Mixtral-8x22B-Instruct-v0.1",
            "Llama 4 Maverick 400B": "meta-llama/Llama-4-Maverick-400B-Instruct",
        },
    },
    "Perplexity": {
        "description": "Perplexity Sonar — live web search built into every model call.",
        "free_tier": "Paid only",
        "placeholder": "pplx-...",
        "get_key_url": "https://www.perplexity.ai/settings/api",
        "local_only": False,
        "base_url": "https://api.perplexity.ai",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "Sonar Pro": "sonar-pro",
            "Sonar": "sonar",
            "Sonar Reasoning Pro": "sonar-reasoning-pro",
            "Sonar Deep Research": "sonar-deep-research",
        },
    },
    "xAI Grok": {
        "description": "xAI Grok — witty, fast, strong on real-time awareness. Grok 4.3 & 4.20.",
        "free_tier": "Paid (free credits)",
        "placeholder": "xai-...",
        "get_key_url": "https://console.x.ai",
        "local_only": False,
        "base_url": "https://api.x.ai/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "Grok 4.3": "grok-4.3",
            "Grok 4.20 Reasoning": "grok-4.20-reasoning",
            "Grok 4.20 Non-Reasoning": "grok-4.20-non-reasoning",
            "Grok 4.20 Multi-Agent": "grok-4.20-multi-agent",
            "Grok 3": "grok-3",
            "Grok 3 Mini": "grok-3-mini",
            "Grok 2": "grok-2",
        },
    },
    "Cohere": {
        "description": "Cohere — Command A+ for agents, RAG, and reasoning. Multilingual Aya.",
        "free_tier": "Paid (free trial)",
        "placeholder": "...",
        "get_key_url": "https://dashboard.cohere.com",
        "local_only": False,
        "base_url": "https://api.cohere.com/v2",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {},
        "paid_models": {
            "Command A+": "command-a-plus-05-2026",
            "Command A": "command-a-03-2025",
            "Command A Reasoning": "command-a-reasoning-08-2025",
            "Command A Translate": "command-a-translate-08-2025",
            "Command A Vision": "command-a-vision-07-2025",
            "Command R7B": "command-r7b-12-2024",
            "Command R+": "command-r-plus-08-2024",
            "Aya Expanse 32B": "c4ai-aya-expanse-32b",
            "Tiny Aya (70 langs)": "tiny-aya-global",
        },
    },
    "Hugging Face": {
        "description": "Hugging Face Router — open-source models, free to start.",
        "free_tier": "Free tier available",
        "placeholder": "hf_...",
        "get_key_url": "https://huggingface.co/settings/tokens",
        "local_only": False,
        "base_url": "https://router.huggingface.co/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "Llama 3.3 70B": "meta-llama/Llama-3.3-70B-Instruct",
            "Llama 3.1 8B": "meta-llama/Llama-3.1-8B-Instruct",
            "Qwen 2.5 72B": "Qwen/Qwen2.5-72B-Instruct",
            "Mistral 7B": "mistralai/Mistral-7B-Instruct-v0.3",
            "Gemma 4 9B": "google/gemma-4-9b-it",
            "Phi 3.5 Medium": "microsoft/Phi-3.5-medium-instruct",
        },
        "paid_models": {},
    },
    "Ollama (Local)": {
        "description": "Ollama — run Llama, Gemma, Phi, Qwen, DeepSeek on your own machine.",
        "free_tier": "100% Free / Offline",
        "placeholder": "Not required",
        "get_key_url": "https://ollama.com/download",
        "local_only": True,
        "base_url": "http://localhost:11434/v1",
        "type": "openai_compat",
        "needs_key": False,
        "free_models": {
            "Llama 3.3": "llama3.3",
            "Llama 3.2": "llama3.2",
            "Gemma 2 27B": "gemma2:27b",
            "Gemma 2 9B": "gemma2:9b",
            "Phi 3 Medium": "phi3:medium",
            "Mistral": "mistral",
            "Qwen 2.5": "qwen2.5",
            "DeepSeek R1 7B": "deepseek-r1:7b",
            "Code Llama": "codellama",
            "Custom Model...": "__custom__",
        },
        "paid_models": {},
    },
    "Ollama Cloud": {
        "description": "Ollama Cloud — hosted inference for frontier open models (Llama, DeepSeek, Qwen, Mistral, Gemma, Phi, GPT OSS). 1M free tokens / month at signup.",
        "free_tier": "Free + Paid (1M tokens/month free at ollama.com)",
        "placeholder": "ollama_...",
        "get_key_url": "https://ollama.com/settings/keys",
        "local_only": False,
        "base_url": "https://ollama.com/v1",
        "type": "openai_compat",
        "needs_key": True,
        "free_models": {
            "Auto Router": "auto",
            "GPT OSS 120B": "gpt-oss:120b",
            "GPT OSS 20B": "gpt-oss:20b",
            "DeepSeek V3.1 671B": "deepseek-v3.1:671b",
            "DeepSeek R1 70B": "deepseek-r1:70b",
            "DeepSeek R1 8B": "deepseek-r1:8b",
            "Qwen 3 480B": "qwen3:480b",
            "Qwen 3 235B": "qwen3:235b",
            "Qwen 3 80B": "qwen3:80b",
            "Qwen 3 32B": "qwen3:32b",
            "Qwen 2.5 72B": "qwen2.5:72b",
            "Qwen 2.5 32B": "qwen2.5:32b",
            "Qwen 2.5 14B": "qwen2.5:14b",
            "Qwen 2.5 7B": "qwen2.5:7b",
            "Mistral Large 3 675B": "mistral-large-3:675b",
            "Mistral Medium 3 128B": "mistral-medium-3:128b",
            "Mistral Small 4 119B": "mistral-small-4:119b",
            "Mixtral 8x7B": "mixtral:8x7b",
            "Llama 4 Maverick 400B": "llama4:maverick",
            "Llama 4 Scout 109B": "llama4:scout",
            "Llama 3.3 70B": "llama3.3:70b",
            "Llama 3.3 8B": "llama3.3:8b",
            "Llama 3.2 90B Vision": "llama3.2:90b-vision",
            "Llama 3.2 11B Vision": "llama3.2:11b-vision",
            "Llama 3.2 3B": "llama3.2:3b",
            "Llama 3.2 1B": "llama3.2:1b",
            "Llama 3.1 70B": "llama3.1:70b",
            "Llama 3.1 8B": "llama3.1:8b",
            "Gemma 3 27B": "gemma3:27b",
            "Gemma 3 12B": "gemma3:12b",
            "Gemma 3 4B": "gemma3:4b",
            "Gemma 2 27B": "gemma2:27b",
            "Gemma 2 9B": "gemma2:9b",
            "Phi 4 14B": "phi4:14b",
            "Phi 4 Mini 3.8B": "phi4-mini:3.8b",
            "Phi 3 Medium 14B": "phi3:medium",
            "MiniMax M3": "minimax:minimax-m3",
            "Nemotron Mini 4B": "nemotron-mini:4b",
            "Command R+": "command-r-plus",
            "CodeLlama 70B": "codellama:70b",
            "CodeLlama 34B": "codellama:34b",
            "CodeLlama 13B": "codellama:13b",
            "Custom Model...": "__custom__",
        },
        "paid_models": {
            "DeepSeek V4 Pro (671B MoE, reserved)": "deepseek-v4-pro",
            "GPT OSS 120B (priority lane)": "gpt-oss:120b-priority",
            "Qwen3 480B (priority lane)": "qwen3:480b-priority",
            "Llama 4 Maverick 400B (priority lane)": "llama4:maverick-priority",
            "Mistral Large 3 675B (priority lane)": "mistral-large-3:675b-priority",
        },
    },
    "LM Studio (Local)": {
        "description": "LM Studio — desktop OpenAI-compatible server for any GGUF model.",
        "free_tier": "100% Free / Offline",
        "placeholder": "Not required",
        "get_key_url": "https://lmstudio.ai",
        "local_only": True,
        "base_url": "http://localhost:1234/v1",
        "type": "openai_compat",
        "needs_key": False,
        "free_models": {
            "Local Auto": "local-model",
        },
        "paid_models": {},
    },
    "llama.cpp Server": {
        "description": "llama.cpp server — minimal local inference daemon.",
        "free_tier": "100% Free / Offline",
        "placeholder": "Not required",
        "get_key_url": "https://github.com/ggerganov/llama.cpp",
        "local_only": True,
        "base_url": "http://localhost:8080/v1",
        "type": "openai_compat",
        "needs_key": False,
        "free_models": {
            "Local Auto": "local",
        },
        "paid_models": {},
    },
}


def list_ollama_cloud_models(api_key=None, timeout=8):
    """Return {(display_label, model_id), ...} for currently hosted Ollama Cloud models.

    Pulled from https://ollama.com/api/tags. Merges into Ollama Cloud catalog if
    dynamic_only=True is passed to refresh_catalogs().
    """
    url = "https://ollama.com/api/tags"
    headers = {"Accept": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return []
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return []
    items = obj.get("models") or []
    rows = []
    for m in items:
        if not isinstance(m, dict):
            continue
        name = m.get("name") or m.get("model")
        if not name:
            continue
        size_b = m.get("size")
        details = m.get("details") or {}
        family = details.get("family") or details.get("parameter_size") or ""
        label_bits = [str(name)]
        if family:
            label_bits.append(str(family))
        if isinstance(size_b, (int, float)) and size_b > 0:
            gb = size_b / (1024 ** 3)
            if gb >= 1:
                label_bits.append(f"{gb:.1f}GB".replace(".0GB", "GB"))
            elif gb > 0:
                mb = size_b / (1024 ** 2)
                label_bits.append(f"{mb:.0f}MB")
        rows.append((" · ".join(label_bits), name))
    return rows


_CATALOG_CACHE = {"ollama_cloud": [], "ts": 0.0}
_CATALOG_TTL_SEC = 600  # 10 min


def refresh_catalogs(api_key=None, force=False, timeout=8):
    """Refresh in-memory cache for Ollama Cloud. Merges live models into PROVIDERS
    without touching the hardcoded curated list (which guarantees a useful baseline
    even when the live API is unreachable).
    """
    now = time.time()
    if not force and (now - _CATALOG_CACHE["ts"]) < _CATALOG_TTL_SEC and _CATALOG_CACHE["ollama_cloud"]:
        return _CATALOG_CACHE["ollama_cloud"]

    live = list_ollama_cloud_models(api_key=api_key, timeout=timeout)
    if not live:
        return []

    info = PROVIDERS.get("Ollama Cloud")
    if info is None:
        return []

    merged = dict(info.get("free_models") or {})
    existing_ids = set(merged.values())
    for label, model_id in live:
        if model_id in existing_ids:
            continue
        clean_label = label
        merged[clean_label] = model_id
        existing_ids.add(model_id)

    info["free_models"] = merged
    _CATALOG_CACHE["ollama_cloud"] = list(merged.items())
    _CATALOG_CACHE["ts"] = now
    return _CATALOG_CACHE["ollama_cloud"]
