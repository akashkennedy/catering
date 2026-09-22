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
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Plus, Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Bilingual } from "@/components/Bilingual";
import { NoAccess } from "@/components/NoAccess";
import { preferredText, ui } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import { useMobileSheet } from "@/hooks/useMobileSheet";
import { templateDisplayName, useTemplatesStore } from "@/store/templates";
import {
  normalizeRemoteContent,
  useSiteContentStore,
  type SiteGalleryInput,
  type SiteGalleryItem,
  type SiteMenu,
  type SiteMenuInput,
  type SiteTestimonial,
  type SiteTestimonialInput,
} from "@/store/siteContent";
import { SITE_GALLERY_CATEGORIES, SITE_GALLERY_CATEGORY_LABELS } from "@/lib/siteCopy";

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
  const [busy, setBusy] = useState<"publish" | "pull" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pullOpened, setPullOpened] = useState(false);

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
    setBusy("publish");
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
      setBusy(null);
    }
  };

  const pull = async () => {
    setPullOpened(false);
    setBusy("pull");
    setError("");
    try {
      const response = await fetch("/api/site-content", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        setError(await readError(response, preferredText(ui.site.publishFailed, uiLanguage)));
        return;
      }
      const body = (await response.json()) as { data?: unknown; updatedAt?: string };
      const content = normalizeRemoteContent(body.data);
      if (!content) {
        setError(preferredText(ui.site.publishFailed, uiLanguage));
        return;
      }
      const state = useSiteContentStore.getState();
      state.replaceAll(content);
      state.setLastPublishedAt(
        typeof body.updatedAt === "string" ? body.updatedAt : null
      );
    } catch {
      setError(preferredText(ui.site.publishFailed, uiLanguage));
    } finally {
      setBusy(null);
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
        <Button onClick={publish} loading={busy === "publish"}>
          <Bilingual label={ui.site.publish} />
        </Button>
        <Button variant="default" onClick={() => setPullOpened(true)} loading={busy === "pull"}>
          <Bilingual label={ui.site.pull} />
        </Button>
      </Group>
      <ConfirmModal
        opened={pullOpened}
        title={preferredText(ui.site.pullTitle, uiLanguage)}
        message={preferredText(ui.site.pullMessage, uiLanguage)}
        onCancel={() => setPullOpened(false)}
        onConfirm={pull}
      />
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

type CourseDraft = {
  key: string;
  nameEn: string;
  nameTa: string;
  itemsText: string;
};

function draftKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `draft-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
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

const menuSchema = z.object({
  nameEn: z.string().trim().min(1, "Name is required"),
  nameTa: z.string(),
  tagEn: z.string(),
  tagTa: z.string(),
  descEn: z.string(),
  descTa: z.string(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  photoUrl: z.string(),
  templateId: z.string().nullable(),
  // Landing display extras — mirror the live site tabs/cards.
  tabKey: z.string(),
  taglineEn: z.string(),
  taglineTa: z.string(),
  unitEn: z.string(),
  unitTa: z.string(),
  isVegOnly: z.boolean(),
  sideTitle: z.string(),
  sideDesc: z.string(),
  sideBadge: z.string(),
  sideImage: z.string(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

function MenuFormModal({
  opened,
  menu,
  onClose,
}: {
  opened: boolean;
  menu: SiteMenu | null;
  onClose: () => void;
}) {
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("full", "lg");
  const templates = useTemplatesStore((state) => state.templates);
  const addMenu = useSiteContentStore((state) => state.addMenu);
  const updateMenu = useSiteContentStore((state) => state.updateMenu);
  const [courses, setCourses] = useState<CourseDraft[]>([]);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<MenuFormValues>({
      resolver: zodResolver(menuSchema),
      defaultValues: {
        nameEn: "",
        nameTa: "",
        tagEn: "",
        tagTa: "",
        descEn: "",
        descTa: "",
        price: 0,
        photoUrl: "",
        templateId: null,
        tabKey: "",
        taglineEn: "",
        taglineTa: "",
        unitEn: "/ per leaf plate",
        unitTa: "/ இலைக்கு",
        isVegOnly: true,
        sideTitle: "",
        sideDesc: "",
        sideBadge: "",
        sideImage: "",
      },
    });

  const initFor = (target: SiteMenu | null) => {
    reset({
      nameEn: target?.nameEn ?? "",
      nameTa: target?.nameTa ?? "",
      tagEn: target?.tagEn ?? "",
      tagTa: target?.tagTa ?? "",
      descEn: target?.descEn ?? "",
      descTa: target?.descTa ?? "",
      price: target?.price ?? 0,
      photoUrl: target?.photoUrl ?? "",
      templateId: target?.templateId ?? null,
      tabKey: target?.tabKey ?? target?.nameEn ?? "",
      taglineEn: target?.taglineEn ?? "",
      taglineTa: target?.taglineTa ?? "",
      unitEn: target?.unitEn ?? "/ per leaf plate",
      unitTa: target?.unitTa ?? "/ இலைக்கு",
      isVegOnly: target?.isVegOnly ?? true,
      sideTitle: target?.sideTitle ?? "",
      sideDesc: target?.sideDesc ?? "",
      sideBadge: target?.sideBadge ?? "",
      sideImage: target?.sideImage ?? "",
    });
    setCourses(
      (target?.courses ?? []).map((course) => ({
        key: course.id,
        nameEn: course.nameEn,
        nameTa: course.nameTa,
        itemsText: course.items
          .map((item) => (item.ta ? `${item.en} | ${item.ta}` : item.en))
          .join("\n"),
      }))
    );
  };

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) initFor(menu);
  }

  const onSubmit = (values: MenuFormValues) => {
    const photo = values.photoUrl.trim() || "/images/img_02.jpg";
    const input: SiteMenuInput = {
      nameEn: values.nameEn.trim(),
      nameTa: values.nameTa.trim() || values.nameEn.trim(),
      tagEn: values.tagEn.trim(),
      tagTa: values.tagTa.trim() || values.tagEn.trim(),
      descEn: values.descEn.trim(),
      descTa: values.descTa.trim() || values.descEn.trim(),
      price: values.price,
      photoUrl: photo,
      templateId: values.templateId,
      tabKey: values.tabKey.trim() || values.nameEn.trim(),
      taglineEn: values.taglineEn.trim() || values.descEn.trim(),
      taglineTa: values.taglineTa.trim() || values.taglineEn.trim() || values.descEn.trim(),
      unitEn: values.unitEn.trim() || "/ per leaf plate",
      unitTa: values.unitTa.trim() || "/ இலைக்கு",
      isVegOnly: values.isVegOnly,
      sideTitle: values.sideTitle.trim(),
      sideDesc: values.sideDesc.trim(),
      sideBadge: values.sideBadge.trim(),
      sideImage: values.sideImage.trim() || photo,
      courses: courses
        .filter((course) => course.nameEn.trim() !== "")
        .map((course) => ({
          nameEn: course.nameEn.trim(),
          nameTa: course.nameTa.trim() || course.nameEn.trim(),
          items: parseItems(course.itemsText),
        })),
    };
    if (menu) updateMenu(menu.id, input);
    else addMenu(input);
    onClose();
  };

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: templateDisplayName(template, uiLanguage),
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Bilingual label={menu ? ui.templates.editTitle : ui.templates.addTemplate} />}
      {...sheet}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <Group grow align="flex-start">
            <TextInput
              label={<Bilingual label={ui.templates.englishName} />}
              withAsterisk
              {...register("nameEn")}
              error={errors.nameEn?.message}
            />
            <TextInput
              label={<Bilingual label={ui.templates.tamilName} />}
              dir="auto"
              {...register("nameTa")}
            />
          </Group>
          <TextInput
            label="Site tab (landing menu tab)"
            placeholder="Kerala Sadya (Kalyanam Special)"
            {...register("tabKey")}
          />
          <Group grow align="flex-start">
            <TextInput label={<Bilingual label={ui.site.tag} />} {...register("tagEn")} />
            <TextInput
              label={<Bilingual label={ui.site.tag} />}
              dir="auto"
              {...register("tagTa")}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput label="Tagline (English)" {...register("taglineEn")} />
            <TextInput label="Tagline (Tamil)" dir="auto" {...register("taglineTa")} />
          </Group>
          <Textarea
            label={<Bilingual label={ui.site.description} />}
            {...register("descEn")}
          />
          <Textarea
            label={<Bilingual label={ui.site.description} />}
            dir="auto"
            {...register("descTa")}
          />
          <Group grow align="flex-start">
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.site.price} />}
                  min={0}
                  allowNegative={false}
                  leftSection="₹"
                  {...field}
                  error={errors.price?.message}
                />
              )}
            />
            <TextInput
              label={<Bilingual label={ui.site.photo} />}
              placeholder="/images/img_02.jpg"
              {...register("photoUrl")}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput label="Price unit (English)" {...register("unitEn")} />
            <TextInput label="Price unit (Tamil)" dir="auto" {...register("unitTa")} />
          </Group>
          <Controller
            name="isVegOnly"
            control={control}
            render={({ field }) => (
              <Select
                label="Pure veg?"
                data={[
                  { value: "veg", label: "Pure veg" },
                  { value: "mixed", label: "Veg + non-veg counters" },
                ]}
                value={field.value ? "veg" : "mixed"}
                onChange={(value) => field.onChange(value !== "mixed")}
              />
            )}
          />
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.site.linkedTemplate} />}
                data={templateOptions}
                searchable
                clearable
                {...field}
                value={field.value ?? null}
                onChange={(value) => field.onChange(value ?? null)}
              />
            )}
          />
          <Card withBorder padding="sm">
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                Side highlight (landing card beside this menu)
              </Text>
              <TextInput label="Highlight title" {...register("sideTitle")} />
              <Textarea label="Highlight description" minRows={2} {...register("sideDesc")} />
              <Group grow align="flex-start">
                <TextInput label="Highlight badge" {...register("sideBadge")} />
                <TextInput
                  label="Highlight image"
                  placeholder="/images/img_03.jpg"
                  {...register("sideImage")}
                />
              </Group>
            </Stack>
          </Card>
          <div>
            <Text size="sm" fw={500} mb={4}>
              <Bilingual label={ui.site.courses} />
            </Text>
            <Stack gap="sm">
              {courses.map((course, index) => (
                <Card key={course.key} withBorder padding="sm">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" fw={600}>
                        {index + 1}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="kumkum"
                        aria-label="Remove course"
                        onClick={() => setCourses(courses.filter((_, idx) => idx !== index))}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                    <Group grow align="flex-start">
                      <TextInput
                        placeholder="English"
                        value={course.nameEn}
                        onChange={(e) =>
                          setCourses(
                            courses.map((item, idx) =>
                              idx === index ? { ...item, nameEn: e.currentTarget.value } : item
                            )
                          )
                        }
                      />
                      <TextInput
                        placeholder="தமிழ்"
                        dir="auto"
                        value={course.nameTa}
                        onChange={(e) =>
                          setCourses(
                            courses.map((item, idx) =>
                              idx === index ? { ...item, nameTa: e.currentTarget.value } : item
                            )
                          )
                        }
                      />
                    </Group>
                    <Textarea
                      label={<Bilingual label={ui.site.itemsOnePerLine} />}
                      minRows={2}
                      value={course.itemsText}
                      onChange={(e) =>
                        setCourses(
                          courses.map((item, idx) =>
                            idx === index ? { ...item, itemsText: e.currentTarget.value } : item
                          )
                        )
                      }
                    />
                  </Stack>
                </Card>
              ))}
              <Button
                variant="light"
                size="xs"
                leftSection={<Plus size={14} />}
                onClick={() =>
                  setCourses([...courses, { key: draftKey(), nameEn: "", nameTa: "", itemsText: "" }])
                }
              >
                <Bilingual label={ui.templates.addDish} />
              </Button>
            </Stack>
          </div>
          <Group justify="flex-end" mt="md" className="form-actions">
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
                    {menu.courses.length} courses
                    {menu.price > 0 ? ` · ₹${menu.price}` : ""}
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
      <MenuFormModal opened={formOpened} menu={editing} onClose={() => setFormOpened(false)} />
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

const gallerySchema = z
  .object({
    kind: z.enum(["photo", "instagram"]),
    url: z.string().trim().min(1, "Link is required"),
    captionEn: z.string(),
    captionTa: z.string(),
    category: z.string().min(1, "Category is required"),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "instagram") {
      if (!values.url.toLowerCase().includes("instagram.com/")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "Enter an Instagram post link." });
      }
    } else {
      // Landing only serves site-hosted photos: /images/… or absolute URLs
      // whose path starts with /images/. Never hotlink CDN URLs.
      const url = values.url.trim();
      const ok =
        url.startsWith("/images/") ||
        (() => {
          try {
            return new URL(url).pathname.startsWith("/images/");
          } catch {
            return false;
          }
        })();
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["url"],
          message: "Use a site image: /images/….jpg (no CDN hotlinks).",
        });
      }
    }
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
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addGalleryItem = useSiteContentStore((state) => state.addGalleryItem);
  const updateGalleryItem = useSiteContentStore((state) => state.updateGalleryItem);

  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } =
    useForm<GalleryFormValues>({
      resolver: zodResolver(gallerySchema),
      defaultValues: { kind: "photo", url: "", captionEn: "", captionTa: "", category: "sadya" },
    });
  const kind = watch("kind");

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) {
      reset({
        kind: item?.kind ?? "photo",
        url: item?.url ?? "",
        captionEn: item?.captionEn ?? "",
        captionTa: item?.captionTa ?? "",
        category: item?.category ?? "sadya",
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
            kind: values.kind,
            url: values.url.trim(),
            captionEn: values.captionEn.trim(),
            captionTa: values.captionTa.trim(),
            category: values.category,
          };
          if (item) updateGalleryItem(item.id, input);
          else addGalleryItem(input);
          onClose();
        })}
      >
        <Stack gap="sm">
          <Controller
            name="kind"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.site.category} />}
                data={[
                  { value: "photo", label: preferredText(ui.site.kindPhoto, uiLanguage) },
                  { value: "instagram", label: preferredText(ui.site.kindInstagram, uiLanguage) },
                ]}
                {...field}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.site.itemUrl} />}
            placeholder="/images/img_02.jpg"
            withAsterisk
            {...register("url")}
            error={errors.url?.message}
            description={
              kind === "instagram" ? <Bilingual label={ui.site.instagramHint} /> : "Site-hosted only: /images/….jpg"
            }
          />
          <TextInput label={<Bilingual label={ui.site.caption} />} {...register("captionEn")} />
          <TextInput
            label={<Bilingual label={ui.site.caption} />}
            dir="auto"
            {...register("captionTa")}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.site.category} />}
                data={SITE_GALLERY_CATEGORIES.map((value) => ({
                  value,
                  label: preferredText(SITE_GALLERY_CATEGORY_LABELS[value], uiLanguage),
                }))}
                {...field}
              />
            )}
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
              aria-label={item.captionEn}
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
                <Text size="sm" fw={500} truncate>
                  {item.kind === "instagram" ? "IG · " : ""}
                  {uiLanguage === "ta" ? item.captionTa.trim() || item.captionEn : item.captionEn}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="kumkum"
                  aria-label="Delete photo"
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
        message={deleting ? `Delete "${deleting.captionEn}"?` : ""}
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
  quoteEn: z.string().trim().min(1, "Review text is required"),
  quoteTa: z.string(),
  author: z.string().trim().min(1, "Author name is required"),
  event: z.string(),
  eventTa: z.string(),
  place: z.string(),
  rating: z.coerce.number().min(1).max(5),
  source: z.enum(["manual", "google"]),
  profileUrl: z.string(),
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
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);
  const sheet = useMobileSheet("sheet");
  const addTestimonial = useSiteContentStore((state) => state.addTestimonial);
  const updateTestimonial = useSiteContentStore((state) => state.updateTestimonial);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
    useForm<TestimonialFormValues>({
      resolver: zodResolver(testimonialSchema),
      defaultValues: {
        quoteEn: "",
        quoteTa: "",
        author: "",
        event: "",
        eventTa: "",
        place: "",
        rating: 5,
        source: "manual",
        profileUrl: "",
      },
    });

  const [lastOpened, setLastOpened] = useState(false);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) {
      reset({
        quoteEn: item?.quoteEn ?? "",
        quoteTa: item?.quoteTa ?? "",
        author: item?.author ?? "",
        event: item?.event ?? "",
        eventTa: item?.eventTa ?? "",
        place: item?.place ?? "",
        rating: item?.rating ?? 5,
        source: item?.source ?? "manual",
        profileUrl: item?.profileUrl ?? "",
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
            quoteEn: values.quoteEn.trim(),
            quoteTa: values.quoteTa.trim() || values.quoteEn.trim(),
            author: values.author.trim(),
            event: values.event.trim(),
            eventTa: values.eventTa.trim() || values.event.trim(),
            place: values.place.trim(),
            rating: values.rating,
            source: values.source,
            profileUrl: values.profileUrl.trim(),
            authorPhotoUrl: item?.authorPhotoUrl ?? "",
            googleReviewId: item?.googleReviewId ?? "",
          };
          if (item) updateTestimonial(item.id, input);
          else addTestimonial(input);
          onClose();
        })}
      >
        <Stack gap="sm">
          <Textarea
            label={<Bilingual label={ui.site.quote} />}
            withAsterisk
            minRows={3}
            {...register("quoteEn")}
            error={errors.quoteEn?.message}
          />
          <Textarea
            label={<Bilingual label={ui.site.quoteTa} />}
            dir="auto"
            minRows={2}
            {...register("quoteTa")}
          />
          <Group grow align="flex-start">
            <TextInput
              label={<Bilingual label={ui.site.author} />}
              withAsterisk
              {...register("author")}
              error={errors.author?.message}
            />
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={<Bilingual label={ui.site.rating} />}
                  min={1}
                  max={5}
                  allowNegative={false}
                  {...field}
                  error={errors.rating?.message}
                />
              )}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput label={<Bilingual label={ui.site.occasion} />} {...register("event")} />
            <TextInput label="Occasion (Tamil)" dir="auto" {...register("eventTa")} />
          </Group>
          <TextInput label="Location (landing shows event • location)" {...register("place")} />
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                label={<Bilingual label={ui.site.source} />}
                data={[
                  { value: "manual", label: preferredText(ui.site.sourceManual, uiLanguage) },
                  { value: "google", label: preferredText(ui.site.sourceGoogle, uiLanguage) },
                ]}
                {...field}
              />
            )}
          />
          <TextInput
            label={<Bilingual label={ui.site.profileUrl} />}
            placeholder={preferredText(ui.site.photoPlaceholder, uiLanguage)}
            {...register("profileUrl")}
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
                    {item.author} · {Math.min(5, Math.max(1, Math.round(item.rating)))}/5
                    {item.source === "google" ? " · Google" : ""}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {uiLanguage === "ta" ? item.quoteTa.trim() || item.quoteEn : item.quoteEn}
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
        <Button component="a" href="/site" target="_blank" rel="noreferrer" variant="light">
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
