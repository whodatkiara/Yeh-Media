import profilesRaw from "@/data/profiles.json";

export type Profile = {
  profileName: string;
  shortExplanation: string;
  observations: string[];
  recommendation: string;
};

const profilesData = profilesRaw as Record<string, Profile>;

export function getProfile(level: number | null): Profile | null {
  if (level == null) return null;
  return profilesData[String(level)] ?? null;
}
