import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productType, variations, stock, categoryId, brandId, category, brand, ...rest } = body;

    let productStock = stock || 0;
    if (productType === "variant" && Array.isArray(variations)) {
      productStock = variations.reduce(
        (acc: number, varient: { stock: number }) => acc + (varient.stock || 0),
        0
      );
    }

    const catId = categoryId || (typeof category === "object" ? category?.id || category?._id : category) || null;
    const brId = brandId || (typeof brand === "object" ? brand?.id || brand?._id : brand) || null;

    const existing = await db.orm.public.Product.where({ slug: body.slug }).first();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists. Please choose a different slug.",
        },
        { status: 409 }
      );
    }

    const newProduct = await db.orm.public.Product.create({
      name: body.name,
      slug: body.slug,
      videoUrl: body.videoUrl || null,
      shortDescription: body.shortDescription || null,
      description: body.description || null,
      thumbnail: body.thumbnail || null,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      price: body.price !== undefined ? parseFloat(body.price) : null,
      discountPrice: body.discountPrice !== undefined ? parseFloat(body.discountPrice) : null,
      discountParcent: body.discountParcent !== undefined ? parseFloat(body.discountParcent) : null,
      costPrice: body.costPrice !== undefined && body.costPrice !== "" ? parseFloat(body.costPrice) : null,
      productType: productType || "single",
      selectedAttributes: body.selectedAttributes || null,
      categoryId: catId,
      brandId: brId,
      stock: productStock,
      trackStock: body.trackStock !== undefined ? Boolean(body.trackStock) : true,
      weight: body.weight ? parseFloat(body.weight) : null,
      dimensionLength: body.dimensions?.length ? parseFloat(body.dimensions.length) : null,
      dimensionWidth: body.dimensions?.width ? parseFloat(body.dimensions.width) : null,
      dimensionHeight: body.dimensions?.height ? parseFloat(body.dimensions.height) : null,
      isFreeShipping: body.shipping?.isFreeShipping !== undefined ? Boolean(body.shipping.isFreeShipping) : Boolean(body.isFreeShipping),
      seoTitle: body.seo?.title || null,
      seoDescription: body.seo?.description || null,
      seoKeywords: Array.isArray(body.seo?.keywords) ? body.seo.keywords : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
      isDelete: false,
      status: body.status !== undefined ? Boolean(body.status) : true,
    });

    if (productType === "variant" && Array.isArray(variations)) {
      for (const v of variations) {
        await db.orm.public.ProductVariation.create({
          productId: newProduct.id,
          name: v.name || "",
          price: v.price ? parseFloat(v.price) : 0,
          offerPriceFixed: v.offerPriceFixed ? parseFloat(v.offerPriceFixed) : null,
          offerPriceParcent: v.offerPriceParcent ? parseFloat(v.offerPriceParcent) : null,
          costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          stock: v.stock ? parseInt(v.stock) : 0,
          lowStockAlert: v.lowStockAlert ? parseInt(v.lowStockAlert) : 5,
          images: Array.isArray(v.images) ? v.images : [],
          attributeConfig: v.attributeConfig || null,
          isDefault: Boolean(v.isDefault),
        });
      }
    }

    const createdProduct = await db.orm.public.Product
      .where({ id: newProduct.id })
      .include("variations", (v: any) => v.all())
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .first();

    return NextResponse.json(
      { success: true, data: formatMongoCompat(createdProduct) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Product create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create product",
      },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const status = searchParams.get("status");
    const isFeatured = searchParams.get("isFeatured");
    const isDelete = searchParams.get("isDelete");

    const skip = (page - 1) * limit;

    let collection = db.orm.public.Product;

    if (status === "true") collection = collection.where({ status: true });
    if (status === "false") collection = collection.where({ status: false });

    if (isDelete === "true") collection = collection.where({ isDelete: true });
    if (isDelete === "false") collection = collection.where({ isDelete: false });

    if (isFeatured === "true") collection = collection.where({ isFeatured: true });
    if (isFeatured === "false") collection = collection.where({ isFeatured: false });

    if (search) {
      collection = collection.where((p: any) => p.name.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const products = await collection
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all())
      .orderBy((p: any) => p.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();


    return NextResponse.json({
      success: true,
      data: formatMongoCompat(products),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
