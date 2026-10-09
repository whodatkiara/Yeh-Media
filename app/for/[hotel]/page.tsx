import { Suspense } from "react";
import HomeSwitch from "@/components/HomeSwitch";
import hotelsRaw from "@/data/hotels.json";

const hotelsData = hotelsRaw as Record<
  string,
  { hotelName: string; contactName: string }
>;

export function generateStaticParams() {
  return Object.keys(hotelsData).map((hotel) => ({ hotel }));
}

export default function HotelPage() {
  // See app/page.tsx for why this needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <HomeSwitch />
    </Suspense>
  );
}
