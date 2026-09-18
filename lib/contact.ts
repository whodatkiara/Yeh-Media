import siteData from "@/data/site.json";

// The /contact page's qualifying questionnaire — see app/contact/page.tsx.
// Zero-backend: compile the answers into one message and hand off to the
// visitor's own mail client, addressed to the studio. contactEmail in
// data/site.json is a placeholder until there's a real inbox to send to.
export type SurveyAnswers = {
  propertyType?: string;
  location?: string;
  size?: string;
  needs: string[];
  engagement?: string;
  hasTeam?: string;
  timeline?: string;
  name?: string;
  role?: string;
  hotelName?: string;
  email?: string;
  phone?: string;
  heardFrom?: string;
  notes?: string;
};

export function buildSurveyMessage(a: SurveyAnswers): string {
  const lines: string[] = ["Hi Yeh Media, I'd like to get in touch."];

  if (a.name) {
    lines.push(`Name: ${a.name}${a.role ? ` (${a.role})` : ""}`);
  }
  if (a.hotelName) lines.push(`Property: ${a.hotelName}`);
  if (a.propertyType) lines.push(`Type: ${a.propertyType}`);
  if (a.location) lines.push(`Location: ${a.location}`);
  if (a.size) lines.push(`Size: ${a.size}`);
  if (a.needs.length > 0) lines.push(`Looking for: ${a.needs.join(", ")}`);
  if (a.engagement) lines.push(`Engagement: ${a.engagement}`);
  if (a.hasTeam) lines.push(`Existing content team: ${a.hasTeam}`);
  if (a.timeline) lines.push(`Timeline: ${a.timeline}`);
  if (a.email) lines.push(`Email: ${a.email}`);
  if (a.phone) lines.push(`Phone: ${a.phone}`);
  if (a.heardFrom) lines.push(`Heard from: ${a.heardFrom}`);
  if (a.notes && a.notes.trim().length > 0) lines.push(`Notes: ${a.notes.trim()}`);

  return lines.join("\n");
}

export function buildSurveyMailtoLink(a: SurveyAnswers): string {
  const subject = a.hotelName ? `New enquiry: ${a.hotelName}` : "New enquiry";
  const body = buildSurveyMessage(a);
  return `mailto:${siteData.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
