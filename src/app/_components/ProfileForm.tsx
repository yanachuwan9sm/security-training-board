"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  membershipLevel: "free" | "premium" | "vip";
  profilePicture?: string;
}

const ProfileForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(
    async (token: string) => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUsername(userData.username || "");
          setEmail(userData.email || "");
          setProfilePicture(userData.profilePicture || "");
        } else {
          const errorData = await response.json();
          setError(errorData.error || "プロフィールの取得に失敗しました");
          if (response.status === 401) {
            // トークンが無効な場合はログアウト
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }
        }
      } catch (err) {
        setError("プロフィールの取得に失敗しました");
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchProfile(token);
  }, [fetchProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("ログインが必要です");
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          profilePicture,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setSuccess("プロフィールを更新しました");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "プロフィールの更新に失敗しました");
      }
    } catch (err) {
      setError("プロフィールの更新に失敗しました");
      console.error("Failed to update profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">プロフィール編集</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="profilePicture"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            プロフィール画像 URL
          </label>
          <input
            id="profilePicture"
            type="text"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-gray-500 mt-1">
            画像のURLを入力してください
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">メンバーシップレベル:</p>
          <p className="bg-gray-100 px-3 py-2 rounded">
            {user?.membershipLevel === "free"
              ? "フリー"
              : user?.membershipLevel === "premium"
                ? "プレミアム"
                : "VIP"}
          </p>
          {user?.membershipLevel === "free" && (
            <p className="text-sm text-gray-500 mt-1">
              アップグレードするには決済ページにアクセスしてください
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={updating}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {updating ? "更新中..." : "プロフィールを更新"}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
