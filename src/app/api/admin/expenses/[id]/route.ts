import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { parseReportDate } from "@/lib/profit-report";
import { expenseSchema } from "@/components/validations/expense";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = expenseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || "Invalid expense" },
        { status: 400 }
      );
    }

    const existing = await db.orm.expenses.where({ id }).first();
    if (!existing) {
      return NextResponse.json({ success: false, message: "Expense not found" }, { status: 404 });
    }

    const { title, category, amount, date, note } = parsed.data;
    await db.orm.expenses.where({ id }).update({
      title,
      category: category || "Other",
      amount,
      date: parseReportDate(date) ?? existing.date,
      note: note || null,
    });

    const updated = await db.orm.expenses.where({ id }).first();
    return NextResponse.json({ success: true, data: formatMongoCompat(updated) });
  } catch (error: any) {
    console.error("Update expense error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await db.orm.expenses.where({ id }).first();
    if (!existing) {
      return NextResponse.json({ success: false, message: "Expense not found" }, { status: 404 });
    }

    await db.orm.expenses.where({ id }).delete();
    return NextResponse.json({ success: true, data: formatMongoCompat(existing) });
  } catch (error: any) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}
