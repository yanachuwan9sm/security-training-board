"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  membershipLevel: "free" | "premium" | "vip";
  profilePicture?: string;
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchUserProfile = async (token: string) => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          // トークンが無効な場合はログアウト
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    // ローカルストレージからトークンを取得
    const token = localStorage.getItem("token");
    if (token) {
      // ユーザー情報をローカルストレージから取得
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          setUser(JSON.parse(userJson));
        } catch (error) {
          console.error("Failed to parse user data:", error);
        }
      } else {
        // APIからユーザー情報を取得
        fetchUserProfile(token);
      }
    }
  }, [handleLogout]);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          セキュリティ研修掲示板
        </Link>

        <div className="flex space-x-4">
          {user ? (
            <>
              <span className="px-3 py-2">
                こんにちは、{user.username}さん ({user.membershipLevel})
              </span>
              <Link
                href="/profile"
                className="px-3 py-2 hover:bg-gray-700 rounded"
              >
                プロフィール
              </Link>
              {user.membershipLevel === "free" && (
                <Link
                  href="/payment"
                  className="px-3 py-2 hover:bg-gray-700 rounded"
                >
                  アップグレード
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 hover:bg-gray-700 rounded"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 hover:bg-gray-700 rounded"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 hover:bg-gray-700 rounded"
              >
                登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
