import type { Metadata } from "next";

import { SitePage } from "@/components/site/SitePage";

export const metadata: Metadata = {
  title: "Mampalli Catering | Authentic Tamil & Kerala Feasts | Thiruvarambu",
  description:
    "Woodfire Kerala Sadya and Tamil Kalyana Virundhu across Kanyakumari. Weddings, receptions, housewarmings — 50 to 5,000+ guests.",
};

export default function PublicSitePage() {
  return <SitePage />;
}
