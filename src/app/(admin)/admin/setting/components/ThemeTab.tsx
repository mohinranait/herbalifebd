"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Sparkles,
  Check,
  ShoppingCart,
  ArrowRight,
  Eye,
  Star,
} from "lucide-react";
import { PRESET_THEMES, generateThemeVariables } from "@/lib/theme-colors";
import { IAppSettings } from "@/models/app-setting";

interface Props {
  settings: IAppSettings;
  callBack: (key: string, value: string) => void;
}

export default function ThemeTab({ settings, callBack }: Props) {
  const currentColor = settings?.themeColor || "#ff7a00";
  const vars = generateThemeVariables(currentColor);

  const handleColorChange = (color: string) => {
    callBack("themeColor", color);
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Brand & Theme Appearance
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Customize the primary accent color across product cards, buttons, badges, and highlights.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {/* Preset Palettes */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Recommended Color Palettes</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_THEMES.map((theme) => {
                const isSelected =
                  currentColor.toLowerCase() === theme.color.toLowerCase();
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleColorChange(theme.color)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all select-none cursor-pointer ${
                      isSelected
                        ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800/10 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-xs flex items-center justify-center border border-black/10"
                      style={{ backgroundColor: theme.color }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {theme.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {theme.color}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker & Hex Input */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Label className="text-xs font-bold text-slate-800">
              Custom Primary Color (HEX)
            </Label>

            <div className="flex flex-wrap items-center gap-3">
              {/* Color Box with Native Picker */}
              <div className="relative">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white shadow-xs"
                  title="Choose custom color"
                />
              </div>

              {/* Hex Input */}
              <div className="w-36">
                <Input
                  type="text"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#ff7a00"
                  className="h-10 text-xs font-mono font-bold uppercase rounded-md border-slate-200"
                />
              </div>

              <div className="text-xs text-slate-400">
                Preview code: <code className="font-mono text-slate-700 font-bold">{currentColor}</code>
              </div>
            </div>
          </div>

          {/* Live Storefront Mockup Preview */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Label className="text-xs font-bold text-slate-800">
                Real-Time Product Card & Button Preview
              </Label>
            </div>

            <div className="p-4 sm:p-6 bg-slate-100/70 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Mini Product Card Mockup */}
              <div
                className="w-64 bg-white rounded-xl p-3 shadow-sm border transition-all duration-300"
                style={{
                  borderColor: vars.brandBorder,
                }}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: vars.brand }}
                  >
                    15% OFF
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">In Stock</span>
                </div>

                {/* Placeholder Image */}
                <div className="w-full h-32 rounded-lg bg-slate-100 flex items-center justify-center mb-2.5 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">Product Image</span>
                </div>

                {/* Title & Brand */}
                <span
                  className="text-[11px] font-bold block truncate"
                  style={{ color: vars.brand }}
                >
                  Herbal Nutrition
                </span>
                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  Formula 1 Nutritional Shake Mix
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-[11px] text-amber-400 my-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-slate-600 font-semibold text-[10px]">5.0 (24)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 my-2">
                  <span
                    className="text-base font-extrabold"
                    style={{ color: vars.brand }}
                  >
                    ৳2,850
                  </span>
                  <del className="text-xs text-slate-400 font-normal">৳3,350</del>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    style={{
                      border: `1.5px solid ${vars.brand}`,
                      color: vars.brand,
                      backgroundColor: vars.brandLight,
                    }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    className="flex-1 h-8 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: vars.brand,
                    }}
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sample Buttons & Elements */}
              <div className="space-y-3 w-full max-w-xs">
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">Primary CTA Button</p>
                  <button
                    type="button"
                    className="w-full h-10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    style={{ backgroundColor: vars.brand }}
                  >
                    <span>Confirm Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1">Outline Badge & Highlights</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: vars.brandLight,
                        color: vars.brand,
                        border: `1px solid ${vars.brandBorder}`,
                      }}
                    >
                      Free Shipping Tag
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: vars.brand }}
                    >
                      See All Products ➔
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
