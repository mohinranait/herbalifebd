"use client";

import React from "react";
import { generateThemeVariables } from "@/lib/theme-colors";
import { useGetAppSettingQuery } from "@/redux/service/setting";

interface Props {
  themeColor?: string;
}

export default function ThemeStyle({ themeColor }: Props) {
  const { data } = useGetAppSettingQuery();

  const activeColor = data?.themeColor || themeColor || "#ff7a00";
  const vars = generateThemeVariables(activeColor);

  const css = `
    :root, .admin-theme {
      --brand-color: ${vars.brand} !important;
      --brand-hover-color: ${vars.brandHover} !important;
      --brand-light-color: ${vars.brandLight} !important;
      --brand-border-color: ${vars.brandBorder} !important;
      --brand-foreground-color: ${vars.brandForeground} !important;
      --primary: ${vars.brand} !important;
      --primary-foreground: ${vars.brandForeground} !important;
      --ring: ${vars.brand} !important;
      --sidebar-primary: ${vars.brand} !important;
      --sidebar-primary-foreground: ${vars.brandForeground} !important;
      --sidebar-accent: ${vars.brandLight} !important;
      --sidebar-accent-foreground: ${vars.brand} !important;
      --sidebar-ring: ${vars.brand} !important;
    }
  `.replace(/\s+/g, " ");

  return <style id="dynamic-brand-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
