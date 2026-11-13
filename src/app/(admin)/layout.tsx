import AdminMainLayout from "@/components/layouts/MainAdminLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BASE_URL } from "@/lib/envSecret";
import { getAppSetting } from "@/lib/get-app-setting";
import { Metadata } from "next";
import React, { Suspense } from "react";
import { Leaf } from "lucide-react";
import PersistReady from "@/providers/PersistReady";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSetting();

  return {
    title: `Admin Portal - ${settings?.siteName || "HerbalifeBD"}`,
    description: settings?.metaDescription || settings?.siteDescription || "Admin dashboard and ecommerce management portal.",
    keywords: settings?.metaKeyword || "",
    icons: {
      icon: settings?.favicon || "/favicon.ico",
      shortcut: settings?.favicon || "/favicon.ico",
      apple: settings?.favicon || "/favicon.ico",
    },
    openGraph: {
      url: `${BASE_URL}/admin`,
      images: [
        { url: settings?.ogImage || settings?.logo || "" }
      ]
    },
  };
}

const AdminLoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
        <Leaf className="size-6" />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Loading Admin Portal...</p>
    </div>
  </div>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Suspense fallback={<AdminLoadingFallback />}>
        {/* The admin panel is a client-only app: render it in the browser only */}
        <PersistReady fallback={<AdminLoadingFallback />}>
          <SidebarProvider>
            <AdminMainLayout>{children}</AdminMainLayout>
          </SidebarProvider>
        </PersistReady>
      </Suspense>
    </div>
  );
};

export default AdminLayout;
