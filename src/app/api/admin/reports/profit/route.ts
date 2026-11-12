import { buildProfitReport, parseReportDate } from "@/lib/profit-report";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/reports/profit?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = parseReportDate(searchParams.get("from"));
    const to = parseReportDate(searchParams.get("to"), true);

    const report = await buildProfitReport(from, to);

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Profit report error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to build profit report" },
      { status: 500 }
    );
  }
}
