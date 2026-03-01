import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; ///route.ts]
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Calculator,
  Users,
  Settings as SettingsIcon,
  BookOpen,
  Building,
} from "lucide-react";

// Define the structure for our setting links
interface SettingLink {
  title: string;
  href: string;
  icon: React.ElementType;
  danger?: boolean;
}

export default async function SettingsPage() {
  // 1. Authenticate the User
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id, role } = session.user;
  let isHod = false;

  // 2. Fetch HOD status if the user is a Teacher
  if (role === UserRole.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: id },
      select: { isHod: true },
    });
    isHod = teacherProfile?.isHod || false;
  }

  // 3. Define the Global Settings (Accessible to everyone)
  const commonLinks: SettingLink[] = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: Shield,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: Bell,
    },
  ];

  const devTools: SettingLink[] = [
    {
      title: "Force  Update",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "Broadcast Message",
      href: "/settings/security",
      icon: Shield,
    },
    {
      title: "Maintance Mode",
      href: "/settings/notifications",
      icon: Bell,
    },
  ];

  // 4. Define Role-Specific Settings
  let roleLinks: SettingLink[] = [];

  if (role === UserRole.STUDENT) {
    roleLinks = [
      {
        title: "Bunk Calculator",
        href: "/settings/bunk-calculator",
        icon: Calculator,
      },
      {
        title: "Leave Requests",
        href: "/settings/leaves",
        icon: BookOpen,
      },
    ];
  } else if (role === UserRole.TEACHER) {
    roleLinks = [
      {
        title: "Delegation Settings",
        href: "/settings/delegation",
        icon: Users,
      },
    ];

    // Inject HOD specific settings
    if (isHod) {
      roleLinks.push({
        title: "Department Configuration",
        href: "/settings/department",
        icon: Building,
      });
    }
  } else if (role === UserRole.ADMIN) {
    roleLinks = [
      {
        title: "Admins",
        href: "/users/admins",
        icon: SettingsIcon,
      },
      {
        title: "Teachers",
        href: "/users/teachers",
        icon: Building,
      },
      {
        title: "Students",
        href: "/users/students",
        icon: Building,
      },
      {
        title: "Class & Routine",
        href: "/settings/manage-hods",
        icon: Building,
      },
      {
        title: "Subjects",
        href: "/settings/manage-hods",
        icon: Building,
      },
      {
        title: "Holidays",
        href: "/settings/manage-hods",
        icon: Building,
      },
    ];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your MindZed account preferences and configurations.
        </p>
      </div>

      <div className="space-y-10">
        {/* Role-Specific Settings Section */}
        {roleLinks.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {role === "TEACHER" && isHod
                ? "Teacher & HOD Menu"
                : `${role} Menu`}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {roleLinks.map((link) => (
                <SettingsCard key={link.title} link={link} />
              ))}
            </div>
          </section>
        )}

        {/* Dev tool Section */}
        { session.user.role === UserRole.ADMIN && <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Dev tool
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {devTools.map((link) => (
              <SettingsCard key={link.title} link={link} />
            ))}
          </div>
        </section>}

        {/* Common Settings Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            General
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {commonLinks.map((link) => (
              <SettingsCard key={link.title} link={link} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Minimalist "Nothing OS" style card component
function SettingsCard({ link }: { link: SettingLink }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-all duration-300 ease-in-out"
    >
      <div className="shrink-0 mt-1">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:underline decoration-1 underline-offset-4">
          {link.title}
        </h3>
      </div>
    </Link>
  );
}
