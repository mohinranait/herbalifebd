/**
 * Runs once when the server starts. Opens the database connection right away,
 * so the first visitor after a deploy / restart does not wait ~2s for it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { db } = await import("@/prisma/db");
    // Not awaited: the server must not start later because of this
    Promise.resolve(db.orm.public.AppSetting.first()).catch(() => null);
  } catch {
    // The first request will connect instead
  }
}
