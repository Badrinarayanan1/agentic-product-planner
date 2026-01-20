# Smart PM Agent

A powerful AI-powered Product Management assistant that helps streamline backlog grooming, feedback clustering, and roadmap generation using Google's Gemini models.

## Features

- **Feedback Analysis**: Clusters raw user feedback into meaningful themes with sentiment analysis.
- **Backlog Grooming**: Automatically reviews backlog items for clarity, completeness, and quality.
- **Roadmap Generation**: Creates intelligent roadmap plans based on dependencies and risk levels.
- **Modern UI**: Clean, minimalist interface built with Next.js and Tailwind CSS (v4).

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Python 3.10+, FastAPI, PydanticAI, Google Gemini.
- **Deployment**: Render (Infrastructure as Code).

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows
   ./venv/Scripts/activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/` and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for easy deployment on [Render](https://render.com).

1. Push this repository to GitHub/GitLab.
2. In Render, create a new **Blueprint** service.
3. Connect your repository.
4. Provide your `GEMINI_API_KEY` when prompted.
5. Deploy!

See [deploy.md](./deploy.md) for detailed instructions.
