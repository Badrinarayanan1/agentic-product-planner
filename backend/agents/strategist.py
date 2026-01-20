from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from .models import RoadmapItem, BacklogItem
from typing import List

class RoadmapPlan(BaseModel):
    items: List[RoadmapItem]
    warnings: List[str]

# Define the agent
strategist_agent = Agent(
    model='gemini-1.5-flash',
    # result_type removed
    system_prompt=(
        "You are an expert Head of Product (Roadmap Strategist). "
        "Your goal is to organize backlog items into a weekly roadmap (e.g., Week 1, Week 2, etc.). "
        "Infer dependencies based on technical logic (e.g., 'Auth' before 'Profile'). "
        "Assign weeks ensuring dependencies are met. "
        "Flag any risks or impossible schedules (e.g., too many high items in one week). "
        "Return a list of roadmap items with assigned weeks and a list of warnings if any."
    )
)

async def generate_roadmap(backlog_items: List[BacklogItem]) -> RoadmapPlan:
    """
    Generates a roadmap from backlog items.
    """
    # Create context
    items_text = "\n".join([
        f"ID: {item.id} | Title: {item.title} | Type: {item.type} | Quality: {item.quality_score}" 
        for item in backlog_items
    ])
    
    prompt = f"Generate a roadmap for the following items:\n\n{items_text}\n\nAssume a team velocity of ~3-4 items per week."
    
    schema = RoadmapPlan.model_json_schema()
    full_prompt = (
        f"{prompt}\n\n"
        f"CRITICAL: Return the result as valid JSON matching this schema:\n{schema}\n"
        "Do not include markdown formatting."
    )

    try:
        import asyncio

        # Retry logic for 429
        max_retries = 5
        result = None
        for attempt in range(max_retries):
            try:
                result = await strategist_agent.run(full_prompt)
                break
            except Exception as e:
                error_str = str(e).lower()
                if ("429" in error_str or "resource_exhausted" in error_str) and attempt < max_retries - 1:
                    wait_time = 2**(attempt + 2)  # Increased backoff: 4s, 8s, 16s, 32s, 64s
                    print(f"Rate limited (429/Resource Exhausted). Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                else:
                    raise e
        
        import json
        clean_text = result.output.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_text)
        return RoadmapPlan(**data)

    except Exception as e:
        # Re-raise the exception (no mock fallback)
        print(f"AI Failed: {e}")
        raise e
