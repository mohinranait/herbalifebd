import "dotenv/config";
import bcrypt from "bcryptjs";
import db from "../src/prisma/db";

/**
 * Idempotent seed: every row is matched by a natural key (slug, phone, sku, title…).
 * Missing rows are created, existing seed rows are brought up to date.
 * Run with: npm run db:seed
 */

const img = (path: string) =>
  `https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_800/${path}`;
const banner = (path: string) =>
  `https://res.cloudinary.com/demo/image/upload/c_fill,w_1600,h_600/${path}`;

async function upsert(collection: string, where: Record<string, unknown>, data: Record<string, unknown>) {
  const existing = await db.orm[collection].where(where).first();
  if (existing) {
    await db.orm[collection].where({ id: existing.id }).update(data);
    return { row: { ...existing, ...data }, created: false };
  }
  const row = await db.orm[collection].create({ ...where, ...data });
  return { row, created: true };
}

const report = (label: string, created: number, total: number) =>
  console.log(`   ✅ ${label}: ${created} created, ${total - created} updated`);

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

const settingsData = {
  siteName: "Herbalife BD",
  siteDescription: "Premier Herbalife Nutrition, Weight Management & Wellness Products in Bangladesh",
  logo: "",
  footerLogo: "",
  favicon: "",
  contactEmail: "support@herbalifebd.com",
  contactPhone: "+8801700000000",
  address: {
    street: "Road 11, Block D, Banani",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    zipCode: "1213",
  },
  metaTitle: "Herbalife BD - Official Nutrition & Wellness Store",
  metaDescription: "Buy 100% authentic Herbalife shakes, energy teas, vitamins, and supplements in Bangladesh.",
  metaKeyword: "Herbalife, Herbalife Bangladesh, Formula 1 Shake, Herbal Tea Concentrate, Weight Loss",
  ogImage: "",
  marque: "100% authentic Herbalife products • Cash on delivery all over Bangladesh • Free shipping on orders over ৳5000",
  currency: { code: "BDT", symbol: "৳" },
  language: "en",
  timezone: "Asia/Dhaka",
  paymentMethods: {
    cod: true,
    stripe: { enabled: false, publishableKey: "" },
    sslcommerz: { enabled: false, storeId: "" },
    bKash: { enabled: true, merchantNumber: "01700000000" },
    nagad: { enabled: true, merchantNumber: "01700000000" },
  },
  shipping: {
    freeShippingThreshold: 5000,
    defaultShippingFee: 130,
    shippingZones: [
      { areaName: "Inside Dhaka", fee: 70 },
      { areaName: "Outside Dhaka", fee: 130 },
    ],
  },
  features: {
    wishlist: true,
    productReview: true,
    couponSystem: false,
    flashSale: false,
    bannerSlider: true,
    guestOrder: true,
    latestSection: true,
    offerSection: true,
    featureSection: true,
    bestSelling: true,
    faq: true,
    review: true,
    contact: true,
    whyChooseUs: true,
    aboutCompany: true,
  },
  layouts: { categorySection: 1, header: 1 },
  socialLinks: {
    facebook: "https://facebook.com/herbalifebd",
    instagram: "https://instagram.com/herbalifebd",
    youtube: "https://youtube.com/@herbalifebd",
    tiktok: "",
  },
  maintenanceMode: false,
};

const siteContentData = {
  companyIntroduction: {
    title: "About Herbalife BD",
    heading: "Your trusted source of authentic Herbalife nutrition",
    description:
      "Herbalife BD brings genuine Herbalife nutrition, weight management and wellness products to every corner of Bangladesh, with sealed packaging, fair prices and fast home delivery.",
    image: banner("samples/people/kitchen-bar.jpg"),
  },
  whyChooseUs: {
    title: "Why Choose Us",
    heading: "Good nutrition, delivered with care",
    items: [
      { title: "100% Authentic", description: "Every product is original, sealed and batch-verified." },
      { title: "Fast Delivery", description: "24-48 hours inside Dhaka, 2-4 days nationwide." },
      { title: "Cash on Delivery", description: "Pay when the parcel reaches your door." },
      { title: "Wellness Support", description: "Guidance on choosing the right product for your goal." },
    ],
  },
};

const brandsData = [
  {
    slug: "herbalife-nutrition",
    name: "Herbalife Nutrition",
    description: "Global leader in premier nutrition, weight management, and personal wellness products.",
    logo: img("samples/cloudinary-group.jpg"),
    banner: banner("samples/landscapes/nature-mountains.jpg"),
    priority: 1,
  },
  {
    slug: "herbalife24",
    name: "Herbalife24",
    description: "Sports nutrition line for athletes and active lifestyles.",
    logo: img("samples/bike.jpg"),
    banner: banner("samples/woman-on-a-football-field.jpg"),
    priority: 2,
  },
  {
    slug: "herbalife-skin",
    name: "Herbalife SKIN",
    description: "Clinically tested skin care with vitamins and botanicals.",
    logo: img("samples/smile.jpg"),
    banner: banner("samples/outdoor-woman.jpg"),
    priority: 3,
  },
];

const categoriesData = [
  { slug: "weight-management", name: "Weight Management", thumbnail: "samples/breakfast.jpg", description: "Meal replacement shakes, protein formulas, and weight control solutions." },
  { slug: "energy-fitness", name: "Energy & Fitness", thumbnail: "samples/bike.jpg", description: "Botanical teas, energy boosters, and workout supplements." },
  { slug: "targeted-nutrition", name: "Targeted Nutrition", thumbnail: "samples/food/spices.jpg", description: "Vitamins, omega-3, digestive health, and heart care." },
  { slug: "skin-body-care", name: "Skin & Body Care", thumbnail: "samples/outdoor-woman.jpg", description: "Collagen boosters, aloe skin hydration, and personal care." },
  { slug: "protein-shakes", name: "Protein Shakes", thumbnail: "samples/food/dessert.jpg", description: "High-protein shakes and powders for every goal." },
  { slug: "herbal-tea", name: "Herbal Tea", thumbnail: "samples/cup-on-a-table.jpg", description: "Refreshing herbal tea concentrates." },
  { slug: "digestive-health", name: "Digestive Health", thumbnail: "samples/food/fish-vegetables.jpg", description: "Aloe, fiber and probiotics for a healthy gut." },
  { slug: "sports-nutrition", name: "Sports Nutrition", thumbnail: "samples/woman-on-a-football-field.jpg", description: "Pre-, during- and post-workout nutrition." },
];

const attributesData = [
  {
    name: "Flavor",
    displayName: "Flavor",
    description: "Product taste and aroma options",
    values: ["Dutch Chocolate", "French Vanilla", "Strawberry", "Lemon", "Original"],
    priority: 1,
  },
  {
    name: "Size",
    displayName: "Size / Weight",
    description: "Container packaging size or weight",
    values: ["500g", "750g", "100g", "50g", "90 Tablets"],
    priority: 2,
  },
];

// NOTE: `discountPrice` is the discount AMOUNT (final price = price - discountPrice).
type SeedProduct = {
  slug: string;
  name: string;
  short: string;
  image: string;
  price: number;
  discount: number;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
  category: string;
  brand?: string;
  featured?: boolean;
  freeShipping?: boolean;
  variations?: { sku: string; name: string; price: number; discount: number; stock: number; isDefault: boolean }[];
};

const productsData: SeedProduct[] = [
  { slug: "herbalife-formula-1-shake-500g", name: "Herbalife Formula 1 Nutritional Shake Mix (500g)", short: "A delicious healthy meal replacement with an ideal balance of protein, vitamins, and minerals.", image: "samples/breakfast.jpg", price: 3850, discount: 400, stock: 50, sold: 120, rating: 4.9, reviews: 24, category: "weight-management", featured: true, freeShipping: true },
  {
    slug: "herbalife-herbal-tea-concentrate-50g", name: "Herbal Tea Concentrate", short: "Revitalizing low-calorie tea blend with green tea, black tea, and botanical extracts.", image: "samples/cup-on-a-table.jpg", price: 2950, discount: 300, stock: 40, sold: 85, rating: 4.8, reviews: 18, category: "herbal-tea", featured: true, freeShipping: true,
    variations: [
      { sku: "TEA-LEM-50", name: "Lemon Flavor (50g)", price: 2950, discount: 300, stock: 20, isDefault: true },
      { sku: "TEA-ORIG-100", name: "Original Flavor (100g)", price: 4600, discount: 400, stock: 20, isDefault: false },
    ],
  },
  { slug: "herbalife-personalized-protein-powder-360g", name: "Personalized Protein Powder (PPP - 360g)", short: "Soy and whey protein blend to boost protein intake without extra calories.", image: "samples/food/dessert.jpg", price: 3200, discount: 300, stock: 35, sold: 65, rating: 4.9, reviews: 12, category: "protein-shakes", featured: true },
  { slug: "herbalife-aloe-concentrate-473ml", name: "Herbalife Aloe Concentrate (473ml)", short: "Soothing aloe vera drink to support healthy digestion and nutrient absorption.", image: "samples/food/pot-mussels.jpg", price: 3100, discount: 300, stock: 30, sold: 45, rating: 4.7, reviews: 9, category: "digestive-health" },
  { slug: "herbalife-cell-u-loss-90-tablets", name: "Cell-U-Loss (90 Tablets)", short: "Corn silk and minerals to support healthy fluid balance.", image: "samples/food/spices.jpg", price: 2450, discount: 250, stock: 25, sold: 30, rating: 4.8, reviews: 8, category: "weight-management" },
  { slug: "herbalife-herbalifeline-max", name: "Herbalifeline Max (Omega-3 Fish Oil)", short: "EPA and DHA omega-3 fatty acids for heart and brain health.", image: "samples/food/fish-vegetables.jpg", price: 3600, discount: 350, stock: 20, sold: 50, rating: 5.0, reviews: 15, category: "targeted-nutrition", featured: true, freeShipping: true },
  { slug: "herbalife-formula-1-shake-750g", name: "Herbalife Formula 1 Shake Mix - French Vanilla (750g)", short: "Family-size Formula 1 shake in creamy French Vanilla.", image: "samples/dessert-on-a-plate.jpg", price: 5400, discount: 550, stock: 28, sold: 98, rating: 4.9, reviews: 21, category: "protein-shakes", featured: true, freeShipping: true },
  { slug: "herbalife-afresh-energy-drink-mix-50g", name: "Afresh Energy Drink Mix - Lemon (50g)", short: "Refreshing guarana-based energy drink to keep you active all day.", image: "samples/coffee.jpg", price: 1250, discount: 100, stock: 60, sold: 140, rating: 4.7, reviews: 32, category: "energy-fitness", featured: true },
  { slug: "herbalife-active-fiber-complex-200g", name: "Active Fiber Complex (200g)", short: "Soluble and insoluble fiber to support digestion and regularity.", image: "samples/sheep.jpg", price: 2850, discount: 250, stock: 22, sold: 38, rating: 4.6, reviews: 7, category: "digestive-health" },
  { slug: "herbalife-multivitamin-mineral-90-tablets", name: "Multivitamin Mineral & Herbal Tablets (90)", short: "Daily micronutrients with antioxidant vitamins C and E.", image: "samples/balloons.jpg", price: 2300, discount: 200, stock: 45, sold: 72, rating: 4.8, reviews: 14, category: "targeted-nutrition" },
  { slug: "herbalife-skin-booster-30-sachets", name: "Skin Booster Collagen Drink (30 Sachets)", short: "Bioactive collagen peptides for firmer, glowing skin.", image: "samples/outdoor-woman.jpg", price: 6200, discount: 700, stock: 18, sold: 41, rating: 4.9, reviews: 11, category: "skin-body-care", brand: "herbalife-skin", featured: true, freeShipping: true },
  { slug: "herbalife-aloe-soothing-gel-200ml", name: "Herbal Aloe Soothing Gel (200ml)", short: "Aloe vera and botanicals to moisturize and soothe skin.", image: "samples/smile.jpg", price: 1650, discount: 150, stock: 40, sold: 55, rating: 4.6, reviews: 10, category: "skin-body-care", brand: "herbalife-skin" },
  { slug: "herbalife24-rebuild-strength-1000g", name: "Herbalife24 Rebuild Strength (1000g)", short: "24g of protein for muscle recovery after strength training.", image: "samples/woman-on-a-football-field.jpg", price: 7800, discount: 800, stock: 15, sold: 27, rating: 4.9, reviews: 6, category: "sports-nutrition", brand: "herbalife24", featured: true, freeShipping: true },
  { slug: "herbalife24-cr7-drive-540g", name: "Herbalife24 CR7 Drive (540g)", short: "Light-tasting sports drink for hydration and endurance.", image: "samples/bike.jpg", price: 3900, discount: 400, stock: 24, sold: 33, rating: 4.7, reviews: 5, category: "sports-nutrition", brand: "herbalife24" },
  { slug: "herbalife-shake-mate-500g", name: "ShakeMate (500g)", short: "Fat-free skimmed milk powder made to mix with Formula 1.", image: "samples/chair.png", price: 1450, discount: 0, stock: 55, sold: 110, rating: 4.5, reviews: 19, category: "weight-management" },
  { slug: "herbalife-dino-shake-200g", name: "Dino Shake for Kids - Chocolate (200g)", short: "Nutritious chocolate shake with DHA and vitamins for growing kids.", image: "samples/two-ladies.jpg", price: 1750, discount: 150, stock: 32, sold: 48, rating: 4.8, reviews: 13, category: "protein-shakes" },
];

const slidersData = [
  { title: "Transform Your Body & Health with Herbalife", description: "Original Herbalife nutrition shakes, energy teas & wellness supplements in Bangladesh.", link: "/shop", buttonName: "Shop Now", image: "samples/landscapes/nature-mountains.jpg", order: 1 },
  { title: "Formula 1 Nutritional Meal Replacement Shake", description: "Essential vitamins, minerals and high quality protein for your daily wellness goals.", link: "/shop", buttonName: "Explore Flavors", image: "samples/breakfast.jpg", order: 2 },
  { title: "Fast Home Delivery Across Bangladesh", description: "Cash on Delivery inside and outside Dhaka. 100% genuine products guaranteed.", link: "/free-shipping", buttonName: "Order Today", image: "samples/landscapes/beach-boat.jpg", order: 3 },
];

const faqsData = [
  { title: "How do I prepare the Herbalife Formula 1 Shake?", contents: ["Mix or blend 2 scoops (approx 25g) of Formula 1 with 250ml of skimmed milk, soy milk, or cold water. Consume once or twice daily as a healthy meal replacement."] },
  { title: "Are all the products 100% authentic and original?", contents: ["Yes, all our products are genuine Herbalife products with intact security seals and batch numbers."] },
  { title: "What payment options do you support?", contents: ["We accept Cash on Delivery (COD) all over Bangladesh, as well as bKash and Nagad mobile banking payments."] },
  { title: "How fast is the delivery service?", contents: ["Deliveries inside Dhaka typically take 24-48 hours. Deliveries outside Dhaka take 2-4 business days via courier."] },
];

/* -------------------------------------------------------------------------- */
/*                                    Seed                                    */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log("🌱 Starting Herbalife BD database seed...");

  // 1. App settings — fill only what is missing or still the auto-created placeholder
  console.log("⚙️  App settings");
  const setting = await db.orm.app_settings.first();
  if (!setting) {
    await db.orm.app_settings.create(settingsData);
    console.log("   ✅ created");
  } else {
    const placeholders: Record<string, string> = {
      siteName: "My Ecommerce",
      contactEmail: "admin@yourstore.com",
    };
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settingsData)) {
      const current = setting[key];
      if (current === null || current === undefined || current === placeholders[key]) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      await db.orm.app_settings.where({ id: setting.id }).update(patch);
    }
    console.log(`   ✅ filled ${Object.keys(patch).length} missing field(s), kept the rest`);
  }

  // 2. Site content
  console.log("📝 Site content");
  const content = await db.orm.site_contents.first();
  if (!content) {
    await db.orm.site_contents.create(siteContentData);
    console.log("   ✅ created");
  } else {
    console.log("   ℹ️  already exists, left as is");
  }

  // 3. Users — never overwrite an existing account
  console.log("👤 Users");
  const passwordHash = await bcrypt.hash("password123", 10);
  const usersData = [
    { name: "Super Admin", phone: "01700000000", role: "Admin" },
    { name: "Mohin Rana", phone: "01800000000", role: "User" },
  ];
  let customerUser: any = null;
  for (const u of usersData) {
    let user = await db.orm.users.where({ phone: u.phone }).first();
    if (!user) {
      user = await db.orm.users.create({ ...u, password: passwordHash, status: "Active" });
      console.log(`   ✅ ${u.role} created (phone: ${u.phone}, pass: password123)`);
    } else {
      console.log(`   ℹ️  ${u.role} ${u.phone} already exists`);
    }
    if (u.role === "User") customerUser = user;
  }

  // 4. Brands
  console.log("🏷️  Brands");
  const brandMap = new Map<string, any>();
  let created = 0;
  for (const { slug, ...rest } of brandsData) {
    const res = await upsert("brands", { slug }, { ...rest, status: true, isDelete: false });
    brandMap.set(slug, res.row);
    if (res.created) created++;
  }
  report("brands", created, brandsData.length);

  // 5. Categories
  console.log("📂 Categories");
  const categoryMap = new Map<string, any>();
  created = 0;
  for (const [i, { slug, thumbnail, ...rest }] of categoriesData.entries()) {
    const res = await upsert("categories", { slug }, {
      ...rest,
      thumbnail: img(thumbnail),
      banner: banner(thumbnail),
      level: 0,
      path: [slug],
      priority: i + 1,
      status: true,
      isDelete: false,
    });
    categoryMap.set(slug, res.row);
    if (res.created) created++;
  }
  report("categories", created, categoriesData.length);

  // 6. Attributes
  console.log("🎨 Attributes");
  created = 0;
  for (const { name, ...rest } of attributesData) {
    const res = await upsert("attributes", { name }, { ...rest, status: true, isDelete: false });
    if (res.created) created++;
  }
  report("attributes", created, attributesData.length);

  // 7. Products (+ variations)
  console.log("📦 Products");
  const productMap = new Map<string, any>();
  created = 0;
  for (const p of productsData) {
    const isVariant = !!p.variations?.length;
    const res = await upsert("products", { slug: p.slug }, {
      name: p.name,
      shortDescription: p.short,
      description: `<p>${p.short}</p><p>100% authentic Herbalife product with sealed packaging. Store in a cool, dry place and use as directed on the label.</p>`,
      thumbnail: img(p.image),
      gallery: [img(p.image), img("sample.jpg")],
      price: p.price,
      discountPrice: p.discount,
      discountParcent: p.price ? Math.round((p.discount / p.price) * 100) : 0,
      productType: isVariant ? "variant" : "single",
      categoryId: categoryMap.get(p.category)?.id ?? null,
      brandId: brandMap.get(p.brand ?? "herbalife-nutrition")?.id ?? null,
      stock: p.stock,
      trackStock: true,
      isFreeShipping: !!p.freeShipping,
      isFeatured: !!p.featured,
      ratingsAverage: p.rating,
      totalReviews: p.reviews,
      totalSold: p.sold,
      seoTitle: p.name,
      seoDescription: p.short,
      seoKeywords: ["herbalife", p.category],
      tags: ["herbalife", "nutrition", p.category],
      status: true,
      isDelete: false,
    });
    productMap.set(p.slug, res.row);
    if (res.created) created++;

    for (const v of p.variations ?? []) {
      await upsert("product_variations", { sku: v.sku }, {
        productId: res.row.id,
        name: v.name,
        price: v.price,
        offerPriceFixed: v.discount,
        stock: v.stock,
        isDefault: v.isDefault,
        images: [img(p.image)],
      });
    }
  }
  report("products", created, productsData.length);

  // 8. Sliders
  console.log("🖼️  Sliders");
  created = 0;
  for (const { title, image, ...rest } of slidersData) {
    const res = await upsert("sliders", { title }, {
      ...rest,
      image: banner(image),
      sliderType: "withImage",
      status: true,
      isDelete: false,
    });
    if (res.created) created++;
  }
  report("sliders", created, slidersData.length);

  // 9. FAQs
  console.log("❓ FAQs");
  created = 0;
  for (const [i, { title, contents }] of faqsData.entries()) {
    const res = await upsert("faqs", { title }, { contents, priority: i + 1, status: true });
    if (res.created) created++;
  }
  report("faqs", created, faqsData.length);

  // 10. Reviews
  console.log("💬 Reviews");
  const reviewsData = [
    { slug: "herbalife-formula-1-shake-500g", rating: 5, comment: "Excellent original Formula 1 shake! Tastes amazing with chilled skim milk." },
    { slug: "herbalife-herbal-tea-concentrate-50g", rating: 5, comment: "Great energy boost in the morning, the lemon flavor is very refreshing." },
    { slug: "herbalife-afresh-energy-drink-mix-50g", rating: 4, comment: "Good taste and fast delivery. Product was sealed and original." },
  ];
  created = 0;
  for (const r of reviewsData) {
    const product = productMap.get(r.slug);
    if (!product || !customerUser) continue;
    const existing = await db.orm.comments.where({ productId: product.id, userId: customerUser.id }).first();
    if (!existing) {
      await db.orm.comments.create({
        productId: product.id,
        userId: customerUser.id,
        comment: r.comment,
        rating: r.rating,
        isApproved: true,
        isFeature: true,
      });
      created++;
    }
  }
  console.log(`   ✅ reviews: ${created} created`);

  // 11. Sample order (so the admin dashboard is not empty)
  console.log("🛒 Sample order");
  const existingOrder = await db.orm.orders.where({ invoiceNumber: "INV-2026-0001" }).first();
  const orderProduct = productMap.get("herbalife-formula-1-shake-500g");
  if (!existingOrder && orderProduct) {
    const order = await db.orm.orders.create({
      invoiceNumber: "INV-2026-0001",
      userId: customerUser?.id ?? null,
      totalItems: 1,
      totalQuantity: 2,
      subtotal: 6900,
      discount: 0,
      shippingCharge: 70,
      tax: 0,
      total: 6970,
      fullName: "Mohin Rana",
      phone: "01800000000",
      address: "House 12, Road 4, Dhanmondi, Dhaka",
      postalCode: "1205",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      trackingNumber: "TRK-HL-1001",
      courierName: "Steadfast Courier",
      isDeleted: false,
    });
    await db.orm.order_items.create({
      orderId: order.id,
      productId: orderProduct.id,
      productName: orderProduct.name,
      productImage: orderProduct.thumbnail,
      productSlug: orderProduct.slug,
      quantity: 2,
      price: 3850,
      salePrice: 3450,
      subtotal: 6900,
    });
    console.log("   ✅ INV-2026-0001 created");
  } else {
    console.log("   ℹ️  already exists");
  }

  console.log("\n🎉 Database seeded successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
