import { z } from "zod";

export const appSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").default("My Ecommerce"),
  siteDescription: z.string().optional().nullable().or(z.literal("")),
  logo: z.string().optional().nullable().or(z.literal("")),
  footerLogo: z.string().optional().nullable().or(z.literal("")),
  favicon: z.string().optional().nullable().or(z.literal("")),
  themeColor: z.string().optional().nullable().or(z.literal("")),

  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactPhone: z.string().optional().nullable().or(z.literal("")),
  address: z
    .object({
      street: z.string().optional().nullable().or(z.literal("")),
      city: z.string().optional().nullable().or(z.literal("")),
      state: z.string().optional().nullable().or(z.literal("")),
      country: z.string().default("Bangladesh").optional().nullable(),
      zipCode: z.string().optional().nullable().or(z.literal("")),
    })
    .optional()
    .nullable(),

  metaTitle: z.string().optional().nullable().or(z.literal("")),
  metaDescription: z.string().optional().nullable().or(z.literal("")),
  metaKeyword: z.string().optional().nullable().or(z.literal("")),
  ogImage: z.string().optional().nullable().or(z.literal("")),

  marque: z.string().optional().nullable().or(z.literal("")),

  currency: z
    .object({
      code: z.string().default("BDT"),
      symbol: z.string().default("৳"),
    })
    .optional()
    .nullable(),

  language: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),

  paymentMethods: z
    .object({
      cod: z.boolean().default(true),
      stripe: z
        .object({
          enabled: z.boolean().default(false),
          publishableKey: z.string().optional().nullable().or(z.literal("")),
        })
        .optional()
        .nullable(),
      sslcommerz: z
        .object({
          enabled: z.boolean().default(false),
          storeId: z.string().optional().nullable().or(z.literal("")),
        })
        .optional()
        .nullable(),
      bKash: z
        .object({
          enabled: z.boolean().default(false),
          merchantNumber: z.string().optional().nullable().or(z.literal("")),
        })
        .optional()
        .nullable(),
      nagad: z
        .object({
          enabled: z.boolean().default(false),
          merchantNumber: z.string().optional().nullable().or(z.literal("")),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  shipping: z
    .object({
      freeShippingThreshold: z.number().default(0),
      defaultShippingFee: z.number().default(0),
      shippingZones: z
        .array(
          z.object({
            areaName: z.string(),
            fee: z.number(),
          })
        )
        .default([]),
    })
    .optional()
    .nullable(),

  tax: z
    .object({
      enabled: z.boolean().default(false),
      rate: z.number().min(0).max(100).default(0),
    })
    .optional()
    .nullable(),

  features: z
    .object({
      wishlist: z.boolean().default(true),
      productReview: z.boolean().default(true),
      couponSystem: z.boolean().default(true),
      flashSale: z.boolean().default(true),
      bannerSlider: z.boolean().default(true),
      guestOrder: z.boolean().default(true),
      latestSection: z.boolean().default(true),
      offerSection: z.boolean().default(true),
      featureSection: z.boolean().default(true),
      bestSelling: z.boolean().default(true),
      faq: z.boolean().default(true),
      review: z.boolean().default(true),
      contact: z.boolean().default(true),
      whyChooseUs: z.boolean().default(true),
      aboutCompany: z.boolean().default(true),
    })
    .optional()
    .nullable(),

  layouts: z
    .object({
      categorySection: z.coerce.number().default(1),
      header: z.coerce.number().default(1),
    })
    .optional()
    .nullable(),

  socialLinks: z
    .object({
      facebook: z.string().optional().nullable().or(z.literal("")),
      instagram: z.string().optional().nullable().or(z.literal("")),
      youtube: z.string().optional().nullable().or(z.literal("")),
      tiktok: z.string().optional().nullable().or(z.literal("")),
    })
    .optional()
    .nullable(),

  maintenanceMode: z.boolean().default(false).optional().nullable(),
  maintenanceMessage: z.string().optional().nullable().or(z.literal("")),
  customCss: z.string().optional().nullable().or(z.literal("")),
  customJs: z.string().optional().nullable().or(z.literal("")),
  orderStatusConfig: z.any().optional().nullable(),
});