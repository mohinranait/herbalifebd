import React from "react";
import { generateThemeVariables } from "@/lib/theme-colors";

interface Props {
  themeColor?: string;
}

export default function ThemeStyle({ themeColor }: Props) {
  const vars = generateThemeVariables(themeColor || "#ff7a00");

  const css = `
    :root {
      --brand-color: ${vars.brand} !important;
      --brand-hover-color: ${vars.brandHover} !important;
      --brand-light-color: ${vars.brandLight} !important;
      --brand-border-color: ${vars.brandBorder} !important;
      --brand-foreground-color: ${vars.brandForeground} !important;
      --primary: ${vars.brand} !important;
      --primary-foreground: ${vars.brandForeground} !important;
      --ring: ${vars.brand} !important;
    }
  `.replace(/\s+/g, " ");

  return <style id="dynamic-brand-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
