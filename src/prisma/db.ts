import mongo from "@prisma/orm-mongo/runtime";
import { contractFromJson } from "@prisma/orm-mongo/static";
import { MongoFieldFilter } from "@prisma/orm-mongo/query-ast/execution";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

const modelToCollectionMap: Record<string, string> = {
  User: "users",
  Category: "categories",
  Brand: "brands",
  Attribute: "attributes",
  Product: "products",
  ProductVariation: "product_variations",
  Order: "orders",
  OrderItem: "order_items",
  Comment: "comments",
  Contact: "contacts",
  Faq: "faqs",
  Media: "media",
  Slider: "sliders",
  RequestQuote: "request_quotes",
  AppSetting: "app_settings",
  SiteContent: "site_contents",
  AppConfig: "app_configs",
};

const url = process.env["DATABASE_URL"] || process.env["NEXT_PUBLIC_DB_URL"];

const rawClient = mongo({
  contract,
  ...(url && url.trim().startsWith("mongodb") ? { url } : {}),
});

/* -------------------------------------------------------------------------- */
/*        Callback-style filters and sorting, translated for the Mongo ORM     */
/* -------------------------------------------------------------------------- */
// The Mongo ORM only understands `.where({ field: value })`, `.where(MongoFilterExpr)`
// and `.orderBy({ field: 1 | -1 })`. Route handlers are written callback-style
// (`.where((p) => p.price.gte(10))`, `.orderBy((p) => p.createdAt.desc())`), which the
// ORM would otherwise silently ignore (filters) or reject (sorting).

/** SQL LIKE pattern (`%` / `_`) to an anchored RegExp. */
function likeToRegExp(pattern: string, flags: string): RegExp {
  const source = String(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");
  return new RegExp(`^${source}$`, flags);
}

function escapeRegExp(value: string): string {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fieldOperators(field: string) {
  return {
    // filters
    eq: (value: unknown) => MongoFieldFilter.eq(field, value as any),
    neq: (value: unknown) => MongoFieldFilter.neq(field, value as any),
    ne: (value: unknown) => MongoFieldFilter.neq(field, value as any),
    gt: (value: unknown) => MongoFieldFilter.gt(field, value as any),
    gte: (value: unknown) => MongoFieldFilter.gte(field, value as any),
    lt: (value: unknown) => MongoFieldFilter.lt(field, value as any),
    lte: (value: unknown) => MongoFieldFilter.lte(field, value as any),
    in: (values: unknown[]) => MongoFieldFilter.in(field, values as any),
    nin: (values: unknown[]) => MongoFieldFilter.nin(field, values as any),
    notIn: (values: unknown[]) => MongoFieldFilter.nin(field, values as any),
    isNull: () => MongoFieldFilter.isNull(field),
    isNotNull: () => MongoFieldFilter.isNotNull(field),
    like: (pattern: string) => MongoFieldFilter.of(field, "$regex", likeToRegExp(pattern, "") as any),
    ilike: (pattern: string) => MongoFieldFilter.of(field, "$regex", likeToRegExp(pattern, "i") as any),
    contains: (value: string) => MongoFieldFilter.of(field, "$regex", new RegExp(escapeRegExp(value), "i") as any),
    // sorting
    asc: () => ({ [field]: 1 }),
    desc: () => ({ [field]: -1 }),
  };
}

const fieldAccessor: any = new Proxy(
  {},
  { get: (_, field) => (typeof field === "string" ? fieldOperators(field) : undefined) }
);

/** `fn`, `[fn, fn]` or `{ field: 1 | -1 | "asc" | "desc" }` to `{ field: 1 | -1 }`. */
function toSortSpec(spec: any): Record<string, 1 | -1> {
  const parts = (Array.isArray(spec) ? spec : [spec]).map((part) =>
    typeof part === "function" ? part(fieldAccessor) : part
  );
  const merged: Record<string, 1 | -1> = {};
  for (const part of parts) {
    for (const [field, direction] of Object.entries(part || {})) {
      merged[field] = direction === -1 || direction === "desc" ? -1 : 1;
    }
  }
  return merged;
}

function wrapCollection(collection: any): any {
  if (!collection) return collection;
  return new Proxy(collection, {
    get(target, prop, receiver) {
      if (prop === "where") {
        return function (filter: any) {
          const resolved = typeof filter === "function" ? filter(fieldAccessor) : filter;
          return wrapCollection(target.where(resolved));
        };
      }
      if (prop === "count") {
        // The Mongo ORM has no count terminal; fetch only ids for the current filters.
        return async function () {
          const rows = await target.select("id").all();
          return rows.length;
        };
      }
      if (prop === "orderBy") {
        return function (spec: any) {
          return wrapCollection(target.orderBy(toSortSpec(spec)));
        };
      }
      if (prop === "first") {
        return function (filter?: any) {
          if (filter && typeof filter === "object") {
            return target.where(filter).first();
          }
          return target.first();
        };
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === "function") {
        return function (...args: any[]) {
          const res = val.apply(target, args);
          if (res && typeof res === "object" && typeof res.where === "function") {
            return wrapCollection(res);
          }
          return res;
        };
      }
      return val;
    },
  });
}

const publicProxy = new Proxy(
  {},
  {
    get(_, prop: string) {
      const collName = modelToCollectionMap[prop] || prop.toLowerCase();
      const coll = (rawClient.orm as any)[collName];
      return wrapCollection(coll);
    },
  }
);

const ormProxy = new Proxy(rawClient.orm, {
  get(target, prop: string, receiver) {
    if (prop === "public") {
      return publicProxy;
    }
    const collName = modelToCollectionMap[prop] || prop;
    const coll = Reflect.get(target, collName, receiver);
    if (coll) {
      return wrapCollection(coll);
    }
    return Reflect.get(target, prop, receiver);
  },
});

export const db: any = new Proxy(rawClient, {
  get(target, prop, receiver) {
    if (prop === "orm") {
      return ormProxy;
    }
    return Reflect.get(target, prop, receiver);
  },
});

const globalForDb = globalThis as unknown as {
  db: any;
};

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export default db;
