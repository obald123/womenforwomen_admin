"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ClipboardCheck,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { ApiError, apiFetch, formatApiError, resolveAssetUrl } from "../../../lib/apiClient";
import { toast } from "react-toastify";

type CampaignGalleryItem = {
  url: string;
  caption: string;
};

type CampaignImpactFact = {
  value: string;
  label: string;
  detail: string;
};

type DonationCampaign = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  closingLine: string;
  imageUrl: string;
  imageUrls: string[];
  galleryItems: CampaignGalleryItem[];
  impactFacts: CampaignImpactFact[];
  donationUrl: string;
  ctaLabel: string;
};

type PendingImage = {
  id: number;
  file: File;
  caption: string;
  previewUrl: string;
};

const EMPTY_CAMPAIGN: DonationCampaign = {
  eyebrow: "",
  title: "",
  paragraphs: [""],
  closingLine: "",
  imageUrl: "",
  imageUrls: [],
  galleryItems: [],
  impactFacts: [],
  donationUrl: "",
  ctaLabel: "Donate now",
};

const REQUESTED_GALLERY_ITEMS: CampaignGalleryItem[] = [
  {
    url: "/images/donation-campaign/workshop-class.png",
    caption: "Women learning practical sewing skills in a workshop.",
  },
  {
    url: "/images/donation-campaign/sewing-training-closeup.png",
    caption: "A close look at garment-making training.",
  },
  {
    url: "/images/donation-campaign/sewing-class-practice.jpeg",
    caption: "Participants practice sewing together.",
  },
  {
    url: "/images/donation-campaign/participant-at-sewing-machine.jpeg",
    caption: "A trainee works at a sewing machine.",
  },
  {
    url: "/images/donation-campaign/shoemaking-training.jpeg",
    caption: "Learning practical skills to create handmade shoes.",
  },
  {
    url: "/images/donation-campaign/knitting-training.jpeg",
    caption: "Women develop knitting skills during vocational training.",
  },
];

const REQUESTED_PARAGRAPHS = [
  "On December 1, your generosity can open new doors for women in Rwanda.",
  "At Women for Women Rwanda, we believe that when a woman gains the skills and confidence to earn her own income, the possibilities go far beyond her.",
  "Through our Stronger Women, Stronger Nation program, women gain practical vocational skills, learn to manage money, save, and explore opportunities to build their own livelihoods.",
  "This Giving Tuesday, December 1, 2026, we invite you to join that journey. Your support can make a difference that reaches far beyond one woman.",
  "Your donation through GlobalGiving will help us continue creating opportunities for women to learn, grow, and build brighter futures for themselves, their families, and their communities.",
];

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isCampaignImageReference(value: string) {
  if (value.startsWith("/images/")) {
    return !value.startsWith("//") && !value.split("/").includes("..");
  }
  return isUrl(value);
}

function normalizeCampaign(data: Partial<DonationCampaign>): DonationCampaign {
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url): url is string => typeof url === "string")
    : [];
  let galleryItems = Array.isArray(data.galleryItems)
    ? data.galleryItems.filter(
        (item): item is CampaignGalleryItem =>
          typeof item?.url === "string" && typeof item?.caption === "string",
      )
    : [];

  if (!galleryItems.length) {
    const urls = imageUrls.length ? imageUrls : data.imageUrl ? [data.imageUrl] : [];
    galleryItems = urls.map((url) => ({ url, caption: data.title ?? "" }));
  }

  return {
    eyebrow: data.eyebrow ?? "",
    title: data.title ?? "",
    paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : [""],
    closingLine: data.closingLine ?? "",
    imageUrl: data.imageUrl ?? galleryItems[0]?.url ?? "",
    imageUrls,
    galleryItems,
    impactFacts: Array.isArray(data.impactFacts) ? data.impactFacts : [],
    donationUrl: data.donationUrl ?? "",
    ctaLabel: data.ctaLabel ?? "Donate now",
  };
}

export default function DonationCampaignPage() {
  const [campaign, setCampaign] = useState<DonationCampaign | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isNewCampaign, setIsNewCampaign] = useState(false);
  const previewUrls = useRef<string[]>([]);
  const nextImageId = useRef(0);
  const imageUrlInput = useRef<HTMLInputElement>(null);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiFetch<{ data: DonationCampaign }>("/api/public/donation-campaign");
      setCampaign(normalizeCampaign(response.data));
      setIsNewCampaign(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setCampaign({ ...EMPTY_CAMPAIGN });
        setIsNewCampaign(true);
      } else {
        setLoadError(formatApiError(error));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaign();
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [loadCampaign]);

  function createPreview(file: File) {
    const url = URL.createObjectURL(file);
    previewUrls.current.push(url);
    return url;
  }

  function revokePreview(url: string) {
    URL.revokeObjectURL(url);
    previewUrls.current = previewUrls.current.filter((item) => item !== url);
  }

  function updateField<K extends keyof DonationCampaign>(field: K, value: DonationCampaign[K]) {
    setCampaign((current) => (current ? { ...current, [field]: value } : current));
  }

  function updateParagraph(index: number, value: string) {
    setCampaign((current) => {
      if (!current) return current;
      const paragraphs = [...current.paragraphs];
      paragraphs[index] = value;
      return { ...current, paragraphs };
    });
  }

  function updateGalleryItem(index: number, patch: Partial<CampaignGalleryItem>) {
    setCampaign((current) => {
      if (!current) return current;
      const galleryItems = current.galleryItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      );
      return { ...current, galleryItems };
    });
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    setCampaign((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.galleryItems.length) return current;
      const galleryItems = [...current.galleryItems];
      [galleryItems[index], galleryItems[target]] = [galleryItems[target], galleryItems[index]];
      return { ...current, galleryItems };
    });
  }

  function removeGalleryItem(index: number) {
    setCampaign((current) =>
      current ? { ...current, galleryItems: current.galleryItems.filter((_, itemIndex) => itemIndex !== index) } : current,
    );
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Choose image files only.");
      return;
    }
    if (pendingImages.length + files.length > 8) {
      toast.error("Upload up to 8 new images at a time.");
      return;
    }

    const additions = files.map((file) => ({
      id: nextImageId.current++,
      file,
      caption: "",
      previewUrl: createPreview(file),
    }));
    setPendingImages((current) => [...current, ...additions]);
  }

  function removePendingImage(id: number) {
    const target = pendingImages.find((image) => image.id === id);
    if (target) revokePreview(target.previewUrl);
    setPendingImages((current) => current.filter((image) => image.id !== id));
  }

  function updatePendingCaption(id: number, caption: string) {
    setPendingImages((current) =>
      current.map((image) => (image.id === id ? { ...image, caption } : image)),
    );
  }

  function addImpactFact() {
    setCampaign((current) =>
      current
        ? {
            ...current,
            impactFacts: [...current.impactFacts, { value: "", label: "", detail: "" }],
          }
        : current,
    );
  }

  function updateImpactFact(index: number, patch: Partial<CampaignImpactFact>) {
    setCampaign((current) => {
      if (!current) return current;
      const impactFacts = current.impactFacts.map((fact, factIndex) =>
        factIndex === index ? { ...fact, ...patch } : fact,
      );
      return { ...current, impactFacts };
    });
  }

  function removeImpactFact(index: number) {
    setCampaign((current) =>
      current ? { ...current, impactFacts: current.impactFacts.filter((_, factIndex) => factIndex !== index) } : current,
    );
  }

  function applyRequestedContent() {
    if (pendingImages.length > 0) {
      const shouldReplace = window.confirm(
        "Applying the supplied campaign photos will discard any new image uploads that have not been saved. Continue?",
      );
      if (!shouldReplace) return;
      pendingImages.forEach((image) => revokePreview(image.previewUrl));
      setPendingImages([]);
    }

    setCampaign((current) =>
      current
        ? {
            ...current,
            eyebrow: "Giving Tuesday | December 1, 2026",
            title: "Help Another Woman Build a Future of Her Own",
            paragraphs: [...REQUESTED_PARAGRAPHS],
            closingLine: "Every gift counts. Every woman deserves the opportunity to thrive.",
            imageUrl: REQUESTED_GALLERY_ITEMS[0].url,
            imageUrls: REQUESTED_GALLERY_ITEMS.map((item) => item.url),
            galleryItems: REQUESTED_GALLERY_ITEMS.map((item) => ({ ...item })),
          }
        : current,
    );
    toast.info("Requested copy and six supplied photos added. Save the campaign to publish them.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaign || saving) return;

    const paragraphs = campaign.paragraphs.map((paragraph) => paragraph.trim());
    const galleryItems = campaign.galleryItems.map((item) => ({
      url: item.url.trim(),
      caption: item.caption.trim(),
    }));
    const impactFacts = campaign.impactFacts.map((fact) => ({
      value: fact.value.trim(),
      label: fact.label.trim(),
      detail: fact.detail.trim(),
    }));

    if (!campaign.eyebrow.trim() || !campaign.title.trim() || paragraphs.some((paragraph) => !paragraph)) {
      toast.error("Complete the campaign label, title, introduction, and every story paragraph.");
      return;
    }
    if (!campaign.closingLine.trim() || !campaign.ctaLabel.trim()) {
      toast.error("Complete the closing line and donation button label.");
      return;
    }
    if (!isUrl(campaign.donationUrl.trim())) {
      toast.error("Enter a valid GlobalGiving donation URL.");
      return;
    }
    if (
      galleryItems.some((item) => !item.url || !isCampaignImageReference(item.url) || !item.caption)
    ) {
      toast.error("Every gallery image needs a valid URL and caption. Remove any unfinished image rows.");
      return;
    }
    if (pendingImages.some((image) => !image.caption.trim())) {
      toast.error("Add a caption for each new image before saving.");
      return;
    }
    if (impactFacts.some((fact) => !fact.value || !fact.label || !fact.detail)) {
      toast.error("Complete every value, label, and detail for impact facts, or remove unfinished facts.");
      return;
    }
    if (!galleryItems.length && !pendingImages.length) {
      toast.error("Add at least one campaign image.");
      return;
    }

    const payload = new FormData();
    payload.append("eyebrow", campaign.eyebrow.trim());
    payload.append("title", campaign.title.trim());
    payload.append("paragraphs", JSON.stringify(paragraphs));
    payload.append("closingLine", campaign.closingLine.trim());
    payload.append("ctaLabel", campaign.ctaLabel.trim());
    payload.append("donationUrl", campaign.donationUrl.trim());
    payload.append("galleryItems", JSON.stringify(galleryItems));
    payload.append("imageUrls", JSON.stringify(galleryItems.map((item) => item.url)));
    payload.append("impactFacts", JSON.stringify(impactFacts));
    payload.append("imageCaptions", JSON.stringify(pendingImages.map((image) => image.caption.trim())));
    pendingImages.forEach((image) => payload.append("images", image.file));

    const fallbackImageUrl = galleryItems[0]?.url;
    if (fallbackImageUrl) payload.append("imageUrl", fallbackImageUrl);

    setSaving(true);
    try {
      const response = await apiFetch<{ data: DonationCampaign }>("/api/donation-campaign", {
        method: "POST",
        body: payload,
      });
      setCampaign(normalizeCampaign(response.data));
      pendingImages.forEach((image) => revokePreview(image.previewUrl));
      setPendingImages([]);
      setIsNewCampaign(false);
      toast.success("Donation campaign saved.");
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSaving(false);
    }
  }

  const inputClassName =
    "mt-2 w-full border border-[#E4E9E7] bg-white px-4 py-3 text-sm text-[#0D2323] outline-none transition focus:border-[#00A991]";
  const labelClassName = "text-[10px] font-black uppercase tracking-[0.18em] text-[#45615B]";

  return (
    <div className="min-h-full bg-[#FBFBFB] text-[#0D2323]">
      <main className="p-6 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-[3px] w-10 bg-[#00A991]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00A991]">
                  Public website content
                </span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
                Donation <span className="text-gray-300">Campaign</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
                Manage the Giving Tuesday hero, story, photo gallery, impact figures, and donation link shown on the homepage and donate page.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={applyRequestedContent}
                disabled={loading || saving || !campaign}
                className="inline-flex items-center justify-center gap-2 bg-[#0D2323] px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#00A991] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ClipboardCheck size={14} />
                Apply requested copy & photos
              </button>
              <button
                type="button"
                onClick={() => void loadCampaign()}
                disabled={loading || saving}
                className="inline-flex items-center justify-center gap-2 border border-[#DDE5E2] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#24423B] transition hover:border-[#00A991] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Reload campaign
              </button>
            </div>
          </div>

          {isNewCampaign && !loading && (
            <div className="mb-6 border border-[#D9ECE7] bg-[#F0F8F6] px-5 py-4 text-sm text-[#315D54]">
              No campaign has been created yet. Complete the fields below and save to create it.
            </div>
          )}

          {loadError && (
            <div role="alert" className="mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>Could not load the campaign: {loadError}</span>
              <button
                type="button"
                onClick={() => void loadCampaign()}
                className="shrink-0 font-bold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {loading && (
            <p role="status" className="border border-[#E4E9E7] bg-white px-5 py-4 text-sm text-gray-500">
              Loading campaign…
            </p>
          )}

          {!loading && campaign && !loadError && (
            <form onSubmit={handleSubmit} className="space-y-7">
              <section className="border border-[#E8ECEA] bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6">
                  <h2 className="text-sm font-black uppercase tracking-[0.15em]">Campaign copy</h2>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    The first paragraph is the hero introduction; the remaining paragraphs make up the story.
                  </p>
                </div>
                <div className="grid gap-5">
                  <label className={labelClassName}>
                    Campaign label and date
                    <input
                      required
                      value={campaign.eyebrow}
                      onChange={(event) => updateField("eyebrow", event.target.value)}
                      placeholder="Giving Tuesday | December 1, 2026"
                      className={inputClassName}
                    />
                  </label>
                  <label className={labelClassName}>
                    Headline
                    <textarea
                      required
                      rows={2}
                      value={campaign.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                  <label className={labelClassName}>
                    Hero introduction
                    <textarea
                      required
                      rows={3}
                      value={campaign.paragraphs[0] ?? ""}
                      onChange={(event) => updateParagraph(0, event.target.value)}
                      className={inputClassName}
                    />
                  </label>

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <h3 className={labelClassName}>Story paragraphs</h3>
                        <p className="mt-1 text-xs text-gray-400">Shown open on the donate page and folded on the homepage.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField("paragraphs", [...campaign.paragraphs, ""])}
                        className="inline-flex items-center gap-2 border border-[#DDE5E2] px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:border-[#00A991]"
                      >
                        <Plus size={14} /> Add paragraph
                      </button>
                    </div>
                    <div className="space-y-3">
                      {campaign.paragraphs.slice(1).map((paragraph, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <textarea
                            required
                            rows={3}
                            aria-label={`Story paragraph ${index + 1}`}
                            value={paragraph}
                            onChange={(event) => updateParagraph(index + 1, event.target.value)}
                            className={inputClassName}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                "paragraphs",
                                campaign.paragraphs.filter((_, paragraphIndex) => paragraphIndex !== index + 1),
                              )
                            }
                            aria-label={`Remove story paragraph ${index + 1}`}
                            className="mt-2 rounded border border-[#F0D8D6] p-3 text-[#B34037] hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className={labelClassName}>
                    Closing line
                    <textarea
                      required
                      rows={2}
                      value={campaign.closingLine}
                      onChange={(event) => updateField("closingLine", event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                </div>
              </section>

              <section className="border border-[#E8ECEA] bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.15em]">Campaign photos</h2>
                    <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-500">
                      Existing photos can be recaptioned, removed, and reordered. New uploads need a caption; up to 8 can be uploaded at once.
                      The first photo is used as the fallback campaign image.
                    </p>
                  </div>
                  <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 bg-[#0D2323] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#00A991]">
                    <ImageIcon size={15} />
                    Add photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="mb-6">
                  <div>
                    <label htmlFor="campaign-image-url" className={labelClassName}>
                      Add image by URL
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        ref={imageUrlInput}
                        type="text"
                        id="campaign-image-url"
                        placeholder="https://example.org/photo.jpg"
                        className="w-full border border-[#E4E9E7] px-4 py-3 text-sm outline-none focus:border-[#00A991]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = imageUrlInput.current;
                          const url = input?.value.trim() ?? "";
                          if (!isCampaignImageReference(url)) {
                            toast.error("Enter a valid image URL or a site-local path under /images/.");
                            return;
                          }
                          setCampaign((current) =>
                            current
                              ? {
                                  ...current,
                                  galleryItems: [...current.galleryItems, { url, caption: "" }],
                                }
                              : current,
                          );
                          if (input) input.value = "";
                        }}
                        className="shrink-0 border border-[#DDE5E2] px-4 text-[10px] font-black uppercase tracking-wider hover:border-[#00A991]"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>

                {campaign.galleryItems.length === 0 && pendingImages.length === 0 && (
                  <div className="flex flex-col items-center border-2 border-dashed border-[#E4E9E7] py-12 text-center text-gray-400">
                    <ImageIcon size={30} strokeWidth={1.4} />
                    <p className="mt-3 text-xs">No campaign photos yet. Add an upload or image URL.</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {campaign.galleryItems.map((item, index) => (
                    <article key={`${item.url}-${index}`} className="overflow-hidden border border-[#E8ECEA]">
                      <div className="relative aspect-[16/9] bg-[#F1F4F2]">
                        {item.url && (
                          <Image
                            src={resolveAssetUrl(item.url) || item.url}
                            alt={item.caption || "Campaign photo"}
                            fill
                            unoptimized
                            sizes="(min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        )}
                        <span className="absolute left-3 top-3 bg-black/65 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                          Photo {index + 1}
                        </span>
                      </div>
                      <div className="space-y-3 p-4">
                        <label className={labelClassName}>
                          Image URL
                          <input
                            type="text"
                            required
                            value={item.url}
                            onChange={(event) => updateGalleryItem(index, { url: event.target.value })}
                            className="mt-2 w-full border border-[#E4E9E7] px-3 py-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-[#00A991]"
                          />
                        </label>
                        <label className={labelClassName}>
                          Caption and image description
                          <textarea
                            required
                            rows={2}
                            value={item.caption}
                            onChange={(event) => updateGalleryItem(index, { caption: event.target.value })}
                            className="mt-2 w-full border border-[#E4E9E7] px-3 py-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-[#00A991]"
                          />
                        </label>
                        <div className="flex items-center justify-between border-t border-[#F0F2F1] pt-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveGalleryItem(index, -1)}
                              aria-label={`Move photo ${index + 1} up`}
                              className="border border-[#E4E9E7] p-2 text-[#45615B] hover:border-[#00A991] disabled:opacity-30"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={index === campaign.galleryItems.length - 1}
                              onClick={() => moveGalleryItem(index, 1)}
                              aria-label={`Move photo ${index + 1} down`}
                              className="border border-[#E4E9E7] p-2 text-[#45615B] hover:border-[#00A991] disabled:opacity-30"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(index)}
                            className="inline-flex items-center gap-2 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-[#B34037] hover:bg-red-50"
                          >
                            <Trash2 size={14} /> Remove photo
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {pendingImages.map((image) => (
                    <article key={image.id} className="overflow-hidden border border-[#B9DED5]">
                      <div className="relative aspect-[16/9] bg-[#F1F4F2]">
                        <Image
                          src={image.previewUrl}
                          alt={image.file.name}
                          fill
                          unoptimized
                          sizes="(min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                        <span className="absolute left-3 top-3 bg-[#087669] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                          New upload
                        </span>
                      </div>
                      <div className="space-y-3 p-4">
                        <p className="truncate text-xs font-bold text-[#45615B]" title={image.file.name}>
                          {image.file.name}
                        </p>
                        <label className={labelClassName}>
                          Caption and image description
                          <textarea
                            required
                            rows={2}
                            value={image.caption}
                            onChange={(event) => updatePendingCaption(image.id, event.target.value)}
                            className="mt-2 w-full border border-[#E4E9E7] px-3 py-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-[#00A991]"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removePendingImage(image.id)}
                          className="inline-flex items-center gap-2 px-2 py-2 text-[10px] font-black uppercase tracking-wider text-[#B34037] hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Remove upload
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="border border-[#E8ECEA] bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.15em]">Impact facts</h2>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">Each fact appears in the campaign impact cards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addImpactFact}
                    className="inline-flex items-center gap-2 border border-[#DDE5E2] px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:border-[#00A991]"
                  >
                    <Plus size={14} /> Add fact
                  </button>
                </div>
                {campaign.impactFacts.length === 0 ? (
                  <p className="border border-dashed border-[#E4E9E7] p-5 text-xs text-gray-400">
                    No impact facts added. Use “Add fact” to create one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {campaign.impactFacts.map((fact, index) => (
                      <div key={index} className="grid gap-3 border border-[#E8ECEA] p-4 sm:grid-cols-[0.65fr_1fr_1.5fr_auto] sm:items-end">
                        <label className={labelClassName}>
                          Value
                          <input
                            required
                            value={fact.value}
                            onChange={(event) => updateImpactFact(index, { value: event.target.value })}
                            className={inputClassName}
                          />
                        </label>
                        <label className={labelClassName}>
                          Label
                          <input
                            required
                            value={fact.label}
                            onChange={(event) => updateImpactFact(index, { label: event.target.value })}
                            className={inputClassName}
                          />
                        </label>
                        <label className={labelClassName}>
                          Detail
                          <input
                            required
                            value={fact.detail}
                            onChange={(event) => updateImpactFact(index, { detail: event.target.value })}
                            className={inputClassName}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImpactFact(index)}
                          aria-label={`Remove impact fact ${index + 1}`}
                          className="border border-[#F0D8D6] p-3 text-[#B34037] hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border border-[#E8ECEA] bg-white p-5 shadow-sm sm:p-7">
                <h2 className="mb-6 text-sm font-black uppercase tracking-[0.15em]">Donation button</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={labelClassName}>
                    Donation button label
                    <input
                      required
                      value={campaign.ctaLabel}
                      onChange={(event) => updateField("ctaLabel", event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                  <label className={labelClassName}>
                    GlobalGiving donation URL
                    <input
                      required
                      type="url"
                      value={campaign.donationUrl}
                      onChange={(event) => updateField("donationUrl", event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-gray-400">
                  The same label and link are used by the hero, mid-page, and bottom donation buttons.
                </p>
              </section>

              <div className="sticky bottom-4 z-20 flex flex-col gap-3 border border-[#E8ECEA] bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  {isNewCampaign ? "This campaign will be created when you save." : "Changes are not live until you save."}
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 bg-[#0D2323] px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#00A991] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} />
                  {saving ? "Saving..." : isNewCampaign ? "Create campaign" : "Save campaign"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
