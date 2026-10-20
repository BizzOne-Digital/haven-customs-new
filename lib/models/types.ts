import type { Types } from "mongoose";

/** Explicit document shapes (cheaper for the type checker than InferSchemaType). */
type Id = { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date };

export type ImageRef = { url: string; alt: string };
export type Faq = { q: string; a: string };

export interface CategoryDoc extends Id {
  name: string; slug: string; description: string; image: string; icon: string; sortOrder: number; isActive: boolean;
}
export interface ProductDoc extends Id {
  name: string; slug: string; category: Types.ObjectId;
  shortDescription: string; longDescription: string; features: string[]; options: string[]; vehicleTypes: string[];
  brand: string; warranty: string; bookingNote: string; calendarKey: string; faqs: Faq[]; images: ImageRef[];
  internalPrice: string; isFeatured: boolean; isActive: boolean; needsReview: boolean; sortOrder: number;
}
export interface OfferDoc extends Id {
  title: string; slug: string; description: string; image: string; products: Types.ObjectId[]; internalNotes: string;
  isActive: boolean; startsAt: Date | null; endsAt: Date | null; sortOrder: number;
}
export interface GalleryItemDoc extends Id {
  image: string; alt: string; caption: string; category: string; sortOrder: number; isActive: boolean;
}
export interface InquiryDoc extends Id {
  fullName: string; phone: string; email: string; vehicleType: string; vehicleMake: string; vehicleModel: string; vehicleYear: string;
  products: { slug: string; name: string }[]; tiresOnRims: string; message: string; preferredContactMethod: string;
  status: string; ghlStatus: "pending" | "sent" | "failed" | "not_configured"; ghlContactId: string; ghlError: string; ghlAttempts: number;
  metaEventId: string; metaStatus: string; sourceUrl: string; dedupeKey: string; notes: string;
}
export interface PageContentDoc extends Id { key: string; data: Record<string, unknown> }
export interface SiteSettingsDoc extends Id {
  key: string; phone?: string; address?: string; addressLine1?: string; addressLine2?: string; hours?: string; email: string;
  instagram?: string; facebook?: string; mapEmbedUrl?: string; bookingIntro: string;
}
export interface AdminUserDoc extends Id { email: string; name: string; passwordHash: string; lastLoginAt?: Date }
export interface AdminSessionDoc extends Id { tokenHash: string; user: Types.ObjectId; expiresAt: Date; userAgent?: string }
export interface RateLimitDoc extends Id { key: string; count: number; expiresAt: Date }
export interface StoredUploadDoc extends Id {
  folder: "products" | "gallery" | "pages" | "misc"; filename: string; originalName: string; mimeType: string; size: number; data: Buffer;
}
export interface UploadSessionDoc extends Id {
  sessionId: string; owner: Types.ObjectId; folder: StoredUploadDoc["folder"]; originalName?: string;
  totalSize: number; chunkSize: number; chunkCount: number; expiresAt: Date;
}
export interface UploadChunkDoc extends Id { sessionId: string; index: number; size: number; data: Buffer; expiresAt: Date }
