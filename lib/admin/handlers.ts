import "server-only";
import { crud } from "../crud";
import { Category, GalleryItem, Offer, Product } from "../models/catalog";
import { categorySchema, gallerySchema, offerSchema, productSchema } from "../validation";

export const productsApi = crud({
  model: Product,
  schema: productSchema,
  slugFrom: "name",
  adminSelect: "internalPrice",
  populate: "category",
  searchFields: ["name", "slug", "brand", "shortDescription"],
});
export const categoriesApi = crud({ model: Category, schema: categorySchema, slugFrom: "name", searchFields: ["name", "slug"] });
export const offersApi = crud({ model: Offer, schema: offerSchema, slugFrom: "title", adminSelect: "internalNotes", searchFields: ["title", "slug"] });
export const galleryApi = crud({ model: GalleryItem, schema: gallerySchema, searchFields: ["caption", "alt", "category"] });
