import { productSchema } from "@/components/validations/product";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.orm.public.Product
      .where({ id })
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all())
      .first();

    if (!product) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;

    const existingProduct = await db.orm.public.Product.first({ id });
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    if (slug && slug !== existingProduct.slug) {
      const duplicate = await db.orm.public.Product
        .where({ slug })
        .where((p: any) => p.id.neq(id))
        .first();

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug already exists",
          },
          { status: 409 }
        );
      }
    }

    const { productType, variations, stock, categoryId, brandId, category, brand } = body;
    let productStock = stock !== undefined ? stock : existingProduct.stock;
    if (productType === "variant" && Array.isArray(variations)) {
      productStock = variations.reduce(
        (acc: number, varient: { stock: number }) => acc + (varient.stock || 0),
        0
      );
    }

    const catId = categoryId || (typeof category === "object" ? category?.id : category) || existingProduct.categoryId;
    const brId = brandId || (typeof brand === "object" ? brand?.id : brand) || existingProduct.brandId;

    await db.orm.public.Product.where({ id }).update({
      name: body.name !== undefined ? body.name : existingProduct.name,
      slug: body.slug !== undefined ? body.slug : existingProduct.slug,
      videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingProduct.videoUrl,
      shortDescription: body.shortDescription !== undefined ? body.shortDescription : existingProduct.shortDescription,
      description: body.description !== undefined ? body.description : existingProduct.description,
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existingProduct.thumbnail,
      gallery: Array.isArray(body.gallery) ? body.gallery : existingProduct.gallery,
      price: body.price !== undefined ? parseFloat(body.price) : existingProduct.price,
      discountPrice: body.discountPrice !== undefined ? parseFloat(body.discountPrice) : existingProduct.discountPrice,
      discountParcent: body.discountParcent !== undefined ? parseFloat(body.discountParcent) : existingProduct.discountParcent,
      costPrice: body.costPrice !== undefined && body.costPrice !== "" ? parseFloat(body.costPrice) : existingProduct.costPrice,
      productType: productType !== undefined ? productType : existingProduct.productType,
      selectedAttributes: body.selectedAttributes !== undefined ? body.selectedAttributes : existingProduct.selectedAttributes,
      categoryId: catId,
      brandId: brId,
      stock: productStock,
      trackStock: body.trackStock !== undefined ? Boolean(body.trackStock) : existingProduct.trackStock,
      isFreeShipping: body.shipping?.isFreeShipping !== undefined ? Boolean(body.shipping.isFreeShipping) : existingProduct.isFreeShipping,
      seoTitle: body.seo?.title !== undefined ? body.seo.title || null : existingProduct.seoTitle,
      seoDescription: body.seo?.description !== undefined ? body.seo.description || null : existingProduct.seoDescription,
      seoKeywords: Array.isArray(body.seo?.keywords) ? body.seo.keywords : existingProduct.seoKeywords,
      tags: Array.isArray(body.tags) ? body.tags : existingProduct.tags,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existingProduct.isFeatured,
      status: body.status !== undefined ? Boolean(body.status) : existingProduct.status,
      isDelete: body.isDelete !== undefined ? Boolean(body.isDelete) : existingProduct.isDelete,
    });

    // Update variations if provided
    if (Array.isArray(variations)) {
      await db.orm.public.ProductVariation.where({ productId: id }).deleteAll();
      for (const v of variations) {
        await db.orm.public.ProductVariation.create({
          productId: id,
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

    const updated = await db.orm.public.Product
      .where({ id })
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all())
      .first();

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.orm.public.Product.first({ id });
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Product.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Product delete successfully",
        data: product,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
