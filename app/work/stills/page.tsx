import type { Metadata } from "next";
import WorkStillsView from "@/components/WorkStillsView";

// Unlisted on purpose: see app/work/videos/page.tsx.
export const metadata: Metadata = {
  title: "In Stills | Yeh Media",
  robots: { index: false, follow: false },
};

export default function StillsPage() {
  return <WorkStillsView />;
}
