export interface AuthResponse {
  token: string;
}

export interface Entry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export type SummaryCategory = {
  category: string;
  total: number;
};

export type SummaryDay = {
  date: string;
  total: number;
};

export interface Summary {
  month: string;
  total: number;
  totalPorCategoria: SummaryCategory[];
  totalPorDia: SummaryDay[];
}

export type EntriesResponse = Entry[];

export type CategoriesResponse = string[];

export interface EntryPayload {
  description: string;
  amount: number;
  category: string;
  date: string;
  source?: string;
}

export interface ExtraEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
}

export interface PlanningData {
  salaryByMonth: Record<string, number>;
  extrasByMonth: Record<string, ExtraEntry[]>;
  fixedBills: FixedBill[];
}

export type PlanningExtra = {
  id: string;
  label?: string;
  description?: string;
  date?: string;
  amount: number;
};

export type PlanningBill = {
  id: string;
  label?: string;
  name?: string;
  amount: number;
  dueDay?: number;
};

export type Planning = {
  salaryByMonth: Record<string, number>;
  extrasByMonth: Record<string, PlanningExtra[]>;
  fixedBills: PlanningBill[];
};

export const DEFAULT_PLANNING: Planning = {
  salaryByMonth: {},
  extrasByMonth: {},
  fixedBills: [],
};
