import type { Metadata } from "next";
import WorkVideosView from "@/components/WorkVideosView";

// Unlisted on purpose: not in the menu, not linked from anywhere on the
// site, and kept out of search results. It exists only to be hyperlinked.
export const metadata: Metadata = {
  title: "In Motion | Yeh Media",
  robots: { index: false, follow: false },
};

export default function VideosPage() {
  return <WorkVideosView />;
}
