"""
app.py - AI-Powered Talent Intelligence & Career Planning Platform
Author: Sachin Chaudhary
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from providers import PROVIDERS, call_api
from analyzer import extract_text_from_pdf, extract_text_from_file, analyze_resume, get_score_label
from database import init_db, save_analysis, get_all_analyses, get_top_missing_skills, get_score_trend, delete_analysis
from scrape_job import fetch_job_description
from export import text_to_docx, text_to_pdf, analysis_to_docx, analysis_to_pdf

st.set_page_config(
    page_title="AI-Powered Talent Intelligence & Career Planning Platform",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded"
)

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
    --bg: #f0f0f0;
    --bg-elevated: #e8e8ec;
    --surface: #ffffff;
    --surface-hover: #f5f5f7;
    --border: rgba(30, 50, 90, 0.06);
    --border-strong: rgba(30, 50, 90, 0.12);
    --primary: #3b5dbf;
    --primary-light: #5b7def;
    --primary-dark: #2a448a;
    --primary-glow: rgba(59, 93, 191, 0.06);
    --accent: #2dd4bf;
    --accent-light: #5eead4;
    --success: #34d399;
    --warning: #fbbf24;
    --danger: #fb7185;
    --text: #1e2a3a;
    --text-muted: #5a6478;
    --text-dim: #8a94a6;
    --font: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-2xl: 28px;
    --shadow-sm: 0 1px 3px rgba(30, 50, 90, 0.04);
    --shadow-md: 0 4px 14px rgba(30, 50, 90, 0.06);
    --shadow-lg: 0 12px 32px rgba(30, 50, 90, 0.08);
    --shadow-xl: 0 24px 48px rgba(30, 50, 90, 0.1);
    --shadow-glow: 0 0 30px rgba(59, 93, 191, 0.04);
    --glass-bg: rgba(255, 255, 255, 0.55);
    --glass-bg-hover: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(30, 50, 90, 0.04);
    --glass-blur: blur(16px);
    --glass-blur-strong: blur(28px);
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --transition: 0.4s var(--ease-out-expo);
}

html, body, [class*="css"] {
    font-family: var(--font) !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ===== RIVR-INSPIRED KEYFRAME ANIMATIONS ===== */
@keyframes fadeSlideUp {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideDown {
    0% { opacity: 0; transform: translateY(-16px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

@keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes scalePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

@keyframes floatSoft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}

@keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 6px rgba(91, 141, 239, 0.08); }
    50% { box-shadow: 0 0 20px rgba(91, 141, 239, 0.25), 0 0 40px rgba(91, 141, 239, 0.04); }
}

@keyframes glowBorder {
    0%, 100% { border-color: rgba(91, 141, 239, 0.1); }
    50% { border-color: rgba(91, 141, 239, 0.3); }
}

@keyframes morphBlob {
    0% { border-radius: 50% 40% 35% 65%/55% 35% 65% 45%; }
    25% { border-radius: 35% 55% 65% 40%/45% 60% 35% 55%; }
    50% { border-radius: 45% 45% 40% 60%/40% 50% 55% 50%; }
    75% { border-radius: 65% 35% 55% 45%/35% 65% 45% 55%; }
    100% { border-radius: 50% 40% 35% 65%/55% 35% 65% 45%; }
}

@keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.01); }
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes gradientOrbit {
    0% { background-position: 0% 0%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
    100% { background-position: 0% 0%; }
}

@keyframes slideInLeft {
    0% { opacity: 0; transform: translateX(-24px); }
    100% { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
    0% { opacity: 0; transform: translateX(24px); }
    100% { opacity: 1; transform: translateX(0); }
}

@keyframes countUp {
    0% { opacity: 0; transform: scale(0.7) translateY(8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes spinSlow {
    to { transform: rotate(360deg); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes pulseRing {
    0% { box-shadow: 0 0 0 0 rgba(91, 141, 239, 0.25); }
    70% { box-shadow: 0 0 0 12px rgba(91, 141, 239, 0); }
    100% { box-shadow: 0 0 0 0 rgba(91, 141, 239, 0); }
}

@keyframes shimmerSlide {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes glassShine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes levitate {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-4px) rotate(0.3deg); }
    66% { transform: translateY(2px) rotate(-0.3deg); }
}

@keyframes borderDance {
    0% { border-image: linear-gradient(135deg, var(--primary), var(--accent)) 1; }
    33% { border-image: linear-gradient(225deg, var(--accent), var(--primary)) 1; }
    66% { border-image: linear-gradient(315deg, var(--primary), var(--accent)) 1; }
    100% { border-image: linear-gradient(135deg, var(--primary), var(--accent)) 1; }
}

@keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.9); }
    50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes orbit {
    0% { transform: rotate(0deg) translateX(3px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(3px) rotate(-360deg); }
}

@keyframes slideExpand {
    0% { max-height: 0; opacity: 0; transform: translateY(-8px); }
    100% { max-height: 500px; opacity: 1; transform: translateY(0); }
}

@keyframes tiltIn {
    0% { opacity: 0; transform: perspective(800px) rotateX(-6deg) translateY(20px); }
    100% { opacity: 1; transform: perspective(800px) rotateX(0) translateY(0); }
}

@keyframes aurora {
    0% { transform: translate(-30%, -30%) rotate(0deg); opacity: 0.3; }
    25% { transform: translate(10%, -10%) rotate(90deg); opacity: 0.4; }
    50% { transform: translate(30%, 20%) rotate(180deg); opacity: 0.25; }
    75% { transform: translate(-10%, 10%) rotate(270deg); opacity: 0.35; }
    100% { transform: translate(-30%, -30%) rotate(360deg); opacity: 0.3; }
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.9; }
}

/* ===== RIVR LIGHT BACKGROUND ===== */
.stApp {
    background: var(--bg) !important;
    color: var(--text) !important;
}

.stApp::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse at 15% 10%, rgba(59, 93, 191, 0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 20%, rgba(45, 212, 191, 0.02) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 90%, rgba(59, 93, 191, 0.015) 0%, transparent 40%);
    z-index: -1;
    filter: blur(80px);
    animation: fadeIn 2s ease-out;
}

/* ===== RIVR SIDEBAR ===== */
[data-testid="stSidebar"] {
    background: rgba(255, 255, 255, 0.65) !important;
    border-right: 1px solid rgba(30, 50, 90, 0.05) !important;
    backdrop-filter: var(--glass-blur-strong) !important;
    -webkit-backdrop-filter: var(--glass-blur-strong) !important;
    position: relative !important;
}

[data-testid="stSidebar"]::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(59, 93, 191, 0.02) 0%, transparent 40%, transparent 60%, rgba(45, 212, 191, 0.015) 100%);
    pointer-events: none;
}

[data-testid="stSidebar"]::after {
    content: '';
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(30, 50, 90, 0.06), transparent);
    pointer-events: none;
}

[data-testid="stSidebar"] .block-container {
    padding-top: 1.5rem !important;
}

/* ===== MAIN CONTENT ===== */
[data-testid="stAppViewContainer"] > .main .block-container {
    animation: fadeSlideUp 0.7s var(--ease-out-expo);
    padding: 2rem 3rem !important;
    max-width: 1480px !important;
}

/* ===== TYPOGRAPHY ===== */
h1, h2, h3, h4 {
    font-family: var(--font) !important;
    color: var(--text) !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
}

h1 {
    font-size: 2.4rem !important;
}

h2 {
    font-size: 1.6rem !important;
    font-weight: 600 !important;
}

/* ===== RIVR HERO SECTION ===== */
.hero {
    position: relative;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    padding: 3.5rem 2.5rem;
    margin-bottom: 2.5rem;
    text-align: center;
    overflow: hidden;
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    animation: scaleIn 0.8s var(--ease-out-expo);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 93, 191, 0.03), transparent, rgba(45, 212, 191, 0.02));
    opacity: 0.6;
    animation: gradientShift 15s ease infinite;
    background-size: 200% 200%;
}

.hero::after {
    content: '';
    position: absolute;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(59, 93, 191, 0.03), transparent 70%);
    top: -100px;
    right: -100px;
    animation: morphBlob 16s ease-in-out infinite;
    pointer-events: none;
}

.hero-badge {
    position: relative;
    display: inline-block;
    background: rgba(59, 93, 191, 0.04);
    border: 1px solid rgba(59, 93, 191, 0.08);
    color: var(--primary);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 20px;
    border-radius: 100px;
    margin-bottom: 1.25rem;
    animation: glowPulse 4s ease-in-out infinite;
    backdrop-filter: blur(4px);
}

.hero h1 {
    position: relative;
    font-size: 2.8rem !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    color: var(--text) !important;
    background: none !important;
    -webkit-text-fill-color: var(--text) !important;
    margin-bottom: 0.75rem !important;
}

.hero p {
    position: relative;
    color: var(--text-muted) !important;
    font-size: 1rem !important;
    font-weight: 400 !important;
    max-width: 600px;
    margin: 0 auto !important;
    line-height: 1.7 !important;
}

/* ===== SECTION TITLE ===== */
.section-title {
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--primary);
    margin: 1.5rem 0 0.75rem 0;
    opacity: 0.8;
}

/* ===== RIVR SCORE CARDS ===== */
.score-wrap {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 18px;
    padding: 1.6rem 1.2rem;
    text-align: center;
    transition: all 0.4s var(--ease-out-expo);
    position: relative;
    overflow: hidden;
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.score-wrap::before {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle at 30% 20%, rgba(59, 93, 191, 0.02), transparent 50%);
    opacity: 0;
    transition: opacity 0.6s ease;
    pointer-events: none;
}

.score-wrap::after {
    content: '';
    position: absolute;
    top: 0;
    left: 8px;
    right: 8px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    pointer-events: none;
}

.score-wrap:hover::before {
    opacity: 1;
}

.score-wrap:hover {
    transform: translateY(-4px);
    border-color: var(--border);
    box-shadow: 0 16px 40px rgba(30, 50, 90, 0.06);
}

.score-number {
    font-size: 3.2rem;
    font-weight: 700;
    line-height: 1;
    margin: 0.5rem 0;
    color: var(--text) !important;
    animation: countUp 0.8s var(--ease-spring);
}

.score-number.green { color: var(--success) !important; }
.score-number.amber { color: var(--warning) !important; }
.score-number.red { color: var(--danger) !important; }

.score-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 500;
}

.score-badge {
    display: inline-block;
    margin-top: 0.5rem;
    font-size: 0.74rem;
    font-weight: 500;
    padding: 3px 12px;
    border-radius: 100px;
    animation: scalePulse 4s ease-in-out infinite;
}

.score-badge.green { background: rgba(52, 211, 153, 0.08); color: var(--success); }
.score-badge.amber { background: rgba(251, 191, 36, 0.08); color: var(--warning); }
.score-badge.red { background: rgba(251, 113, 133, 0.08); color: var(--danger); }

/* ===== INFO / STATUS BOXES ===== */
.info-box, .win-box, .success-box, .danger-box {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem 1.3rem;
    margin: 0.6rem 0;
    color: var(--text-muted);
    line-height: 1.6;
    transition: all 0.35s var(--ease-out-expo);
    animation: slideInLeft 0.5s var(--ease-out-expo);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.info-box:hover, .win-box:hover, .success-box:hover, .danger-box:hover {
    background: var(--glass-bg-hover);
    border-color: var(--border);
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
}

.success-box { border-left: 3px solid var(--success); }
.danger-box { border-left: 3px solid var(--danger); }
.win-box { border-left: 3px solid var(--warning); }

.summary-box {
    background: linear-gradient(135deg, rgba(59, 93, 191, 0.03) 0%, rgba(45, 212, 191, 0.02) 100%);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin: 1rem 0;
    color: var(--text);
    line-height: 1.7;
    animation: tiltIn 0.6s var(--ease-out-expo);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.resume-output {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 1.8rem;
    font-size: 0.94rem;
    line-height: 1.8;
    color: var(--text);
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.4s var(--ease-out-expo);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
}

.resume-output:hover {
    border-color: var(--border);
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

/* ===== RIVR CHIPS ===== */
.chip {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 100px;
    font-size: 0.74rem;
    font-weight: 500;
    margin: 2px;
    transition: all 0.3s var(--ease-spring);
    cursor: default;
}

.chip:hover {
    transform: translateY(-1px) scale(1.03);
}

.chip-green { background: rgba(52, 211, 153, 0.08); color: var(--success); border: 1px solid rgba(52, 211, 153, 0.12); }
.chip-green:hover { background: rgba(52, 211, 153, 0.14); }

.chip-red { background: rgba(251, 113, 133, 0.08); color: var(--danger); border: 1px solid rgba(251, 113, 133, 0.12); }
.chip-red:hover { background: rgba(251, 113, 133, 0.14); }

.chip-blue { background: rgba(45, 212, 191, 0.08); color: var(--accent); border: 1px solid rgba(45, 212, 191, 0.12); }
.chip-blue:hover { background: rgba(45, 212, 191, 0.14); }

/* ===== RIVR BUTTONS ===== */
.stButton > button {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
    background-size: 200% 200% !important;
    color: white !important;
    border: none !important;
    border-radius: var(--radius-md) !important;
    padding: 0.7rem 1.6rem !important;
    font-weight: 500 !important;
    font-size: 0.88rem !important;
    transition: all 0.3s var(--ease-smooth) !important;
    position: relative !important;
    overflow: hidden !important;
    box-shadow: 0 2px 8px rgba(59, 93, 191, 0.15) !important;
}

.stButton > button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 93, 191, 0.2), 0 0 12px rgba(59, 93, 191, 0.05) !important;
    background-position: 100% 100% !important;
}

.stButton > button:active {
    transform: translateY(0) scale(0.98) !important;
}

.stButton > button:disabled {
    background: rgba(30, 50, 90, 0.04) !important;
    color: var(--text-dim) !important;
    box-shadow: none !important;
    cursor: not-allowed !important;
}

/* ===== RIVR INPUTS ===== */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea,
.stTextInput > div > div > input[type="text"],
.stTextInput > div > div > input[type="password"] {
    background: var(--glass-bg) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: var(--radius-md) !important;
    color: var(--text) !important;
    padding: 11px 16px !important;
    transition: all 0.3s var(--ease-smooth) !important;
    backdrop-filter: blur(6px) !important;
    -webkit-backdrop-filter: blur(6px) !important;
    box-shadow: inset 0 1px 3px rgba(30, 50, 90, 0.04) !important;
    font-size: 0.88rem !important;
}

.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 2px rgba(59, 93, 191, 0.06), 0 0 20px rgba(59, 93, 191, 0.02), inset 0 1px 3px rgba(30, 50, 90, 0.04) !important;
}

/* ===== RIVR METRICS ===== */
[data-testid="stMetric"] {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 0.9rem 1rem;
    transition: all 0.35s var(--ease-out-expo);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
}

[data-testid="stMetric"]::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(59, 93, 191, 0.02), transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
}

[data-testid="stMetric"]:hover {
    border-color: var(--border);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

[data-testid="stMetric"]:hover::before {
    opacity: 1;
}

[data-testid="stMetricLabel"] {
    color: var(--text-muted) !important;
    font-size: 0.78rem !important;
}

[data-testid="stMetricValue"] {
    color: var(--text) !important;
    font-weight: 700 !important;
    font-size: 1.5rem !important;
}

/* ===== RIVR SELECT / RADIO ===== */
.stSelectbox > div > div,
.stRadio > div {
    background: var(--glass-bg) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: var(--radius-md) !important;
    backdrop-filter: var(--glass-blur) !important;
    -webkit-backdrop-filter: var(--glass-blur) !important;
    box-shadow: inset 0 1px 3px rgba(30, 50, 90, 0.03) !important;
}

.stRadio label {
    color: var(--text) !important;
}

.stRadio > div {
    display: flex !important;
    gap: 4px !important;
    padding: 3px !important;
}

.stRadio > div label {
    padding: 6px 16px !important;
    border-radius: var(--radius-sm) !important;
    transition: all 0.25s ease !important;
    font-size: 0.84rem !important;
}

.stRadio > div label:hover {
    background: rgba(59, 93, 191, 0.04) !important;
}

.stRadio > div label[data-checked="true"],
.stRadio > div label[aria-checked="true"] {
    background: rgba(59, 93, 191, 0.06) !important;
    border: 1px solid rgba(59, 93, 191, 0.12) !important;
}

/* ===== SLIDER ===== */
.stSlider > div > div > div > div {
    background: var(--primary) !important;
}

/* ===== HIDE DEFAULTS ===== */
#MainMenu, footer, header { visibility: hidden; }

/* ===== RIVR SCROLLBAR ===== */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(30, 50, 90, 0.08); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(30, 50, 90, 0.15); }

/* ===== RIVR GLASS CARDS ===== */
.glass-card {
    background: var(--glass-bg) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: var(--radius-lg) !important;
    padding: 1.4rem !important;
    backdrop-filter: var(--glass-blur) !important;
    -webkit-backdrop-filter: var(--glass-blur) !important;
    transition: all 0.4s var(--ease-out-expo) !important;
    animation: fadeSlideUp 0.5s var(--ease-out-expo) !important;
    position: relative !important;
    box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 40%, rgba(59, 93, 191, 0.01) 100%);
    pointer-events: none;
}

.glass-card:hover {
    background: var(--glass-bg-hover) !important;
    border-color: var(--border) !important;
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.glass-panel {
    background: var(--glass-bg) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: var(--radius-2xl) !important;
    padding: 1.8rem !important;
    backdrop-filter: var(--glass-blur-strong) !important;
    -webkit-backdrop-filter: var(--glass-blur-strong) !important;
    transition: all 0.45s var(--ease-out-expo) !important;
    animation: fadeSlideUp 0.6s var(--ease-out-expo) !important;
    position: relative !important;
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.glass-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(59, 93, 191, 0.02) 0%, transparent 40%, rgba(45, 212, 191, 0.01) 100%);
    pointer-events: none;
}

.glass-panel:hover {
    background: var(--glass-bg-hover) !important;
    border-color: var(--border) !important;
    box-shadow: var(--shadow-xl), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-1px) !important;
}

/* ===== RIVR FEATURE GRID ===== */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 0.9rem;
    margin: 1.5rem 0;
}

.feature-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 1.4rem;
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    transition: all 0.4s var(--ease-out-expo);
    animation: tiltIn 0.6s var(--ease-out-expo) both;
    box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(59, 93, 191, 0.01), transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.feature-card:nth-child(1) { animation-delay: 0.05s; }
.feature-card:nth-child(2) { animation-delay: 0.12s; }
.feature-card:nth-child(3) { animation-delay: 0.19s; }
.feature-card:nth-child(4) { animation-delay: 0.26s; }
.feature-card:nth-child(5) { animation-delay: 0.33s; }
.feature-card:nth-child(6) { animation-delay: 0.4s; }

.feature-card:hover::before {
    opacity: 1;
}

.feature-card:hover {
    border-color: var(--border);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
}

.feature-card .icon {
    font-size: 1.8rem;
    margin-bottom: 0.65rem;
    display: inline-block;
    animation: float 5s ease-in-out infinite;
    opacity: 0.8;
}

.feature-card h3 {
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
    color: var(--text) !important;
}

.feature-card p {
    font-size: 0.84rem;
    color: var(--text-muted);
    line-height: 1.6;
}

/* ===== RIVR STEPPER ===== */
.stepper {
    display: flex;
    gap: 0.65rem;
    margin: 1.5rem 0;
    flex-wrap: wrap;
}

.step {
    flex: 1;
    min-width: 130px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 0.9rem;
    text-align: center;
    transition: all 0.3s var(--ease-out-expo);
    position: relative;
    backdrop-filter: blur(8px);
}

.step:hover {
    border-color: var(--border);
    transform: translateY(-1px);
}

.step.active {
    border-color: var(--primary);
    background: rgba(59, 93, 191, 0.03);
    animation: glowBorder 3s ease-in-out infinite;
}

.step .step-num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(59, 93, 191, 0.06);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.4rem;
    font-size: 0.78rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.step.active .step-num {
    background: var(--primary);
    color: white;
    box-shadow: 0 0 12px rgba(59, 93, 191, 0.15);
}

.step.active .step-num::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid rgba(59, 93, 191, 0.12);
    animation: pulseRing 3s infinite;
}

/* ===== RIVR PULSE DOT ===== */
.pulse-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 5px;
    animation: pulseRing 2.5s infinite;
}

.pulse-dot.green { background: var(--success); }
.pulse-dot.amber { background: var(--warning); }
.pulse-dot.red { background: var(--danger); }
.pulse-dot.blue { background: var(--primary); }

/* ===== RIVR PROVIDER BADGE ===== */
.provider-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.68rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 100px;
    background: rgba(59, 93, 191, 0.04);
    border: 1px solid rgba(59, 93, 191, 0.08);
    backdrop-filter: blur(4px);
}

/* ===== RIVR SPINNER ===== */
.custom-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(59, 93, 191, 0.06);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

/* ===== RIVR STAT TOAST ===== */
.stat-toast {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 0.7rem 1rem;
    margin: 0.4rem 0;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideInLeft 0.5s var(--ease-out-expo);
    backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-sm);
}

.stat-toast .stat-icon {
    font-size: 1.1rem;
    opacity: 0.7;
}

.stat-toast .stat-text {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.stat-toast .stat-value {
    font-weight: 500;
    color: var(--text);
}

/* ===== RIVR DIVIDER ===== */
.glass-divider {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(30, 50, 90, 0.04), transparent);
    margin: 0.8rem 0;
}

/* ===== RIVR EXPANDER ===== */
.streamlit-expanderHeader {
    background: var(--glass-bg) !important;
    border: 1px solid var(--glass-border) !important;
    border-radius: var(--radius-md) !important;
    backdrop-filter: blur(6px) !important;
    transition: all 0.3s ease !important;
}

.streamlit-expanderHeader:hover {
    border-color: var(--border) !important;
}

/* ===== RIVR RESPONSIVE ===== */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

@media (max-width: 768px) {
    [data-testid="stAppViewContainer"] > .main .block-container {
        padding: 1rem !important;
    }
    .hero {
        padding: 2rem 1rem;
        border-radius: var(--radius-xl);
    }
    .hero h1 {
        font-size: 1.6rem !important;
    }
    .hero p {
        font-size: 0.88rem !important;
    }
    .feature-grid {
        grid-template-columns: 1fr;
    }
    .stepper {
        flex-direction: column;
    }
    .score-number {
        font-size: 2.2rem;
    }
}
</style>
"""

st.markdown(CSS, unsafe_allow_html=True)

init_db()

if "api_keys" not in st.session_state:
    st.session_state.api_keys = {}
if "messages" not in st.session_state:
    st.session_state.messages = []
if "prev_provider" not in st.session_state:
    st.session_state.prev_provider = None

with st.sidebar:
    st.markdown("""
    <div style="text-align:center;margin-bottom:0.2rem">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,rgba(91,141,239,0.15),rgba(45,212,191,0.1));border:1px solid rgba(91,141,239,0.2);margin-bottom:0.4rem;animation:float 5s ease-in-out infinite;font-size:1.2rem;font-weight:600;color:var(--primary-light)">AC</div>
    </div>
    <div style="font-family:var(--font);font-size:1.05rem;font-weight:700;background:linear-gradient(135deg,#8bb4ff,#5eead4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.1rem;text-align:center;background-size:200% 200%;animation:gradientShift 6s ease infinite;line-height:1.3">
        AI Career Suite<br><span style="font-size:0.68rem;font-weight:400;color:var(--text-dim);-webkit-text-fill-color:var(--text-dim)">Talent Intelligence &amp; Career Planning</span>
    </div>
    <div style="font-size:0.65rem;color:var(--text-dim);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1.5rem;text-align:center;opacity:0.7">
        <span class="pulse-dot blue"></span> Analyze &middot; Build &middot; Succeed
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title" style="margin-top:0;display:flex;align-items:center;gap:6px"><span class="pulse-dot blue"></span> AI Provider</div>', unsafe_allow_html=True)
    selected_provider = st.selectbox("AI Provider", list(PROVIDERS.keys()), label_visibility="collapsed", key="provider_sel")
    pinfo = PROVIDERS[selected_provider]

    free_tier_color = "var(--success)" if "free" in pinfo["free_tier"].lower() else "var(--warning)"
    st.markdown(f"""
    <div style="font-size:0.76rem;line-height:1.7;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:0.75rem;margin-bottom:1rem;animation:fadeSlideUp 0.3s ease-out">
        <b style="color:var(--text)">{pinfo['description']}</b><br>
        <span style="color:{free_tier_color};display:inline-flex;align-items:center;gap:4px"><span class="pulse-dot {'green' if 'free' in pinfo['free_tier'].lower() else 'amber'}"></span>{pinfo['free_tier']}</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""<hr class="glass-divider">""", unsafe_allow_html=True)

    st.markdown(f"<div class='section-title' style='display:flex;align-items:center;gap:6px'>{selected_provider} API Key</div>", unsafe_allow_html=True)
    saved_key = st.session_state.api_keys.get(selected_provider, "")
    entered_key = st.text_input("API Key", value=saved_key, type="password", placeholder=pinfo["placeholder"],
                                label_visibility="collapsed", key=f"apikey_{selected_provider}")

    if entered_key:
        st.session_state.api_keys[selected_provider] = entered_key.strip()

    is_local = pinfo.get("local_only", False)
    if is_local:
        st.session_state.api_keys[selected_provider] = "local"

    api_key = st.session_state.api_keys.get(selected_provider, "").strip()

    if is_local:
        st.markdown("""
        <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:8px 10px;font-size:0.74rem;color:var(--success);margin-top:4px;line-height:1.6">
            No API key needed. Runs 100% on your machine.
        </div>
        """, unsafe_allow_html=True)
    elif api_key:
        st.markdown(f"""
        <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:6px 10px;font-size:0.74rem;color:var(--success);margin-top:4px">
            Key saved: <code style="font-family:var(--font-mono);font-size:0.7rem">{api_key[:8]}...{api_key[-4:]}</code>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div style="font-size:0.74rem;color:var(--text-dim);margin-top:4px">
            Get key: <a href="{pinfo['get_key_url']}" target="_blank" style="color:var(--primary-light);text-decoration:none">{pinfo['get_key_url'].replace('https://','')}</a>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""<hr class="glass-divider">""", unsafe_allow_html=True)

    free_models, paid_models = pinfo["free_models"], pinfo["paid_models"]
    has_free, has_paid = len(free_models) > 0, len(paid_models) > 0

    if has_free and has_paid:
        tier = st.radio("Model Tier", ["Free", "Paid"], horizontal=True, key=f"tier_{selected_provider}")
        model_opts = list(free_models.keys()) if tier == "Free" else list(paid_models.keys())
    elif has_free:
        st.markdown('<span style="font-size:0.72rem;color:var(--success)">All models free</span>', unsafe_allow_html=True)
        model_opts = list(free_models.keys())
    elif has_paid:
        st.markdown('<span style="font-size:0.72rem;color:var(--warning)">Paid models only</span>', unsafe_allow_html=True)
        model_opts = list(paid_models.keys())
    else:
        model_opts = ["No models available"]

    sel_name = st.selectbox("Model", model_opts, label_visibility="collapsed", key=f"model_{selected_provider}")
    all_provider_models = {**free_models, **paid_models}
    sel_id = all_provider_models.get(sel_name, sel_name)

    if sel_id == "__custom__" or (is_local and "Ollama" in selected_provider):
        custom_model = st.text_input("Custom model name:", placeholder="e.g. llama3.2, mistral, phi4", key="ollama_custom_model")
        if custom_model.strip():
            sel_id = custom_model.strip()
        elif sel_id == "__custom__":
            sel_id = "llama3.2"

    if is_local:
        st.markdown("""
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:8px 10px;font-size:0.73rem;color:var(--warning);margin-top:6px;line-height:1.6">
            Local only. Works when running <code style="font-size:0.7rem">streamlit run app.py</code> on your machine. Not on Streamlit Cloud.
        </div>
        """, unsafe_allow_html=True)

    if not api_key:
        st.markdown("""
        <div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.2);border-radius:8px;padding:8px 10px;font-size:0.76rem;color:var(--danger);margin-top:6px;line-height:1.6">
            No API key entered. Paste your key above to use AI features.
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""<hr class="glass-divider">""", unsafe_allow_html=True)
    page = st.radio("Navigate", [
        "Analyzer", "Cover Letter", "Interview Prep", "Resume Builder",
        "Job Discovery", "AI Copilot", "Dashboard", "API Guide", "How to Use", "About"
    ], label_visibility="collapsed")
    st.markdown("""<hr class="glass-divider">""", unsafe_allow_html=True)
    st.markdown("""
    <div style="font-size:0.72rem;color:var(--text-dim);text-align:center;line-height:1.8;padding:0.5rem 0">
        <span style="display:inline-block;animation:float 3s ease-in-out infinite">Made by</span> <b style="color:var(--primary-light)">Sachin Chaudhary</b><br>
        Python &middot; Streamlit &middot; SQLite
    </div>
    """, unsafe_allow_html=True)


def chips(items, cls="chip-green"):
    if not items:
        return "<span style='color:var(--text-dim);font-size:0.82rem'>None found</span>"
    return "".join(f'<span class="chip {cls}">{item}</span>' for item in items)


def score_card(score, title):
    cls = "green" if score >= 75 else ("amber" if score >= 50 else "red")
    label_text, _ = get_score_label(score)
    st.markdown(f"""
    <div class="score-wrap {cls}">
        <div class="score-label">{title}</div>
        <div class="score-number {cls}">{score}</div>
        <div class="score-label">out of 100</div>
        <span class="score-badge {cls}">{label_text}</span>
    </div>
    """, unsafe_allow_html=True)
    st.progress(score / 100)


def ai_call(prompt, temperature=0.7, max_tokens=2500):
    if not api_key and not is_local:
        raise ValueError("No API key entered. Paste your key in the sidebar.")
    messages = [
        {"role": "system", "content": "You are precise, structured, and concise. Use markdown formatting. Be specific and reference actual input."},
        {"role": "user", "content": prompt},
    ]
    ok, err, reply = call_api(selected_provider, api_key, sel_id, messages, temperature, max_tokens)
    if not ok:
        raise ValueError(err)
    return reply


def input_resume_pdf_or_text(prefix, height=220):
    rtype = st.radio("Resume Input", ["Upload File", "Paste Text"], horizontal=True,
                     label_visibility="collapsed", key=f"{prefix}_rt")
    text = ""
    filename = ""
    if rtype == "Upload File":
        up = st.file_uploader("Upload Resume (PDF, Word .docx/.doc)", type=["pdf", "docx", "doc"], label_visibility="collapsed", key=f"{prefix}_pdf")
        if up:
            try:
                text = extract_text_from_file(up)
                filename = up.name
                st.success(f"Extracted {len(text.split())} words from **{up.name}**")
                with st.expander("Preview"):
                    st.text(text[:600] + ("..." if len(text) > 600 else ""))
            except ValueError as e:
                st.error(str(e))
    else:
        text = st.text_area("Resume Text", height=height, placeholder="Paste your resume text here...",
                            label_visibility="collapsed", key=f"{prefix}_paste")
        filename = "pasted.txt"
    return text, filename


def input_job_with_scrape(prefix):
    jt = st.text_input("Job Title", placeholder="e.g. Data Engineer", value=st.session_state.get(f"{prefix}_title", ""), key=f"{prefix}_jt")
    co = st.text_input("Company", placeholder="e.g. Google", value=st.session_state.get(f"{prefix}_company", ""), key=f"{prefix}_co")
    j_mode = st.radio("Provide Job Description:", ["Paste Text", "Scrape URL"], horizontal=True, key=f"{prefix}_j_mode")
    if j_mode == "Scrape URL":
        url = st.text_input("Job Link URL", placeholder="https://greenhouse.io/...", key=f"{prefix}_url")
        if url and st.button("Scrape Page", key=f"{prefix}_scrape"):
            with st.spinner("Extracting..."):
                data = fetch_job_description(url)
                st.session_state[f"{prefix}_fetched_jd"] = data["text"]
                if data["title"]:
                    st.session_state[f"{prefix}_title"] = data["title"]
                if data["company"]:
                    st.session_state[f"{prefix}_company"] = data["company"]
                st.rerun()
        jd = st.text_area("Extracted Job Context", value=st.session_state.get(f"{prefix}_fetched_jd", ""), height=140, key=f"{prefix}_jd")
    else:
        jd = st.text_area("Job Description", height=160, placeholder="Paste the full job posting here...", key=f"{prefix}_jd_paste")
    return jt, co, jd


# ------------------------------------------------------------------
# ANALYZER
# ------------------------------------------------------------------
if page == "Analyzer":
    st.markdown("""
    <div class="hero">
        <div class="hero-badge">ATS Score · Match Analysis · Interview Probability</div>
        <h1>Resume Analyzer</h1>
        <p>Upload your resume and job description. Get a detailed recruiter-level analysis in seconds.</p>
    </div>
    """, unsafe_allow_html=True)

    if not api_key:
        st.warning("Enter a free API key in the sidebar to begin. Try OpenRouter or NVIDIA Build.")

    c1, c2 = st.columns(2, gap="large")
    with c1:
        st.markdown('<div class="section-title">Your Resume</div>', unsafe_allow_html=True)
        resume_text, resume_file = input_resume_pdf_or_text("an")
    with c2:
        st.markdown('<div class="section-title">Job Details</div>', unsafe_allow_html=True)
        jt, co, jd = input_job_with_scrape("an")

    st.markdown("")
    if st.button("Analyze My Resume", type="primary", use_container_width=True, disabled=not api_key):
        if not resume_text.strip():
            st.error("Please provide your resume.")
        elif not jd.strip():
            st.error("Please provide the job description.")
        elif len(jd) < 50:
            st.error("Job description is too short. Paste the full posting.")
        else:
            with st.spinner("Analyzing with AI..."):
                try:
                    result = analyze_resume(selected_provider, api_key, sel_id, resume_text, jd, jt, co)
                    result.update({
                        "provider": selected_provider,
                        "model": sel_id,
                        "resume_filename": resume_file,
                        "job_title": jt,
                        "company_name": co,
                        "word_count": len(resume_text.split()),
                        "_resume_text": resume_text,
                        "_jd_text": jd,
                    })
                    save_analysis(result)
                    st.session_state["last_result"] = result
                    st.success("Analysis complete!")
                except ValueError as e:
                    st.error(str(e))

    if "last_result" in st.session_state:
        r = st.session_state["last_result"]
        st.markdown('<hr class="glass-divider">', unsafe_allow_html=True)
        if r.get("job_title"):
            st.markdown(f"<h3 style='color:var(--text)'>Results — {r['job_title']}{' @ '+r['company_name'] if r.get('company_name') else ''}</h3>", unsafe_allow_html=True)

        s1, s2, s3 = st.columns(3)
        with s1:
            score_card(r["ats_score"], "ATS Score")
        with s2:
            score_card(r["match_score"], "Job Match")
        with s3:
            score_card(r.get("hire_probability", 0), "Interview Chance")

        st.markdown(f'<div class="summary-box"><strong>AI Verdict:</strong> {r["overall_summary"]}</div>', unsafe_allow_html=True)

        col1, col2 = st.columns(2, gap="large")
        with col1:
            st.markdown('<div class="section-title">Matched Skills</div>', unsafe_allow_html=True)
            st.markdown(chips(r["matched_skills"], "chip-green"), unsafe_allow_html=True)
            st.markdown('<div class="section-title">Strengths</div>', unsafe_allow_html=True)
            for s in r.get("strengths", []):
                st.markdown(f'<div class="info-box">{s}</div>', unsafe_allow_html=True)
        with col2:
            st.markdown('<div class="section-title">Missing Skills</div>', unsafe_allow_html=True)
            st.markdown(chips(r["missing_skills"], "chip-red"), unsafe_allow_html=True)
            st.markdown('<div class="section-title">Improvements</div>', unsafe_allow_html=True)
            for tip in r.get("improvements", []):
                st.markdown(f'<div class="info-box">{tip}</div>', unsafe_allow_html=True)

        st.markdown('<div class="section-title">ATS Keywords to Add</div>', unsafe_allow_html=True)
        st.markdown(chips(r.get("keyword_suggestions", []), "chip-blue"), unsafe_allow_html=True)

        if r.get("quick_wins"):
            st.markdown('<div class="section-title">Quick Wins</div>', unsafe_allow_html=True)
            for w in r["quick_wins"]:
                st.markdown(f'<div class="win-box">{w}</div>', unsafe_allow_html=True)
        if r.get("red_flags"):
            st.markdown('<div class="section-title">Recruiter Red Flags</div>', unsafe_allow_html=True)
            for f in r["red_flags"]:
                st.markdown(f'<div class="danger-box">{f}</div>', unsafe_allow_html=True)
        if r.get("salary_insight"):
            st.markdown(f'<div class="success-box"><strong>Salary Insight:</strong> {r["salary_insight"]}</div>', unsafe_allow_html=True)

        with st.expander("Experience & Education Details"):
            e1, e2 = st.columns(2)
            with e1:
                st.markdown("**Experience Gap**")
                st.info(r.get("experience_gap", "N/A"))
            with e2:
                st.markdown("**Education Match**")
                st.info(r.get("education_match", "N/A"))

        report = f"""AI RESUME ANALYSIS REPORT
{'='*50}
Job: {r.get('job_title','N/A')} @ {r.get('company_name','N/A')}
ATS: {r['ats_score']}/100 | Match: {r['match_score']}/100 | Interview: {r.get('hire_probability',0)}/100

SUMMARY
{r['overall_summary']}

MATCHED: {', '.join(r['matched_skills'])}
MISSING: {', '.join(r['missing_skills'])}
KEYWORDS: {', '.join(r.get('keyword_suggestions',[]))}

STRENGTHS
{chr(10).join('- '+s for s in r['strengths'])}

IMPROVEMENTS
{chr(10).join('- '+s for s in r['improvements'])}

QUICK WINS
{chr(10).join('- '+s for s in r.get('quick_wins',[]))}

RED FLAGS
{chr(10).join('- '+s for s in r.get('red_flags',[]))}

SALARY: {r.get('salary_insight','N/A')}
EXPERIENCE: {r.get('experience_gap','N/A')}
EDUCATION: {r.get('education_match','N/A')}"""
        st.markdown('<div class="section-title">Download Report</div>', unsafe_allow_html=True)
        dl_base = f"analysis_{(r.get('job_title','role')).replace(' ','_')}"
        dl1, dl2, dl3 = st.columns(3)
        with dl1:
            st.download_button("Download .txt", data=report,
                               file_name=f"{dl_base}.txt",
                               mime="text/plain", use_container_width=True, key="dl_txt_an")
        with dl2:
            st.download_button("Download .docx", data=analysis_to_docx(r),
                               file_name=f"{dl_base}.docx",
                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                               use_container_width=True, key="dl_docx_an")
        with dl3:
            st.download_button("Download .pdf", data=analysis_to_pdf(r),
                               file_name=f"{dl_base}.pdf",
                               mime="application/pdf",
                               use_container_width=True, key="dl_pdf_an")

        st.markdown('<hr class="glass-divider">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Deep Analysis</div>', unsafe_allow_html=True)
        da1, da2, da3 = st.columns(3)
        with da1:
            if st.button("Competitive Positioning", use_container_width=True, key="deep_comp", disabled=not api_key):
                with st.spinner("Analyzing competitive position..."):
                    try:
                        comp = ai_call(f"""You are a senior career strategist. Analyze this resume against the target job.

RESUME: {r.get('_resume_text', resume_text)}
JOB: {r.get('job_title','the role')} at {r.get('company_name','the company')}
JD: {r.get('_jd_text', jd)}

Provide:
1. Positioning statement
2. Top 3 differentiators
3. Competitive weaknesses
4. Market demand
5. Career trajectory (2-3 years)
6. Networking strategy
7. Hidden strengths

Be specific and reference actual resume content.""", temperature=0.5, max_tokens=1500)
                        st.markdown(f'<div class="resume-output">{comp}</div>', unsafe_allow_html=True)
                        dc1, dc2, dc3 = st.columns(3)
                        with dc1:
                            st.download_button("Download .txt", data=comp, file_name="competitive_analysis.txt",
                                               mime="text/plain", use_container_width=True, key="dl_comp")
                        with dc2:
                            st.download_button("Download .docx", data=text_to_docx("Competitive Analysis", comp),
                                               file_name="competitive_analysis.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_comp_docx")
                        with dc3:
                            st.download_button("Download .pdf", data=text_to_pdf("Competitive Analysis", comp),
                                               file_name="competitive_analysis.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_comp_pdf")
                    except Exception as e:
                        st.error(str(e))
        with da2:
            if st.button("Section-by-Section Grade", use_container_width=True, key="deep_grade", disabled=not api_key):
                with st.spinner("Grading resume sections..."):
                    try:
                        grade = ai_call(f"""Grade each section of this resume for the target role.

RESUME: {r.get('_resume_text', resume_text)}
TARGET: {r.get('job_title','the role')} at {r.get('company_name','the company')}

For each section give Grade (A-F), Score (0-100), What's Good, What to Fix, Rewritten Example.
Sections: Contact Info, Summary, Work Experience, Skills, Education, Projects, Certifications, Overall Formatting.
End with an overall GPA.""", temperature=0.4, max_tokens=2500)
                        st.markdown(f'<div class="resume-output">{grade}</div>', unsafe_allow_html=True)
                        dg1, dg2, dg3 = st.columns(3)
                        with dg1:
                            st.download_button("Download .txt", data=grade, file_name="section_grades.txt",
                                               mime="text/plain", use_container_width=True, key="dl_grade")
                        with dg2:
                            st.download_button("Download .docx", data=text_to_docx("Section-by-Section Grades", grade),
                                               file_name="section_grades.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_grade_docx")
                        with dg3:
                            st.download_button("Download .pdf", data=text_to_pdf("Section-by-Section Grades", grade),
                                               file_name="section_grades.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_grade_pdf")
                    except Exception as e:
                        st.error(str(e))
        with da3:
            if st.button("AI Rewrite Suggestions", use_container_width=True, key="deep_rewrite", disabled=not api_key):
                with st.spinner("Generating rewrite suggestions..."):
                    try:
                        rewrite = ai_call(f"""Rewrite the weakest parts of this resume to score 95+ ATS.

RESUME: {r.get('_resume_text', resume_text)}
TARGET JOB: {r.get('job_title','the role')}
MISSING SKILLS: {', '.join(r.get('missing_skills',[]))}
KEYWORDS TO ADD: {', '.join(r.get('keyword_suggestions',[]))}

Provide:
1. Rewritten professional summary
2. Top 5 bullet rewrites
3. Skills section rewrite
4. 3 new bullets to add
5. LinkedIn headline (120 chars max)
6. LinkedIn summary (3 sentences)

Use exact keywords from the job description.""", temperature=0.4, max_tokens=2000)
                        st.markdown(f'<div class="resume-output">{rewrite}</div>', unsafe_allow_html=True)
                        dw1, dw2, dw3 = st.columns(3)
                        with dw1:
                            st.download_button("Download .txt", data=rewrite, file_name="rewrite_suggestions.txt",
                                               mime="text/plain", use_container_width=True, key="dl_rewrite")
                        with dw2:
                            st.download_button("Download .docx", data=text_to_docx("AI Rewrite Suggestions", rewrite),
                                               file_name="rewrite_suggestions.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_rewrite_docx")
                        with dw3:
                            st.download_button("Download .pdf", data=text_to_pdf("AI Rewrite Suggestions", rewrite),
                                               file_name="rewrite_suggestions.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_rewrite_pdf")
                    except Exception as e:
                        st.error(str(e))


# ------------------------------------------------------------------
# COVER LETTER
# ------------------------------------------------------------------
elif page == "Cover Letter":
    st.markdown("""
    <div class="hero">
        <div class="hero-badge">Cover Letters · Follow-Up · Thank You · LinkedIn · Cold Outreach</div>
        <h1>Smart Letter Generator</h1>
        <p>Generate polished, job-specific professional documents tailored to your resume.</p>
    </div>
    """, unsafe_allow_html=True)

    if not api_key:
        st.warning("Enter an API key in the sidebar to generate documents.")

    doc_type = st.radio("Document Type", ["Cover Letter", "Follow-Up Email", "Thank You Note", "LinkedIn Message", "Cold Outreach"],
                        horizontal=True, label_visibility="collapsed", key="doc_type")

    c1, c2 = st.columns(2, gap="large")
    with c1:
        st.markdown('<div class="section-title">Your Resume</div>', unsafe_allow_html=True)
        cl_r, _ = input_resume_pdf_or_text("cl", height=200)
    with c2:
        st.markdown('<div class="section-title">Job Details</div>', unsafe_allow_html=True)
        cl_jt = st.text_input("Job Title", placeholder="e.g. Data Engineer", value=st.session_state.get("cl_title", ""), key="cl_jt")
        cl_co = st.text_input("Company", placeholder="e.g. Google", value=st.session_state.get("cl_company", ""), key="cl_co")
        cl_hm = st.text_input("Hiring Manager (optional)", placeholder="e.g. Sarah Johnson", key="cl_hm")
        cl_j_mode = st.radio("Provide JD:", ["Paste Text", "Scrape URL"], horizontal=True, key="cl_j_mode")
        if cl_j_mode == "Scrape URL":
            cl_url = st.text_input("Job Link URL", placeholder="https://greenhouse.io/...", key="cl_url")
            if cl_url and st.button("Scrape Page", key="cl_scrape"):
                with st.spinner("Extracting..."):
                    data = fetch_job_description(cl_url)
                    st.session_state["cl_fetched_jd"] = data["text"]
                    if data["title"]: st.session_state["cl_title"] = data["title"]
                    if data["company"]: st.session_state["cl_company"] = data["company"]
                    st.rerun()
            cl_jd = st.text_area("Extracted Job Context", value=st.session_state.get("cl_fetched_jd", ""), height=100, key="cl_jd")
        else:
            cl_jd = st.text_area("Job Description", height=120, placeholder="Paste job posting...", key="cl_jd_paste")

    if doc_type == "Follow-Up Email":
        st.markdown('<div class="section-title">Follow-Up Details</div>', unsafe_allow_html=True)
        fu_context = st.radio("Follow-Up Context", ["After applying", "After phone screen", "After interview", "After rejection"],
                              horizontal=True, label_visibility="collapsed", key="fu_ctx")
        fu_days = st.slider("Days since last contact", 1, 30, 7, key="fu_days")
    elif doc_type == "Thank You Note":
        st.markdown('<div class="section-title">Interview Details</div>', unsafe_allow_html=True)
        ty_round = st.radio("Interview Round", ["Phone Screen", "Technical Interview", "Behavioral Interview", "Final Round"],
                            horizontal=True, label_visibility="collapsed", key="ty_round")
        ty_topic = st.text_input("Key topic discussed (optional)", placeholder="e.g. system design", key="ty_topic")
    elif doc_type == "LinkedIn Message":
        st.markdown('<div class="section-title">LinkedIn Context</div>', unsafe_allow_html=True)
        li_type = st.radio("LinkedIn Type", ["Connection request", "InMail to hiring manager", "Referral request", "Networking"],
                           horizontal=True, label_visibility="collapsed", key="li_type")

    st.markdown('<div class="section-title">Tone</div>', unsafe_allow_html=True)
    tone = st.select_slider("Tone", ["Very Formal", "Professional", "Friendly & Professional", "Enthusiastic"],
                            value="Professional", label_visibility="collapsed")

    if st.button(f"Generate {doc_type}", type="primary", use_container_width=True, disabled=not api_key):
        if not cl_r.strip():
            st.error("Please provide your resume.")
        elif not cl_jd.strip() and doc_type == "Cover Letter":
            st.error("Please provide the job description.")
        else:
            prompts = {
                "Cover Letter": f"""Write an ATS-optimized cover letter. Tone: {tone}.
RESUME: {cl_r}
JOB: {cl_jt or 'the position'} at {cl_co or 'the company'}
HIRING MANAGER: {cl_hm or 'Hiring Manager'}
JD: {cl_jd}
Rules: strong hook (not "I am writing to apply"), 3-4 paragraphs, max 380 words, 2-3 quantified achievements, 5 ATS keywords, confident CTA. Start with "Dear {cl_hm or 'Hiring Manager'},".""",
                "Follow-Up Email": f"""Write a follow-up email. Tone: {tone}.
RESUME: {cl_r}
JOB: {cl_jt or 'the position'} at {cl_co or 'the company'}
CONTEXT: {fu_context}, {fu_days} days since last contact.
Rules: subject line first, under 150 words, reference the role, add value, clear next step.""",
                "Thank You Note": f"""Write a thank-you email after an interview. Tone: {tone}.
RESUME: {cl_r}
JOB: {cl_jt or 'the position'} at {cl_co or 'the company'}
ROUND: {ty_round}
TOPIC: {ty_topic or 'general discussion'}
Rules: subject line first, under 200 words, reference specific conversation point, reinforce fit.""",
                "LinkedIn Message": f"""Write a LinkedIn message. Tone: {tone}.
RESUME: {cl_r}
TARGET: {cl_jt or 'the position'} at {cl_co or 'the company'}
TYPE: {li_type}
Rules: under 300 chars for connection request, under 500 words for InMail, specific reason for outreach, add value first.""",
                "Cold Outreach": f"""Write a cold outreach email to a hiring manager. Tone: {tone}.
RESUME: {cl_r}
TARGET: {cl_jt or 'the position'} at {cl_co or 'the company'}
Rules: catchy subject, under 120 words, lead with value, one quantified achievement, easy CTA."""
            }
            with st.spinner(f"Writing {doc_type}..."):
                try:
                    letter = ai_call(prompts[doc_type], temperature=0.75)
                    st.markdown(f'<div class="section-title">Your {doc_type}</div>', unsafe_allow_html=True)
                    st.markdown(f'<div class="resume-output">{letter}</div>', unsafe_allow_html=True)
                    fname = doc_type.lower().replace(" ", "_")
                    base_name = f"{fname}_{(cl_co or 'company').replace(' ','_')}"
                    doc_title = f"{doc_type} - {cl_co or 'Company'}"
                    st.markdown('<div class="section-title">Download</div>', unsafe_allow_html=True)
                    ld1, ld2, ld3 = st.columns(3)
                    with ld1:
                        st.download_button(f"Download .txt", data=letter,
                                           file_name=f"{base_name}.txt",
                                           mime="text/plain", use_container_width=True, key="dl_cl_txt")
                    with ld2:
                        st.download_button(f"Download .docx", data=text_to_docx(doc_title, letter, subtitle=f"{cl_jt or 'Position'} | {cl_co or ''}"),
                                           file_name=f"{base_name}.docx",
                                           mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                           use_container_width=True, key="dl_cl_docx")
                    with ld3:
                        st.download_button(f"Download .pdf", data=text_to_pdf(doc_title, letter, subtitle=f"{cl_jt or 'Position'} | {cl_co or ''}"),
                                           file_name=f"{base_name}.pdf",
                                           mime="application/pdf", use_container_width=True, key="dl_cl_pdf")
                    st.info("Always personalize the output before sending.")
                except Exception as e:
                    st.error(str(e))


# ------------------------------------------------------------------
# INTERVIEW PREP
# ------------------------------------------------------------------
elif page == "Interview Prep":
    st.markdown("""
    <div class="hero">
        <div class="hero-badge">Questions · STAR Stories · Salary Negotiation</div>
        <h1>Interview Prep Suite</h1>
        <p>AI-generated interview prep tailored to your resume and target role.</p>
    </div>
    """, unsafe_allow_html=True)

    if not api_key:
        st.warning("Enter an API key in the sidebar to generate interview prep.")

    ip_mode = st.radio("Prep Mode", ["Interview Questions", "STAR Stories", "Salary Negotiation"],
                       horizontal=True, label_visibility="collapsed", key="ip_mode")

    c1, c2 = st.columns(2, gap="large")
    with c1:
        st.markdown('<div class="section-title">Your Resume</div>', unsafe_allow_html=True)
        ip_r, _ = input_resume_pdf_or_text("ip", height=200)
    with c2:
        st.markdown('<div class="section-title">Job Details</div>', unsafe_allow_html=True)
        ip_jt = st.text_input("Job Title", placeholder="e.g. Data Engineer", value=st.session_state.get("ip_title", ""), key="ip_jt")
        ip_co = st.text_input("Company", placeholder="e.g. Google", value=st.session_state.get("ip_company", ""), key="ip_co")
        ip_j_mode = st.radio("Provide JD:", ["Paste Text", "Scrape URL"], horizontal=True, key="ip_j_mode")
        if ip_j_mode == "Scrape URL":
            ip_url = st.text_input("Job Link URL", placeholder="https://greenhouse.io/...", key="ip_url")
            if ip_url and st.button("Scrape Page", key="ip_scrape"):
                with st.spinner("Extracting..."):
                    data = fetch_job_description(ip_url)
                    st.session_state["ip_fetched_jd"] = data["text"]
                    if data["title"]: st.session_state["ip_title"] = data["title"]
                    if data["company"]: st.session_state["ip_company"] = data["company"]
                    st.rerun()
            ip_jd = st.text_area("Extracted Job Context", value=st.session_state.get("ip_fetched_jd", ""), height=100, key="ip_jd")
        else:
            ip_jd = st.text_area("Job Description", height=120, placeholder="Paste job posting...", key="ip_jd_paste")

    if ip_mode == "Interview Questions":
        st.markdown('<div class="section-title">Question Settings</div>', unsafe_allow_html=True)
        diff_col, cat_col = st.columns([1, 3])
        with diff_col:
            difficulty = st.radio("Difficulty", ["Entry Level", "Mid Level", "Senior Level"], key="ip_diff")
        with cat_col:
            q1, q2, q3, q4 = st.columns(4)
            with q1: qt = st.checkbox("Technical", value=True)
            with q2: qb = st.checkbox("Behavioral", value=True)
            with q3: qs = st.checkbox("Situational", value=True)
            with q4: qf = st.checkbox("Company Fit", value=True)
        nq = st.slider("Questions per category", 2, 5, 3)

        if st.button("Generate Interview Questions", type="primary", use_container_width=True, disabled=not api_key):
            if not ip_r.strip():
                st.error("Please provide your resume.")
            elif not ip_jd.strip():
                st.error("Please provide the job description.")
            else:
                types = [t for t, c in [
                    ("Technical (role-specific skills)", qt),
                    ("Behavioral (STAR format)", qb),
                    ("Situational (hypothetical scenarios)", qs),
                    ("Company Fit (culture, motivation)", qf)
                ] if c]
                with st.spinner("Generating interview guide..."):
                    try:
                        guide = ai_call(f"""You are a senior interviewer hiring for {ip_jt or 'tech'} roles at top companies.
DIFFICULTY: {difficulty}
RESUME: {ip_r}
ROLE: {ip_jt or 'the role'} at {ip_co or 'top company'}
JD: {ip_jd}

Generate {nq} questions for EACH category: {', '.join(types)}
For each question include: Question, Why asked, Ideal answer (3-4 bullets using actual resume content), Common mistake, Follow-up question.
Reference actual projects/skills from the resume.""", temperature=0.6)
                        st.markdown(f'<div class="resume-output">{guide}</div>', unsafe_allow_html=True)
                        iv_base = f"interview_{(ip_jt or 'prep').replace(' ','_')}"
                        iv_title = f"Interview Guide - {ip_jt or 'Role'}"
                        iv1, iv2, iv3 = st.columns(3)
                        with iv1:
                            st.download_button("Download .txt", data=guide,
                                               file_name=f"{iv_base}.txt",
                                               mime="text/plain", use_container_width=True, key="dl_iv_txt")
                        with iv2:
                            st.download_button("Download .docx", data=text_to_docx(iv_title, guide),
                                               file_name=f"{iv_base}.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_iv_docx")
                        with iv3:
                            st.download_button("Download .pdf", data=text_to_pdf(iv_title, guide),
                                               file_name=f"{iv_base}.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_iv_pdf")
                    except Exception as e:
                        st.error(str(e))

    elif ip_mode == "STAR Stories":
        star_count = st.slider("Number of STAR stories", 3, 8, 5, key="star_count")
        if st.button("Generate STAR Stories", type="primary", use_container_width=True, disabled=not api_key):
            if not ip_r.strip():
                st.error("Please provide your resume.")
            else:
                with st.spinner("Crafting STAR stories..."):
                    try:
                        stars = ai_call(f"""Create polished STAR stories from this resume for behavioral interviews.

RESUME: {ip_r}
TARGET ROLE: {ip_jt or 'tech role'} at {ip_co or 'top company'}
JD: {ip_jd or 'general tech role'}

Generate {star_count} STAR stories covering: leadership, technical challenge, teamwork, failure/recovery, initiative.
For each: Story Title, Best For, Situation, Task, Action (3-4 bullets), Result (quantified), Power Phrases.
Make them authentic and conversational.""", temperature=0.6, max_tokens=3000)
                        st.markdown(f'<div class="resume-output">{stars}</div>', unsafe_allow_html=True)
                        st1d, st2d, st3d = st.columns(3)
                        with st1d:
                            st.download_button("Download .txt", data=stars, file_name="star_stories.txt",
                                               mime="text/plain", use_container_width=True, key="dl_star_txt")
                        with st2d:
                            st.download_button("Download .docx", data=text_to_docx("STAR Stories", stars),
                                               file_name="star_stories.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_star_docx")
                        with st3d:
                            st.download_button("Download .pdf", data=text_to_pdf("STAR Stories", stars),
                                               file_name="star_stories.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_star_pdf")
                    except Exception as e:
                        st.error(str(e))

    elif ip_mode == "Salary Negotiation":
        sal_col1, sal_col2 = st.columns(2)
        with sal_col1:
            current_sal = st.text_input("Current/Last Salary (optional)", placeholder="e.g. $85,000", key="cur_sal")
        with sal_col2:
            target_sal = st.text_input("Target Salary (optional)", placeholder="e.g. $120,000", key="tgt_sal")
        if st.button("Generate Negotiation Strategy", type="primary", use_container_width=True, disabled=not api_key):
            if not ip_r.strip():
                st.error("Please provide your resume.")
            else:
                with st.spinner("Building negotiation strategy..."):
                    try:
                        neg = ai_call(f"""You are a salary negotiation expert. Create a complete negotiation strategy.

RESUME: {ip_r}
TARGET ROLE: {ip_jt or 'tech role'} at {ip_co or 'a company'}
JD: {ip_jd or 'general tech role'}
CURRENT SALARY: {current_sal or 'not disclosed'}
TARGET SALARY: {target_sal or 'market rate'}

Provide:
1. Market analysis (salary range and candidate positioning)
2. Anchor number and walk-away minimum
3. Negotiation scripts for common scenarios
4. Leverage points from resume
5. Mistakes to avoid
6. Timing guidance

Be specific with numbers.""", temperature=0.5, max_tokens=2500)
                        st.markdown(f'<div class="resume-output">{neg}</div>', unsafe_allow_html=True)
                        sn1, sn2, sn3 = st.columns(3)
                        with sn1:
                            st.download_button("Download .txt", data=neg, file_name="salary_negotiation.txt",
                                               mime="text/plain", use_container_width=True, key="dl_neg_txt")
                        with sn2:
                            st.download_button("Download .docx", data=text_to_docx("Salary Negotiation Strategy", neg),
                                               file_name="salary_negotiation.docx",
                                               mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                               use_container_width=True, key="dl_neg_docx")
                        with sn3:
                            st.download_button("Download .pdf", data=text_to_pdf("Salary Negotiation Strategy", neg),
                                               file_name="salary_negotiation.pdf",
                                               mime="application/pdf", use_container_width=True, key="dl_neg_pdf")
                    except Exception as e:
                        st.error(str(e))


# ------------------------------------------------------------------
# RESUME BUILDER
# ------------------------------------------------------------------
elif page == 'Resume Builder':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Build Fresh · Rewrite for Job · LinkedIn Optimizer</div>
        <h1>AI Resume & LinkedIn Builder</h1>
        <p>Build a complete resume from scratch, rewrite for a specific job, or optimize your LinkedIn profile.</p>
    </div>
    ''', unsafe_allow_html=True)

    if not api_key:
        st.warning('Enter an API key in the sidebar to use the resume builder.')

    mode = st.radio('Builder Mode', ['Build Fresh Resume', 'Rewrite for New Job', 'LinkedIn Profile Optimizer'],
                    horizontal=True, label_visibility='collapsed', key='rb_mode')
    st.markdown('<hr class="glass-divider">', unsafe_allow_html=True)

    if mode == 'Rewrite for New Job':
        st.markdown('<div class="info-box">Paste your current resume and target job description. AI will rewrite your resume to be ATS-optimized for that role while keeping all facts accurate.</div>', unsafe_allow_html=True)
        rw1, rw2 = st.columns(2, gap='large')
        with rw1:
            st.markdown('<div class="section-title">Your Current Resume</div>', unsafe_allow_html=True)
            rw_cur, _ = input_resume_pdf_or_text('rw', height=280)
        with rw2:
            st.markdown('<div class="section-title">Target Job</div>', unsafe_allow_html=True)
            rw_jt = st.text_input('Job Title', placeholder='e.g. Data Engineer', value=st.session_state.get('rw_title', ''), key='rw_jt')
            rw_co = st.text_input('Company (optional)', placeholder='e.g. Google', value=st.session_state.get('rw_company', ''), key='rw_co')
            rw_j_mode = st.radio('Provide JD:', ['Paste Text', 'Scrape URL'], horizontal=True, key='rw_j_mode')
            if rw_j_mode == 'Scrape URL':
                rw_url = st.text_input('Job Link URL', placeholder='https://greenhouse.io/...', key='rw_url')
                if rw_url and st.button('Scrape Page', key='rw_scrape'):
                    with st.spinner('Extracting...'):
                        data = fetch_job_description(rw_url)
                        st.session_state['rw_fetched_jd'] = data['text']
                        if data['title']: st.session_state['rw_title'] = data['title']
                        if data['company']: st.session_state['rw_company'] = data['company']
                        st.rerun()
                rw_jd = st.text_area('Extracted Job Context', value=st.session_state.get('rw_fetched_jd', ''), height=120, key='rw_jd')
            else:
                rw_jd = st.text_area('Job Description', height=200, placeholder='Paste the full job posting...', key='rw_jd_paste')

        st.markdown('<div class="section-title">Rewrite Options</div>', unsafe_allow_html=True)
        op1, op2, op3 = st.columns(3)
        with op1: rw_ats = st.checkbox('Aggressive ATS keywords', value=True, help='Heavily inject job keywords')
        with op2: rw_num = st.checkbox('Add estimated metrics', value=True, help='Add realistic numbers where missing')
        with op3: rw_lang = st.checkbox('Modernize language', value=True, help='Replace weak verbs with power verbs')

        if st.button('Rewrite My Resume', type='primary', use_container_width=True, disabled=not api_key):
            if not rw_cur.strip():
                st.error('Please provide your current resume.')
            elif not rw_jd.strip():
                st.error('Please provide the target job description.')
            elif len(rw_jd) < 50:
                st.error('Job description is too short. Paste the full posting.')
            else:
                ats_rule = 'Inject EXACT keywords from JD throughout every section. Mirror JD language precisely.' if rw_ats else 'Naturally weave in relevant keywords.'
                num_rule = 'Add realistic quantified achievements where missing. Every bullet needs a number, percentage, or scale.' if rw_num else 'Keep existing metrics.'
                lang_rule = 'Replace ALL weak verbs with power verbs. Remove filler phrases like responsible for.' if rw_lang else 'Improve language where clearly weak.'
                prompt = f'''You are an expert resume writer. Rewrite this resume for the target job.

CURRENT RESUME:
{rw_cur}

TARGET JOB: {rw_jt or 'the role'} at {rw_co or 'the company'}
JOB DESCRIPTION:
{rw_jd}

RULES:
- {ats_rule}
- {num_rule}
- {lang_rule}
- Keep ALL facts 100% accurate
- Structure: Contact -> Professional Summary -> Key Achievements -> Experience -> Skills -> Projects -> Education -> Certifications
- Summary: 3 powerful sentences with target title and top matching skills
- Skills: organized by category, job-critical skills first
- Each bullet: Power Verb + Action + Tool + Measurable Result
- Add a Key Achievements callout with 3 most impressive accomplishments
- 700-900 words, ready to copy-paste

Output the COMPLETE rewritten resume.'''
                with st.spinner(f'Rewriting resume for {rw_jt or "the role"}...'):
                    try:
                        rewritten = ai_call(prompt, temperature=0.35, max_tokens=3000)
                        st.markdown('<div class="success-box">Resume rewritten. Go to Analyzer to verify your ATS score.</div>', unsafe_allow_html=True)
                        st.markdown('<div class="section-title">Your Rewritten Resume</div>', unsafe_allow_html=True)
                        st.markdown(f'<div class="resume-output">{rewritten}</div>', unsafe_allow_html=True)
                        rw_base = f'resume_{(rw_jt or "rewritten").replace(" ", "_")}'
                        rw_title = f"Rewritten Resume - {rw_jt or 'Role'}"
                        d1, d2, d3, d4 = st.columns(4)
                        with d1:
                            st.download_button('Download .txt', data=rewritten,
                                               file_name=f'{rw_base}.txt',
                                               mime='text/plain', use_container_width=True, key='dl_rw_txt')
                        with d2:
                            st.download_button('Download .docx', data=text_to_docx(rw_title, rewritten),
                                               file_name=f'{rw_base}.docx',
                                               mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                               use_container_width=True, key='dl_rw_docx')
                        with d3:
                            st.download_button('Download .pdf', data=text_to_pdf(rw_title, rewritten),
                                               file_name=f'{rw_base}.pdf',
                                               mime='application/pdf', use_container_width=True, key='dl_rw_pdf')
                        with d4:
                            st.download_button('Both Versions .txt',
                                               data=f'ORIGINAL:\n{"="*50}\n{rw_cur}\n\nREWRITTEN:\n{"="*50}\n{rewritten}',
                                               file_name='resume_comparison.txt', mime='text/plain', use_container_width=True, key='dl_rw_both')
                    except Exception as e:
                        st.error(str(e))

    elif mode == 'Build Fresh Resume':
        st.markdown('<div class="info-box">Fill in your details and AI will build a complete ATS-optimized resume tailored to your target job.</div>', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Personal Info</div>', unsafe_allow_html=True)
        p1, p2 = st.columns(2, gap='large')
        with p1:
            rb_name = st.text_input('Full Name *', placeholder='Your Name', key='rb_name')
            rb_mail = st.text_input('Email *', placeholder='you@example.com', key='rb_mail')
            rb_ph = st.text_input('Phone', placeholder='+1 (123) 456-7890', key='rb_ph')
            rb_loc = st.text_input('Location', placeholder='City, Country', key='rb_loc')
        with p2:
            rb_tgt = st.text_input('Target Job Title *', placeholder='e.g. Data Engineer', value=st.session_state.get('rb2_title', ''), key='rb_tgt')
            rb_li = st.text_input('LinkedIn URL', placeholder='linkedin.com/in/yourname', key='rb_li')
            rb_gh = st.text_input('GitHub URL', placeholder='github.com/yourname', key='rb_gh')
            rb_port = st.text_input('Portfolio URL', placeholder='yoursite.com', key='rb_port')

        st.markdown('<div class="section-title">Education</div>', unsafe_allow_html=True)
        rb_edu = st.text_area('Education', height=80, key='rb_edu',
                              placeholder="Master's in CS, University Name, 2024-2026\nBachelor's in CS, University Name, 2019-2022")
        st.markdown('<div class="section-title">Work Experience</div>', unsafe_allow_html=True)
        rb_exp = st.text_area('Work Experience', height=120, key='rb_exp',
                              placeholder='Job Title, Company, Dates\n- Built automation scripts\n- Designed dashboards\n- Managed databases')
        st.markdown('<div class="section-title">Skills & Projects</div>', unsafe_allow_html=True)
        sk1, sk2 = st.columns(2, gap='large')
        with sk1:
            rb_sk = st.text_area('Technical Skills (comma-separated)', height=85, key='rb_sk',
                                 placeholder='Python, SQL, Power BI, Docker, AWS, REST APIs, Git')
        with sk2:
            rb_pr = st.text_area('Projects', height=85, key='rb_pr',
                                 placeholder='Project Name - Tech stack - Brief impact')
        st.markdown('<div class="section-title">Certifications & Target JD</div>', unsafe_allow_html=True)
        ce1, ce2 = st.columns(2, gap='large')
        with ce1:
            rb_cert = st.text_area('Certifications', height=75, key='rb_cert',
                                   placeholder='AWS Cloud Practitioner, Jan 2026')
        with ce2:
            rb_j_mode = st.radio('Provide Target JD:', ['Paste Text', 'Scrape URL'], horizontal=True, key='rb2_j_mode')
            if rb_j_mode == 'Scrape URL':
                rb2_url = st.text_input('Job Link URL', placeholder='https://greenhouse.io/...', key='rb2_url')
                if rb2_url and st.button('Scrape Page', key='rb2_scrape'):
                    with st.spinner('Extracting...'):
                        data = fetch_job_description(rb2_url)
                        st.session_state['rb2_fetched_jd'] = data['text']
                        if data['title']: st.session_state['rb2_title'] = data['title']
                        st.rerun()
                rb_jd = st.text_area('Extracted Job Context', value=st.session_state.get('rb2_fetched_jd', ''), height=75, key='rb_jd2')
            else:
                rb_jd = st.text_area('Target Job Description (recommended)', height=75, key='rb_jd2_paste',
                                     placeholder='Paste the job you are targeting...')

        if st.button('Build My Resume', type='primary', use_container_width=True, disabled=not api_key):
            if not rb_name.strip() or not rb_mail.strip() or not rb_tgt.strip():
                st.error('Please fill in Name, Email, and Target Job Title.')
            else:
                with st.spinner('Building your ATS-optimized resume...'):
                    try:
                        output = ai_call(f'''Build a complete ATS-optimized resume.
Name:{rb_name} | Email:{rb_mail} | Phone:{rb_ph} | Location:{rb_loc}
LinkedIn:{rb_li} | GitHub:{rb_gh} | Portfolio:{rb_port} | Target:{rb_tgt}
EDUCATION: {rb_edu}
EXPERIENCE: {rb_exp}
SKILLS: {rb_sk}
PROJECTS: {rb_pr}
CERTIFICATIONS: {rb_cert}
TARGET JD: {rb_jd or f'General {rb_tgt} role'}

Rules: Professional Summary (3 sentences, target title + top skills + value), power verbs + quantified results, skills by category, ATS keywords from JD throughout, clear section headers, 600-800 words. Output COMPLETE copy-paste-ready resume.''', temperature=0.35, max_tokens=3000)
                        st.markdown('<div class="success-box">Resume built. Go to Analyzer to check your ATS score.</div>', unsafe_allow_html=True)
                        st.markdown('<div class="section-title">Your AI-Built Resume</div>', unsafe_allow_html=True)
                        st.markdown(f'<div class="resume-output">{output}</div>', unsafe_allow_html=True)
                        rb_base = f'resume_{rb_name.replace(" ", "_")}'
                        rb_title = f"Resume - {rb_name}"
                        bd1, bd2, bd3 = st.columns(3)
                        with bd1:
                            st.download_button('Download .txt', data=output,
                                               file_name=f'{rb_base}.txt',
                                               mime='text/plain', use_container_width=True, key='dl_bd_txt')
                        with bd2:
                            st.download_button('Download .docx', data=text_to_docx(rb_title, output),
                                               file_name=f'{rb_base}.docx',
                                               mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                               use_container_width=True, key='dl_bd_docx')
                        with bd3:
                            st.download_button('Download .pdf', data=text_to_pdf(rb_title, output),
                                               file_name=f'{rb_base}.pdf',
                                               mime='application/pdf', use_container_width=True, key='dl_bd_pdf')
                    except Exception as e:
                        st.error(str(e))

    elif mode == 'LinkedIn Profile Optimizer':
        st.markdown('<div class="info-box">Paste your resume or LinkedIn profile and target role. AI will generate an optimized headline, about section, experience bullets, and featured section suggestions.</div>', unsafe_allow_html=True)
        li1, li2 = st.columns(2, gap='large')
        with li1:
            st.markdown('<div class="section-title">Resume / LinkedIn Profile</div>', unsafe_allow_html=True)
            li_text, _ = input_resume_pdf_or_text('li', height=250)
        with li2:
            st.markdown('<div class="section-title">Target Role</div>', unsafe_allow_html=True)
            li_role = st.text_input('Target Job Title', placeholder='e.g. Senior Data Engineer', key='li_role')
            li_industry = st.text_input('Industry', placeholder='e.g. FinTech, HealthTech', key='li_industry')
            li_jd = st.text_area('Target JD (optional)', height=140, placeholder='Paste a job description for tailoring...', key='li_jd')

        st.markdown('<div class="section-title">Optimize</div>', unsafe_allow_html=True)
        lo1, lo2, lo3, lo4 = st.columns(4)
        with lo1: lo_headline = st.checkbox('Headline', value=True)
        with lo2: lo_about = st.checkbox('About Section', value=True)
        with lo3: lo_exp = st.checkbox('Experience Bullets', value=True)
        with lo4: lo_featured = st.checkbox('Featured Suggestions', value=True)

        if st.button('Optimize My LinkedIn', type='primary', use_container_width=True, disabled=not api_key):
            if not li_text.strip():
                st.error('Please provide your resume or LinkedIn profile.')
            elif not li_role.strip():
                st.error('Please enter your target job title.')
            else:
                sections = [s for s, c in [
                    ('HEADLINE (120 char max, keyword-rich)', lo_headline),
                    ('ABOUT SECTION (3 paragraphs: hook + achievements + CTA)', lo_about),
                    ('EXPERIENCE BULLETS (LinkedIn-optimized, 2-3 lines each)', lo_exp),
                    ('FEATURED SECTION (3-5 suggestions)', lo_featured)
                ] if c]
                with st.spinner('Optimizing your LinkedIn profile...'):
                    try:
                        linkedin = ai_call(f'''You are a LinkedIn optimization expert.

RESUME/PROFILE: {li_text}
TARGET ROLE: {li_role}
INDUSTRY: {li_industry or 'Tech'}
TARGET JD: {li_jd or f'General {li_role} position'}

Optimize these sections:
{chr(10).join(f'- {s}' for s in sections)}

Rules:
- Use recruiter search keywords
- Headline: Title | Key Skill 1 | Key Skill 2 | Unique Value
- About: Hook question or stat, first person, 3 quantified achievements, CTA
- Experience: 2-3 line bullets with context, tools, results
- Featured: Specific content suggestions with examples
- End with a KEYWORDS section of 20 recruiter search terms

Sound human, confident, and authentic.''', temperature=0.5, max_tokens=2500)
                        st.markdown('<div class="section-title">Your Optimized LinkedIn Profile</div>', unsafe_allow_html=True)
                        st.markdown(f'<div class="resume-output">{linkedin}</div>', unsafe_allow_html=True)
                        li_title = f"LinkedIn Optimization - {li_role}"
                        ld1, ld2, ld3 = st.columns(3)
                        with ld1:
                            st.download_button('Download .txt', data=linkedin, file_name='linkedin_optimized.txt',
                                               mime='text/plain', use_container_width=True, key='dl_li_txt')
                        with ld2:
                            st.download_button('Download .docx', data=text_to_docx(li_title, linkedin),
                                               file_name='linkedin_optimized.docx',
                                               mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                               use_container_width=True, key='dl_li_docx')
                        with ld3:
                            st.download_button('Download .pdf', data=text_to_pdf(li_title, linkedin),
                                               file_name='linkedin_optimized.pdf',
                                               mime='application/pdf', use_container_width=True, key='dl_li_pdf')
                    except Exception as e:
                        st.error(str(e))


# ------------------------------------------------------------------
# JOB DISCOVERY
# ------------------------------------------------------------------
elif page == 'Job Discovery':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Smart Search · Role Matching · Market Data</div>
        <h1>Job Discovery Engine</h1>
        <p>Upload your resume and let AI recommend the best roles, companies, and direct search links.</p>
    </div>
    ''', unsafe_allow_html=True)

    if not api_key:
        st.warning('Enter an API key in the sidebar to discover roles.')

    jd_r_type = st.radio('Resume Source:', ['Upload File', 'Paste Text'], horizontal=True, key='jd_r_type')
    jd_resume = ''
    if jd_r_type == 'Upload File':
        up = st.file_uploader('Upload Resume (PDF, Word .docx/.doc)', type=['pdf', 'docx', 'doc'], label_visibility='collapsed', key='jd_pdf')
        if up: jd_resume = extract_text_from_file(up)
    else:
        jd_resume = st.text_area('Paste Resume', height=200, key='jd_paste')

    st.markdown('<div class="section-title">Location (Optional)</div>', unsafe_allow_html=True)
    jd_loc = st.text_input('Location', placeholder='e.g. Remote, New York, Bangalore', key='jd_loc', label_visibility='collapsed')

    if st.button('Discover My Next Role', type='primary', use_container_width=True, disabled=not api_key):
        if not jd_resume.strip():
            st.error('Please provide your resume first.')
        else:
            with st.spinner('Scanning roles and analyzing fit...'):
                try:
                    discovery = ai_call(f'''You are a career growth strategist. Analyze this resume and recommend jobs.

RESUME: {jd_resume}
LOCATION PREFERENCE: {jd_loc or 'Global/Remote'}

Provide:
1. RECOMMENDED ROLES: Top 3 job titles to target
2. TARGET COMPANIES: 5 specific companies (MNCs and startups)
3. SMART SEARCH STRATEGY: One sentence on filtering
4. DIRECT SEARCH LINKS: For each role, provide markdown links for LinkedIn Jobs, Indeed, and Google Jobs with proper URL encoding
5. MARKET SALARY: Estimated range based on experience
6. HIDDEN PATH: One alternative career path

Format with markdown, bold headers, and clean bullet points. Ensure URLs are properly formatted as [Label](URL).''', temperature=0.6, max_tokens=2000)
                    st.markdown('<div class="section-title">Your Career Roadmap</div>', unsafe_allow_html=True)
                    st.markdown(f'<div class="resume-output">{discovery}</div>', unsafe_allow_html=True)
                    jd1, jd2, jd3 = st.columns(3)
                    with jd1:
                        st.download_button('Download .txt', data=discovery, file_name='career_roadmap.txt',
                                           mime='text/plain', use_container_width=True, key='dl_disc_txt')
                    with jd2:
                        st.download_button('Download .docx', data=text_to_docx("Career Roadmap", discovery),
                                           file_name='career_roadmap.docx',
                                           mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                           use_container_width=True, key='dl_disc_docx')
                    with jd3:
                        st.download_button('Download .pdf', data=text_to_pdf("Career Roadmap", discovery),
                                           file_name='career_roadmap.pdf',
                                           mime='application/pdf', use_container_width=True, key='dl_disc_pdf')
                    st.info('Pro Tip: Copy one of these roles and practice a mock interview in AI Copilot.')
                except Exception as e:
                    st.error(str(e))


# ------------------------------------------------------------------
# AI COPILOT
# ------------------------------------------------------------------
elif page == 'AI Copilot':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Interactive Career Coach</div>
        <h1>AI Career Copilot</h1>
        <p>Chat with your AI career coach. Ask for rewrites, mock interviews, salary advice, and more.</p>
    </div>
    ''', unsafe_allow_html=True)

    if 'messages' not in st.session_state or not st.session_state.messages:
        st.session_state.messages = [{'role': 'assistant', 'content': 'Hello! I am your AI Career Copilot. Set your resume and job context below, or ask me anything.'}]

    if not api_key:
        st.warning('Please provide an API key in the sidebar to chat with the Copilot.')
    else:
        with st.expander('Set Context (Optional: Resume & Job Description)', expanded=False):
            c1, c2 = st.columns(2)
            with c1:
                cp_r_type = st.radio('Resume Input:', ['Paste Text', 'Upload File'], horizontal=True, key='cp_r_type')
                copilot_r = ''
                if cp_r_type == 'Upload File':
                    up = st.file_uploader('Upload Resume (PDF, Word .docx/.doc)', type=['pdf', 'docx', 'doc'], label_visibility='collapsed', key='cp_pdf')
                    if up: copilot_r = extract_text_from_file(up)
                else:
                    copilot_r = st.text_area('Resume Content', height=150, key='cp_r', placeholder='Paste your resume here...')
            with c2:
                cp_j_mode = st.radio('Provide JD:', ['Paste Text', 'Scrape URL'], horizontal=True, key='cp_j_mode')
                if cp_j_mode == 'Scrape URL':
                    cp_url = st.text_input('Job Link URL', placeholder='https://greenhouse.io/...', key='cp_url')
                    if cp_url and st.button('Scrape Page', key='cp_scrape'):
                        with st.spinner('Extracting...'):
                            data = fetch_job_description(cp_url)
                            st.session_state['cp_fetched_jd'] = data['text']
                            st.rerun()
                    copilot_jd = st.text_area('Extracted Job Context', value=st.session_state.get('cp_fetched_jd', ''), height=100, key='cp_jd')
                else:
                    copilot_jd = st.text_area('Job Description', height=150, key='cp_jd_paste', placeholder='Paste job posting here...')

        for msg in st.session_state.messages:
            with st.chat_message(msg['role']):
                st.markdown(msg['content'])

        if prompt := st.chat_input('Ask your career coach anything...'):
            st.session_state.messages.append({'role': 'user', 'content': prompt})
            with st.chat_message('user'):
                st.markdown(prompt)

            context = ''
            if copilot_r or copilot_jd:
                context += '\n[User Context]\n'
                if copilot_r: context += f'RESUME:\n{copilot_r}\n\n'
                if copilot_jd: context += f'TARGET JOB:\n{copilot_jd}\n\n'
            elif 'last_result' in st.session_state:
                lr = st.session_state['last_result']
                context += f'\n[Previous Analysis: {lr.get("job_title", "a job")} at {lr.get("company_name", "a company")}. ATS Score: {lr.get("ats_score", 0)}.]\n\n'

            system_prompt = 'You are an elite executive career coach and technical recruiter. ' + context + 'Provide concise, actionable advice. Help with resume rewrites, interview practice, salary negotiation, and job search strategy.'
            history = '\n'.join([f"{m['role'].capitalize()}: {m['content']}" for m in st.session_state.messages[-5:]])
            full_prompt = f"{system_prompt}\n\nConversation History:\n{history}\n\nAssistant:"

            with st.chat_message('assistant'):
                with st.spinner('Thinking...'):
                    try:
                        response = ai_call(full_prompt, temperature=0.6, max_tokens=1000)
                        st.markdown(response)
                        st.session_state.messages.append({'role': 'assistant', 'content': response})
                    except Exception as e:
                        st.error(str(e))


# ------------------------------------------------------------------
# DASHBOARD
# ------------------------------------------------------------------
elif page == 'Dashboard':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Progress · Trends · Insights</div>
        <h1>Career Analytics Dashboard</h1>
        <p>Track your resume improvements and identify skill gaps across all applications.</p>
    </div>
    ''', unsafe_allow_html=True)

    analyses = get_all_analyses()
    ms = get_top_missing_skills()
    st_data = get_score_trend()

    if not analyses:
        st.info('No analyses yet. Go to Analyzer to get started!')
    else:
        avg_ats = sum(a['ats_score'] for a in analyses) / len(analyses)
        avg_m = sum(a['match_score'] for a in analyses) / len(analyses)
        best = max(a['ats_score'] for a in analyses)
        m1, m2, m3, m4 = st.columns(4)
        m1.metric('Total Analyses', len(analyses))
        m2.metric('Avg ATS', f'{avg_ats:.0f}/100')
        m3.metric('Avg Match', f'{avg_m:.0f}/100')
        m4.metric('Best ATS', f'{best}/100')

        if len(st_data) >= 2:
            st.markdown('<div class="section-title">Score Improvement Over Time</div>', unsafe_allow_html=True)
            df = pd.DataFrame(st_data)
            fig_line = px.area(df, x='date', y=['ats', 'match'],
                               labels={'value': 'Score (0-100)', 'date': 'Date'},
                               color_discrete_sequence=['#6366f1', '#10b981'])
            fig_line.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                                   font=dict(color='#94a3b8'), legend_title_text='Metric',
                                   margin=dict(l=0, r=0, t=10, b=0))
            st.plotly_chart(fig_line, use_container_width=True)

        if ms:
            st.markdown('<div class="section-title">Skills You Keep Missing</div>', unsafe_allow_html=True)
            df2 = pd.DataFrame(ms).head(8).rename(columns={'count': 'times_missing'})
            fig_radar = go.Figure()
            fig_radar.add_trace(go.Scatterpolar(
                r=df2['times_missing'].tolist(),
                theta=df2['skill'].tolist(),
                fill='toself',
                name='Missing Frequency',
                line_color='#ec4899',
                fillcolor='rgba(236,72,153,0.3)'
            ))
            fig_radar.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, df2['times_missing'].max() + 1]), bgcolor='rgba(0,0,0,0)'),
                showlegend=False,
                plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#e2e8f0'), margin=dict(l=40, r=40, t=20, b=20)
            )
            st.plotly_chart(fig_radar, use_container_width=True)

        st.markdown('<div class="section-title">Analysis History</div>', unsafe_allow_html=True)
        for a in analyses:
            with st.expander(f"{a['job_title'] or 'Unknown'}{' @ '+a['company_name'] if a['company_name'] else ''} — ATS {a['ats_score']} · Match {a['match_score']} · {a['created_at'][:10]}"):
                h1, h2 = st.columns(2)
                with h1:
                    st.markdown('**Matched:**')
                    st.markdown(chips(a['matched_skills'][:8], 'chip-green'), unsafe_allow_html=True)
                with h2:
                    st.markdown('**Missing:**')
                    st.markdown(chips(a['missing_skills'][:8], 'chip-red'), unsafe_allow_html=True)
                st.markdown(f"**Summary:** {a['overall_summary']}")
                if st.button('Delete', key=f"del_{a['id']}"):
                    delete_analysis(a['id'])
                    st.rerun()

        st.markdown('<hr class="glass-divider">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">AI Career Coach</div>', unsafe_allow_html=True)
        st.markdown('<div class="info-box">Based on your analysis history, AI will create a personalized learning roadmap and career strategy.</div>', unsafe_allow_html=True)

        coach1, coach2 = st.columns(2)
        with coach1:
            if st.button('Generate Learning Roadmap', use_container_width=True, disabled=not api_key, key='coach_road'):
                all_missing, all_matched, jobs_analyzed = [], [], []
                for a in analyses:
                    all_missing.extend(a.get('missing_skills', []))
                    all_matched.extend(a.get('matched_skills', []))
                    jobs_analyzed.append(f"{a.get('job_title','Unknown')} @ {a.get('company_name','')}")
                with st.spinner('Building learning roadmap...'):
                    try:
                        roadmap = ai_call(f'''You are a senior career coach. Create a personalized learning roadmap.

JOBS ANALYZED: {', '.join(jobs_analyzed[:10])}
SKILLS THEY HAVE: {', '.join(set(all_matched))}
SKILLS THEY KEEP MISSING: {', '.join(set(all_missing))}
AVERAGE ATS SCORE: {avg_ats:.0f}/100
TOTAL ANALYSES: {len(analyses)}

Create:
1. Top 5 skills to learn (ordered by impact)
2. Learning plan for each skill (best free resource, estimated time, hands-on project)
3. 30-day action plan (week by week)
4. Quick wins (skills learnable in a weekend)
5. Career pattern analysis
6. Ideal target role

Be specific with resources. Make it actionable.''', temperature=0.5, max_tokens=2500)
                        st.markdown(f'<div class="resume-output">{roadmap}</div>', unsafe_allow_html=True)
                        rm1, rm2, rm3 = st.columns(3)
                        with rm1:
                            st.download_button('Download .txt', data=roadmap, file_name='learning_roadmap.txt',
                                               mime='text/plain', use_container_width=True, key='dl_roadmap')
                        with rm2:
                            st.download_button('Download .docx', data=text_to_docx("Learning Roadmap", roadmap),
                                               file_name='learning_roadmap.docx',
                                               mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                               use_container_width=True, key='dl_roadmap_docx')
                        with rm3:
                            st.download_button('Download .pdf', data=text_to_pdf("Learning Roadmap", roadmap),
                                               file_name='learning_roadmap.pdf',
                                               mime='application/pdf', use_container_width=True, key='dl_roadmap_pdf')
                    except Exception as e:
                        st.error(str(e))

        with coach2:
            if st.button('Export All Data', use_container_width=True, key='export_all'):
                export_lines = ['AI CAREER SUITE - COMPLETE EXPORT', '=' * 60, '']
                for a in analyses:
                    export_lines.append(f"Job: {a.get('job_title','N/A')} @ {a.get('company_name','N/A')}")
                    export_lines.append(f"Date: {a.get('created_at','N/A')}")
                    export_lines.append(f"ATS: {a['ats_score']}/100 | Match: {a['match_score']}/100")
                    export_lines.append(f"Matched: {', '.join(a.get('matched_skills',[]))}")
                    export_lines.append(f"Missing: {', '.join(a.get('missing_skills',[]))}")
                    export_lines.append(f"Summary: {a.get('overall_summary','N/A')}")
                    export_lines.append('-' * 40)
                    export_lines.append('')
                export_text = '\n'.join(export_lines)
                st.download_button('Download Export File', data=export_text, file_name='career_suite_export.txt',
                                   mime='text/plain', use_container_width=True, key='dl_export')


# ------------------------------------------------------------------
# API GUIDE
# ------------------------------------------------------------------
elif page == 'API Guide':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Free & Paid Providers · Setup Guide</div>
        <h1>API Guide</h1>
        <p>Choose the best AI provider for your needs and get started in minutes.</p>
    </div>
    ''', unsafe_allow_html=True)

    st.markdown('''
    <div class="success-box">
        <strong>Best free strategy:</strong> Start with <strong>NVIDIA Build</strong> (Gemma 4 31B, 1000 free credits),
        <strong>OpenRouter</strong> (one key, 200+ models), or <strong>Groq</strong> (fastest free inference).
    </div>
    ''', unsafe_allow_html=True)

    st.markdown('<div class="section-title">Recommended Free Providers</div>', unsafe_allow_html=True)
    providers_to_show = ['OpenRouter', 'NVIDIA Build', 'Groq', 'Google Gemini', 'Cohere', 'Hugging Face']
    for pname in providers_to_show:
        p = PROVIDERS[pname]
        st.markdown(f'''
        <div class="glass-card" style="margin-bottom:1rem">
            <h3 style="color:var(--primary-light);margin-bottom:0.5rem">{pname}</h3>
            <p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:0.75rem">{p['description']}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;font-size:0.82rem">
                <div style="background:var(--surface);border-radius:10px;padding:0.8rem;border:1px solid var(--border)">
                    <div style="color:var(--success);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:0.7rem">Free Tier</div>
                    <div style="color:var(--text);margin-top:0.3rem">{p['free_tier']}</div>
                </div>
                <div style="background:var(--surface);border-radius:10px;padding:0.8rem;border:1px solid var(--border)">
                    <div style="color:var(--primary-light);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:0.7rem">Best Models</div>
                    <div style="color:var(--text);margin-top:0.3rem">{', '.join(list(p['free_models'].keys())[:3]) or 'Paid only'}</div>
                </div>
                <div style="background:var(--surface);border-radius:10px;padding:0.8rem;border:1px solid var(--border)">
                    <div style="color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:0.7rem">Get Key</div>
                    <div style="margin-top:0.3rem"><a href="{p['get_key_url']}" target="_blank" style="color:var(--primary-light);text-decoration:none">{p['get_key_url'].replace('https://','')}</a></div>
                </div>
            </div>
        </div>
        ''', unsafe_allow_html=True)

    st.markdown('<div class="section-title">Troubleshooting</div>', unsafe_allow_html=True)
    st.markdown('''
    | Error | Cause | Fix |
    |-------|-------|-----|
    | 401 Unauthorized | Invalid API key | Recheck key, remove extra spaces |
    | 404 Not Found | Model removed | Switch to a different model |
    | 429 Rate Limit | Too many requests | Wait 60s or switch provider |
    | 402 Payment Required | No credits | Add credits or use a free provider |
    | 503 Service Unavailable | Server/model loading | Wait 30s and retry |
    | timeout | Slow response | Switch to Groq for faster inference |
    ''')


# ------------------------------------------------------------------
# HOW TO USE
# ------------------------------------------------------------------
elif page == 'How to Use':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Step-by-Step Guide</div>
        <h1>How to Use</h1>
        <p>Get the most out of AI-Powered Talent Intelligence &amp; Career Planning Platform with this simple workflow.</p>
    </div>
    ''', unsafe_allow_html=True)

    st.markdown('''
    <div class="glass-card" style="margin-bottom:1rem">
        <h3 style="color:var(--primary-light);margin-bottom:0.5rem">1. Get a Free API Key</h3>
        <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
            Go to <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--primary-light)">openrouter.ai/keys</a>, sign up with Google (no card),
            create a key, and paste it in the sidebar. Select OpenRouter and the Auto Free Router model.
        </p>
    </div>
    <div class="glass-card" style="margin-bottom:1rem">
        <h3 style="color:var(--primary-light);margin-bottom:0.5rem">2. Analyze Your Resume</h3>
        <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
            Go to Analyzer. Upload your resume PDF or paste text. Paste the full job description or scrape it from a URL.
            Click Analyze My Resume. Review ATS score, match score, missing skills, and quick wins.
        </p>
    </div>
    <div class="glass-card" style="margin-bottom:1rem">
        <h3 style="color:var(--primary-light);margin-bottom:0.5rem">3. Rewrite for the Job</h3>
        <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
            If your ATS score is below 75, go to Resume Builder -> Rewrite for New Job. Paste your resume and JD,
            choose rewrite options, and generate a tailored version. Re-analyze until you hit 80+.
        </p>
    </div>
    <div class="glass-card" style="margin-bottom:1rem">
        <h3 style="color:var(--primary-light);margin-bottom:0.5rem">4. Generate Cover Letter & Prep Interview</h3>
        <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
            Use Cover Letter to generate a tailored letter. Use Interview Prep for role-specific questions,
            STAR stories, and salary negotiation scripts.
        </p>
    </div>
    <div class="glass-card" style="margin-bottom:1rem">
        <h3 style="color:var(--primary-light);margin-bottom:0.5rem">5. Track Progress</h3>
        <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
            Visit Dashboard to see score trends over time and discover which skills you keep missing across all jobs.
            Use the AI Career Coach to generate a personalized learning roadmap.
        </p>
    </div>
    ''', unsafe_allow_html=True)


# ------------------------------------------------------------------
# ABOUT
# ------------------------------------------------------------------
elif page == 'About':
    st.markdown('''
    <div class="hero">
        <div class="hero-badge">Open Source · Privacy First · Powerful</div>
        <h1>About AI-Powered Talent Intelligence &amp; Career Planning Platform</h1>
        <p>A modern, AI-powered career assistant built to help job seekers land more interviews.</p>
    </div>
    ''', unsafe_allow_html=True)

    st.markdown('<div class="section-title">Tools</div>', unsafe_allow_html=True)
    st.markdown('''
    <div class="feature-grid">
        <div class="feature-card"><div class="icon">Analyzer</div><h3>Resume Analyzer</h3><p>ATS score, job match, interview probability, red flags, salary insight</p></div>
        <div class="feature-card"><div class="icon">Cover Letter</div><h3>Smart Letters</h3><p>Custom ATS-friendly cover letters, follow-ups, thank you notes, LinkedIn messages</p></div>
        <div class="feature-card"><div class="icon">Interview Prep</div><h3>Interview Prep</h3><p>Role-specific questions, STAR stories, salary negotiation scripts</p></div>
        <div class="feature-card"><div class="icon">Resume Builder</div><h3>Resume Builder</h3><p>Build from scratch, rewrite for a job, LinkedIn profile optimizer</p></div>
        <div class="feature-card"><div class="icon">Job Discovery</div><h3>Job Discovery</h3><p>AI recommends roles, companies, and direct search links</p></div>
        <div class="feature-card"><div class="icon">Copilot</div><h3>AI Copilot</h3><p>Interactive career coach chat for rewrites, mock interviews, salary advice</p></div>
    </div>
    ''', unsafe_allow_html=True)

    st.markdown('<div class="section-title">Details</div>', unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('''
        <div class="glass-card" style="margin-bottom:1rem">
            <h3 style="color:var(--primary-light);margin-bottom:0.5rem">AI Providers</h3>
            <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
                OpenRouter, NVIDIA Build, Groq, Google Gemini, Anthropic, OpenAI, DeepSeek, Mistral,<br>
                Together AI, Perplexity, xAI Grok, Cohere, HuggingFace, Ollama, LM Studio, llama.cpp Server.
            </p>
        </div>
        ''', unsafe_allow_html=True)
        st.markdown('''
        <div class="glass-card" style="margin-bottom:1rem">
            <h3 style="color:var(--primary-light);margin-bottom:0.5rem">Tech Stack</h3>
            <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
                Python 3.10+ · Streamlit · SQLite · Plotly · pdfplumber · BeautifulSoup
            </p>
        </div>
        ''', unsafe_allow_html=True)
    with col2:
        st.markdown('''
        <div class="glass-card" style="margin-bottom:1rem">
            <h3 style="color:var(--primary-light);margin-bottom:0.5rem">Privacy</h3>
            <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
                Resume text is sent only to your chosen AI API. Analysis history is stored locally in a SQLite database. API keys stay in your browser session only.
            </p>
        </div>
        ''', unsafe_allow_html=True)
        st.markdown('''
        <div class="glass-card" style="margin-bottom:1rem">
            <h3 style="color:var(--primary-light);margin-bottom:0.5rem">Author</h3>
            <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7">
                <b style="color:var(--text)">Sachin Chaudhary</b><br>
                Open source · Built with passion
            </p>
        </div>
        ''', unsafe_allow_html=True)
