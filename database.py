"""
database.py - SQLite helpers for AI Career Suite
Author: Sachin Chaudhary
"""

import os
import sqlite3
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "career_suite.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            provider TEXT,
            model TEXT,
            job_title TEXT,
            company_name TEXT,
            ats_score INTEGER,
            match_score INTEGER,
            hire_probability INTEGER,
            overall_summary TEXT,
            matched_skills TEXT,
            missing_skills TEXT,
            keyword_suggestions TEXT,
            strengths TEXT,
            improvements TEXT,
            quick_wins TEXT,
            red_flags TEXT,
            salary_insight TEXT,
            experience_gap TEXT,
            education_match TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def save_analysis(result):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO analyses (
            created_at, provider, model, job_title, company_name,
            ats_score, match_score, hire_probability, overall_summary,
            matched_skills, missing_skills, keyword_suggestions,
            strengths, improvements, quick_wins, red_flags,
            salary_insight, experience_gap, education_match
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            datetime.now(timezone.utc).isoformat(),
            result.get("provider", ""),
            result.get("model", ""),
            result.get("job_title", ""),
            result.get("company_name", ""),
            int(result.get("ats_score", 0)),
            int(result.get("match_score", 0)),
            int(result.get("hire_probability", 0)),
            (result.get("overall_summary", "") or "")[:2000],
            "|".join(result.get("matched_skills", [])) if isinstance(result.get("matched_skills"), list) else str(result.get("matched_skills", "")),
            "|".join(result.get("missing_skills", [])) if isinstance(result.get("missing_skills"), list) else str(result.get("missing_skills", "")),
            "|".join(result.get("keyword_suggestions", [])) if isinstance(result.get("keyword_suggestions"), list) else str(result.get("keyword_suggestions", "")),
            "|".join(result.get("strengths", [])) if isinstance(result.get("strengths"), list) else str(result.get("strengths", "")),
            "|".join(result.get("improvements", [])) if isinstance(result.get("improvements"), list) else str(result.get("improvements", "")),
            "|".join(result.get("quick_wins", [])) if isinstance(result.get("quick_wins"), list) else str(result.get("quick_wins", "")),
            "|".join(result.get("red_flags", [])) if isinstance(result.get("red_flags"), list) else str(result.get("red_flags", "")),
            (result.get("salary_insight", "") or "")[:500],
            (result.get("experience_gap", "") or "")[:500],
            (result.get("education_match", "") or "")[:500],
        ),
    )
    conn.commit()
    conn.close()


def _split_field(val):
    if isinstance(val, list):
        return val
    if isinstance(val, str) and "|" in val:
        return [s.strip() for s in val.split("|") if s.strip()]
    if isinstance(val, str) and val.strip():
        return [val.strip()]
    return []


def get_all_analyses():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM analyses ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    for r in rows:
        for key in ["matched_skills", "missing_skills", "keyword_suggestions", "strengths", "improvements", "quick_wins", "red_flags"]:
            r[key] = _split_field(r.get(key, ""))
    return rows


def delete_analysis(analysis_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    conn.commit()
    conn.close()


def get_score_trend(limit=20):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT created_at, ats_score, match_score FROM analyses ORDER BY id DESC LIMIT ?", (limit,))
    raw = cur.fetchall()[::-1]
    conn.close()
    return [{"date": r[0][:10], "ats": r[1], "match": r[2]} for r in raw]


def get_top_missing_skills(limit=10):
    analyses = get_all_analyses()
    freq = {}
    for a in analyses:
        for s in a.get("missing_skills", []):
            skill = s.strip()
            if skill:
                freq[skill] = freq.get(skill, 0) + 1
    sorted_skills = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:limit]
    return [{"skill": s, "count": c} for s, c in sorted_skills]
