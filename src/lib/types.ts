export interface VideoData {
  id: string;
  title: string;
  viewCount: number;
}

export interface GameState {
  status: 'loading' | 'playing' | 'guessing' | 'result';
  currentVideo: VideoData | null;
  userGuess: number | null;
  score: number;
  attempts: number;
}

export interface GameSettings {
  questionCount: number;
  forceRefresh: boolean;
  timeLimit: number | null; // 秒數，null 表示無時限
}
