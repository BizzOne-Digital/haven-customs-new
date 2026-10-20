import "server-only";
import type { HydratedDocument } from "mongoose";
import { forwardInquiryToGhl } from "./integrations";
import type { InquiryDoc } from "./models/ops";

/** Push a saved inquiry to GHL and record the outcome on the document. Never throws. */
export async function deliverToGhl(inq: HydratedDocument<InquiryDoc>) {
  const result = await forwardInquiryToGhl(inq.toObject() as InquiryDoc);
  inq.ghlAttempts = (inq.ghlAttempts ?? 0) + 1;
  inq.ghlStatus = result.status;
  inq.ghlError = result.status === "failed" ? result.error.slice(0, 500) : "";
  if (result.status === "sent" && result.contactId) inq.ghlContactId = result.contactId;
  await inq.save();
  return result;
}
