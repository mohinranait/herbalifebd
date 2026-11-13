import { db } from "@/prisma/db";
import { parseReportDate } from "@/lib/profit-report";
import { expenseSchema } from "@/components/validations/expense";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD&category=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = parseReportDate(searchParams.get("from"));
    const to = parseReportDate(searchParams.get("to"), true);
    const category = searchParams.get("category");

    let collection = db.orm.expenses;
    if (from) collection = collection.where((e: any) => e.date.gte(from));
    if (to) collection = collection.where((e: any) => e.date.lte(to));
    if (category) collection = collection.where({ category });

    const expenses = await collection
      .orderBy([(e: any) => e.date.desc(), (e: any) => e.createdAt.desc()])
      .all();

    const total = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: expenses,
      meta: { total: expenses.length, totalAmount: Math.round(total * 100) / 100 },
    });
  } catch (error: any) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = expenseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || "Invalid expense" },
        { status: 400 }
      );
    }

    const { title, category, amount, date, note } = parsed.data;
    const expense = await db.orm.expenses.create({
      title,
      category: category || "Other",
      amount,
      date: parseReportDate(date) ?? new Date(),
      note: note || null,
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}
