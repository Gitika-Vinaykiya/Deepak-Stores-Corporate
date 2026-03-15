"use server";

import { redirect } from "next/navigation";
import { verifyAdminPassword, setAdminSession } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = (formData.get("password") as string)?.trim() ?? "";

  if (!password) {
    return { error: "Password is required" };
  }

  const result = await verifyAdminPassword(password);

  if (result.noPasswordConfigured) {
    return { error: "Admin password not configured. Add ADMIN_PASSWORD to .env.local" };
  }

  if (!result.valid) {
    return { error: "Invalid password" };
  }

  await setAdminSession();
  redirect("/admin");
}
