import { db } from "@/prisma/db";
import { v2 as cloudinary } from "cloudinary";

export const applyCloudinaryConfig = async () => {
  const config = await db.orm.public.AppConfig.first();
  const cloudinaryConfig = config?.cloudinary as any;

  if (!cloudinaryConfig || !cloudinaryConfig.status) {
    throw new Error("Cloudinary is not configured or disabled");
  }

  return cloudinary.config({
    cloud_name: cloudinaryConfig.name,
    api_key: cloudinaryConfig.key,
    api_secret: cloudinaryConfig.secret,
  });
};
