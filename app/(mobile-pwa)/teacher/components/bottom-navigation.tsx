'use client';

import { Home, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/teacher',
      icon: <Home className="w-6 h-6" />,
      label: 'Home',
    },
    {
      href: '/mobile-view/teacher/schedule',
      icon: <Calendar className="w-6 h-6" />,
      label: 'Schedule',
    },
    {
      href: '/mobile-view/teacher/resources',
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Resources',
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm bg-white rounded-full shadow-2xl border border-gray-100 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-3 transition-colors flex-1 rounded-full ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
