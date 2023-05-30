export interface Category {
  id: number|string;
  name: string;
}

export interface ApiQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers: string[];
  user_answer?: string;
}

export interface Results {
  questions: Question[];
  score: number;
}

export interface TokenResponse extends ApiResponse {
  response_message: string;
  token: string;
}

export interface ResetTokenResponse extends ApiResponse {
  token: string;
}

interface ApiResponse {
  response_code: ResponseCode;
} 


export type Difficulty = "Easy" | "Medium" | "Hard";
export type ResponseCode = 0 | 1 | 2 | 3 | 4;