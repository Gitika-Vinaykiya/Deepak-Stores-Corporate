import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) redirect("/admin");

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Admin Login</h1>
        <p className="text-zinc-500 mb-8">
          Enter your password to access the admin panel.
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
