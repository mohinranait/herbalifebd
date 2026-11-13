"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Languages,
  Plus,
  RotateCcw,
  Save,
  Search,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Info,
  SlidersHorizontal,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetAdminTranslationsQuery,
  useUpdateAdminTranslationsMutation,
  useResetAdminTranslationsMutation,
} from "@/redux/service/translations";
import { DEFAULT_TRANSLATIONS } from "@/constants/default-translations";
import { toast } from "sonner";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { format } from "date-fns";

const CATEGORIES = [
  { id: "all", label: "All Keys" },
  { id: "home", label: "Homepage Sections", prefix: ["shop-", "best-", "all-", "see-", "popular-", "brands-", "hero-"] },
  { id: "cart", label: "Cart & Checkout", prefix: ["cart-", "start-", "remove-", "subtotal-", "delivery-", "grand-", "proceed-", "view-"] },
  { id: "product", label: "Product & Badges", prefix: ["add-", "buy-", "out-", "in-", "discount-", "select-", "added-"] },
  { id: "header", label: "Header & Footer", prefix: ["header-", "search-", "free-", "money-", "secure-"] },
];

export default function AllTranslations() {
  const { data, isLoading, isFetching } = useGetAdminTranslationsQuery();
  const [updateTranslations, { isLoading: isUpdating }] = useUpdateAdminTranslationsMutation();
  const [resetTranslations, { isLoading: isResetting }] = useResetAdminTranslationsMutation();

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Key Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  // Reset Confirm Dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Track modified/dirty state
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state from API data
  useEffect(() => {
    if (data?.data) {
      setTranslations(data.data);
      setHasChanges(false);
    }
  }, [data?.data]);

  const handleValueChange = (key: string, val: string) => {
    setTranslations((prev) => {
      const updated = { ...prev, [key]: val };
      return updated;
    });
    setHasChanges(true);
  };

  const handleDeleteKey = (key: string) => {
    setTranslations((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setHasChanges(true);
    toast.info(`Key "${key}" removed from local draft. Click Save to apply.`);
  };

  const handleAddNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newKey.trim().toLowerCase().replace(/\s+/g, "-");
    const cleanValue = newValue.trim();

    if (!cleanKey) {
      toast.error("Please enter a valid key name");
      return;
    }
    if (!cleanValue) {
      toast.error("Please enter the translation text");
      return;
    }

    if (translations[cleanKey]) {
      toast.error(`Key "${cleanKey}" already exists!`);
      return;
    }

    setTranslations((prev) => ({
      [cleanKey]: cleanValue,
      ...prev,
    }));
    setHasChanges(true);
    setNewKey("");
    setNewValue("");
    setIsAddOpen(false);
    toast.success(`Key "${cleanKey}" added to draft!`);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("Key copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAll = async () => {
    try {
      await updateTranslations({ content: translations }).unwrap();
      setHasChanges(false);
      toast.success("All site translations have been saved successfully!");
    } catch (error) {
      handleErrors(error as ErrorResponse);
    }
  };

  const handleResetToDefaults = async () => {
    try {
      await resetTranslations().unwrap();
      setIsResetConfirmOpen(false);
      setHasChanges(false);
      toast.success("Translations have been restored to defaults!");
    } catch (error) {
      handleErrors(error as ErrorResponse);
    }
  };

  // Filtered keys
  const filteredEntries = useMemo(() => {
    const entries = Object.entries(translations);
    return entries.filter(([key, value]) => {
      // Search filter
      const matchesSearch =
        key.toLowerCase().includes(search.toLowerCase()) ||
        String(value).toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (activeCategory === "all") return true;

      const cat = CATEGORIES.find((c) => c.id === activeCategory);
      if (!cat?.prefix) return true;

      return cat.prefix.some((p) => key.startsWith(p));
    });
  }, [translations, search, activeCategory]);

  const totalKeys = Object.keys(translations).length;
  const modifiedCount = useMemo(() => {
    let count = 0;
    for (const [k, v] of Object.entries(translations)) {
      if (DEFAULT_TRANSLATIONS[k] !== undefined && DEFAULT_TRANSLATIONS[k] !== v) {
        count++;
      }
    }
    return count;
  }, [translations]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Site Translations & Dynamic Texts
              </h1>
              <p className="text-xs text-slate-400">
                Manage client-side storefront static texts dynamically without editing code.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isResetting || isLoading}
            type="button"
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs font-semibold rounded-md border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </Button>

          <Button
            onClick={() => setIsAddOpen(true)}
            type="button"
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs font-semibold rounded-md border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Key</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isUpdating || !hasChanges}
            type="button"
            size="sm"
            className={`h-8.5 px-3.5 text-xs font-bold rounded-md gap-1.5 shadow-xs transition-all ${
              hasChanges
                ? "bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse"
                : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{hasChanges ? "Save Changes" : "Saved"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Total Text Keys
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalKeys}</p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Customized Values
          </p>
          <p className="text-xl font-extrabold text-primary mt-0.5">{modifiedCount}</p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Filtered Display
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">
            {filteredEntries.length}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Status
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasChanges ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="text-xs font-bold text-slate-700">
              {hasChanges ? "Unsaved Changes" : "Up to Date"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search translation by key or text..."
              className="pl-9 h-8.5 text-xs rounded-md border-slate-200 bg-slate-50/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all select-none ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Translation Items Table/List */}
      <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
        <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Translation Keys & Values
            </CardTitle>
          </div>
          <p className="text-xs text-slate-400">
            Showing {filteredEntries.length} of {totalKeys} keys
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-slate-400 font-medium">Loading translations...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Languages className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No translation keys found</p>
              <p className="text-xs text-slate-400">
                {search ? "Try searching with a different term" : "Click 'Add New Key' to create one."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEntries.map(([key, value]) => {
                const isCustomized =
                  DEFAULT_TRANSLATIONS[key] !== undefined &&
                  DEFAULT_TRANSLATIONS[key] !== value;
                const isNewKey = DEFAULT_TRANSLATIONS[key] === undefined;

                return (
                  <div
                    key={key}
                    className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Key Info */}
                    <div className="md:w-1/3 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {key}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(key)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Copy Key"
                        >
                          {copiedKey === key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {isNewKey ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            Custom Key
                          </span>
                        ) : isCustomized ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Modified
                          </span>
                        ) : null}
                      </div>

                      {DEFAULT_TRANSLATIONS[key] && isCustomized && (
                        <p className="text-[11px] text-slate-400 truncate">
                          Default: <span className="italic">{DEFAULT_TRANSLATIONS[key]}</span>
                        </p>
                      )}
                    </div>

                    {/* Value Field */}
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        placeholder="Enter translated display text..."
                        className="h-9 text-xs rounded-md border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-primary font-medium"
                      />

                      {DEFAULT_TRANSLATIONS[key] && isCustomized && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleValueChange(key, DEFAULT_TRANSLATIONS[key])}
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md shrink-0"
                          title="Reset this key to default"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKey(key)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md shrink-0"
                        title="Delete this key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Key Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span>Add New Translation Key</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a new key-value pair for client-side dynamic text.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewKey} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Key Name</label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. shop-new-asca, cart-promo-notice"
                className="h-8.5 text-xs rounded-md border-slate-200 font-mono"
                required
              />
              <p className="text-[10px] text-slate-400">
                Use lowercase letters and hyphens without spaces.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Display Text (Value)</label>
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. শপে নতুন এসেছে"
                className="h-8.5 text-xs rounded-md border-slate-200 font-medium"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="h-8 text-xs rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add Translation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Alert Dialog */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Restore Default Translations?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              This will overwrite all modified translation texts and restore them to the default system values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetToDefaults}
              className="h-8 text-xs font-bold rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
