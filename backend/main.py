from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import List

# Load env variables
load_dotenv()

# Configure Pydantic AI to use native Google Gemini
if os.getenv("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from agents.models import BacklogItem, FeedbackItem, FeedbackCluster, AgentResponse
from agents.groomer import check_quality
from agents.analyst import cluster_feedback
from agents.strategist import generate_roadmap, RoadmapPlan

app = FastAPI(title="Smart PM Agent API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Smart PM Agent API is running"}

@app.post("/api/groom", response_model=BacklogItem)
async def groom_item(item: BacklogItem):
    try:
        result = await check_quality(item)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cluster-feedback", response_model=List[FeedbackCluster])
async def feedback_clusters(items: List[FeedbackItem]):
    try:
        result = await cluster_feedback(items)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/roadmap", response_model=RoadmapPlan)
async def create_roadmap(items: List[BacklogItem]):
    try:
        result = await generate_roadmap(items)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
