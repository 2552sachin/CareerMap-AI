"""
analyzer.py - Resume parsing and analysis helpers
Author: Sachin Chaudhary
"""

import io
import json
import re

from providers import PROVIDERS


def extract_text_from_pdf(uploaded_file):
    try:
        import pdfplumber

        raw = uploaded_file.read()
        text_parts = []
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            for page in pdf.pages:
                t = page.extract_text() or ""
                if t:
                    text_parts.append(t)
        text = "\n".join(text_parts).strip()
        if not text:
            raise ValueError("Could not extract text from this PDF. Try pasting text instead.")
        return text
    except ImportError:
        raise ValueError("pdfplumber not installed. Run: pip install pdfplumber")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"PDF extraction failed: {e}")


def extract_text_from_docx(uploaded_file):
    try:
        from docx import Document

        raw = uploaded_file.read()
        doc = Document(io.BytesIO(raw))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs).strip()
        if not text:
            raise ValueError("Could not extract text from this DOCX. Try pasting text instead.")
        return text
    except ImportError:
        raise ValueError("python-docx not installed. Run: pip install python-docx")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"DOCX extraction failed: {e}")


def extract_text_from_doc(uploaded_file):
    """Extract text from legacy .doc (OLE/Word 97-2003) files."""
    try:
        import olefile

        raw = uploaded_file.read()
        ole = olefile.OleFileIO(io.BytesIO(raw))
        if not ole.exists("WordDocument"):
            raise ValueError("Not a valid .doc file.")
        word_stream = ole.openstream("WordDocument").read()

        # Try the simpler approach: extract from the 1Table or 0Table stream
        table_name = None
        for candidate in ("1Table", "0Table"):
            if ole.exists(candidate):
                table_name = candidate
                break
        if not table_name:
            raise ValueError("Could not find table stream in .doc file.")

        # Fallback: pull all printable text from the WordDocument stream
        import struct

        # Read FIB (File Information Block) at start of WordDocument stream
        # fcMin = offset of main text in WordDocument stream
        if len(word_stream) < 0x4c:
            raise ValueError("Truncated .doc file.")

        fc_min = struct.unpack_from("<I", word_stream, 0x18)[0]
        ccp_text = struct.unpack_from("<I", word_stream, 0x4c)[0]

        if fc_min + ccp_text <= len(word_stream):
            text_bytes = word_stream[fc_min:fc_min + ccp_text]
            # .doc uses cp1252 encoding for the text
            text = text_bytes.decode("cp1252", errors="replace")
            # Clean up control characters
            text = text.replace("\r", "\n").replace("\x07", "\n").replace("\x0b", "\n")
            # Remove remaining non-printable chars
            text = re.sub(r"[\x00-\x08\x0c\x0e-\x1f]", "", text)
            text = text.strip()
            if text:
                return text

        # Ultimate fallback: extract all ASCII text
        text = raw.decode("latin-1", errors="replace")
        text = re.sub(r"[\x00-\x08\x0e-\x1f]", "", text)
        lines = [ln.strip() for ln in text.splitlines() if ln.strip() and len(ln.strip()) > 2]
        result = "\n".join(lines)
        if result:
            return result
        raise ValueError("Could not extract text from this .doc file. Try converting to .docx or .pdf.")
    except ValueError:
        raise
    except ImportError:
        raise ValueError(
            "Legacy .doc support requires olefile. Run: pip install olefile"
        )
    except Exception as e:
        raise ValueError(f".doc extraction failed: {e}")


def extract_text_from_file(uploaded_file):
    """Auto-detect file type and extract text from PDF, DOCX, or DOC."""
    name = getattr(uploaded_file, "name", "").lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(uploaded_file)
    if name.endswith(".docx"):
        return extract_text_from_docx(uploaded_file)
    if name.endswith(".doc"):
        return extract_text_from_doc(uploaded_file)
    raise ValueError("Unsupported file type. Please upload a .pdf, .docx, or .doc file.")


SCORE_LABELS = [
    (90, "Exceptional", "Top-1% candidate profile."),
    (80, "Strong", "Highly competitive. Apply with confidence."),
    (70, "Solid", "Good foundation - tighten impact lines."),
    (60, "Improving", "Likely to clear ATS. Add measurable outcomes."),
    (50, "Promising", "Promising base. Restructure and quantify."),
    (40, "Developing", "Needs sharper language and proof points."),
    (30, "Early", "Significant rework recommended."),
    (0, "Foundation", "Start with structure, clarity, and impact statements."),
]


def get_score_label(score):
    for threshold, label, tip in SCORE_LABELS:
        if score >= threshold:
            return label, tip
    return "Foundation", "Start with structure, clarity, and impact statements."


def _extract_number(text, patterns, default=50):
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            try:
                val = int(float(m.group(1)))
                return max(0, min(100, val))
            except (ValueError, IndexError):
                continue
    return default


def _extract_list(text, section_patterns, max_items=10):
    for pat in section_patterns:
        m = re.search(pat, text, re.IGNORECASE | re.DOTALL)
        if m:
            block = m.group(1)
            items = re.findall(r"[-*]\s+(.+)", block)
            if not items:
                items = [line.strip("- *") for line in block.split("\n") if line.strip() and not line.strip().startswith("#")]
            return [i.strip()[:120] for i in items if len(i.strip()) > 2][:max_items]
    return []


def analyze_resume(provider, api_key, model_id, resume_text, job_description, job_title, company, temperature=0.3, max_tokens=2500):
    from providers import call_api

    prompt = f"""You are an expert ATS-resume analyst and senior technical recruiter.
Analyze this resume against the job description and return a JSON object.

RESUME:
{resume_text[:6000]}

JOB TITLE: {job_title or 'the role'}
COMPANY: {company or 'the company'}
JOB DESCRIPTION:
{job_description[:4000]}

Return ONLY a valid JSON object with these exact keys:
{{
    "ats_score": <number 0-100>,
    "match_score": <number 0-100>,
    "hire_probability": <number 0-100>,
    "overall_summary": "<2-3 sentence summary>",
    "matched_skills": ["skill1", "skill2", ...],
    "missing_skills": ["skill1", "skill2", ...],
    "keyword_suggestions": ["keyword1", "keyword2", ...],
    "strengths": ["strength1", "strength2", ...],
    "improvements": ["improvement1", "improvement2", ...],
    "quick_wins": ["quick win1", "quick win2", ...],
    "red_flags": ["red flag1", "red flag2", ...],
    "salary_insight": "<brief salary insight>",
    "experience_gap": "<brief experience gap analysis>",
    "education_match": "<education match assessment>"
}}

Be specific and reference actual resume content. Ensure valid JSON."""

    messages = [
        {"role": "system", "content": "You are a precise ATS resume analyst. Return ONLY valid JSON. No markdown, no code fences, just the JSON object."},
        {"role": "user", "content": prompt},
    ]
    ok, err, reply = call_api(provider, api_key, model_id, messages, temperature=temperature, max_tokens=max_tokens)
    if not ok:
        raise ValueError(f"AI call failed: {err}")

    cleaned = reply.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        ats_score = _extract_number(cleaned, [r"ats.?score[:\s]+(\d+)", r"ATS[:\s]+(\d+)"], 50)
        match_score = _extract_number(cleaned, [r"match.?score[:\s]+(\d+)", r"match[:\s]+(\d+)", r"(\d+)%"], 50)
        hire_probability = _extract_number(cleaned, [r"hire.?probability[:\s]+(\d+)", r"interview[:\s]+(\d+)"], 45)
        matched_skills = _extract_list(cleaned, [r"matched.?skills?:?\s*(.*?)(?=missing|improvement|$)"])
        missing_skills = _extract_list(cleaned, [r"missing.?skills?:?\s*(.*?)(?=keyword|strength|$)"])
        keyword_suggestions = _extract_list(cleaned, [r"keyword.?suggestion?:?\s*(.*?)(?=strength|quick|$)"], 8)
        strengths = _extract_list(cleaned, [r"strengths?:?\s*(.*?)(?=improvement|missing|$)"])
        improvements = _extract_list(cleaned, [r"improvements?:?\s*(.*?)(?=quick|red.?flag|$)"])
        quick_wins = _extract_list(cleaned, [r"quick.?wins?:?\s*(.*?)(?=red.?flag|salary|$)"])
        red_flags = _extract_list(cleaned, [r"red.?flags?:?\s*(.*?)(?=salary|experience|$)"])
        result = {
            "ats_score": ats_score, "match_score": match_score, "hire_probability": hire_probability,
            "overall_summary": "Analysis complete. See details below.",
            "matched_skills": matched_skills, "missing_skills": missing_skills,
            "keyword_suggestions": keyword_suggestions, "strengths": strengths,
            "improvements": improvements, "quick_wins": quick_wins,
            "red_flags": red_flags, "salary_insight": "See market data for your region.",
            "experience_gap": "See detailed analysis.", "education_match": "See detailed analysis.",
        }

    for key in ["ats_score", "match_score", "hire_probability"]:
        if key in result:
            try:
                result[key] = int(float(result[key]))
            except (ValueError, TypeError):
                result[key] = 50

    for key in ["matched_skills", "missing_skills", "keyword_suggestions", "strengths", "improvements", "quick_wins", "red_flags"]:
        if key not in result or not isinstance(result[key], list):
            result[key] = []

    for key in ["overall_summary", "salary_insight", "experience_gap", "education_match"]:
        if key not in result or not isinstance(result[key], str):
            result[key] = ""

    return result
