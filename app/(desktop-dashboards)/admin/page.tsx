// app/(desktop-dashboards)/admin/page.tsx
// This file serves as the entry point for the Admin Dashboard. It performs an immediate
// redirect to the actual dashboard page, ensuring that any access to "/admin" routes
// is seamlessly directed to "/admin/dashboard". This allows for cleaner URLs and a
// more intuitive navigation experience for administrators.

import { redirect } from "next/navigation";

export default function AdminRootPage() {
  // Instantly redirect the user to the actual dashboard
  redirect("/admin/dashboard");
}