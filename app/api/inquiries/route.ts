import crypto from "crypto";
import { after } from "next/server";
import { connectDB } from "@/lib/db";
import { isSameOrigin } from "@/lib/auth";
import { fail, handleError, ok, parse } from "@/lib/api";
import { deliverToGhl } from "@/lib/inquiries";
import { sendMetaLeadEvent } from "@/lib/integrations";
import { Product } from "@/lib/models/catalog";
import { Inquiry } from "@/lib/models/ops";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { inquirySchema } from "@/lib/validation";

export const runtime = "nodejs";

const THANKS = "Thanks! Our team will contact you shortly.";

export async function POST(req: Request) {
  if (!(await isSameOrigin(req))) return fail("Invalid request origin", 403);
  try {
    await connectDB();
    if (!(await rateLimit("inquiry", 6, 10 * 60))) {
      return fail("Too many submissions. Please call us or try again shortly.", 429);
    }
    const data = await parse(req, inquirySchema);

    // Bots: honeypot filled, or the form was submitted faster than a human could.
    if (data.company || (data.startedAt && Date.now() - data.startedAt < 2500)) {
      return ok({ message: THANKS });
    }

    const products = await Product.find({ slug: { $in: data.products }, isActive: true }, "name slug").lean();
    if (!products.length) return fail("Please choose at least one service", 422, { products: "Choose at least one service" });

    // Duplicate protection: same phone + same services within 10 minutes → return the existing inquiry.
    const dedupeKey = crypto
      .createHash("sha256")
      .update(`${data.phone.replace(/\D/g, "")}|${products.map((p) => p.slug).sort().join(",")}`)
      .digest("hex");
    const recent = await Inquiry.findOne({ dedupeKey, createdAt: { $gt: new Date(Date.now() - 10 * 60_000) } }).lean();
    if (recent) return ok({ message: THANKS, id: String(recent._id), duplicate: true });

    const isTire = data.tiresOnRims !== "";
    const inquiry = await Inquiry.create({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      vehicleType: data.vehicleType,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      products: products.map((p) => ({ slug: p.slug, name: p.name })),
      tiresOnRims: isTire ? data.tiresOnRims : "",
      message: data.message,
      preferredContactMethod: data.preferredContactMethod,
      sourceUrl: data.sourceUrl.slice(0, 500),
      dedupeKey,
      metaEventId: `lead-${crypto.randomUUID()}`,
      ghlStatus: "pending",
    });

    const ip = await clientIp();
    const ua = req.headers.get("user-agent") ?? "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    // The inquiry is already saved; external delivery runs after the response so a slow
    // or failing GHL/Meta call never loses the lead. Failures are visible + retryable in admin.
    after(async () => {
      await deliverToGhl(inquiry);
      if (data.marketingConsent) {
        const status = await sendMetaLeadEvent({
          eventId: inquiry.metaEventId!,
          email: data.email,
          phone: data.phone,
          eventSourceUrl: data.sourceUrl || `${siteUrl}/contact`,
          clientIp: ip,
          userAgent: ua,
        });
        inquiry.metaStatus = status;
        await inquiry.save();
      }
    });

    return ok({ message: THANKS, id: String(inquiry._id), eventId: inquiry.metaEventId }, 201);
  } catch (err) {
    return handleError(err);
  }
}
