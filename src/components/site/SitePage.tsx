"use client";

import { useState } from "react";

import { useSiteContentStore } from "@/store/siteContent";
import { useTemplatesStore } from "@/store/templates";
import type { SiteLang } from "./SiteSections";
import {
  AboutSection,
  ContactSection,
  GallerySection,
  HeroSection,
  MenusSection,
  SiteFooter,
  SiteHeader,
  StandardsSection,
  StatsSection,
  TestimonialsSection,
  TrustSection,
} from "./SiteSections";

export function SitePage({ preview = false }: { preview?: boolean }) {
  const [lang, setLang] = useState<SiteLang>("en");
  const business = useSiteContentStore((state) => state.business);
  const menus = useSiteContentStore((state) => state.menus);
  const gallery = useSiteContentStore((state) => state.gallery);
  const testimonials = useSiteContentStore((state) => state.testimonials);
  const templates = useTemplatesStore((state) => state.templates);

  return (
    <div>
      <SiteHeader business={business} lang={lang} onLangChange={setLang} />
      <main>
        <HeroSection business={business} lang={lang} />
        <TrustSection business={business} lang={lang} />
        <StatsSection lang={lang} />
        <AboutSection lang={lang} />
        <MenusSection menus={menus} templates={templates} lang={lang} />
        <StandardsSection lang={lang} />
        <GallerySection items={gallery} lang={lang} />
        <TestimonialsSection items={testimonials} lang={lang} />
        <ContactSection business={business} lang={lang} interactive={!preview} />
      </main>
      <SiteFooter business={business} lang={lang} />
    </div>
  );
}
