import type { Metadata } from "next";
import {  Geist_Mono, Roboto } from "next/font/google"
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/providers/ReduxProvider";
import { cn } from "@/lib/utils";
import { getAppSetting } from "@/lib/get-app-setting";
import ThemeStyle from "@/components/shared/ThemeStyle";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAppSetting();
 
  return (
    <html
      lang="en"
      className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable)}
      // suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          {/* <ThemeProvider> */}
            <ThemeStyle themeColor={settings?.themeColor} />
            <Toaster />
            {children}
          {/* </ThemeProvider> */}
        </ReduxProvider>
      </body>
    </html>
  );
}
