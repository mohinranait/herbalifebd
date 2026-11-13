"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlobalModal } from "@/components/shared/GlobalModal";
import { toast } from "sonner";
import MediaModal from "../../media/components/MediaModal";
import { FolderTree, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { ICategory } from "@/redux/service/categories/type";
import { categorySchema, TCategoryFormData } from "@/components/validations/categories";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/service/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  previousData?: ICategory;
  defaultParentId?: string | null;
};

export default function CategoryForm({
  isOpen,
  setIsOpen,
  previousData,
  defaultParentId,
}: Props) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeField, setActiveField] = useState<"thumbnail" | "banner" | null>(null);

  const { data } = useGetCategoriesQuery("page=1&limit=1000&isDelete=false");
  const categories = data?.data || [];

  const [createCategory, { isLoading: createLoading }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] = useUpdateCategoryMutation();

  const form = useForm<TCategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      description: "",
      thumbnail: "",
      banner: "",
      status: true,
      priority: 0,
    },
  });

  const { control, setValue, watch } = form;
  const name = watch("name");
  const thumbnail = watch("thumbnail");
  const banner = watch("banner");

  // Auto generate slug from name when creating
  useEffect(() => {
    if (name && !previousData?.id) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [name, previousData, setValue]);

  // Reset values on open/previousData change
  useEffect(() => {
    if (previousData) {
      form.reset({
        name: previousData.name || "",
        slug: previousData.slug || "",
        parentId: previousData.parentId || null,
        status: previousData.status ?? true,
        description: previousData.description || "",
        thumbnail: previousData?.thumbnail || "",
        banner: previousData.banner || "",
        priority: previousData.priority ?? 0,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        parentId: defaultParentId || null,
        status: true,
        description: "",
        thumbnail: "",
        banner: "",
        priority: 0,
      });
    }
  }, [previousData, defaultParentId, form]);

  const onSubmit = async (formData: TCategoryFormData) => {
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId && formData.parentId !== "null" ? formData.parentId : null,
        priority: Number(formData.priority) || 0,
      };

      if (previousData?.id) {
        await updateCategory({ payload, id: previousData.id }).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created successfully!");
      }

      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      handleErrors(error as ErrorResponse);
    }
  };

  const isSubmitting = createLoading || updateLoading;

  // Filter out current category to avoid circular nesting
  const availableParents = categories.filter((cat) => {
    if (!previousData) return true;
    return cat.id !== previousData.id;
  });

  return (
    <GlobalModal
      open={isOpen}
      onOpenChange={setIsOpen}
      title={previousData ? "Edit Category Details" : "Create New Category"}
      description="Configure category name, slug, parent level, and display settings"
      icon={<FolderTree className="w-5 h-5 text-orange-500" />}
      className="max-w-2xl rounded-lg"
      footer={
        <div className="flex justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            className="rounded-md h-9 text-xs"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-md h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {previousData ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-1">
        {/* Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Health Supplements"
              className="h-9 text-xs rounded-md"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-[11px] font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              URL Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="health-supplements"
              className="h-9 text-xs rounded-md"
              {...form.register("slug")}
            />
            {form.formState.errors.slug && (
              <p className="text-red-500 text-[11px] font-medium">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>
        </div>

        {/* Parent Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Parent Category
            </Label>
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  value={field.value || "null"}
                  onValueChange={(val) => field.onChange(val === "null" ? null : val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-md w-full">
                    <SelectValue placeholder="Root Level (No Parent)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="null" className="text-xs font-medium text-slate-600">
                      — Root Level (No Parent) —
                    </SelectItem>
                    {availableParents
                      .filter((p) => !p.parentId)
                      .map((root) => (
                        <React.Fragment key={root.id}>
                          <SelectItem value={root.id} className="text-xs font-semibold">
                            📁 {root.name}
                          </SelectItem>
                          {availableParents
                            .filter((sub) => sub.parentId === root.id)
                            .map((sub) => (
                              <SelectItem
                                key={sub.id}
                                value={sub.id}
                                className="text-xs pl-6 text-slate-600"
                              >
                                ↳ {sub.name}
                              </SelectItem>
                            ))}
                        </React.Fragment>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Display Priority
            </Label>
            <Input
              type="number"
              placeholder="0"
              className="h-9 text-xs rounded-md"
              {...form.register("priority")}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </Label>
          <Textarea
            rows={2}
            placeholder="Brief overview of this category..."
            className="text-xs rounded-md resize-none"
            {...form.register("description")}
          />
        </div>

        {/* Thumbnail & Banner Image pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Thumbnail */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thumbnail Icon
            </Label>
            <div className="flex items-center gap-3">
              {thumbnail ? (
                <div className="relative w-20 h-20 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src={thumbnail}
                    alt="Thumbnail"
                    width={72}
                    height={72}
                    className="w-full h-full object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("thumbnail", null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveField("thumbnail");
                    setMediaOpen(true);
                  }}
                  className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-orange-500 bg-slate-50/50 dark:bg-slate-900/50 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Thumbnail</span>
                </button>
              )}
              <div className="text-[11px] text-slate-400 leading-tight">
                Square icon or thumbnail image for menus and card listings (1:1 ratio)
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Banner
            </Label>
            <div className="flex items-center gap-3">
              {banner ? (
                <div className="relative w-28 h-20 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src={banner}
                    alt="Banner"
                    width={100}
                    height={72}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("banner", null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveField("banner");
                    setMediaOpen(true);
                  }}
                  className="w-28 h-20 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-orange-500 bg-slate-50/50 dark:bg-slate-900/50 shrink-0"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Upload Banner</span>
                </button>
              )}
              <div className="text-[11px] text-slate-400 leading-tight">
                Wide header banner for the category shop page (16:9 ratio)
              </div>
            </div>
          </div>
        </div>

        {/* Status switch */}
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex items-center justify-between border border-slate-200/90 dark:border-slate-800 p-3 rounded-md bg-slate-50/60 dark:bg-slate-900/40">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Active Status
                </p>
                <p className="text-[11px] text-slate-400">
                  When enabled, category and products within are visible to customers
                </p>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      </form>

      <MediaModal
        open={mediaOpen}
        setOpen={setMediaOpen}
        onSelect={(url) => {
          if (activeField === "thumbnail") {
            form.setValue("thumbnail", url[0], { shouldValidate: true });
          }
          if (activeField === "banner") {
            form.setValue("banner", url[0], { shouldValidate: true });
          }
        }}
      />
    </GlobalModal>
  );
}
