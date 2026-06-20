"""
api.py - FastAPI backend for AI Career Suite React dashboard
Wraps providers.py + analyzer.py for the rivr-dashboard frontend.

Run:  uvicorn api:app --reload --port 8000
"""

from __future__ import annotations

import base64
from typing import Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from providers import PROVIDERS, call_api, list_models
from analyzer import analyze_resume, extract_text_from_file as extract_resume_text
from scrape_job import fetch_job_description
from export import text_to_docx, text_to_pdf, analysis_to_docx, analysis_to_pdf

app = FastAPI(title="AI Career Suite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    provider: str
    api_key: str
    model: str
    resume_text: str
    job_description: str
    job_title: str = ""
    company: str = ""


class GenerateRequest(BaseModel):
    provider: str
    api_key: str
    model: str
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 2500


class ChatRequest(BaseModel):
    provider: str
    api_key: str
    model: str
    messages: list[dict[str, str]]
    system: str | None = None
    temperature: float = 0.6
    max_tokens: int = 1000


class ScrapeRequest(BaseModel):
    url: str


class ExportRequest(BaseModel):
    title: str
    body: str
    subtitle: str | None = None
    format: str = Field(..., pattern="^(docx|pdf)$")


class AnalysisExportRequest(BaseModel):
    result: dict[str, Any]
    format: str = Field(..., pattern="^(docx|pdf)$")


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/api/providers")
async def get_providers():
    out = {}
    for name, info in PROVIDERS.items():
        out[name] = {
            "description": info.get("description", ""),
            "free_tier": info.get("free_tier", ""),
            "placeholder": info.get("placeholder", ""),
            "get_key_url": info.get("get_key_url", ""),
            "local_only": info.get("local_only", False),
            "needs_key": info.get("needs_key", True),
            "free_models": list(info.get("free_models", {}).keys()),
            "paid_models": list(info.get("paid_models", {}).keys()),
        }
    return out


@app.get("/api/providers/{provider}/models")
async def get_models(provider: str):
    if provider not in PROVIDERS:
        raise HTTPException(status_code=404, detail=f"Unknown provider: {provider}")
    info = PROVIDERS[provider]
    return {
        "free": info.get("free_models", {}),
        "paid": info.get("paid_models", {}),
    }


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        result = analyze_resume(
            req.provider, req.api_key, req.model,
            req.resume_text, req.job_description,
            req.job_title, req.company,
        )
        result.update({
            "provider": req.provider,
            "model": req.model,
            "job_title": req.job_title,
            "company_name": req.company,
        })
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    messages = [
        {"role": "system", "content": "You are precise, structured, and concise. Use markdown formatting. Be specific and reference actual input."},
        {"role": "user", "content": req.prompt},
    ]
    ok, err, reply = call_api(req.provider, req.api_key, req.model, messages,
                              temperature=req.temperature, max_tokens=req.max_tokens)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
    return {"content": reply}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    messages = list(req.messages)
    if req.system:
        messages = [{"role": "system", "content": req.system}, *messages]
    ok, err, reply = call_api(req.provider, req.api_key, req.model, messages,
                              temperature=req.temperature, max_tokens=req.max_tokens)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
    return {"content": reply}


@app.post("/api/scrape")
async def scrape(req: ScrapeRequest):
    data = fetch_job_description(req.url)
    if not data["ok"]:
        raise HTTPException(status_code=400, detail=data["error"])
    return data


@app.post("/api/export")
async def export_doc(req: ExportRequest):
    try:
        if req.format == "docx":
            data = text_to_docx(req.title, req.body, req.subtitle)
            media = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ext = "docx"
        else:
            data = text_to_pdf(req.title, req.body, req.subtitle)
            media = "application/pdf"
            ext = "pdf"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(content=data, media_type=media,
                    headers={"Content-Disposition": f"attachment; filename=document.{ext}"})


@app.post("/api/export/analysis")
async def export_analysis(req: AnalysisExportRequest):
    try:
        if req.format == "docx":
            data = analysis_to_docx(req.result)
            media = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ext = "docx"
        else:
            data = analysis_to_pdf(req.result)
            media = "application/pdf"
            ext = "pdf"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return Response(content=data, media_type=media,
                    headers={"Content-Disposition": f"attachment; filename=analysis.{ext}"})


@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or "resume"
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(status_code=400, detail="Only .pdf, .docx, or .doc files are supported.")
    try:
        raw = await file.read()

        class _Wrapper:
            def __init__(self, data, name):
                self._data = data
                self._name = name
                self._pos = 0

            def read(self, n=-1):
                if n == -1:
                    chunk = self._data[self._pos:]
                    self._pos = len(self._data)
                else:
                    chunk = self._data[self._pos:self._pos + n]
                    self._pos += len(chunk)
                return chunk

            @property
            def name(self):
                return self._name

        wrapper = _Wrapper(raw, filename)
        text = extract_resume_text(wrapper)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parse error: {e}")
    return {"text": text, "filename": filename, "word_count": len(text.split())}