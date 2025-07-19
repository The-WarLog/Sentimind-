# backend/gemini_analyzer.py
import os
import json
import google.generativeai as genai
from . import schemas

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def get_analysis_from_gemini(ticket_text: str) -> schemas.AnalysisResults:
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f"""
    Analyze the ticket and return a single, valid JSON object with keys: "emotion", "summary", "topic", "urgency_score".
    Ticket Text: "{ticket_text}"
    """
    response = await model.generate_content_async(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return schemas.AnalysisResult(**json.loads(cleaned_response))