export type MediaType = 'book' | 'song' | 'movie' | 'tv-show';

export interface RiskCategory {
  score: number;
  label: string;
  reason: string;
}

export interface AnalysisResult {
  title: string;
  type: MediaType;
  overallRisk: number;
  categories: {
    bullying: RiskCategory;
    violence: RiskCategory;
    psychological: RiskCategory;
    cultural: RiskCategory;
    insult: RiskCategory;
  };
  detailedExplanation: string;
  ageRecommendation: string;
  riskyPhrases: string[];
}
