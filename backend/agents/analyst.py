from pydantic_ai import Agent, RunContext
from .models import FeedbackCluster, FeedbackItem
from typing import List

# Define the agent
analyst_agent = Agent(
    model='gemini-2.5-flash-preview-09-2025',
    # result_type removed
    system_prompt=(
        "You are an expert Product Manager/User Researcher (Feedback Analyst). "
        "Your goal is to analyze a list of raw feedback items and cluster them into meaningful themes. "
        "For each cluster, identify the core theme, write a description, and list the IDs of the feedback items that belong to it. "
        "Also analyze the overall sentiment distribution for the cluster."
    )
)

async def cluster_feedback(items: List[FeedbackItem]) -> List[FeedbackCluster]:
    """
    Clusters feedback items into themes.
    """
    # Create a string representation of the feedback
    feedback_text = "\n".join([f"ID: {item.id} | Content: {item.content} | Source: {item.source}" for item in items])
    
    prompt = f"Please analyze and cluster the following feedback items:\n\n{feedback_text}"
    
    # Schema injection
    from pydantic import TypeAdapter
    schema = TypeAdapter(List[FeedbackCluster]).json_schema()
    full_prompt = (
        f"{prompt}\n\n"
        f"CRITICAL: Return the result as valid JSON list matching this schema:\n{schema}\n"
        "Do not include markdown formatting."
    )

    try:
        import asyncio
        
        # Retry logic for 429
        max_retries = 3
        result = None
        for attempt in range(max_retries):
            try:
                result = await analyst_agent.run(full_prompt)
                break
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"Rate limited (429). Retrying in {2**(attempt+1)}s...")
                    await asyncio.sleep(2**(attempt+1))
                else:
                    raise e

        import json
        clean_text = result.output.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_text)
        return [FeedbackCluster(**item) for item in data]

    except Exception as e:
        # Re-raise the exception (no mock fallback)
        print(f"AI Failed: {e}")
        raise e
