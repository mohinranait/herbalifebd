import React from "react";
import AllTranslations from "./components/AllTranslations";
import Navbar from "@/components/shared/NavBar";
import { Main } from "@/components/ui/main";

export const metadata = {
  title: "Site Translations | Admin Panel",
  description: "Manage client-side dynamic texts and labels",
};

export default function TranslationsPage() {
  return <>
    <Navbar fixed />
    <Main>
      <AllTranslations />
    </Main>
  </>;
}
