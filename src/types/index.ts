export interface AuthResponse {
  token: string;
}

export interface Entry {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  [key: string]: unknown;
}

export type EntriesResponse = Entry[] | Record<string, unknown>[];

export type SummaryResponse = Record<string, unknown>;
