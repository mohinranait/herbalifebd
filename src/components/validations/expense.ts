import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "Courier",
  "Advertising",
  "Packaging",
  "Salary",
  "Rent",
  "Utilities",
  "Other",
] as const;

export const expenseSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  category: z.string().trim().optional(),
  amount: z.coerce.number().positive("Amount must be more than 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
  note: z.string().trim().optional(),
});

export type TExpenseForm = z.infer<typeof expenseSchema>;
