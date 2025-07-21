import os
import json
import re
import google.generativeai as genai
from . import schemas
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def is_valid_feedback(text: str) -> bool:
    """
    Checks if the input text contains at least one word-like structure.
    """
    if len(text) > 5000:
        return False
    if re.search(r'[a-zA-Z]{3,}', text):
        return True
    return False

async def get_analysis_from_gemini(ticket_text: str) -> schemas.AnalysisResult:
    if not is_valid_feedback(ticket_text):
        raise ValueError("Invalid input: The submitted text does not contain meaningful content.")

    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # UPDATED: The prompt is now more intelligent.
    prompt = f"""
    Analyze the customer feedback text below and return a single, valid JSON object with keys: "emotion", "summary", "topic", "urgency_score".
    
    Instructions:
    1.  The urgency_score must be an integer from 1 (low) to 10 (critical).
    2.  Possible emotions are: 'anger', 'delight', 'sadness', 'neutral', 'confusion'.
    3.  The topic should be a short, descriptive category of the feedback.
    4.  **Crucially, if the text is not valid customer feedback (e.g., it's a random sentence, a news headline, a poem, or nonsensical), set the "topic" to "Irrelevant".**

    Ticket Text: "{ticket_text}"
    """
    try:
        response = await model.generate_content_async(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        result = schemas.AnalysisResult(**json.loads(cleaned_response))

        # We can add a final check here as a safeguard
        if result.topic.lower() == 'irrelevant':
            result.urgency_score = 1
            result.emotion = 'neutral'

        return result
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error parsing Gemini response: {e}")
        raise ValueError("Failed to get a valid analysis from the AI model.")
