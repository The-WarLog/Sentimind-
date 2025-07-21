import os
import json
import google.generativeai as genai
from . import schemas
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def get_analysis_from_gemini(ticket_text: str) -> schemas.AnalysisResult:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Analyze the ticket and return a single, valid JSON object with keys: "emotion", "summary", "topic", "urgency_score".
    The urgency_score must be an integer from 1 (low) to 10 (critical).
    Ticket Text: "{ticket_text}"
    """
    try:
        response = await model.generate_content_async(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return schemas.AnalysisResult(**json.loads(cleaned_response))
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error parsing Gemini response: {e}")
        raise ValueError("Failed to get a valid analysis from the AI model.")