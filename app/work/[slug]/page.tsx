import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import { caseStudies, caseStudyBySlug } from "@/data/case-studies";

// Only the slugs in data/case-studies.ts exist; anything else is a 404. (The
// fixed /work/videos and /work/stills pages are separate folders and win over
// this one.)
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: `${study.project} | Yeh Media`,
    description: study.standfirst,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();
  return <CaseStudyView study={study} />;
}
