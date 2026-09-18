import { Suspense } from "react";
import HomeDeck from "@/components/HomeDeck";

export default function Home() {
  // HomeDeck reads a "?slide=N" param (via useSearchParams) to decide
  // where to open — Next.js requires that hook's nearest page to have a
  // Suspense boundary, since search params aren't known at build/static
  // time. No fallback content: the deck itself is the whole page, and the
  // gap this would cover is imperceptibly small client-side.
  return (
    <Suspense fallback={null}>
      <HomeDeck />
    </Suspense>
  );
}
