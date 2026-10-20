/**
 * Create or reset an admin user. No public sign-up exists.
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-password' npm run create-admin
 * (or set them in .env.local). Re-running with the same email resets the password.
 */
import "./env";
import mongoose from "mongoose";
import { AdminSession, AdminUser } from "../lib/models/ops";
import { hashPassword } from "../lib/password";

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";
  if (!uri) throw new Error("Set MONGODB_URI first");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email");
  if (!password || password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  await mongoose.connect(uri);
  const passwordHash = await hashPassword(password);
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = name;
    await existing.save();
    await AdminSession.deleteMany({ user: existing._id }); // sign out old sessions
    console.log(`Password reset for ${email}`);
  } else {
    await AdminUser.create({ email, name, passwordHash });
    console.log(`Admin created: ${email}`);
  }
  console.log("Remove ADMIN_PASSWORD from your environment now that the account exists.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await mongoose.disconnect();
  process.exit(1);
});
