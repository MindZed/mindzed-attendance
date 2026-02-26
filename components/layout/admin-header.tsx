// components/layout/admin-header.tsx

"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminHeader() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-sm relative z-50">
            {/* Left: Greeting & Profile */}
            <div className="flex items-center gap-3">
                {/* Profile Picture Placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-gray-600 font-bold text-lg">
                        {session?.user?.name?.charAt(0) || "A"}
                    </span>
                </div>

                <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                        System Administrator
                    </p>
                    <h2 className="text-lg font-bold leading-tight text-gray-900">
                        {session?.user?.name || "Admin"}
                    </h2>
                </div>
            </div>

            {/* Right: Settings Button */}
            <div>
                <button
                    onClick={toggleMenu}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    aria-label="Settings"
                >
                    {/* Settings Gear SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.004.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute right-4 top-16 mt-2 w-48 bg-white border rounded-xl shadow-lg py-2 overflow-hidden">
                        <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Manage Users
                        </Link>
                        {/* NEW SECURITY LINK */}
                        <Link
                            href="/admin/security"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Security
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 transition"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}