export interface VideoData {
  id: string;
  title: string;
  viewCount: number;
}

export interface GameSettings {
  questionCount: number;
  forceRefresh: boolean;
  timeLimit: number | null;
}
