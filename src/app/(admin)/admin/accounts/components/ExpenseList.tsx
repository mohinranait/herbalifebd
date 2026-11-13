"use client";

import { useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteExpenseMutation, useGetExpensesQuery } from "@/redux/service/accounts";
import { IExpense } from "@/redux/service/accounts/type";

import DateRangeFilter, { DateRange, presets, rangeToParams } from "./date-range";
import ExpenseModal from "./ExpenseModal";
import { money } from "./money";

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });

const ExpenseList = () => {
  const [range, setRange] = useState<DateRange>(() => presets[0].range());
  const { data, isLoading, isError } = useGetExpensesQuery(rangeToParams(range));
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<IExpense | null>(null);
  const [toDelete, setToDelete] = useState<IExpense | null>(null);

  const expenses = data?.data || [];

  const openCreate = () => {
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (expense: IExpense) => {
    setSelected(expense);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExpense(toDelete.id).unwrap();
      toast.success("Expense deleted");
      setToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not delete the expense");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Courier, advertising, packaging, salary and other costs. These are subtracted from profit.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </div>

      <DateRangeFilter range={range} onChange={setRange} />

      <Card className="py-5">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{data?.meta?.total || 0} expense(s)</p>
            <p className="text-sm">
              Total <span className="text-lg font-bold">{money(data?.meta?.totalAmount)}</span>
            </p>
          </div>

          {isError ? (
            <p className="py-8 text-center text-sm text-red-600">Could not load expenses. Please try again.</p>
          ) : isLoading ? (
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
          ) : expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-muted-foreground">No expenses in this period.</p>
              <Button variant="outline" className="mt-3" onClick={openCreate}>
                Add the first one
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">{formatDay(expense.date)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{expense.title}</p>
                        {expense.note && <p className="text-xs text-muted-foreground">{expense.note}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{expense.category || "Other"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{money(expense.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" aria-label="Edit expense" onClick={() => openEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" aria-label="Delete expense" onClick={() => setToDelete(expense)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseModal open={modalOpen} onOpenChange={setModalOpen} expense={selected} />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense</AlertDialogTitle>
            <AlertDialogDescription>
              {`Delete "${toDelete?.title}" (${money(toDelete?.amount)})? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpenseList;
