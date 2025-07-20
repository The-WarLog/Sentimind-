```markdown
# SentiMind AI 🧠✨

## Description

SentiMind AI is an intelligent, full-stack web application designed to analyze customer feedback at scale. By leveraging the power of large language models (LLMs) via the Gemini API, this tool provides real-time insights into customer sentiment, emotion, and urgency, transforming raw text into actionable data for support and product teams.  It offers a powerful, centralized platform to automate the analysis of customer feedback. Users can submit individual tickets or upload entire text files containing multiple customer entries.

## Features

-   **🤖 Real-Time AI Analysis:** Get instant, detailed sentiment and emotional analysis for any text.
-   **📂 Batch File Upload:** Analyze hundreds or thousands of customer feedback entries at once by uploading a simple .txt file.
-   **📜 Persistent History:** All analyses are automatically saved to a permanent database, creating a searchable and valuable record of customer sentiment.
-   **📥 Downloadable Reports:** Export detailed reports for single analyses or a full report of all completed jobs in a clean .txt format.
-   **🗑️ History Management:** Users can clear the entire analysis history to start fresh.
-   **🚀 Full-Stack Architecture:** Built with a modern, decoupled architecture featuring a robust Python backend and a responsive React frontend.
-   **☁️ Cloud-Native:** Fully deployable on cloud platforms like Render and GitHub Pages, ensuring global accessibility and scalability.

## Technologies Used

-   Frontend: React (with Vite), Tailwind CSS
-   Backend: FastAPI (Python), Uvicorn with Gunicorn
-   AI Model: Google Gemini API
-   Database: PostgreSQL
-   Deployment: Render (Backend & DB), GitHub Pages (Frontend)

## Installation

### Frontend

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`

### Backend

1.  Navigate to the backend directory: `cd backend`
2.  Create a virtual environment (recommended): `python3 -m venv venv`
3.  Activate the virtual environment:
    -   On Linux/macOS: `source venv/bin/activate`
    -   On Windows: `venv\Scripts\activate`
4.  Install dependencies: `pip install -r requirements.txt`
5.  Set up PostgreSQL database (see backend documentation for details)
6.  Configure environment variables (e.g., Gemini API key, database connection string)

## Usage

### Frontend

1.  Navigate to the frontend directory: `cd frontend`
2.  Start the development server: `npm run dev`
3.  Open your browser and navigate to the address provided by Vite (usually `http://localhost:5173/`).

### Backend

1.  Navigate to the backend directory: `cd backend`
2.  Start the server using Uvicorn: `uvicorn main:app --reload` (for development) or using Gunicorn for production.

### Interacting with the Application

1.  Submit individual text entries for analysis through the frontend.
2.  Upload `.txt` files containing multiple customer feedback entries.
3.  View analysis history and download reports through the frontend interface.


```