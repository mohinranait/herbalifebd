import { db } from "@/prisma/db";

/** The category itself plus every sub-category below it. */
export async function getAllDescendantIds(categoryId: string): Promise<string[]> {
  const allCategories = await db.orm.public.Category
    .where({ isDelete: false, status: true })
    .select("id", "parentId")
    .all();

  const result: string[] = [];
  const seen = new Set<string>();
  const queue: string[] = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Two categories set as each other's parent must not loop forever
    if (seen.has(current)) continue;
    seen.add(current);
    result.push(current);

    // direct children
    const children = allCategories.filter((c: any) => c.parentId === current);
    children.forEach((c: any) => queue.push(c.id));
  }

  return result;
}
