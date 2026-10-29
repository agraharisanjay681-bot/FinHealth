"""
FinHealth Dynamic AI Chatbot - FastAPI Backend Server
Powered by official OpenAI Python SDK & Responses API (gpt-5.6)
Features:
- Safe startup validation for OPENAI_API_KEY (never prints actual key)
- Official OpenAI Responses API integration: client.responses.create()
- Financial context injection from finhealth_data.json (credit_score, income, expenses, DTI, utilization, debt, payment_history, emergency_fund)
- Detailed server-side console logging (HTTP status, error type, error message) with key masking
- Diagnostic error reporting: {"success": false, "error": "OpenAI request failed", "detail": "..."}
- Persistent conversation memory stored in finhealth_data.json
"""

import os
import sys
import re
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Header, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from jose import jwt, JWTError
from openai import OpenAI, APIError, AuthenticationError, RateLimitError, NotFoundError

# -------------------------------------------------------------
# Configuration & Environment
# -------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
dotenv_candidates = [
    ROOT_DIR / ".env",
    Path(__file__).resolve().parent / ".env",
    Path(".env").resolve()
]

for p in dotenv_candidates:
    if p.exists():
        load_dotenv(dotenv_path=p, override=True)

DATA_FILE_PATH = ROOT_DIR / "finhealth_data.json"
JWT_SECRET = os.getenv("JWT_SECRET", "finhealth-secure-jwt-secret-key-prod-2025")
JWT_ALGORITHM = "HS256"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("finhealth-fastapi")

app = FastAPI(
    title="FinHealth AI Chatbot API",
    description="Dynamic AI Financial Health Assistant powered by OpenAI (gpt-5.6)",
    version="2.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def mask_api_key(key: Optional[str]) -> str:
    """Mask an API key for safe logging without exposing secrets."""
    if not key:
        return "None"
    k = key.strip()
    if len(k) <= 8:
        return "***"
    return f"{k[:3]}...{k[-4:]}"

def sanitize_error_string(err_str: str) -> str:
    """Strip any raw API key patterns from error messages."""
    return re.sub(r'sk-[a-zA-Z0-9_-]+', 'sk-***', err_str)

def validate_openai_configuration() -> Dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    is_placeholder = key in ["", "your_key_here", "YOUR_OPENAI_API_KEY", "your_api_key_here"]
    configured = bool(key and not is_placeholder)
    model = os.getenv("OPENAI_MODEL", "gpt-5.6").strip() or "gpt-5.6"
    return {
        "configured": configured,
        "is_placeholder": is_placeholder,
        "masked_key": mask_api_key(key) if configured else "Not Set",
        "model": model
    }

@app.on_event("startup")
def on_startup():
    config = validate_openai_configuration()
    key_exists = config["configured"]
    # Safely print existence boolean (never prints the actual key)
    print(f"OPENAI_API_KEY PRESENT: {'TRUE' if key_exists else 'FALSE'}")
    logger.info(f"OPENAI_API_KEY PRESENT: {'TRUE' if key_exists else 'FALSE'}")
    if key_exists:
        logger.info(f"✓ [Startup Validation] OPENAI_API_KEY detected successfully. Model: {config['model']} | Key: {config['masked_key']}")
    else:
        logger.warning(
            "⚠️ [Startup Validation] OPENAI_API_KEY is not configured or using placeholder 'your_key_here' in .env. "
            "Please update .env with your actual OpenAI API key to enable live AI responses."
        )

# -------------------------------------------------------------
# Database Helpers (finhealth_data.json)
# -------------------------------------------------------------
def load_db() -> Dict[str, Any]:
    if DATA_FILE_PATH.exists():
        try:
            with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading database file {DATA_FILE_PATH}: {e}")
    return {
        "users": [],
        "profiles": [],
        "credit_history": [],
        "loans": [],
        "payments": [],
        "goals": [],
        "recommendations": [],
        "chat_sessions": [],
        "chat_messages": [],
        "notifications": []
    }

def save_db(data: Dict[str, Any]) -> None:
    try:
        with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Error writing to database file {DATA_FILE_PATH}: {e}")

def get_user_financial_data(user_id: Optional[str] = None):
    db_data = load_db()
    users = db_data.get("users", [])
    profiles = db_data.get("profiles", [])
    loans = db_data.get("loans", [])
    goals = db_data.get("goals", [])

    user = None
    if user_id:
        user = next((u for u in users if u.get("id") == user_id), None)
    if not user and users:
        user = next((u for u in users if u.get("id") == "usr_alex_sharma"), users[0])

    active_user_id = user.get("id") if user else "usr_alex_sharma"
    profile = next((p for p in profiles if p.get("user_id") == active_user_id), None)
    user_loans = [l for l in loans if l.get("user_id") == active_user_id]
    user_goals = [g for g in goals if g.get("user_id") == active_user_id]

    return user, profile, user_loans, user_goals

def extract_user_id_from_auth(auth_header: Optional[str]) -> Optional[str]:
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("id")
    except JWTError:
        return None

# -------------------------------------------------------------
# System Prompt & Context Construction
# -------------------------------------------------------------
def build_finhealth_system_prompt(user_name: str, profile: Optional[Dict[str, Any]], loans: List[Dict[str, Any]], goals: List[Dict[str, Any]]) -> str:
    """Builds dynamic system instructions injecting only relevant FinHealth data without fabricating numbers."""
    if profile:
        emergency_fund = profile.get("emergency_fund_balance")
        monthly_expenses = profile.get("monthly_expenses")
        emergency_months = "unavailable"
        if emergency_fund is not None and monthly_expenses and monthly_expenses > 0:
            emergency_months = f"{emergency_fund / monthly_expenses:.1f}"

        loan_summary = "None"
        if loans:
            active_loans = [l for l in loans if l.get("status") == "active"]
            if active_loans:
                loan_summary = ", ".join([f"{l.get('name')}: balance ₹{l.get('remaining_amount', 0):,.0f} (EMI ₹{l.get('emi', 0):,.0f})" for l in active_loans])

        financial_context = f"""
ADDITIONAL FINANCIAL CONTEXT (Supplementary - Use ONLY when relevant to the user's specific question):
- User Name: {user_name}
- credit_score: {profile.get('current_credit_score', 'unavailable')} / 900
- monthly_income: ₹{profile.get('monthly_income', 0):,.0f} (other: ₹{profile.get('other_income', 0):,.0f})
- monthly_expenses: ₹{profile.get('monthly_expenses', 0):,.0f} (essential: ₹{profile.get('essential_expenses', 0):,.0f}, discretionary: ₹{profile.get('discretionary_expenses', 0):,.0f})
- DTI (Debt-to-Income): {profile.get('debt_to_income_ratio', 'unavailable')}%
- credit_utilization: {profile.get('credit_utilization_ratio', 'unavailable')}% (Balance: ₹{profile.get('credit_card_balance', 0):,.0f} / Limit: ₹{profile.get('total_credit_limit', 0):,.0f})
- total_debt: ₹{profile.get('total_debt', 0):,.0f} (Monthly EMI: ₹{profile.get('monthly_emi', 0):,.0f})
- payment_history: {profile.get('missed_payments', 0)} missed, {profile.get('late_payments', 0)} late payments in past 24 months
- emergency_fund: ₹{profile.get('emergency_fund_balance', 0):,.0f} (~{emergency_months} months living expenses buffer)
- active_loans: {loan_summary}
- wellness_score: {profile.get('financial_health_score', 'unavailable')}/100
"""
    else:
        financial_context = f"\nUser {user_name} does not have a saved financial profile.\n"

    system_prompt = f"""You are FinHealth AI. Help users with financial and credit-health questions.
Answer the user's current question directly. Use personal financial data only when relevant.

{financial_context}

RULES & GUIDELINES:
1. ALWAYS answer the user's CURRENT question first.
2. Do NOT automatically repeat a full financial analysis or dump credit metrics unless the user explicitly asks for an analysis.
3. Use the user's financial data ONLY when relevant to their current question.
4. If the user asks about live market prices or specific company stocks (e.g. "What is stock price of Tesla?", "Tata Motors share price"), explain clearly that you do not have live streaming intraday ticker feeds and direct them to Google Finance, Yahoo Finance, or NSE/BSE. NEVER output the user's personal credit score or metrics for stock/market queries.
5. If the user greets you (e.g. "Hello", "Hi"), respond warmly and ask how you can help. Do NOT dump their credit metrics.
6. If the user asks a general educational question (e.g. "What is DTI?", "What is an emergency fund?"), answer the question directly with clear definitions and examples.
7. If the user asks how to improve their credit score or why their utilization is high, use their relevant financial metrics to give actionable advice.
8. If the user explicitly asks to analyze their financial health (e.g. "Analyze my financial health", "Identify my bottlenecks"), provide a comprehensive structured health summary with their metrics.
9. NEVER invent financial data or live stock prices.
10. NEVER guarantee specific score changes or loan approvals."""

    return system_prompt.strip()

# -------------------------------------------------------------
# OpenAI API Execution Engine
# -------------------------------------------------------------
def call_openai_responses_api(
    system_prompt: str,
    history: List[Dict[str, str]],
    user_message: str
) -> Dict[str, Any]:
    """
    Executes request using official OpenAI Python SDK and Responses API (client.responses.create).
    Logs HTTP status, error type, and message to server console while masking keys.
    Returns structured result with success status and answer or error details.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    is_placeholder = api_key in ["", "your_key_here", "YOUR_OPENAI_API_KEY", "your_api_key_here"]

    if not api_key or is_placeholder:
        err_msg = "OPENAI_API_KEY is not configured in .env. Please set a valid OPENAI_API_KEY in .env."
        logger.error(f"[OpenAI Error] {err_msg}")
        return {
            "success": False,
            "error": "OpenAI API request failed",
            "detail": err_msg
        }

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-5.6").strip() or "gpt-5.6"

    # Build input with conversation context if history exists
    if history:
        context_turns = []
        for h in history[-6:]:
            speaker = "User" if h.get("sender") == "user" else "FinHealth AI"
            context_turns.append(f"{speaker}: {h.get('message')}")
        formatted_input = "Previous conversation history:\n" + "\n".join(context_turns) + f"\n\nLatest user question: {user_message}"
    else:
        formatted_input = user_message

    # 1. Primary: Official OpenAI Responses API
    try:
        logger.info(f"Calling OpenAI Responses API with model='{model}'...")
        response = client.responses.create(
            model=model,
            instructions=system_prompt,
            input=formatted_input,
            timeout=30.0
        )

        answer = getattr(response, "output_text", None)
        if not answer and hasattr(response, "output") and response.output:
            output_parts = []
            for item in response.output:
                if hasattr(item, "content"):
                    for c in item.content:
                        if hasattr(c, "text"):
                            output_parts.append(c.text)
            if output_parts:
                answer = "".join(output_parts)

        if answer and answer.strip():
            logger.info("✓ OpenAI Responses API call succeeded.")
            return {
                "success": True,
                "response": answer.strip()
            }
    except Exception as e:
        status_code = getattr(e, "status_code", None)
        error_type = type(e).__name__
        raw_error_str = str(e)
        safe_error_msg = sanitize_error_string(raw_error_str)

        logger.error(
            f"[OpenAI Responses API Error]\n"
            f"  • HTTP Status: {status_code}\n"
            f"  • Error Type: {error_type}\n"
            f"  • Error Message: {safe_error_msg}"
        )

        # For authentication failure, key is invalid
        if "Authentication" in error_type or status_code == 401:
            return {
                "success": False,
                "error": "OpenAI API request failed",
                "detail": f"AuthenticationError (401): {safe_error_msg}"
            }

    # 2. Fallback: Chat Completions API with model cascade (gpt-5.6, gpt-4o, gpt-4o-mini)
    logger.info("Attempting OpenAI Chat Completions fallback...")
    models_to_try = [model]
    if model != "gpt-4o":
        models_to_try.append("gpt-4o")
    if "gpt-4o-mini" not in models_to_try:
        models_to_try.append("gpt-4o-mini")

    last_error_detail = "Failed to communicate with OpenAI API"

    for m in models_to_try:
        try:
            logger.info(f"Attempting Chat Completions with model='{m}'...")
            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-6:]:
                messages.append({
                    "role": "user" if h.get("sender") == "user" else "assistant",
                    "content": h.get("message", "")
                })
            messages.append({"role": "user", "content": user_message})

            completion = client.chat.completions.create(
                model=m,
                messages=messages,
                temperature=0.3,
                timeout=30.0
            )

            if completion.choices and completion.choices[0].message.content:
                reply = completion.choices[0].message.content.strip()
                logger.info(f"✓ OpenAI Chat Completions succeeded with model='{m}'.")
                return {
                    "success": True,
                    "response": reply
                }
        except Exception as fb_e:
            fb_status = getattr(fb_e, "status_code", None)
            fb_type = type(fb_e).__name__
            fb_safe_msg = sanitize_error_string(str(fb_e))
            last_error_detail = f"{fb_type} ({fb_status or 'unknown'}): {fb_safe_msg}"
            logger.error(
                f"[OpenAI Chat Completions Error]\n"
                f"  • Model: {m}\n"
                f"  • HTTP Status: {fb_status}\n"
                f"  • Error Type: {fb_type}\n"
                f"  • Error Message: {fb_safe_msg}"
            )
            if "Authentication" in fb_type or fb_status == 401:
                break

    return {
        "success": False,
        "error": "OpenAI request failed",
        "detail": last_error_detail
    }

# -------------------------------------------------------------
# Models
# -------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    sessionId: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    userName: Optional[str] = None

class ChatMessageModel(BaseModel):
    id: str
    session_id: str
    sender: str
    message: str
    created_at: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sessionId: str
    reply: ChatMessageModel
    disclaimer: str

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@app.get("/api/health")
def health_check():
    config = validate_openai_configuration()
    return {
        "status": "ok",
        "service": "FinHealth AI API (FastAPI)",
        "openai_configured": config["configured"],
        "model": config["model"],
        "key_status": "configured" if config["configured"] else "missing_or_placeholder",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/chat/test")
def test_openai_connection():
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    is_placeholder = api_key in ["", "your_key_here", "YOUR_OPENAI_API_KEY", "your_api_key_here"]
    if not api_key or is_placeholder:
        err_detail = "OPENAI_API_KEY is not configured in .env. Please set a valid OPENAI_API_KEY in .env."
        logger.error(f"[Test Connection Failed] {err_detail}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "OpenAI API request failed",
                "detail": err_detail
            }
        )

    model = os.getenv("OPENAI_MODEL", "gpt-5.6").strip() or "gpt-5.6"

    try:
        client = OpenAI(api_key=api_key)
        logger.info(f"Direct test of OpenAI Responses API with model='{model}'...")
        response = client.responses.create(
            model=model,
            input="Hello FinHealth AI. Reply with: CONNECTION_OK",
            timeout=15.0
        )
        answer = getattr(response, "output_text", None)
        if not answer and hasattr(response, "output") and response.output:
            parts = []
            for item in response.output:
                if hasattr(item, "content"):
                    for c in item.content:
                        if hasattr(c, "text"):
                            parts.append(c.text)
            if parts:
                answer = "".join(parts)

        logger.info(f"✓ OpenAI Responses API test connection succeeded. Reply: {answer}")
        return {
            "status": "CONNECTION_OK",
            "message": "CONNECTION_OK",
            "model": model,
            "reply": answer or "CONNECTION_OK"
        }
    except Exception as e:
        status_code = getattr(e, "status_code", None)
        error_type = type(e).__name__
        raw_error_str = str(e)
        safe_error_msg = sanitize_error_string(raw_error_str)

        logger.error(
            f"[OpenAI Test Endpoint Error]\n"
            f"  • HTTP Status: {status_code}\n"
            f"  • Error Type: {error_type}\n"
            f"  • Error Message: {safe_error_msg}"
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "OpenAI API request failed",
                "detail": f"{error_type} ({status_code or 500}): {safe_error_msg}"
            }
        )

@app.get("/api/chat/suggestions")
def get_chat_suggestions(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id_from_auth(authorization)
    _, profile, loans, _ = get_user_financial_data(user_id)

    suggestions = []
    if profile:
        util = profile.get("credit_utilization_ratio", 28)
        dti = profile.get("debt_to_income_ratio", 17)
        score = profile.get("current_credit_score", 742)

        suggestions.append({
            "category": "Analysis",
            "prompt": "Analyze my current financial health."
        })
        if util > 20:
            suggestions.append({
                "category": "Utilization",
                "prompt": f"Why is my credit utilization at {util}% and how can I lower it?"
            })
        if dti > 15:
            suggestions.append({
                "category": "DTI",
                "prompt": f"What is DTI and how does my {dti}% ratio affect me?"
            })
        suggestions.append({
            "category": "Credit Score",
            "prompt": f"How can I improve my credit score from {score}?"
        })
        suggestions.append({
            "category": "Emergency Fund",
            "prompt": "How much emergency savings should I have?"
        })
    else:
        suggestions = [
            {"category": "DTI", "prompt": "What is DTI?"},
            {"category": "Credit Score", "prompt": "How can I improve my credit score?"},
            {"category": "Utilization", "prompt": "Why is my credit utilization high?"},
            {"category": "Analysis", "prompt": "Analyze my financial health."},
            {"category": "Emergency Fund", "prompt": "What is an emergency fund?"}
        ]

    return {"suggestions": suggestions[:6]}

@app.get("/api/chat/sessions")
def list_chat_sessions(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id_from_auth(authorization) or "usr_alex_sharma"
    db_data = load_db()
    sessions = [s for s in db_data.get("chat_sessions", []) if s.get("user_id") == user_id]
    sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return {"sessions": sessions}

@app.post("/api/chat/sessions")
def create_chat_session(payload: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user_id = extract_user_id_from_auth(authorization) or "usr_alex_sharma"
    db_data = load_db()
    title = payload.get("title") or "New Conversation"
    new_sess = {
        "id": f"sess_{int(datetime.utcnow().timestamp()*1000)}",
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    db_data.setdefault("chat_sessions", []).insert(0, new_sess)
    save_db(db_data)
    return {"session": new_sess}

@app.get("/api/chat/sessions/{session_id}")
def get_chat_session(session_id: str, authorization: Optional[str] = Header(None)):
    db_data = load_db()
    session = next((s for s in db_data.get("chat_sessions", []) if s.get("id") == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    messages = [m for m in db_data.get("chat_messages", []) if m.get("session_id") == session_id]
    messages.sort(key=lambda x: x.get("created_at", ""))
    return {"session": session, "messages": messages}

@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(session_id: str, authorization: Optional[str] = Header(None)):
    db_data = load_db()
    initial_len = len(db_data.get("chat_sessions", []))
    db_data["chat_sessions"] = [s for s in db_data.get("chat_sessions", []) if s.get("id") != session_id]
    db_data["chat_messages"] = [m for m in db_data.get("chat_messages", []) if m.get("session_id") != session_id]
    save_db(db_data)
    if len(db_data["chat_sessions"]) < initial_len:
        return {"message": "Session deleted successfully"}
    raise HTTPException(status_code=404, detail="Chat session not found")

@app.post("/api/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest, authorization: Optional[str] = Header(None)):
    user_msg_text = req.message.strip() if req.message else ""
    print(f"USER QUESTION: {user_msg_text}")
    logger.info(f"USER QUESTION: {user_msg_text}")
    if not user_msg_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_id = extract_user_id_from_auth(authorization)
    user, profile, loans, goals = get_user_financial_data(user_id)
    user_name = req.userName or (user.get("name") if user else "Alex Sharma")
    active_profile = req.profile or profile

    session_id = req.conversation_id or req.sessionId or f"sess_{int(datetime.utcnow().timestamp()*1000)}"

    db_data = load_db()

    # Ensure session exists in DB
    existing_sess = next((s for s in db_data.get("chat_sessions", []) if s.get("id") == session_id), None)
    if not existing_sess:
        new_sess = {
            "id": session_id,
            "user_id": user.get("id") if user else "usr_alex_sharma",
            "title": user_msg_text[:30] + ("..." if len(user_msg_text) > 30 else ""),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        db_data.setdefault("chat_sessions", []).insert(0, new_sess)

    # Fetch conversation history for session
    existing_messages = [
        {"sender": m.get("sender", "user"), "message": m.get("message", "")}
        for m in db_data.get("chat_messages", [])
        if m.get("session_id") == session_id
    ]

    # Save user message to database
    user_msg_id = f"msg_u_{int(datetime.utcnow().timestamp()*1000)}"
    user_msg_obj = {
        "id": user_msg_id,
        "session_id": session_id,
        "sender": "user",
        "message": user_msg_text,
        "created_at": datetime.utcnow().isoformat()
    }
    db_data.setdefault("chat_messages", []).append(user_msg_obj)

    # Build dynamic prompt with financial context
    system_prompt = build_finhealth_system_prompt(user_name, active_profile, loans, goals)

    # Call OpenAI API
    ai_result = call_openai_responses_api(
        system_prompt=system_prompt,
        history=existing_messages,
        user_message=user_msg_text
    )

    if not ai_result.get("success"):
        error_detail = ai_result.get("detail", "OpenAI request failed")
        error_type = ai_result.get("error", "OpenAI request failed")

        # Save the database state with the user message recorded
        save_db(db_data)

        # Return safe diagnostic response with HTTP 500
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": error_type,
                "detail": error_detail
            }
        )

    ai_reply_text = ai_result["response"]

    # Save assistant message to database
    assistant_msg_id = f"msg_a_{int(datetime.utcnow().timestamp()*1000)}"
    assistant_msg_obj = {
        "id": assistant_msg_id,
        "session_id": session_id,
        "sender": "assistant",
        "message": ai_reply_text,
        "created_at": datetime.utcnow().isoformat()
    }
    db_data.setdefault("chat_messages", []).append(assistant_msg_obj)

    # Update session updated_at
    for s in db_data.get("chat_sessions", []):
        if s.get("id") == session_id:
            s["updated_at"] = datetime.utcnow().isoformat()
            break

    save_db(db_data)

    chat_msg_model = ChatMessageModel(
        id=assistant_msg_id,
        session_id=session_id,
        sender="assistant",
        message=ai_reply_text,
        created_at=assistant_msg_obj["created_at"]
    )

    return ChatResponse(
        response=ai_reply_text,
        conversation_id=session_id,
        sessionId=session_id,
        reply=chat_msg_model,
        disclaimer="FinHealth AI provides educational financial insights based on your provided data. It does not replace professional financial advice."
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("FASTAPI_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
