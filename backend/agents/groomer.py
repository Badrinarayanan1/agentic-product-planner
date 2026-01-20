from pydantic_ai import Agent, RunContext
from .models import BacklogItem, QualityIssue
import os
from typing import List

# Define the agent
groomer_agent = Agent(
    model='gemini-2.5-flash-preview-09-2025',

    system_prompt=(
        "You are an expert Product Manager assistant (Backlog Groomer). "
        "Your goal is to review backlog items for quality, clarity, and completeness. "
        "Analyze the title and description. "
        "If they are vague, missing acceptance criteria, or unclear, flag them as quality issues. "
        "Provide a concrete suggestion to improve the title and description. "
        "Assign a quality score from 0-100. "
        "Also, if the item looks like a bug, label it as such."
    )
)

async def check_quality(item: BacklogItem) -> BacklogItem:
    """
    Analyzes a backlog item and returns needed improvements.
    """
    # We pass the item as the user prompt
    prompt = f"Please review this backlog item:\nTitle: {item.title}\nDescription: {item.description}\nCurrent Type: {item.type}"
    
    # Run the agent

    schema = BacklogItem.model_json_schema()
    full_prompt = (
        f"{prompt}\n\n"
        f"CRITICAL: Return the result as valid JSON matching this schema:\n{schema}\n"
        "Do not include markdown formatting like ```json."
    )
    # Main execution block with Fallback
    try:
        import asyncio
        
        # Retry logic for 429 Rate Limits
        max_retries = 3
        result = None
        for attempt in range(max_retries):
            try:
                result = await groomer_agent.run(full_prompt)
                break
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"Rate limited (429). Retrying in {2**(attempt+1)}s...")
                    await asyncio.sleep(2**(attempt+1))
                else:
                    raise e # This will go to the outer except
        
        # Parse JSON
        import json
        clean_text = result.output.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_text)
        analyzed_item = BacklogItem(**data)
        
        # Ensure ID is preserved
        analyzed_item.id = item.id 
        return analyzed_item

    except Exception as e:
        # Re-raise the exception (no mock fallback)
        print(f"AI Failed: {e}")
        raise e

# Note: We need to handle the dependencies and env vars in main.py
