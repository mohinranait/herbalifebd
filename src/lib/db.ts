import { db } from "@/prisma/db";

/**
 * For backwards compatibility with existing route handlers
 */
export async function connectDB() {
  return db;
}

export { db };
export default connectDB;
