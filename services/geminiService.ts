import { SocialInsightsResponse, TrendingData } from "../types";

export const fetchSocialInsights = async (
  industry: string,
  timezone: string
): Promise<SocialInsightsResponse> => {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ industry, timezone }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch insights');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching insights:", error);
    throw error;
  }
};

export const fetchTrendingTopics = async (industry: string): Promise<TrendingData> => {
  try {
    const response = await fetch('/api/trending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ industry }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trending topics');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    // Return empty state on error
    return { items: [], rawText: "Could not fetch trending topics via API.", sources: [] };
  }
};