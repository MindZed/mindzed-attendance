// app/admin/security/page.tsx

"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions/user";

export default function SecurityPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // 1. Basic Client-Side Validation
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            // Call the Server Action
            const result = await updatePassword(currentPassword, newPassword);

            if (result.error) {
                // If the server returns an error (like "Incorrect current password")
                setError(result.error);
            } else if (result.success) {
                // If it succeeds
                setSuccess("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Security Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your password and account security.</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Update Password</h2>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {/* Feedback Messages */}
                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                    {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}