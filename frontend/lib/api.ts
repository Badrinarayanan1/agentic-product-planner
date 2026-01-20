
const API_BASE_URL = 'http://localhost:8000/api';

export interface BacklogItem {
    id: string;
    title: string;
    description: string;
    type: "feature" | "bug" | "chore" | "improvement";
    status: "backlog" | "todo" | "in_progress" | "done";
    quality_score?: number;
    quality_issues: { issue_type: string; suggestion: string }[];
    refined_description?: string;
}

export interface FeedbackItem {
    id: string;
    source: string;
    content: string;
    sentiment?: string;
}

export interface FeedbackCluster {
    theme: string;
    description: string;
    related_feedback_ids: string[];
}

export interface RoadmapPlan {
    items: {
        item_id: string;
        week: number;
        dependencies: string[];
        risk_level: string;
    }[];
    warnings: string[];
}

export async function groomItem(item: BacklogItem): Promise<BacklogItem> {
    const res = await fetch(`${API_BASE_URL}/groom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to groom item');
    return res.json();
}

export async function clusterFeedback(items: FeedbackItem[]): Promise<FeedbackCluster[]> {
    const res = await fetch(`${API_BASE_URL}/cluster-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error('Failed to cluster feedback');
    return res.json();
}

export async function generateRoadmap(items: BacklogItem[]): Promise<RoadmapPlan> {
    const res = await fetch(`${API_BASE_URL}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error('Failed to generate roadmap');
    return res.json();
}
