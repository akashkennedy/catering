"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  List,
  Rating,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { MessageCircle, Phone } from "lucide-react";

import { preferredText, type Label } from "@/lib/i18n";
import { formatINR } from "@/lib/format";
import { validatePhone } from "@/lib/phone";
import type { FoodTemplate } from "@/store/templates";
import type {
  SiteBusiness,
  SiteGalleryItem,
  SiteMenu,
  SiteTestimonial,
} from "@/store/siteContent";
import {
  GOOGLE_MAPS_URL,
  SITE_ABOUT,
  SITE_CONTACT,
  SITE_FOOTER,
  SITE_GALLERY_CATEGORY_LABELS,
  SITE_GALLERY_SECTION,
  SITE_HERO,
  SITE_MENU_SECTION,
  SITE_NAV,
  SITE_SPECIALITIES,
  SITE_STANDARDS,
  SITE_STATS,
  SITE_TESTIMONIALS_SECTION,
  SITE_TRUST_CARDS,
} from "@/lib/siteCopy";

export type SiteLang = "en" | "ta";

function t(label: Label, lang: SiteLang): string {
  return preferredText(label, lang);
}

function SectionHead({ eyebrow, title, lang }: { eyebrow: Label; title: Label; lang: SiteLang }) {
  return (
    <Stack gap={4} mb="lg" align="center" ta="center">
      <Text size="sm" fw={600} c="dimmed">
        {t(eyebrow, lang)}
      </Text>
      <Title order={2}>{t(title, lang)}</Title>
    </Stack>
  );
}

export function SiteHeader({
  business,
  lang,
  onLangChange,
}: {
  business: SiteBusiness;
  lang: SiteLang;
  onLangChange: (lang: SiteLang) => void;
}) {
  const callHref = business.phones[0] ? `tel:${business.phones[0].replace(/\s/g, "")}` : undefined;
  const links = [
    { href: "#home", label: SITE_NAV.home },
    { href: "#about", label: SITE_NAV.about },
    { href: "#menu", label: SITE_NAV.menu },
    { href: "#gallery", label: SITE_NAV.gallery },
    { href: "#testimonials", label: SITE_NAV.testimonials },
    { href: "#contact", label: SITE_NAV.contact },
  ];
  return (
    <header className="site-header">
      <Container size="lg" className="site-header__inner">
        <Anchor href="#home" className="site-header__brand">
          {t(SITE_FOOTER.name, lang)}
        </Anchor>
        <nav className="site-header__nav" aria-label="Site">
          {links.map((link) => (
            <Anchor key={link.href} href={link.href} className="site-header__link">
              {t(link.label, lang)}
            </Anchor>
          ))}
        </nav>
        <Group gap="xs">
          <Group gap={4}>
            <Button
              variant={lang === "en" ? "filled" : "subtle"}
              size="xs"
              onClick={() => onLangChange("en")}
            >
              EN
            </Button>
            <Button
              variant={lang === "ta" ? "filled" : "subtle"}
              size="xs"
              onClick={() => onLangChange("ta")}
            >
              தமிழ்
            </Button>
          </Group>
          {callHref && (
            <Button
              component="a"
              href={callHref}
              variant="light"
              size="xs"
              leftSection={<Phone size={14} />}
            >
              {t(SITE_NAV.callDesk, lang)}
            </Button>
          )}
          <Button component="a" href="#contact" size="xs" visibleFrom="sm">
            {t(SITE_NAV.bookFeast, lang)}
          </Button>
        </Group>
      </Container>
    </header>
  );
}

export function HeroSection({ business, lang }: { business: SiteBusiness; lang: SiteLang }) {
  const callHref = business.phones[0] ? `tel:${business.phones[0].replace(/\s/g, "")}` : "#contact";
  return (
    <section id="home" className="site-hero">
      <Container size="lg">
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Badge variant="light" size="lg">
                {t(SITE_HERO.badge, lang)}
              </Badge>
              <Title order={1}>{t(SITE_HERO.title, lang)}</Title>
              <Text size="lg" c="dimmed">
                {t(SITE_HERO.subtitle, lang)}
              </Text>
              <Group>
                <Button component="a" href="#contact" size="md">
                  {t(SITE_HERO.quoteCta, lang)}
                </Button>
                <Button component="a" href="#menu" size="md" variant="default">
                  {t(SITE_HERO.menusCta, lang)}
                </Button>
              </Group>
              {callHref !== "#contact" && (
                <Anchor href={callHref}>
                  <Phone size={14} style={{ verticalAlign: -2 }} /> {business.phones[0]}
                </Anchor>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            {SITE_HERO.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE_HERO.photoUrl} alt={t(SITE_HERO.title, lang)} className="site-photo" loading="lazy" />
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </section>
  );
}

export function TrustSection({ business, lang }: { business: SiteBusiness; lang: SiteLang }) {
  const waHref = business.whatsapp ? `https://wa.me/${business.whatsapp}` : undefined;
  return (
    <section className="site-section">
      <Container size="lg">
        <Grid>
          {SITE_TRUST_CARDS.map((card) => (
            <Grid.Col key={card.title.en} span={{ base: 6, md: 3 }}>
              <Card withBorder padding="md" h="100%">
                <Text fw={700}>{t(card.title, lang)}</Text>
                <Text size="sm" c="dimmed">
                  {t(card.desc, lang)}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        <Stack gap="xs" mt="lg">
          {SITE_SPECIALITIES.map((item) => (
            <div key={item.title.en}>
              <Text fw={600}>{t(item.title, lang)}</Text>
              <Text size="sm" c="dimmed">
                {t(item.desc, lang)}
              </Text>
            </div>
          ))}
        </Stack>
        {waHref && (
          <Button
            component="a"
            href={waHref}
            target="_blank"
            rel="noreferrer"
            mt="md"
            leftSection={<MessageCircle size={16} />}
          >
            WhatsApp
          </Button>
        )}
      </Container>
    </section>
  );
}

export function StatsSection({ lang }: { lang: SiteLang }) {
  return (
    <section className="site-section site-band">
      <Container size="lg">
        <Grid>
          {SITE_STATS.map((stat) => (
            <Grid.Col key={stat.value} span={{ base: 6, md: 3 }} ta="center">
              <Text size="xl" fw={800}>
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed">
                {t(stat.label, lang)}
              </Text>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

export function AboutSection({ lang }: { lang: SiteLang }) {
  return (
    <section id="about" className="site-section">
      <Container size="lg">
        <SectionHead eyebrow={SITE_ABOUT.eyebrow} title={SITE_ABOUT.title} lang={lang} />
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="sm">
              {SITE_ABOUT.paras.map((para) => (
                <Text key={para.en.slice(0, 24)}>{t(para, lang)}</Text>
              ))}
              <List spacing="xs" mt="sm">
                {SITE_ABOUT.checklist.map((item) => (
                  <List.Item key={item.en}>{t(item, lang)}</List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            {SITE_ABOUT.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE_ABOUT.photoUrl} alt={t(SITE_ABOUT.title, lang)} className="site-photo" loading="lazy" />
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </section>
  );
}

function MenuCard({
  menu,
  templates,
  lang,
}: {
  menu: SiteMenu;
  templates: FoodTemplate[];
  lang: SiteLang;
}) {
  const linked = menu.templateId
    ? (templates.find((item) => item.id === menu.templateId) ?? null)
    : null;
  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <div>
          <Badge variant="light" mb="xs">
            {lang === "ta" ? menu.tagTa.trim() || menu.tagEn : menu.tagEn}
          </Badge>
          <Title order={3}>
            {lang === "ta" ? menu.nameTa.trim() || menu.nameEn : menu.nameEn}
          </Title>
          {(menu.descEn || menu.descTa) && (
            <Text c="dimmed">{lang === "ta" ? menu.descTa.trim() || menu.descEn : menu.descEn}</Text>
          )}
        </div>
        {menu.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.photoUrl}
            alt={menu.nameEn}
            className="site-photo"
            loading="lazy"
          />
        )}
        {menu.courses.map((course) => (
          <div key={course.id}>
            <Text fw={600}>
              {lang === "ta" ? course.nameTa.trim() || course.nameEn : course.nameEn}
            </Text>
            <List size="sm" c="dimmed">
              {course.items.map((item, idx) => (
                <List.Item key={`${course.id}-${idx}`}>
                  {lang === "ta" ? item.ta.trim() || item.en : item.en}
                </List.Item>
              ))}
            </List>
          </div>
        ))}
        {linked && linked.dishes.length > 0 && (
          <div>
            <Text fw={600} size="sm">
              {linked.nameEn}
            </Text>
            <Text size="sm" c="dimmed">
              {linked.dishes.map((dish) => dish.nameEn).join(", ")}
            </Text>
          </div>
        )}
        {menu.price > 0 && (
          <Text fw={800} size="lg">
            {formatINR(menu.price)}
            {t(SITE_MENU_SECTION.perLeaf, lang)}
          </Text>
        )}
        <Button component="a" href="#contact" variant="light">
          {t(SITE_MENU_SECTION.enquire, lang)}
        </Button>
      </Stack>
    </Card>
  );
}

export function MenusSection({
  menus,
  templates,
  lang,
}: {
  menus: SiteMenu[];
  templates: FoodTemplate[];
  lang: SiteLang;
}) {
  const [active, setActive] = useState<string | null>(menus[0]?.id ?? null);
  const current = menus.find((menu) => menu.id === active) ?? menus[0] ?? null;
  if (menus.length === 0) return null;
  return (
    <section id="menu" className="site-section">
      <Container size="lg">
        <SectionHead
          eyebrow={SITE_MENU_SECTION.eyebrow}
          title={SITE_MENU_SECTION.title}
          lang={lang}
        />
        <Text ta="center" c="dimmed" mb="lg">
          {t(SITE_MENU_SECTION.subtitle, lang)}
        </Text>
        <Tabs value={active} onChange={setActive}>
          <Tabs.List grow>
            {menus.map((menu) => (
              <Tabs.Tab key={menu.id} value={menu.id}>
                {lang === "ta" ? menu.nameTa.trim() || menu.nameEn : menu.nameEn}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <div style={{ marginTop: 16 }}>
          {current && <MenuCard menu={current} templates={templates} lang={lang} />}
        </div>
      </Container>
    </section>
  );
}

export function StandardsSection({ lang }: { lang: SiteLang }) {
  return (
    <section className="site-section">
      <Container size="lg">
        <Grid>
          {SITE_STANDARDS.map((card) => (
            <Grid.Col key={card.title.en} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder padding="md" h="100%">
                <Text fw={700}>{t(card.title, lang)}</Text>
                <Text size="sm" c="dimmed">
                  {t(card.desc, lang)}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

function InstagramEmbed({ url, caption }: { url: string; caption: string }) {
  return (
    <div>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
      >
        <div style={{ padding: 16 }}>
          <a href={url} target="_blank" rel="noreferrer">
            {caption || "View this post on Instagram"}
          </a>
        </div>
      </blockquote>
      <Anchor href={url} target="_blank" rel="noreferrer" size="sm" display="block" mt="xs">
        {caption || url}
      </Anchor>
    </div>
  );
}

export function GallerySection({
  items,
  lang,
}: {
  items: SiteGalleryItem[];
  lang: SiteLang;
}) {
  const [filter, setFilter] = useState<string>("all");
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [items, filter]);
  if (items.length === 0) return null;
  const visible = filter === "all" ? items : items.filter((item) => item.category === filter);
  return (
    <section id="gallery" className="site-section">
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      <Container size="lg">
        <SectionHead
          eyebrow={SITE_GALLERY_SECTION.eyebrow}
          title={SITE_GALLERY_SECTION.title}
          lang={lang}
        />
        <Group justify="center" mb="lg">
          <Button variant={filter === "all" ? "filled" : "default"} size="xs" onClick={() => setFilter("all")}>
            {t(SITE_GALLERY_SECTION.all, lang)}
          </Button>
          {Object.entries(SITE_GALLERY_CATEGORY_LABELS).map(([value, label]) => (
            <Button
              key={value}
              variant={filter === value ? "filled" : "default"}
              size="xs"
              onClick={() => setFilter(value)}
            >
              {t(label, lang)}
            </Button>
          ))}
        </Group>
        <Grid>
          {visible.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder padding="xs">
                {item.kind === "instagram" ? (
                  <InstagramEmbed
                    url={item.url}
                    caption={
                      lang === "ta" ? item.captionTa.trim() || item.captionEn : item.captionEn
                    }
                  />
                ) : (
                  <>
                    {item.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.captionEn} className="site-photo" loading="lazy" />
                    )}
                    <Text size="sm" fw={500} mt="xs">
                      {lang === "ta" ? item.captionTa.trim() || item.captionEn : item.captionEn}
                    </Text>
                  </>
                )}
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return <Rating value={Math.min(5, Math.max(1, Math.round(value)))} readOnly size="sm" />;
}

export function TestimonialsSection({
  items,
  lang,
}: {
  items: SiteTestimonial[];
  lang: SiteLang;
}) {
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className="site-section">
      <Container size="lg">
        <SectionHead
          eyebrow={SITE_TESTIMONIALS_SECTION.eyebrow}
          title={SITE_TESTIMONIALS_SECTION.title}
          lang={lang}
        />
        <Grid>
          {items.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, md: 4 }}>
              <Card withBorder padding="md" h="100%">
                <Stack gap="sm">
                  <Stars value={item.rating} />
                  <Text size="sm">
                    “{lang === "ta" ? item.quoteTa.trim() || item.quoteEn : item.quoteEn}”
                  </Text>
                  <div>
                    <Text fw={600} size="sm">
                      {item.author}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {[item.event, item.place].filter(Boolean).join(" • ")}
                    </Text>
                  </div>
                  {item.source === "google" && (
                    <Group gap="xs">
                      <Badge variant="light" size="sm">
                        G · {t(SITE_TESTIMONIALS_SECTION.googleBadge, lang)}
                      </Badge>
                      {item.profileUrl && (
                        <Anchor href={item.profileUrl} target="_blank" rel="noreferrer" size="xs">
                          {item.profileUrl}
                        </Anchor>
                      )}
                    </Group>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {GOOGLE_MAPS_URL && (
          <Group justify="center" mt="lg">
            <Button component="a" href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" variant="light">
              {t(SITE_TESTIMONIALS_SECTION.reviewUs, lang)}
            </Button>
          </Group>
        )}
      </Container>
    </section>
  );
}

export function ContactSection({
  business,
  lang,
  interactive = true,
}: {
  business: SiteBusiness;
  lang: SiteLang;
  interactive?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState<string | null>(null);
  const [guests, setGuests] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!name.trim() || !phone.trim() || !date || !eventType || !guests || !location.trim()) {
      setError(lang === "ta" ? "அனைத்து * புலங்களையும் நிரப்பவும்." : "Please fill all * fields.");
      return;
    }
    if (!validatePhone(phone)) {
      setError(
        lang === "ta"
          ? "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்."
          : "Enter a valid 10-digit mobile number."
      );
      return;
    }
    const lines = [
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Date: ${date}`,
      `Event: ${eventType}`,
      `Guests: ${guests}`,
      `Location: ${location.trim()}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ].filter(Boolean);
    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank"
    );
  };

  return (
    <section id="contact" className="site-section">
      <Container size="lg">
        <SectionHead
          eyebrow={SITE_CONTACT.eyebrow}
          title={SITE_CONTACT.title}
          lang={lang}
        />
        <Text ta="center" c="dimmed" mb="lg">
          {t(SITE_CONTACT.subtitle, lang)}
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder padding="lg">
              <Stack gap="sm">
                <TextInput
                  label={t(SITE_CONTACT.name, lang)}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  disabled={!interactive}
                />
                <TextInput
                  label={t(SITE_CONTACT.phone, lang)}
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  disabled={!interactive}
                />
                <TextInput
                  label={t(SITE_CONTACT.date, lang)}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.currentTarget.value)}
                  disabled={!interactive}
                />
                <Select
                  label={t(SITE_CONTACT.eventType, lang)}
                  placeholder={t(SITE_CONTACT.eventTypePlaceholder, lang)}
                  data={SITE_CONTACT.eventTypes.map((option) => ({
                    value: option.en,
                    label: t(option, lang),
                  }))}
                  value={eventType}
                  onChange={setEventType}
                  disabled={!interactive}
                />
                <Select
                  label={t(SITE_CONTACT.guestCount, lang)}
                  placeholder={t(SITE_CONTACT.guestCountPlaceholder, lang)}
                  data={SITE_CONTACT.guestRanges.map((option) => ({
                    value: option.en,
                    label: t(option, lang),
                  }))}
                  value={guests}
                  onChange={setGuests}
                  disabled={!interactive}
                />
                <TextInput
                  label={t(SITE_CONTACT.location, lang)}
                  value={location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                  disabled={!interactive}
                />
                <Textarea
                  label={t(SITE_CONTACT.notes, lang)}
                  value={notes}
                  onChange={(e) => setNotes(e.currentTarget.value)}
                  disabled={!interactive}
                />
                {error && (
                  <Text size="sm" c="red">
                    {error}
                  </Text>
                )}
                <Group grow>
                  <Button
                    leftSection={<MessageCircle size={16} />}
                    onClick={submit}
                    disabled={!interactive}
                  >
                    {t(SITE_CONTACT.sendWhatsapp, lang)}
                  </Button>
                  {business.phones[0] && (
                    <Button
                      component="a"
                      href={`tel:${business.phones[0].replace(/\s/g, "")}`}
                      variant="default"
                      leftSection={<Phone size={16} />}
                    >
                      {t(SITE_CONTACT.callDirect, lang)}
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="sm">
              <Card withBorder padding="md">
                <Text fw={700}>{t(SITE_CONTACT.officeTitle, lang)}</Text>
                <Text size="sm" c="dimmed">
                  {lang === "ta"
                    ? business.addressTa.trim() ||
                      business.addressEn.trim() ||
                      t(SITE_CONTACT.address, lang)
                    : business.addressEn.trim() || t(SITE_CONTACT.address, lang)}
                </Text>
                {business.phones.map((phoneNo) => (
                  <Anchor
                    key={phoneNo}
                    href={`tel:${phoneNo.replace(/\s/g, "")}`}
                    display="block"
                  >
                    {phoneNo}
                  </Anchor>
                ))}
                {business.whatsapp && (
                  <Anchor
                    href={`https://wa.me/${business.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    display="block"
                    size="sm"
                  >
                    {t(SITE_CONTACT.whatsappHours, lang)}
                  </Anchor>
                )}
              </Card>
              <Card withBorder padding="md">
                <Text fw={700} mb="xs">
                  {t(SITE_CONTACT.zonesTitle, lang)}
                </Text>
                <Text size="sm" c="dimmed">
                  {SITE_CONTACT.zones.join(" • ")}
                </Text>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </section>
  );
}

export function SiteFooter({ business, lang }: { business: SiteBusiness; lang: SiteLang }) {
  return (
    <footer className="site-footer">
      <Container size="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Text fw={800} size="lg">
              {t(SITE_FOOTER.name, lang)}
            </Text>
            <Text size="sm" c="dimmed">
              {t(SITE_FOOTER.blurb, lang)}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 4 }}>
            <Text fw={700} mb="xs">
              {t(SITE_FOOTER.regionsTitle, lang)}
            </Text>
            <Text size="sm" c="dimmed">
              {SITE_CONTACT.zones.join(" • ")}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Text fw={700} mb="xs">
              {t(SITE_FOOTER.contactTitle, lang)}
            </Text>
            {business.phones.map((phoneNo) => (
              <Anchor key={phoneNo} href={`tel:${phoneNo.replace(/\s/g, "")}`} display="block" size="sm">
                {phoneNo}
              </Anchor>
            ))}
          </Grid.Col>
        </Grid>
        <Text size="xs" c="dimmed" ta="center" mt="lg">
          {t(SITE_FOOTER.rights, lang)}
        </Text>
      </Container>
    </footer>
  );
}
