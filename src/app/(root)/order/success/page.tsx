'use client';

import { Suspense } from "react";
import SuccessPageCompo from "./components/SuccessPageCompo";
import { SuccessPageSkeleton } from "./components/SuccessSkeleton";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<SuccessPageSkeleton />}>
      <SuccessPageCompo />
    </Suspense>
  );
}
