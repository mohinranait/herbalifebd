"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES, expenseSchema, TExpenseForm } from "@/components/validations/expense";
import { useCreateExpenseMutation, useUpdateExpenseMutation } from "@/redux/service/accounts";
import { IExpense } from "@/redux/service/accounts/type";

import { toDay } from "./date-range";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: IExpense | null;
};

/** Stored date to the YYYY-MM-DD day in the shop's timezone. */
const storedDay = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date(value));

const ExpenseModal = ({ open, onOpenChange, expense }: Props) => {
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TExpenseForm>({ resolver: zodResolver(expenseSchema) });

  useEffect(() => {
    if (!open) return;
    reset({
      title: expense?.title || "",
      category: expense?.category || "Other",
      amount: expense?.amount ?? ("" as unknown as number),
      date: expense ? storedDay(expense.date) : toDay(new Date()),
      note: expense?.note || "",
    });
  }, [open, expense, reset]);

  const onSubmit = async (values: TExpenseForm) => {
    try {
      if (expense) {
        await updateExpense({ id: expense.id, payload: values }).unwrap();
        toast.success("Expense updated");
      } else {
        await createExpense(values).unwrap();
        toast.success("Expense added");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not save the expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>Money spent on running the shop, apart from buying products.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-title">Title</Label>
            <Input id="expense-title" placeholder="e.g. Facebook ads" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount (৳)</Label>
              <Input id="expense-amount" type="number" min={0} step="0.01" placeholder="0" {...register("amount")} />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input id="expense-date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>
            <select
              id="expense-category"
              {...register("category")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-note">Note (optional)</Label>
            <Textarea id="expense-note" rows={2} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {expense ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
