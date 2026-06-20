<div align="center">

# 🗺️ CareerMap AI

**Map your path to every interview.**

*AI-powered talent intelligence & career planning platform — analyze your resume against ATS,
generate cover letters, prep for interviews, build an optimized resume, and chat with an AI career copilot.*

<br/>

<img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11"/>
<img src="https://img.shields.io/badge/Streamlit-1.32+-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
<img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8"/>
<img src="https://img.shields.io/badge/15%2B_AI_Providers-Supported-8b5cf6?style=for-the-badge" alt="15+ AI Providers"/>
<img src="https://img.shields.io/badge/Local_LLM-Ollama_/_LM_Studio-10b981?style=for-the-badge&logo=ollama&logoColor=white" alt="Local LLM"/>
<img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License"/>

<br/><br/>

**The open-source AI career assistant that scores your resume like a recruiter —
then tells you exactly how to fix it.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [✨ Features](#-features)
- [🤖 Supported AI Providers](#-supported-ai-providers)
- [⚡ Quick Start](#-quick-start)
- [🎛️ The 5 Core Tools](#-the-5-core-tools)
- [💻 Local LLM Setup (Ollama & LM Studio)](#-local-llm-setup-ollama--lm-studio)
- [🏗️ Architecture](#%EF%B8%8F-architecture)
- [🌐 The React Dashboard](#%EF%B8%8F-the-react-dashboard)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [📁 Project Structure](#-project-structure)
- [💡 Recommended Workflow](#-recommended-workflow)
- [🔒 Privacy](#-privacy)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

---

## 📖 Overview

CareerMap AI is a comprehensive, open-source career optimization platform. It doesn't just parse your resume — it reads it the way a real recruiter does, scores it against an ATS, tells you what's missing, and then **fixes it for you**.

It runs on **15+ AI providers** — including free cloud APIs (Groq, Google Gemini, OpenRouter, NVIDIA Build) and fully local models (Ollama, LM Studio). Bring your own key, or run 100% offline. Your resume never leaves your machine unless you choose a cloud provider.

> *Map your resume. Map your gaps. Map your path to the offer.*

---

## ✨ Features

- 🎯 **ATS-style Resume Analysis** — 0–100 score, interview probability, matched/missing keywords, quick wins, salary insights
- ✉️ **Cover Letter Generator** — ATS-optimized, uses your real achievements, hooks that don't start with *"I am writing to apply"*
- 🎤 **Interview Prep Guide** — role-specific questions tailored to *your* projects & experience, with answer frameworks and common mistakes
- 📝 **AI Resume Builder** — build from scratch or rewrite your existing resume for a specific job (aggressive ATS optimization, metric injection, modern power-verbs)
- 💬 **Interactive AI Career Copilot** — context-aware chat that reads your last analysis, roleplays interviews, rewrites bullet points on demand
- 🕸️ **Smart URL Job Scraper** — paste any job link (Greenhouse, Lever, LinkedIn, careers pages) and auto-extract the JD
- 📊 **Progress Dashboard** — track score trends, skill gaps, and full analysis history over time
- 🌐 **Modern React Dashboard** — glassmorphism UI, 3D tilt effects, animated keyframe transitions
- 🔌 **15+ LLM Providers** — one `call_api()` dispatcher handles all provider differences
- 🖥️ **100% Local Mode** — Ollama / LM Studio support; zero data leaves your machine

---

## 🤖 Supported AI Providers

The universal dispatcher (`providers.py`) handles all provider quirks via a single call:
`call_api(provider_name, api_key, model_id, prompt)`

### 🆓 Free Providers — No Credit Card Needed

| Provider | Free Limits | Best Free Model | Get Key |
|----------|-------------|-----------------|---------|
| 🟢 **NVIDIA Build** ⭐ | 1000 free credits | Gemma 4 31B IT | [build.nvidia.com](https://build.nvidia.com/explore/discover) |
| 🔀 **OpenRouter** | 20 req/min · 200/day | 🎲 Auto Free Router | [openrouter.ai/keys](https://openrouter.ai/keys) |
| ⚡ **Groq** | 30 req/min · 14,400/day | Llama 3.3 70B | [console.groq.com](https://console.groq.com/keys) |
| 🌙 **Google Gemini** | 15 req/min · 1M tokens/day | Gemini 2.0 Flash | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| 🤗 **Hugging Face** | Rate limited | Llama 3.1 8B | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| 🌊 **Cohere** | 20/min · 1,000/month | Command R | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| 🖥️ **Ollama (Local)** | Unlimited | Any model you pull | [ollama.com/download](https://ollama.com/download) |
| 🎨 **LM Studio (Local)** | Unlimited | Any GGUF file | [lmstudio.ai](https://lmstudio.ai) |

### 💳 Paid Providers (some have free signup credits)

| Provider | Free Credits | Best Model | Cost / Analysis* |
|----------|-------------|------------|------------------|
| 🔥 **Together AI** | ✅ $25 free | Llama 3.3 70B Turbo | ~$0.002 |
| 🔥 **xAI Grok** | ✅ $25 free | Grok 3 Mini | ~$0.001 |
| 🧠 **DeepSeek** | ~$5 new acct | DeepSeek R1 | ~$0.001 |
| 💎 **OpenAI** | ~$5 new acct | GPT-4o Mini | ~$0.0006 |
| 👑 **Anthropic** | None | Claude 3.5 Sonnet | ~$0.008 |
| ⚡ **Mistral AI** | Trial credits | Mistral Small | ~$0.0002 |
| 🌐 **Perplexity** | None | Sonar (has web search) | ~$0.005 |

*\*Per analysis ≈ 2,000 input + 500 output tokens*

> **Best free setup:** NVIDIA Build (Gemma 4 31B) + OpenRouter (Auto Router) + Groq (Llama 3.3 70B). Three keys, 10 minutes total, effectively unlimited free analyses.

---

## ⚡ Quick Start

### Option 1 — Run Locally (Recommended)

```bash
# Clone the repo
git clone https://github.com/2552sachin/CareerMap-AI.git
cd CareerMap-AI

# Install Python dependencies
pip install -r requirements.txt

# Launch the app
streamlit run app.py
# Opens at http://localhost:8501
```

Then grab a free API key from [openrouter.ai/keys](https://openrouter.ai/keys) (2 min, no card), paste it in the sidebar, pick **🎲 Auto Free Router**, and start analyzing.

### Option 2 — Run the React Dashboard

The modern web frontend lives in `rivr-dashboard/`:

```bash
cd rivr-dashboard
npm install
npm run dev
# Opens at http://localhost:5173
```

> The React dashboard connects to the Streamlit backend (API on port 8501). The two share the same design language and tool set. See [`rivr-dashboard/README.md`](rivr-dashboard/README.md) for full details.

### Option 3 — Deploy Your Own Instance

1. Fork this repo
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect GitHub → select this repo → click **Deploy**
4. Live in ~2 minutes

---

## 🎛️ The 5 Core Tools

### 🎯 1. Resume Analyzer
Paste your resume + a job description. Get a full ATS-style recruiter analysis in ~15 seconds.

| Output | What it tells you |
|--------|-------------------|
| **ATS Score** (0–100) | How automated screening software rates your resume |
| **Job Match %** | How well your overall experience fits the role |
| **Interview Probability** | Realistic callback chance using real recruiter logic |
| **Matched Skills** | Keywords in both your resume and the JD |
| **Missing Skills** | Critical JD keywords completely absent from your resume |
| **Red Flags** | What a recruiter notices negatively in the first 6 seconds |
| **Quick Wins** | 3 things to fix TODAY that immediately improve callback rate |
| **Salary Insight** | Estimated market value based on your resume's positioning |
| **Strengths** | Genuine positives backed by evidence from your resume |
| **Improvements** | Specific rewording suggestions — not vague advice |

### ✉️ 2. Cover Letter Generator
Generates a fully custom, ATS-optimized cover letter tailored to the exact job.
- Starts with a strong hook — not *"I am writing to apply"*
- Uses YOUR actual achievements from your resume
- Injects 5 exact ATS keywords from the job description
- 3 tone options: Very Formal · Professional · Enthusiastic
- ~380 words, 3–4 paragraphs — exactly the right length

### 🎤 3. Interview Prep Guide
Generates role-specific questions based on YOUR resume — not generic answers from Google.
Each question includes:
- ❓ **The question** — specific to your own projects and experience
- 🎯 **Why they ask it** — so you understand the interviewer's intent
- ✅ **Ideal answer framework** — 3–4 bullets using your actual resume content
- ❌ **Common mistake to avoid**

Supports: Technical · Behavioral · Situational · Company Fit — 2–5 questions per category.

### 📝 4. AI Resume Builder — 2 Modes
**✨ Mode 1: Build Fresh Resume** — Fill in your details → AI builds a complete ATS-optimized resume from scratch. Best for students, career changers, first resumes.

**🔄 Mode 2: Rewrite for a Specific Job** — Paste your current resume + a target JD → AI rewrites the entire resume for that exact role, with three options:
- 🔥 **Aggressive ATS Optimization** — injects exact JD keywords, mirrors language
- 📊 **Add Estimated Metrics** — adds realistic numbers/% where achievements lack them
- ✨ **Modernize Language** — replaces weak verbs (helped, worked) with power verbs (Engineered, Architected)

Download both the original and rewritten versions side-by-side to compare.

### 📊 5. Progress Dashboard
Track your entire job search across all analyses.
- **Score Trend Chart** — see ATS + match scores improving over time
- **Skill Gap Chart** — top missing skills across ALL your applications = your learning roadmap
- **Full History** — every resume + job analyzed, with matched/missing skill chips
- Delete any entry anytime

---

## 💻 Local LLM Setup (Ollama & LM Studio)

Run AI entirely on your own machine. No API key. No cost. No data ever leaves your computer.

### Option A — Ollama (command line, recommended)

```bash
# 1. Install from ollama.com/download
# 2. Pull a model (pick based on your RAM)
ollama pull llama3.2          # 2 GB  — good for 8 GB RAM laptops
ollama pull deepseek-r1:7b    # 4 GB  — best reasoning quality
ollama pull qwen2.5:14b       # 9 GB  — best quality for 16 GB RAM
ollama pull phi3.5            # 2 GB  — fastest on low-end hardware

# 3. Start the server
ollama serve

# 4. Run the app
streamlit run app.py
# Select 🖥️ Ollama (Local) in sidebar — no key needed
```

**RAM guide:**

| RAM | Recommended model |
|-----|------------------|
| 8 GB | `phi3.5` or `llama3.2` |
| 16 GB | `llama3.1` or `deepseek-r1:7b` |
| 32 GB+ | `qwen2.5:14b` or `deepseek-r1:14b` |
| NVIDIA GPU | Ollama auto-uses VRAM — much faster |

### Option B — LM Studio (GUI — drag & drop GGUF files)

1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Search for any model inside LM Studio → Download — or drag-drop any `.gguf` file
3. Click **Local Server** tab → **Start Server**
4. In this app: select `🎨 LM Studio (Local)` → no key needed

> ⚠️ Local LLMs only work when running the app locally (`streamlit run app.py`).
> They will NOT work on Streamlit Cloud deployments — use any API provider for the deployed app.

---

## 🏗️ Architecture

Every tool makes a single call:

```python
result = call_api(provider_name, api_key, model_id, prompt)
```

The dispatcher handles all provider differences:

| Type | Providers |
|------|-----------|
| `openai_compat` | OpenRouter, NVIDIA Build, Groq, DeepSeek, Mistral, Together, Perplexity, xAI, LM Studio |
| `anthropic` | Anthropic Claude (different auth + response schema) |
| `gemini` | Google Gemini (URL-based key + nested response format) |
| `cohere` | Cohere (v2 chat endpoint) |
| `huggingface` | HuggingFace (model name in URL path) |
| `ollama` | Local Ollama server (health check + `/api/chat`) |

Adding a new provider = adding one new case to the dispatcher.

---

## 🌐 The React Dashboard

The `rivr-dashboard/` directory contains a modern, production-grade React frontend:

- **React 19** + **TypeScript 6** (strict mode) + **Vite 8** + **Tailwind CSS v4**
- Glassmorphism UI matching the Streamlit app's design language
- 3D tilt hover effects, animated keyframe transitions
- AI Career Copilot, Job Tracker, Documentation, Onboarding Tour, Command Palette
- Error Boundary, SEO metadata, Open Graph, PWA manifest, sitemap, 404 page
- Full accessibility: semantic HTML, ARIA, keyboard nav, `prefers-reduced-motion`

See [`rivr-dashboard/README.md`](rivr-dashboard/README.md) for setup, scripts, and design system docs.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Language | Python 3.11 |
| Backend UI | Streamlit 1.32 |
| Frontend | React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 |
| Animation | Motion (`motion/react`) + CSS keyframes |
| AI Providers | NVIDIA Build · OpenRouter · OpenAI · Anthropic · Google Gemini · Groq · DeepSeek · Mistral · Together AI · Perplexity · xAI · Cohere · HuggingFace · Ollama · LM Studio |
| Database | SQLite (zero setup, local-only) |
| PDF Parsing | pdfplumber |
| Hosting | Streamlit Cloud (backend) / any static host (frontend) |

---

## 📁 Project Structure

```
CareerMap-AI/
│
├── app.py              # Main Streamlit app — UI, sidebar, routing, all tool pages
├── analyzer.py         # Resume analysis — prompt, JSON parsing, score clamping
├── providers.py         # Universal API dispatcher — all 15+ providers + error handling
├── database.py         # SQLite operations — save/retrieve/delete analyses
├── scrape_job.py       # BeautifulSoup-powered job URL scraper
├── export.py           # DOCX / PDF export utilities
├── api.py              # REST API layer for the React frontend
├── requirements.txt    # Python dependencies
│
├── rivr-dashboard/     # React 19 + TS + Vite frontend
│   ├── src/
│   │   ├── components/ # Navbar, Hero, FeatureCards, CommandPalette, etc.
│   │   ├── tools/      # BuilderTool, DocumentationTool, JobTrackerTool
│   │   ├── lib/        # settings.tsx, theme.tsx
│   │   └── App.tsx
│   ├── public/         # favicon, manifest, robots, sitemap, og-image
│   └── package.json
│
└── README.md           # You're reading it
```

---

## 💡 Recommended Workflow

```
Step 1 → 🎯 Analyzer        Analyze resume vs job → get baseline ATS score
Step 2 → 📝 Resume Builder Rewrite mode → rewrite for that specific job
Step 3 → 🎯 Analyzer        Re-analyze rewritten resume → verify 80+ ATS score
Step 4 → ✉️ Cover Letter    Generate custom cover letter
Step 5 → 📩 Apply           Submit resume PDF + cover letter
Step 6 → 🎤 Interview Prep  If you get an interview → practice questions out loud 3×
Step 7 → 📊 Dashboard       Review skill gaps → decide what to learn next
```

> Aim for **ATS score 75+** before applying. Below 75, most ATS systems reject you before a human ever reads your resume.

---

## 🔒 Privacy

- Resume text is sent **directly to your chosen AI API** — nowhere else
- Analysis history is saved **only on your local machine** in SQLite
- Your API key lives only in your browser session — never logged, never stored
- Using Ollama or LM Studio? Your resume **never leaves your machine at all**

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss.

**Ideas for contributions:**
- New AI provider integrations
- Job board API integrations (LinkedIn, Indeed scraping)
- Resume template export (DOCX/PDF with formatting)
- Multi-language resume support
- Better JSON extraction for edge-case model outputs

### Setup

```bash
git clone https://github.com/2552sachin/CareerMap-AI.git
cd CareerMap-AI
pip install -r requirements.txt
streamlit run app.py
```

---

## 📄 License

Distributed under the **MIT License**.
See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

**Sachin Chaudhary**

<p>
  <a href="https://github.com/2552sachin"><img src="https://img.shields.io/badge/GitHub-2552sachin-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
  <a href="https://www.linkedin.com/in/sachin002552/"><img src="https://img.shields.io/badge/LinkedIn-sachin002552-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
</p>

*If CareerMap AI helped you land an interview or a job, consider ⭐ starring this repo — it helps others find it too.*

---

<div align="center">

**[⬆ Back to Top](#-caremap-ai)**

</div>
