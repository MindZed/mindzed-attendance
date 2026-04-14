"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminView } from "./AdminView";
import { BaseTeacherView } from "./BaseTeacherView";
import { mockCurrentUser } from "./mock-data";

const canAccessAdminView = (role: string) => role === "CC" || role === "HOD";

export function DashboardLayout() {
  const [isAdminView, setIsAdminView] = useState(false);
  const canToggleAdmin = canAccessAdminView(mockCurrentUser.role);

  const shellClassName = useMemo(
    () =>
      [
        "min-h-screen w-full p-6 transition-colors duration-300",
        isAdminView ? "admin-theme" : "",
      ]
        .join(" ")
        .trim(),
    [isAdminView],
  );

  return (
    <motion.main
      className={shellClassName}
      initial={false}
      animate={{
        backgroundColor: isAdminView ? "#101010" : "#FFFFFF",
        color: isAdminView ? "#F3EFFA" : "#101010",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-6 flex items-center justify-between border border-current/15 bg-current/5 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] opacity-70">MindZed Attendance</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome, {mockCurrentUser.name}
            </h1>
            <p className="text-sm opacity-75">
              {isAdminView ? "Administrative Insight Mode" : "Base Teacher Dashboard"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 border border-current/30 px-2 py-1 text-xs font-semibold uppercase tracking-[0.13em]">
              {isAdminView ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
              {isAdminView ? "Admin View" : "Teacher View"}
            </span>

            {canToggleAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminView((value) => !value)}
                className="border border-mz-text-primary bg-mz-warning px-4 py-2 text-sm font-semibold text-mz-text-primary transition hover:opacity-90"
              >
                {isAdminView ? "Switch to Teacher View" : "Switch to Admin View"}
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isAdminView ? (
            <motion.section
              key="admin-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <AdminView user={mockCurrentUser} />
            </motion.section>
          ) : (
            <motion.section
              key="teacher-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <BaseTeacherView />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
