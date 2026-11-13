"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  ImagePlus,
  X,
  Package,
  Layers,
  FolderTree,
  Settings2,
  Loader2,
  Sparkles,
  ExternalLink,
  Globe,
  Tag,
  Truck,
  Video,
  Star,
  Check,
} from "lucide-react";

import MediaModal from "../../../media/components/MediaModal";
import { useGetBrandsQuery } from "@/redux/service/brand";
import { useGetCategoriesQuery } from "@/redux/service/categories";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/service/products";
import { useGetAttributesQuery } from "@/redux/service/attributes";
import { productSchema, TProductFormType } from "@/components/validations/product";
import { IProduct } from "@/redux/service/products/type";
import SectionCard from "./SectionCard";
import { FormField } from "./FormField";
import SingleProduct from "./single-product";
import VariantTable from "./variant-table";
import { ProductFormSkeleton } from "./skeletion";
import NestedCategorySelector from "./NextedCategorySelector";
import QuillEditor from "@/components/shared/QuilEditor";

interface IAttributeConfig {
  attributeId: string;
  name: string;
  selectedValues: string[];
}

const orUndefined = <T,>(value: T | null | undefined): T | undefined => value ?? undefined;

function productToFormValues(product: IProduct): TProductFormType {
  return {
    name: product.name,
    slug: product.slug,
    videoUrl: product.videoUrl ?? "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    thumbnail: product.thumbnail ?? "",
    gallery: product.gallery ?? [],

    price: orUndefined(product.price),
    discountPrice: orUndefined(product.discountPrice),
    discountParcent: orUndefined(product.discountParcent),
    costPrice: orUndefined(product.costPrice),

    productType: product.productType || "single",
    selectedAttributes: product.selectedAttributes ?? [],
    variations: (product.variations ?? []).map((variation) => ({
      name: variation.name,
      price: variation.price ?? 0,
      offerPriceFixed: orUndefined(variation.offerPriceFixed),
      offerPriceParcent: orUndefined(variation.offerPriceParcent),
      costPrice: orUndefined(variation.costPrice),
      sku: orUndefined(variation.sku),
      barcode: orUndefined(variation.barcode),
      stock: variation.stock ?? 0,
      lowStockAlert: variation.lowStockAlert ?? 5,
      images: variation.images ?? [],
      attributeConfig: orUndefined(variation.attributeConfig),
      weight: orUndefined(variation.weight),
      dimensions: {
        length: orUndefined(variation.dimensionLength),
        width: orUndefined(variation.dimensionWidth),
        height: orUndefined(variation.dimensionHeight),
      },
      isDefault: orUndefined(variation.isDefault),
    })),

    category: product.categoryId ?? "",
    brand: product.brandId ?? "",

    stock: orUndefined(product.stock),
    trackStock: orUndefined(product.trackStock),

    shipping: {
      weight: orUndefined(product.weight),
      dimensions: {
        length: orUndefined(product.dimensionLength),
        width: orUndefined(product.dimensionWidth),
        height: orUndefined(product.dimensionHeight),
      },
      isFreeShipping: Boolean(product.isFreeShipping),
    },
    seo: {
      title: product.seoTitle ?? "",
      description: product.seoDescription ?? "",
      keywords: product.seoKeywords ?? [],
    },

    tags: product.tags ?? [],
    isFeatured: Boolean(product.isFeatured),
    isDelete: Boolean(product.isDelete),
    status: product.status ?? true,
  };
}

export default function ProductForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("pid");
  const isEdit = Boolean(productId);
  const router = useRouter();

  const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updateLoading }] = useUpdateProductMutation();
  const { data: getSingleProduct, isLoading: productLoading } = useGetProductByIdQuery(
    productId!,
    { skip: !productId }
  );
  const product = getSingleProduct?.data;

  // RTK Queries
  const { data: getBrands, isLoading: brandsLoading } = useGetBrandsQuery(
    "page=1&limit=1000&status=true&isDelete=false"
  );
  const brands = getBrands?.data || [];

  const { data: getCategories, isLoading: categoriesLoading } = useGetCategoriesQuery(
    "page=1&limit=20000&status=true&isDelete=false"
  );
  const categories = getCategories?.data || [];

  const { data: getAttributes, isLoading: attributesLoading } = useGetAttributesQuery(
    "page=1&limit=1000&status=true&isDelete=false"
  );
  const attributes = getAttributes?.data || [];

  // Local state
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedConfigs, setSelectedConfigs] = useState<IAttributeConfig[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  // React Hook Form
  const form = useForm<TProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      status: true,
      isFeatured: false,
      category: "",
      brand: "",
      productType: "single",
      variations: [],
      gallery: [],
      thumbnail: "",
      tags: [],
      shipping: {
        isFreeShipping: false,
      },
      seo: {
        title: "",
        description: "",
      },
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "variations",
  });

  // Auto-generate slug when name changes in create mode
  const watchedName = watch("name");
  const productType = watch("productType");
  const currentTags = watch("tags") || [];
  const watchedStatus = watch("status");
  const watchedFeatured = watch("isFeatured");
  const watchedFreeShipping = watch("shipping.isFreeShipping");
  const watchedCategory = watch("category");
  const watchedPrice = watch("price");
  const watchedSeoTitle = watch("seo.title");
  const watchedSeoDesc = watch("seo.description");

  useEffect(() => {
    if (watchedName && !isEdit) {
      setValue(
        "slug",
        watchedName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        { shouldValidate: true }
      );
    }
  }, [watchedName, isEdit, setValue]);

  // Load product data when editing
  useEffect(() => {
    if (product) {
      form.reset({
        ...form.getValues(),
        ...productToFormValues(product),
      });
      setSelectedConfigs(product.selectedAttributes ?? []);
      setProductImages(product.gallery ?? []);
    }
  }, [product, form]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (!productId) {
      form.reset({
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        status: true,
        isFeatured: false,
        category: "",
        brand: "",
        productType: "single",
        variations: [],
        gallery: [],
        thumbnail: "",
        tags: [],
        shipping: {
          isFreeShipping: false,
        },
        seo: {
          title: "",
          description: "",
        },
      });
      setSelectedConfigs([]);
      setProductImages([]);
      setTagInput("");
      replace([]);
    }
  }, [productId, form, replace]);

  // ---------------- Attributes & Variations Logic ----------------
  const addAttributeRow = () => {
    setSelectedConfigs([
      ...selectedConfigs,
      { attributeId: "", name: "", selectedValues: [] },
    ]);
  };

  const removeAttributeRow = (idx: number) => {
    setSelectedConfigs(selectedConfigs.filter((_, i) => i !== idx));
  };

  const updateAttributeType = (idx: number, attrId: string) => {
    const attr = attributes.find((a) => a.id === attrId);
    const newConfigs = [...selectedConfigs];
    newConfigs[idx] = {
      attributeId: attrId,
      name: attr?.displayName || attr?.name || "",
      selectedValues: [],
    };
    setSelectedConfigs(newConfigs);
  };

  const toggleAttributeValue = (idx: number, value: string) => {
    setSelectedConfigs((prev) =>
      prev.map((config, index) => {
        if (index !== idx) return config;
        const selectedValues = config.selectedValues.includes(value)
          ? config.selectedValues.filter((v) => v !== value)
          : [...config.selectedValues, value];
        return { ...config, selectedValues };
      })
    );
  };

  const generateVariations = () => {
    const lists = selectedConfigs
      .map((c) => c.selectedValues)
      .filter((l) => l.length > 0);

    if (lists.length === 0) {
      toast.error("Please select at least one attribute value");
      return;
    }

    const cartesian = lists.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
      [[]]
    );

    replace(
      cartesian.map((combo) => ({
        name: combo.join(" / "),
        price: Number(watch("price")) || 0,
        offerPriceFixed: 0,
        offerPriceParcent: 0,
        costPrice: 0,
        lowStockAlert: 5,
        sku: `SKU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        stock: 0,
      }))
    );

    toast.success(`${cartesian.length} variations generated successfully!`);
  };

  // ---------------- Tags Handler ----------------
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const val = tagInput.trim().replace(",", "");
      if (val && !currentTags.includes(val)) {
        setValue("tags", [...currentTags, val], { shouldValidate: true });
        setTagInput("");
      }
    }
  };

  const removeTag = (valToRemove: string) => {
    setValue(
      "tags",
      currentTags.filter((v) => v !== valToRemove),
      { shouldValidate: true }
    );
  };

  // ---------------- Submit Handler ----------------
  const onSubmit = async (data: TProductFormType) => {
    try {
      const payload: any = {
        ...data,
        gallery: productImages,
        thumbnail: data.thumbnail || productImages[0] || null,
        selectedAttributes: selectedConfigs,
      };

      const brandVal = data.brand?.trim();
      if (brandVal && brandVal !== "" && brandVal !== "undefined") {
        payload.brand = brandVal;
      } else {
        delete payload.brand;
      }

      let resUrl = "";

      if (isEdit) {
        if (!product) return;
        const res = await updateProduct({ id: product.id, payload }).unwrap();
        resUrl = res?.data?.id as string;
        toast.success("Product updated successfully!");
      } else {
        const res = await createProduct(payload).unwrap();
        resUrl = res?.data?.id as string;
        toast.success("Product created successfully!");
      }

      if (resUrl) {
        router.push(`/admin/products/form?pid=${resUrl}`);
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Something went wrong. Please try again.";
      if (err?.data?.error) errorMessage = err.data.error;
      else if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.error) errorMessage = err.error;
      else if (err?.message) errorMessage = err.message;
      toast.error(errorMessage);
    }
  };

  // Completeness Checklist Calculation
  const completeness = useMemo(() => {
    const checks = [
      { label: "Product Title", done: Boolean(watchedName?.trim()) },
      { label: "Category Selected", done: Boolean(watchedCategory) },
      { label: "Images Uploaded", done: productImages.length > 0 },
      {
        label: "Pricing Defined",
        done:
          productType === "single"
            ? Number(watchedPrice) > 0
            : fields.length > 0,
      },
    ];

    const completedCount = checks.filter((c) => c.done).length;
    const percent = Math.round((completedCount / checks.length) * 100);

    return { checks, percent };
  }, [watchedName, watchedCategory, productImages, watchedPrice, productType, fields]);

  const isSubmitting = createLoading || updateLoading;

  if (productLoading) return <ProductFormSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      {/* ── Top Header (Sticky) ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Back button & Title */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/products")}
              className="h-8 px-2.5 text-xs font-semibold rounded-md gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              <span>Back to Products</span>
            </Button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isEdit ? "Edit Product" : "Add New Product"}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                    watchedStatus
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80"
                  }`}
                >
                  {watchedStatus ? "Active" : "Draft (Inactive)"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Configure basic info, pricing, media gallery, variations and SEO
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isEdit && product?.slug && (
              <Link
                href={`/shop/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-2.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-primary hover:bg-primary/10 flex items-center gap-1.5 transition-colors"
                title="View on Storefront"
              >
                <ExternalLink size={13} />
                <span className="hidden xs:inline">Preview in Store</span>
              </Link>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/products")}
              className="h-8 px-3 text-xs font-semibold rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-8 px-4 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>{isEdit ? "Save Changes" : "Publish Product"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Form Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ── Left Column (Core Product Details) ── */}
        <div className="space-y-6">
          {/* 1. General Product Information */}
          <SectionCard
            icon={<Package size={16} />}
            title="General Information"
            description="Product title, URL slug, short summary and detailed description"
          >
            <FormField
              label="Product Title"
              required
              error={errors.name?.message}
              hint="Main title displayed to customers. Keep it concise and attractive."
            >
              <Input
                {...register("name")}
                placeholder="e.g. Herbalife Formula 1 Shake Mix (500g)"
                className="h-10 text-sm font-medium rounded-md"
              />
            </FormField>

            <FormField
              label="URL Slug"
              hint="Unique web address for this product. Auto-generated from title."
            >
              <div className="flex items-center">
                <span className="px-3 h-9 flex items-center border border-r-0 rounded-l-md bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 border-slate-200 dark:border-slate-800">
                  /products/
                </span>
                <Input
                  {...register("slug")}
                  placeholder="herbalife-formula-1-shake-mix"
                  className="h-9 text-xs rounded-l-none"
                />
              </div>
            </FormField>

            <FormField
              label="Short Summary"
              hint="Brief 2-3 line summary shown in cards and below the title."
            >
              <Textarea
                {...register("shortDescription")}
                placeholder="Provide a quick highlight of this product's benefits..."
                className="text-xs min-h-[75px] resize-none rounded-md"
              />
            </FormField>

            <FormField
              label="Detailed Description"
              hint="Full product details including ingredients, benefits, and usage instructions."
            >
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <QuillEditor
                  value={watch("description") || ""}
                  callBack={(value) =>
                    setValue("description", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            </FormField>
          </SectionCard>

          {/* 2. Product Category Selection */}
          <SectionCard
            icon={<FolderTree size={16} />}
            title="Product Category"
            description="Select the hierarchical category branch where this product belongs."
            className="overflow-visible"
          >
            <FormField
              label="Category"
              required
              error={errors.category?.message}
              hint="Select root category, subcategory and branch level."
            >
              {categoriesLoading ? (
                <div className="text-xs text-slate-400">Loading categories...</div>
              ) : (
                <NestedCategorySelector
                  categories={categories}
                  value={watch("category")}
                  onChange={(id) => setValue("category", id, { shouldValidate: true })}
                  error={errors.category?.message}
                />
              )}
            </FormField>
          </SectionCard>

          {/* 3. Product Images & Gallery */}
          <SectionCard
            icon={<ImagePlus size={16} />}
            title="Media Gallery"
            description="Upload high-resolution product photos. The first image will be used as the primary thumbnail."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {productImages.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group bg-slate-50 dark:bg-slate-900 shadow-2xs"
                  >
                    <Image
                      src={url}
                      alt={`Product image ${i + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Primary badge for 1st image */}
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                        <Star size={10} className="fill-current" /> Primary
                      </span>
                    )}

                    {/* Hover remove button */}
                    <button
                      type="button"
                      onClick={() =>
                        setProductImages(productImages.filter((_, j) => j !== i))
                      }
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Remove image"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                ))}

                {/* Add Image Button */}
                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary bg-slate-50/50 dark:bg-slate-900/50 shrink-0"
                >
                  <Plus size={20} />
                  <span className="text-[10px] font-bold">Add Image</span>
                </button>
              </div>

              {productImages.length === 0 && (
                <p className="text-xs text-slate-400">
                  No images uploaded yet. Click &ldquo;Add Image&rdquo; to open the media library.
                </p>
              )}

              {/* Video URL */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <FormField
                  label="Product Video URL (Optional)"
                  hint="Provide a YouTube or Vimeo video link to display on the product page."
                >
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      {...register("videoUrl")}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-9 pl-9 text-xs rounded-md"
                    />
                  </div>
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* 3. Product Type & Pricing Structure */}
          <SectionCard
            icon={<Settings2 size={16} />}
            title="Product Type"
            description="Choose between a single standalone product or a multi-variant product"
          >
            {/* Segmented Type Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("productType", "single", { shouldValidate: true })}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  productType === "single"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    productType === "single"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Package size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">Single Product</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Standard item with fixed price and single inventory
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("productType", "variant", { shouldValidate: true })}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  productType === "variant"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    productType === "variant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">Variant Product</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Item with multiple sizes, flavors, or weights
                  </p>
                </div>
              </button>
            </div>
          </SectionCard>

          {/* If Single: Render SingleProduct financial inputs */}
          {productType === "single" && <SingleProduct form={form} />}

          {/* If Variant: Render Attributes & Variant Table */}
          {productType === "variant" && (
            <SectionCard
              icon={<Layers size={16} />}
              title="Attributes & Variations"
              description="Define attributes such as Size, Flavor, or Weight to generate product combinations"
            >
              {/* Selected Attribute Rows */}
              <div className="space-y-3">
                {attributesLoading && (
                  <div className="text-xs text-slate-400">Loading attributes...</div>
                )}

                {selectedConfigs.map((config, idx) => {
                  const attr = attributes.find((a) => a.id === config.attributeId);

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
                            Attribute Type (e.g. Size, Flavor, Weight)
                          </Label>
                          <Select
                            value={config.attributeId}
                            onValueChange={(val) => updateAttributeType(idx, val)}
                          >
                            <SelectTrigger className="h-8 text-xs rounded-md bg-white dark:bg-slate-900">
                              <SelectValue placeholder="Select attribute..." />
                            </SelectTrigger>
                            <SelectContent>
                              {attributes.map((a) => (
                                <SelectItem key={a.id} value={a.id} className="text-xs">
                                  {a.displayName || a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttributeRow(idx)}
                          className="mt-4 h-8 w-8 text-slate-400 hover:text-rose-600 rounded-md"
                          title="Remove attribute"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>

                      {attr && (
                        <div>
                          <Label className="text-[11px] font-semibold text-slate-500 mb-2 block">
                            Select Applicable Values:
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {attr.values.map((val: string) => {
                              const active = config.selectedValues.includes(val);
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => toggleAttributeValue(idx, val)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                    active
                                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAttributeRow}
                  className="h-8 text-xs font-semibold rounded-md gap-1.5 flex-1 border-slate-200 dark:border-slate-700"
                >
                  <Plus size={13} /> Add Attribute
                </Button>

                <Button
                  type="button"
                  onClick={generateVariations}
                  className="h-8 text-xs font-bold rounded-md gap-1.5 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                >
                  <RefreshCw size={13} /> Generate Variations ({selectedConfigs.length})
                </Button>
              </div>

              {/* Variations Table */}
              {fields.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Generated Variations ({fields.length} combinations)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Customize price, discount, SKU, and image per variation
                    </span>
                  </div>
                  <VariantTable form={form} remove={remove} fields={fields} />
                </div>
              )}
            </SectionCard>
          )}

          {/* 4. Search Engine Optimization (SEO) */}
          <SectionCard
            icon={<Globe size={16} />}
            title="Search Engine Optimization (SEO)"
            description="Preview and configure how this product appears in Google search results"
            collapsible
            defaultOpen={false}
          >
            {/* Google SERP Live Preview */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Google Search Preview
              </p>
              <p className="text-xs font-medium text-slate-500 truncate">
                https://herbalifebd.com/products/{watch("slug") || "your-product-slug"}
              </p>
              <h4 className="text-base font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                {watchedSeoTitle || watchedName || "Product Title | Herbalife BD"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {watchedSeoDesc ||
                  watch("shortDescription") ||
                  "Buy 100% authentic Herbalife products in Bangladesh with fast home delivery and best prices."}
              </p>
            </div>

            <FormField
              label="SEO Meta Title"
              hint="Search engine title displayed in Google results (ideal length: 55-60 characters)."
            >
              <Input
                {...register("seo.title")}
                placeholder="Herbalife Formula 1 Shake Mix | Best Price in Bangladesh"
                className="h-9 text-xs rounded-md"
              />
            </FormField>

            <FormField
              label="SEO Meta Description"
              hint="Search snippet displayed under the title (ideal length: 150-160 characters)."
            >
              <Textarea
                {...register("seo.description")}
                placeholder="Buy 100% authentic Herbalife products in Bangladesh with fastest home delivery..."
                className="text-xs min-h-[60px] resize-none rounded-md"
              />
            </FormField>
          </SectionCard>
        </div>

        {/* ── Right Column (Sidebar: Visibility, Category, Brand, Tags) ── */}
        <div className="space-y-5 lg:sticky lg:top-16">
          {/* Card 1: Publish & Visibility Settings */}
          <Card className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Publish & Visibility
              </h3>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${
                  watchedStatus
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {watchedStatus ? "Published" : "Draft"}
              </Badge>
            </div>

            {/* Switches */}
            <div className="space-y-3.5">
              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Visible to Customers
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    When active, product is published and live on storefront
                  </p>
                </div>
                <Switch
                  checked={watchedStatus === true}
                  onCheckedChange={(val) =>
                    setValue("status", val, { shouldValidate: true })
                  }
                />
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Featured Collection
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    Highlighted in the homepage showcase section
                  </p>
                </div>
                <Switch
                  checked={watchedFeatured === true}
                  onCheckedChange={(val) =>
                    setValue("isFeatured", val, { shouldValidate: true })
                  }
                />
              </div>

              {/* Free Delivery Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Free Delivery
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    Qualifies this product for free shipping
                  </p>
                </div>
                <Switch
                  checked={watchedFreeShipping === true}
                  onCheckedChange={(val) =>
                    setValue("shipping.isFreeShipping", val, { shouldValidate: true })
                  }
                />
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full h-10 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs transition-all mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>{isEdit ? "Save Changes" : "Publish Product"}</span>
            </Button>
          </Card>

          {/* Card 2: Organization (Brand & Attributes) */}
          <Card className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Organization & Brand
            </h3>

            {/* Brand Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Brand
              </Label>
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    disabled={brandsLoading}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-md w-full bg-white dark:bg-slate-900">
                      <SelectValue placeholder="Select brand..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs text-slate-400">
                        — None —
                      </SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Product Tags */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Tags
              </Label>
              <div className="flex gap-1 flex-wrap mb-1.5">
                {currentTags.map((val, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(val)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type tag and press Enter..."
                  className="h-8 pl-8 text-xs rounded-md"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Separate tags with comma (,) or press Enter
              </p>
            </div>
          </Card>

          {/* Card 3: Shipping & Package Dimensions */}
          <Card className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Truck size={15} className="text-primary" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Shipping & Weight
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  className="h-8 text-xs rounded-md"
                  {...register("shipping.weight")}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Package Dimensions (L × W × H - cm)
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Input
                    type="number"
                    placeholder="L"
                    className="h-8 text-xs rounded-md"
                    {...register("shipping.dimensions.length")}
                  />
                  <Input
                    type="number"
                    placeholder="W"
                    className="h-8 text-xs rounded-md"
                    {...register("shipping.dimensions.width")}
                  />
                  <Input
                    type="number"
                    placeholder="H"
                    className="h-8 text-xs rounded-md"
                    {...register("shipping.dimensions.height")}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4: Completeness Checklist */}
          <Card className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Form Completion
              </span>
              <span className="text-xs font-bold text-primary">
                {completeness.percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${completeness.percent}%` }}
              />
            </div>

            {/* Check items */}
            <div className="space-y-1.5 pt-1">
              {completeness.checks.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span
                    className={
                      item.done
                        ? "text-slate-700 dark:text-slate-300 font-medium"
                        : "text-slate-400"
                    }
                  >
                    {item.label}
                  </span>
                  {item.done ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Media Modal ── */}
      <MediaModal
        open={mediaOpen}
        setOpen={setMediaOpen}
        onSelect={(urls: string[]) => {
          setProductImages((prev) => [...prev, ...urls]);
        }}
      />
    </div>
  );
}
