"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Check, Plus, Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { NoAccess } from "@/components/NoAccess";
import { preferredText, ui } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import {
  DEFAULT_GALLERY_FALLBACKS,
  useSiteContentStore,
  type SiteGalleryInput,
  type SiteGalleryItem,
  type SiteMenu,
  type SiteMenuInput,
  type SiteTestimonial,
  type SiteTestimonialInput,
} from "@/store/siteContent";

function stripDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidDisplayPhone(value: string): boolean {
  return /^91?[6-9]\d{9}$/.test(stripDigits(value));
}

function ConfirmModal({
  opened,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  opened: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} centered>
      <Stack gap="md">
        <Text size="sm">{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            <Bilingual label={ui.common.cancel} />
          </Button>
          <Button color="kumkum" onClick={onConfirm}>
            <Bilingual label={ui.common.delete} />
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function PublishCard() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const readError = async (response: Response, fallback: string): Promise<string> => {
    if (response.status === 503) return preferredText(ui.site.dbMissing, uiLanguage);
    if (response.status === 401) {
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) return body.error;
      } catch {
        /* fall through */
      }
      return "Publish secret rejected (401). Check PUBLISH_SECRET in Vercel.";
    }
    try {
      const body = (await response.json()) as { error?: string };
      return body.error || fallback;
    } catch {
      return fallback;
    }
  };

  const publish = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const state = useSiteContentStore.getState();
      const response = await fetch("/api/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          business: state.business,
          menus: state.menus,
          gallery: state.gallery,
          testimonials: state.testimonials,
        }),
      });
      if (!response.ok) {
        setError(await readError(response, preferredText(ui.site.publishFailed, uiLanguage)));
        return;
      }
      const body = (await response.json()) as {
        updatedAt?: string;
        published?: boolean;
        publishError?: string;
        warnings?: string[];
      };
      state.setLastPublishedAt(
        typeof body.updatedAt === "string" ? body.updatedAt : new Date().toISOString()
      );
      if (body.published === false) {
        setError(
          body.publishError ||
            "Saved to database, but the site still shows stale content (publish hook failed)."
        );
        return;
      }
      const warnings = (body.warnings ?? []).filter(Boolean);
      setNotice(
        warnings.length
          ? `Published. Notes: ${warnings.join(" ")}`
          : "Published — live site refreshed."
      );
    } catch {
      setError(preferredText(ui.site.publishFailed, uiLanguage));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dash-card">
      <Title order={3} mb="sm">
        <Bilingual label={ui.site.publish} />
      </Title>
      <LastPublishedLine />
      {error && (
        <Text size="sm" c="red" mb="sm">
          {error}
        </Text>
      )}
      {notice && (
        <Text size="sm" c="green" mb="sm">
          {notice}
        </Text>
      )}
      <Group>
        <Button onClick={publish} loading={busy}>
          <Bilingual label={ui.site.publish} />
        </Button>
      </Group>
    </div>
  );
}

function LastPublishedLine() {
  const lastPublishedAt = useSiteContentStore((state) => state.lastPublishedAt);
  if (!lastPublishedAt) {
    return (
      <Text size="sm" c="dimmed" mb="sm">
        <Bilingual label={ui.site.neverPublished} />
      </Text>
    );
  }
  const when = new Date(lastPublishedAt);
  const stamp = Number.isNaN(when.getTime()) ? lastPublishedAt : when.toLocaleString();
  return (
    <Text size="sm" c="dimmed" mb="sm">
      <Bilingual label={ui.site.lastPublished} />: {stamp}
    </Text>
  );
}

function BusinessCard() {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const business = useSiteContentStore((state) => state.business);
  const setBusiness = useSiteContentStore((state) => state.setBusiness);
  const [phones, setPhones] = useState<string[]>(business.phones);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp);
  const [addressEn, setAddressEn] = useState(business.addressEn);
  const [addressTa, setAddressTa] = useState(business.addressTa);
  const [zonesText, setZonesText] = useState<string>(
    (business.serviceZones ?? []).join("\n")
  );
  const [touched, setTouched] = useState(false);

  const phoneErrors = phones.map((phone) =>
    touched && phone.trim() !== "" && !isValidDisplayPhone(phone)
      ? preferredText(ui.events.invalidPhone, uiLanguage)
      : undefined
  );
  const whatsappError =
    touched && whatsapp.trim() !== "" && !/^91?[6-9]\d{9}$/.test(stripDigits(whatsapp))
      ? preferredText(ui.events.invalidPhone, uiLanguage)
      : undefined;
  const canSave =
    phones.some((phone) => phone.trim() !== "") &&
    phoneErrors.every((error) => !error) &&
    !whatsappError;

  return (
    <div className="dash-card">
      <Title order={3} mb="sm">
        <Bilingual label={ui.site.business} />
      </Title>
      <Stack gap="sm">
        <div>
          <Text size="sm" fw={500} mb={4}>
            <Bilingual label={ui.site.phoneNumbers} />
          </Text>
          <Stack gap="xs">
            {phones.map((phone, index) => (
              <Group key={index} align="flex-start" wrap="nowrap">
                <TextInput
                  placeholder={preferredText(ui.site.phonePlaceholder, uiLanguage)}
                  value={phone}
                  onChange={(e) =>
                    setPhones(phones.map((item, idx) => (idx === index ? e.currentTarget.value : item)))
                  }
                  error={phoneErrors[index]}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label="Remove phone"
                  onClick={() => setPhones(phones.filter((_, idx) => idx !== index))}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              size="xs"
              leftSection={<Plus size={14} />}
              onClick={() => setPhones([...phones, ""])}
            >
              <Bilingual label={ui.site.addPhone} />
            </Button>
          </Stack>
        </div>
        <TextInput
          label={<Bilingual label={ui.site.whatsapp} />}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.currentTarget.value)}
          error={whatsappError}
        />
        <Textarea
          label={<Bilingual label={ui.site.address} />}
          value={addressEn}
          onChange={(e) => setAddressEn(e.currentTarget.value)}
          minRows={2}
        />
        <Textarea
          label={<Bilingual label={ui.site.address} />}
          dir="auto"
          value={addressTa}
          onChange={(e) => setAddressTa(e.currentTarget.value)}
          minRows={2}
        />
        <Textarea
          label="Service zones (one per line — landing contact + footer)"
          value={zonesText}
          onChange={(e) => setZonesText(e.currentTarget.value)}
          minRows={3}
          placeholder={"Thiruvarambu\nMarthandam\nNagercoil"}
        />
        <Group justify="flex-end">
          <Button
            disabled={!canSave}
            onClick={() => {
              setTouched(true);
              if (!canSave) return;
              const zones = zonesText
                .split("\n")
                .map((z) => z.trim())
                .filter(Boolean);
              setBusiness({
                phones: phones.map((phone) => phone.trim()).filter(Boolean),
                whatsapp: stripDigits(whatsapp),
                addressEn: addressEn.trim(),
                addressTa: addressTa.trim() || addressEn.trim(),
                serviceZones: zones.length ? zones : [...business.serviceZones],
              });
            }}
          >
            <Bilingual label={ui.common.save} />
          </Button>
        </Group>
      </Stack>
    </div>
  );
}

function parseItems(text: string): { en: string; ta: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, ...rest] = line.split("|");
      return { en: en.trim(), ta: rest.join("|").trim() };
    })
    .filter((item) => item.en !== "");
}

function dishesToText(items: { en: string; ta: string }[]): string {
  return items.map((item) => (item.ta ? `${item.en} | ${item.ta}` : item.en)).join("\n");
}

const menuSchema = z.object({
  nameEn: z.string().trim().min(1, "Meal name is required"),
  nameTa: z.string(),
  imageUrl: z.string().trim().min(1, "Image is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  mainText: z.string().trim().min(1, "Add at least one main dish"),
  sideText: z.string(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

function MenuFormModal({
  opened,
  menu,
  onClose,
  onSaved,
}: {
  opened: boolean;
  menu: SiteMenu | null;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const sheet = useMobileSheet("sheet");
  const addMenu = useSiteContentStore((state) => state.addMenu);
  const updateMenu = useSiteContentStore((state) => state.updateMenu);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<MenuFormValues>({
      resolver: zodResolver(menuSchema),
      defaultValues: {
        nameEn: "",
        nameTa: "",
        imageUrl: "/images/img_02.jpg",
        price: 0,
        mainText: "",
        sideText: "",
      },
    });

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) {
      reset({
        nameEn: menu?.nameEn ?? "",
        nameTa: menu?.nameTa ?? "",
        imageUrl: menu?.imageUrl ?? "/images/img_02.jpg",
        price: menu?.price ?? 0,
        mainText: dishesToText(menu?.mainDishes ?? []),
        sideText: dishesToText(menu?.sideDishes ?? []),
      });
    }
  }

  const onSubmit = (values: MenuFormValues) => {
    const nameEn = values.nameEn.trim();
    const input: SiteMenuInput = {
      nameEn,
      nameTa: values.nameTa.trim() || nameEn,
      imageUrl: values.imageUrl.trim(),
      price: values.price,
      mainDishes: parseItems(values.mainText),
      sideDishes: parseItems(values.sideText),
    };
    if (menu) updateMenu(menu.id, input);
    else addMenu(input);
    onClose();
    onSaved(nameEn);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.site.menus} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Group grow align="flex-start">
            <TextInput
              label="Meal name (English)"
              withAsterisk
              placeholder="Royal Travancore Wedding Sadya"
              {...register("nameEn")}
              error={errors.nameEn?.message}
            />
            <TextInput
              label="Meal name (Tamil)"
              dir="auto"
              placeholder="ராயல் திருவிதாங்கூர் திருமண சாத்யா"
              {...register("nameTa")}
            />
          </Group>
          <TextInput
            label="Image"
            withAsterisk
            placeholder="/images/img_02.jpg"
            description="Single meal photo — site-hosted /images/… path"
            {...register("imageUrl")}
            error={errors.imageUrl?.message}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Price per plate (₹, 0 hides price)"
                min={0}
                allowNegative={false}
                leftSection="₹"
                {...field}
                error={errors.price?.message}
              />
            )}
          />
          <Textarea
            label="Main dishes — one per line (English | Tamil)"
            withAsterisk
            minRows={4}
            placeholder={"Kerala Red Matta Rice & Ponni Rice | கேரள மட்டை அரிசி\nParippu Curry & Cow Ghee | பருப்பு குழம்பு & நெய்"}
            {...register("mainText")}
            error={errors.mainText?.message}
          />
          <Textarea
            label="Side dishes — one per line (English | Tamil)"
            minRows={3}
            placeholder={"Nendran Banana Chips | நேந்திரன் சிப்ஸ்\nAda Pradhaman | அட பிரதமன்"}
            {...register("sideText")}
          />
          <Group justify="flex-end" className="form-actions">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={menu ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function MenusManager() {
  const menus = useSiteContentStore((state) => state.menus);
  const deleteMenu = useSiteContentStore((state) => state.deleteMenu);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<SiteMenu | null>(null);
  const [deleting, setDeleting] = useState<SiteMenu | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const handleSaved = (name: string) => {
    setSavedName(name);
    window.setTimeout(() => {
      setSavedName((current) => (current === name ? null : current));
    }, 4000);
  };

  return (
    <div className="dash-card">
      <Group justify="space-between" mb="sm">
        <Title order={3}>
          <Bilingual label={ui.site.menus} />
        </Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setFormOpened(true);
          }}
        >
          <Bilingual label={ui.common.add} />
        </Button>
      </Group>
      {savedName && (
        <Group gap="xs" mb="sm" c="green">
          <Check size={16} />
          <Text size="sm" fw={600}>
            Saved — “{savedName}”
          </Text>
        </Group>
      )}
      {menus.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.site.emptyMenus} />
        </Text>
      ) : (
        <Stack gap="xs">
          {menus.map((menu) => (
            <Card
              key={menu.id}
              withBorder
              padding="sm"
              role="button"
              tabIndex={0}
              aria-label={menu.nameEn}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setEditing(menu);
                setFormOpened(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditing(menu);
                  setFormOpened(true);
                }
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text fw={600}>
                    {uiLanguage === "ta" ? menu.nameTa.trim() || menu.nameEn : menu.nameEn}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {menu.mainDishes.length} mains · {menu.sideDishes.length} sides
                    {menu.price > 0 ? ` · ₹${menu.price}/plate` : ""}
                  </Text>
                </Stack>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label={`Delete ${menu.nameEn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleting(menu);
                  }}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
      <MenuFormModal
        opened={formOpened}
        menu={editing}
        onClose={() => setFormOpened(false)}
        onSaved={handleSaved}
      />
      <ConfirmModal
        opened={deleting !== null}
        title={preferredText(ui.templates.deleteTitle, uiLanguage)}
        message={deleting ? `Delete "${deleting.nameEn}"?` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMenu(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}

const gallerySchema = z.object({
  instagramUrl: z
    .string()
    .trim()
    .min(1, "Instagram link is required")
    .refine((url) => url.toLowerCase().includes("instagram.com/"), {
      message: "Enter an Instagram post link.",
    }),
  altTitle: z.string().trim().min(1, "Alt title is required"),
  fallbackImage: z.string().trim().min(1, "Fallback image is required"),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

function GalleryFormModal({
  opened,
  item,
  onClose,
}: {
  opened: boolean;
  item: SiteGalleryItem | null;
  onClose: () => void;
}) {
  const sheet = useMobileSheet("sheet");
  const addGalleryItem = useSiteContentStore((state) => state.addGalleryItem);
  const updateGalleryItem = useSiteContentStore((state) => state.updateGalleryItem);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<GalleryFormValues>({
      resolver: zodResolver(gallerySchema),
      defaultValues: {
        instagramUrl: "https://www.instagram.com/p/PLACEHOLDER/",
        altTitle: "",
        fallbackImage: DEFAULT_GALLERY_FALLBACKS[0],
      },
    });

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) {
      reset({
        instagramUrl: item?.instagramUrl ?? "https://www.instagram.com/p/PLACEHOLDER/",
        altTitle: item?.altTitle ?? "",
        fallbackImage: item?.fallbackImage ?? DEFAULT_GALLERY_FALLBACKS[0],
      });
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.site.gallery} />}
      {...sheet}
    >
      <form
        onSubmit={handleSubmit((values) => {
          const input: SiteGalleryInput = {
            instagramUrl: values.instagramUrl.trim(),
            altTitle: values.altTitle.trim(),
            fallbackImage: values.fallbackImage.trim(),
          };
          if (item) updateGalleryItem(item.id, input);
          else addGalleryItem(input);
          onClose();
        })}
      >
        <Stack gap="sm">
          <TextInput
            label="Instagram post link"
            placeholder="https://www.instagram.com/p/…"
            withAsterisk
            {...register("instagramUrl")}
            error={errors.instagramUrl?.message}
            description="Public post — embedded on the landing gallery."
          />
          <TextInput
            label="Alt title (shown if the embed fails to load)"
            withAsterisk
            placeholder="2,500 Guests Vazhaillai Virundhu"
            {...register("altTitle")}
            error={errors.altTitle?.message}
          />
          <TextInput
            label="Fallback image (shown if the embed fails to load)"
            placeholder="/images/img_02.jpg"
            {...register("fallbackImage")}
            error={errors.fallbackImage?.message}
          />
          <Group justify="flex-end" className="form-actions">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={item ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function GalleryManager() {
  const gallery = useSiteContentStore((state) => state.gallery);
  const deleteGalleryItem = useSiteContentStore((state) => state.deleteGalleryItem);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<SiteGalleryItem | null>(null);
  const [deleting, setDeleting] = useState<SiteGalleryItem | null>(null);

  return (
    <div className="dash-card">
      <Group justify="space-between" mb="sm">
        <Title order={3}>
          <Bilingual label={ui.site.gallery} />
        </Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setFormOpened(true);
          }}
        >
          <Bilingual label={ui.common.add} />
        </Button>
      </Group>
      {gallery.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.site.emptyGallery} />
        </Text>
      ) : (
        <Stack gap="xs">
          {gallery.map((item) => (
            <Card
              key={item.id}
              withBorder
              padding="sm"
              role="button"
              tabIndex={0}
              aria-label={item.altTitle}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setEditing(item);
                setFormOpened(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditing(item);
                  setFormOpened(true);
                }
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={500} truncate>
                    IG · {item.altTitle}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {item.instagramUrl}
                  </Text>
                </Stack>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label="Delete post"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleting(item);
                  }}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
      <GalleryFormModal opened={formOpened} item={editing} onClose={() => setFormOpened(false)} />
      <ConfirmModal
        opened={deleting !== null}
        title={preferredText(ui.templates.deleteTitle, uiLanguage)}
        message={deleting ? `Delete "${deleting.altTitle}"?` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteGalleryItem(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}

const testimonialSchema = z.object({
  review: z.string().trim().min(1, "Review text is required"),
  author: z.string().trim().min(1, "Reviewer name is required"),
  location: z.string().trim().min(1, "Location is required"),
  rating: z.coerce.number().min(1).max(5),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

function TestimonialFormModal({
  opened,
  item,
  onClose,
}: {
  opened: boolean;
  item: SiteTestimonial | null;
  onClose: () => void;
}) {
  const sheet = useMobileSheet("sheet");
  const addTestimonial = useSiteContentStore((state) => state.addTestimonial);
  const updateTestimonial = useSiteContentStore((state) => state.updateTestimonial);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<TestimonialFormValues>({
      resolver: zodResolver(testimonialSchema),
      defaultValues: {
        review: "",
        author: "",
        location: "",
        rating: 5,
      },
    });

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) {
      reset({
        review: item?.review ?? "",
        author: item?.author ?? "",
        location: item?.location ?? "",
        rating: item?.rating ?? 5,
      });
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={ui.site.testimonials} />}
      {...sheet}
    >
      <form
        onSubmit={handleSubmit((values) => {
          const input: SiteTestimonialInput = {
            review: values.review.trim(),
            author: values.author.trim(),
            location: values.location.trim(),
            rating: values.rating,
          };
          if (item) updateTestimonial(item.id, input);
          else addTestimonial(input);
          onClose();
        })}
      >
        <Stack gap="sm">
          <Textarea
            label="Review (English)"
            withAsterisk
            minRows={3}
            {...register("review")}
            error={errors.review?.message}
          />
          <Group grow align="flex-start">
            <TextInput
              label="Reviewer name"
              withAsterisk
              {...register("author")}
              error={errors.author?.message}
            />
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Stars (1–5)"
                  min={1}
                  max={5}
                  allowNegative={false}
                  {...field}
                  error={errors.rating?.message}
                />
              )}
            />
          </Group>
          <TextInput
            label="Location"
            withAsterisk
            placeholder="Marthandam"
            {...register("location")}
            error={errors.location?.message}
          />
          <Group justify="flex-end" className="form-actions">
            <Button variant="default" onClick={onClose}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Bilingual label={item ? ui.common.save : ui.common.add} />
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function TestimonialsManager() {
  const testimonials = useSiteContentStore((state) => state.testimonials);
  const deleteTestimonial = useSiteContentStore((state) => state.deleteTestimonial);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<SiteTestimonial | null>(null);
  const [deleting, setDeleting] = useState<SiteTestimonial | null>(null);

  return (
    <div className="dash-card">
      <Group justify="space-between" mb="sm">
        <Title order={3}>
          <Bilingual label={ui.site.testimonials} />
        </Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setFormOpened(true);
          }}
        >
          <Bilingual label={ui.common.add} />
        </Button>
      </Group>
      {testimonials.length === 0 ? (
        <Text size="sm" c="dimmed">
          <Bilingual label={ui.site.emptyTestimonials} />
        </Text>
      ) : (
        <Stack gap="xs">
          {testimonials.map((item) => (
            <Card
              key={item.id}
              withBorder
              padding="sm"
              role="button"
              tabIndex={0}
              aria-label={item.author}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setEditing(item);
                setFormOpened(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditing(item);
                  setFormOpened(true);
                }
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {item.author} · {Math.min(5, Math.max(1, Math.round(item.rating)))}/5 ·{" "}
                    {item.location}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {item.review}
                  </Text>
                </Stack>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label={`Delete ${item.author}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleting(item);
                  }}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
      <TestimonialFormModal opened={formOpened} item={editing} onClose={() => setFormOpened(false)} />
      <ConfirmModal
        opened={deleting !== null}
        title={preferredText(ui.templates.deleteTitle, uiLanguage)}
        message={deleting ? `Delete review by "${deleting.author}"?` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTestimonial(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}

export function SiteManager() {
  const canViewWebsite = useAuthStore((state) => state.permissions.canViewWebsite);
  if (!canViewWebsite) {
    return <NoAccess />;
  }
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>
          <Bilingual label={ui.site.manager} />
        </Title>
        <Button
          component="a"
          href="https://mampallicatering.vercel.app"
          target="_blank"
          rel="noreferrer"
          variant="light"
        >
          <Bilingual label={ui.site.preview} />
        </Button>
      </Group>
      <PublishCard />
      <BusinessCard />
      <MenusManager />
      <GalleryManager />
      <TestimonialsManager />
    </Stack>
  );
}
