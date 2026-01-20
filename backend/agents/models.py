from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class QualityIssue(BaseModel):
    issue_type: str = Field(..., description="Type of issue, e.g., 'clarity', 'missing_criteria', 'vague'")
    suggestion: str = Field(..., description="Suggestion to fix the issue")

class BacklogItem(BaseModel):
    id: str
    title: str
    description: str
    type: Literal["feature", "bug", "chore", "improvement"]
    status: Literal["backlog", "todo", "in_progress", "done"] = "backlog"
    quality_score: Optional[int] = Field(None, ge=0, le=100)
    quality_issues: List[QualityIssue] = Field(default_factory=list)
    refined_description: Optional[str] = None
    
class FeedbackItem(BaseModel):
    id: str
    source: str
    content: str
    date: datetime = Field(default_factory=datetime.now)
    sentiment: Literal["positive", "neutral", "negative"] = "neutral"
    cluster_theme: Optional[str] = None

class FeedbackCluster(BaseModel):
    theme: str
    description: str
    related_feedback_ids: List[str]
    sentiment_distribution: dict 

class RoadmapItem(BaseModel):
    item_id: str
    week: int
    dependencies: List[str] = Field(default_factory=list)
    risk_level: Literal["low", "medium", "high"] = "low"

class AgentResponse(BaseModel):
    """Standard response wrapper for agent actions"""
    success: bool
    data: dict
    message: Optional[str] = None
