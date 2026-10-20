/* eslint-disable @typescript-eslint/no-explicit-any -- typed via ./types; Schema generics are too costly for tsc */
import mongoose, { Schema, type Model } from "mongoose";
import type * as T from "./types";

export type { InquiryDoc, StoredUploadDoc } from "./types";
import { CONTACT_METHODS, GHL_STATUSES, INQUIRY_STATUSES, UPLOAD_FOLDERS } from "../constants";

/** Reuse compiled models across hot reloads. Cast (not a generic helper) keeps tsc fast. */
const model = (name: string, schema: Schema<any>) => mongoose.models[name] ?? mongoose.model(name, schema);

/* ── Inquiry ── */
const InquirySchema = new Schema<any>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, default: "", trim: true, lowercase: true, maxlength: 160 },
    vehicleType: { type: String, required: true },
    vehicleMake: { type: String, default: "" },
    vehicleModel: { type: String, default: "" },
    vehicleYear: { type: String, default: "" },
    products: [{ slug: String, name: String, _id: false }],
    tiresOnRims: { type: String, enum: ["", "On rims", "Off rims", "Not sure"], default: "" },
    message: { type: String, default: "", maxlength: 3000 },
    preferredContactMethod: { type: String, enum: CONTACT_METHODS, default: "Call" },
    status: { type: String, enum: INQUIRY_STATUSES, default: "New", index: true },
    ghlStatus: { type: String, enum: GHL_STATUSES, default: "pending", index: true },
    ghlContactId: { type: String, default: "" },
    ghlError: { type: String, default: "" },
    ghlAttempts: { type: Number, default: 0 },
    metaEventId: { type: String, default: "" },
    metaStatus: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    dedupeKey: { type: String, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
InquirySchema.index({ createdAt: -1 });

/* ── Page content (homepage, about, contact, reviews …) ── */
const PageContentSchema = new Schema<any>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

/* ── Site settings (singleton) ── */
const SiteSettingsSchema = new Schema<any>(
  {
    key: { type: String, default: "site", unique: true },
    phone: String,
    address: String,
    addressLine1: String,
    addressLine2: String,
    hours: String,
    email: { type: String, default: "" },
    instagram: String,
    facebook: String,
    mapEmbedUrl: String,
    bookingIntro: { type: String, default: "" },
  },
  { timestamps: true }
);

/* ── Admin auth ── */
const AdminUserSchema = new Schema<any>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const AdminSessionSchema = new Schema<any>(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
  },
  { timestamps: true }
);
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitSchema = new Schema<any>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ── Uploads (MongoDB binary storage) ── */
const StoredUploadSchema = new Schema<any>(
  {
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

const UploadSessionSchema = new Schema<any>(
  {
    sessionId: { type: String, required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    originalName: String,
    totalSize: { type: Number, required: true },
    chunkSize: { type: Number, required: true },
    chunkCount: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UploadChunkSchema = new Schema<any>({
  sessionId: { type: String, required: true },
  index: { type: Number, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
  expiresAt: { type: Date, required: true },
});
UploadChunkSchema.index({ sessionId: 1, index: 1 }, { unique: true });
UploadChunkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Inquiry = model("Inquiry", InquirySchema) as unknown as Model<T.InquiryDoc>;
export const PageContent = model("PageContent", PageContentSchema) as unknown as Model<T.PageContentDoc>;
export const SiteSettings = model("SiteSettings", SiteSettingsSchema) as unknown as Model<T.SiteSettingsDoc>;
export const AdminUser = model("AdminUser", AdminUserSchema) as unknown as Model<T.AdminUserDoc>;
export const AdminSession = model("AdminSession", AdminSessionSchema) as unknown as Model<T.AdminSessionDoc>;
export const RateLimit = model("RateLimit", RateLimitSchema) as unknown as Model<T.RateLimitDoc>;
export const StoredUpload = model("StoredUpload", StoredUploadSchema) as unknown as Model<T.StoredUploadDoc>;
export const UploadSession = model("UploadSession", UploadSessionSchema) as unknown as Model<T.UploadSessionDoc>;
export const UploadChunk = model("UploadChunk", UploadChunkSchema) as unknown as Model<T.UploadChunkDoc>;
