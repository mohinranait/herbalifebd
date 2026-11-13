import { IAppSettings } from "@/models/app-setting";
import { getSettings, safe } from "./storefront-data";

/**
 * Site settings, read straight from the database through the storefront cache.
 * Saving the settings in the admin panel expires the cache, so there is no
 * stale window (the reason caching was switched off here before).
 */
export const getAppSetting = async (): Promise<IAppSettings | null> =>
  (await safe(getSettings(), null)) as IAppSettings | null;

export const getAppSettingForMeta = getAppSetting;
