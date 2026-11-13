"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, CheckCircle2, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/Table";
import Pagination from "@/components/shared/Pagination";
import { useGetCommentsQuery } from "@/redux/service/comments";
import { IComment } from "@/redux/service/comments/type";
import tableColumns from "./columns";
import Filters from "./filters";

const AllComments = () => {
  const [isParams, setIsParams] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const { data, isLoading } = useGetCommentsQuery(
    `page=${pagination.page}&limit=${pagination.limit}&${isParams}`
  );

  const comments = data?.data || [];
  const meta = data?.meta;

  const stats = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let totalRating = 0;
    let ratingCount = 0;

    comments.forEach((c: IComment) => {
      if (c.isApproved) approved++;
      else pending++;
      if (c.rating && c.rating > 0) {
        totalRating += c.rating;
        ratingCount++;
      }
    });

    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";
    return { approved, pending, avgRating };
  }, [comments]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reviews & Ratings Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Moderate customer feedback, approve ratings, and manage featured reviews
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Total Reviews
            </p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {(meta?.total || comments.length).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Approved
            </p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
              {stats.approved}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Pending Moderation
            </p>
            <p className="text-base sm:text-lg font-extrabold text-amber-600 mt-0.5">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-purple-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Average Rating
            </p>
            <p className="text-base sm:text-lg font-extrabold text-purple-600 mt-0.5">
              ★ {stats.avgRating}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Filters setParams={setIsParams} />

      {/* Table Card */}
      <Card className="p-0 border border-slate-200/90 rounded-lg shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          <DataTable columns={tableColumns} data={comments} loading={isLoading} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="pt-2">
        <Pagination
          page={meta?.page || 1}
          totalPages={meta?.totalPages || 1}
          onPageChange={(page: number) =>
            setPagination((prev) => ({ ...prev, page }))
          }
        />
      </div>
    </div>
  );
};

export default AllComments;
