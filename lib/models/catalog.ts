/* eslint-disable @typescript-eslint/no-explicit-any -- typed via ./types; Schema generics are too costly for tsc */
import mongoose, { Schema, type Model } from "mongoose";
import type { CategoryDoc, GalleryItemDoc, OfferDoc, ProductDoc } from "./types";

export type { CategoryDoc, GalleryItemDoc, OfferDoc, ProductDoc };
import { VEHICLE_TYPES } from "../constants";

const ImageSchema = new Schema<any>(
  { url: { type: String, required: true, trim: true }, alt: { type: String, default: "", trim: true } },
  { _id: false }
);

const FaqSchema = new Schema<any>(
  { q: { type: String, required: true }, a: { type: String, required: true } },
  { _id: false }
);

/* ── Category ── */
const CategorySchema = new Schema<any>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", maxlength: 400 },
    image: { type: String, default: "" },
    icon: { type: String, default: "sparkles" },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* ── Product ── */
const ProductSchema = new Schema<any>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    shortDescription: { type: String, default: "", maxlength: 200 },
    longDescription: { type: String, default: "", maxlength: 5000 },
    features: { type: [String], default: [] },
    options: { type: [String], default: [] },
    vehicleTypes: { type: [String], enum: VEHICLE_TYPES, default: [] },
    brand: { type: String, default: "" },
    warranty: { type: String, default: "" },
    bookingNote: { type: String, default: "" },
    calendarKey: { type: String, default: "" },
    faqs: { type: [FaqSchema], default: [] },
    images: { type: [ImageSchema], default: [] },
    /** Admin only — excluded from every public query. */
    internalPrice: { type: String, default: "", select: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    needsReview: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ProductSchema.index({ category: 1, sortOrder: 1 });
ProductSchema.index({ name: "text", shortDescription: "text", brand: "text" });

/* ── Offer ── */
const OfferSchema = new Schema<any>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", maxlength: 1000 },
    image: { type: String, default: "" },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    /** Admin only notes (e.g. internal price terms). Never public. */
    internalNotes: { type: String, default: "", select: false },
    isActive: { type: Boolean, default: false, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ── Gallery ── */
const GalleryItemSchema = new Schema<any>(
  {
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "", maxlength: 200 },
    category: { type: String, default: "General", index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


/** Reuse compiled models across hot reloads. Cast (not a generic helper) keeps tsc fast. */
const model = (name: string, schema: Schema<any>) => mongoose.models[name] ?? mongoose.model(name, schema);

export const Category = model("Category", CategorySchema) as unknown as Model<CategoryDoc>;
export const Product = model("Product", ProductSchema) as unknown as Model<ProductDoc>;
export const Offer = model("Offer", OfferSchema) as unknown as Model<OfferDoc>;
export const GalleryItem = model("GalleryItem", GalleryItemSchema) as unknown as Model<GalleryItemDoc>;
