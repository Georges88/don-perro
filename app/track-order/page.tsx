import TrackOrderView from "@/components/order/TrackOrderView";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Track Your Order | Don Perro",
  description: "Stay updated on your Don Perro order delivery status, estimated arrival, and live tracking routes.",
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-secondary text-sm font-semibold">Trawling cargo dispatch registries...</p>
      </div>
    }>
      <TrackOrderView />
    </Suspense>
  );
}
