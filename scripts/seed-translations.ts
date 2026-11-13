import "dotenv/config";
import db from "../src/prisma/db";
import { DEFAULT_TRANSLATIONS } from "../src/constants/default-translations";

async function seedTranslations() {
  console.log("🌱 Seeding Site Translations...");

  try {
    let existing = await db.orm.public.SiteTranslation.first();

    if (existing) {
      const merged = {
        ...DEFAULT_TRANSLATIONS,
        ...((existing.content as Record<string, string>) || {}),
      };

      await db.orm.public.SiteTranslation.where({ id: existing.id }).update({
        content: merged,
      });
      console.log(`✅ Translations updated! Total keys: ${Object.keys(merged).length}`);
    } else {
      const created = await db.orm.public.SiteTranslation.create({
        content: DEFAULT_TRANSLATIONS,
      });
      console.log(`✅ Translations created! Total keys: ${Object.keys(DEFAULT_TRANSLATIONS).length}`);
    }
  } catch (error) {
    console.error("❌ Error seeding translations:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedTranslations();
