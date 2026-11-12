import type { ProfitReport } from "@/lib/profit-report";

export interface IExpense {
  _id: string;
  title: string;
  category?: string;
  amount: number;
  date: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseListResponse {
  success: boolean;
  data: IExpense[];
  meta: { total: number; totalAmount: number };
}

export interface IProfitReportResponse {
  success: boolean;
  data: ProfitReport;
}
