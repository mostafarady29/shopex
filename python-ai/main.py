from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Initialize Gemini Client
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

app = FastAPI(
    title="ShopEx AI Service",
    description="Python microservice for ShopEx AI Chatbot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are ShopEx Assistant — the official AI helper for the ShopEx e-commerce platform.

Your role:
- Help customers find products, track orders, understand return policies, and answer shopping questions.
- Help affiliates understand their commissions, generate referral links, and get marketing tips.
- Help admins get quick insights about revenue, top products, and user activity.

Behavior rules:
- Be friendly, concise, and helpful.
- If you don't know something specific about the user's data, say so honestly.
- Never make up order statuses or product details — only use information provided in context.
- Support both English and Arabic — respond in the same language the user uses.
- Keep responses under 200 words unless the user asks for detail.
"""

# Request model
class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None
    user_name: str | None = None
    user_role: str | None = None
    chat_history: list[ChatHistoryItem] | None = None
    user_orders: list[dict] | None = None

# Response model
class ChatResponse(BaseModel):
    response: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ShopEx AI Service is running"}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    try:
        # Build context from user data
        context_parts = []
        
        if request.user_name:
            context_parts.append(f"User: {request.user_name} (Role: {request.user_role or 'customer'})")
        
        if request.user_orders:
            orders_text = "\n".join([
                f"- Order #{o.get('orderId')}: {o.get('status')} | ${o.get('total')} | Items: {', '.join(o.get('items', []))}"
                for o in request.user_orders
            ])
            context_parts.append(f"Recent orders:\n{orders_text}")
        
        # Build the system instruction with context
        system_instruction = SYSTEM_PROMPT
        if context_parts:
            system_instruction += "\n\nCurrent user context:\n" + "\n".join(context_parts)

        # Build conversation contents from chat history
        contents = []
        if request.chat_history:
            for msg in request.chat_history[:-1]:  # Exclude the current message (last one)
                gemini_role = "user" if msg.role == "user" else "model"
                contents.append(types.Content(role=gemini_role, parts=[types.Part.from_text(text=msg.content)]))
        
        # Add current message
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=request.message)]))

        # Call Gemini AI with full context
        ai_response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=1024,
            ),
        )
        
        ai_reply = ai_response.text

        return ChatResponse(response=ai_reply)
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
