import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./envSecret";

export async function getAuthUser() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("access_token")?.value;  

  if (!token) {
    throw new Error("Unauthorized: No token found");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return decoded; 
  } catch (err: unknown) {
    throw new Error("Unauthorized: Invalid token");
  }
}

export type AuthUser = { id: string; phone: string; role?: string };

/** The logged-in user, or null for a guest (never throws). */
export async function getOptionalAuthUser(): Promise<AuthUser | null> {
  try {
    const decoded = await getAuthUser();
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) return null;
    return decoded as AuthUser;
  } catch {
    return null;
  }
}

export const isAdminUser = (user: AuthUser | null) => user?.role === "Admin";
