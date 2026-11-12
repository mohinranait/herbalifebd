import { format } from "date-fns";
import { Calendar, ShoppingBag, ArrowRight } from "lucide-react";
import Analytics from "./components/analytics";
import Orders from "./components/Orders";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            <span>আজ {format(new Date(), "dd MMMM, yyyy")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            স্বাগতম, আপনার কাস্টমার ড্যাশবোর্ড 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার সকল অর্ডার, ডেলিভারি ট্র্যাকিং এবং খরচ একনজরে পর্যালোচনা করুন।
          </p>
        </div>

        <Link href="/shop" className="shrink-0">
          <Button className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm rounded-xl h-10 px-5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>নতুন কেনাকাটা</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Stats Analytics Cards */}
      <Analytics />

      {/* Recent Orders Component */}
      <Orders />
    </div>
  );
}
