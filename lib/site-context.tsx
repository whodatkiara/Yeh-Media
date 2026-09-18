"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import hotelsRaw from "@/data/hotels.json";

type HotelRecord = { hotelName: string; contactName: string };
const hotelsData = hotelsRaw as Record<string, HotelRecord>;

type SiteContextValue = {
  hotelSlug: string | null;
  hotelName: string | null;
  contactName: string | null;
  brandDnaLevel: number | null;
  setBrandDnaLevel: (level: number) => void;
  isRevealed: boolean;
  // The homepage's scroll-hijacked slide deck (HomeDeck) announces its
  // current slide here on mount and clears it (null) on unmount, so chrome
  // like Menu can tell whether a deck is present and jump it to a slide
  // (e.g. "Contact" → the Studio slide) instead of falling back to a
  // normal anchor scroll, which wouldn't do anything inside the deck's
  // fixed, non-scrolling viewport.
  deckIndex: number | null;
  setDeckIndex: (index: number | null) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [brandDnaLevel, setBrandDnaLevelState] = useState<number | null>(
    null,
  );
  const [deckIndex, setDeckIndex] = useState<number | null>(null);

  const params = useParams<{ hotel?: string }>();
  const rawSlug = params?.hotel;
  const hotelEntry = rawSlug ? hotelsData[rawSlug] : undefined;
  const hotelSlug = hotelEntry ? (rawSlug as string) : null;
  const hotelName = hotelEntry?.hotelName ?? null;
  const contactName = hotelEntry?.contactName ?? null;

  const setBrandDnaLevel = (level: number) => setBrandDnaLevelState(level);

  const isRevealed = brandDnaLevel !== null;

  return (
    <SiteContext.Provider
      value={{
        hotelSlug,
        hotelName,
        contactName,
        brandDnaLevel,
        setBrandDnaLevel,
        isRevealed,
        deckIndex,
        setDeckIndex,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
