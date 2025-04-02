"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  membershipLevel: "free" | "premium" | "vip";
}

export default function Payment() {
  const [user, setUser] = useState<User | null>(null);
  const [membershipLevel, setMembershipLevel] = useState<"premium" | "vip">(
    "premium",
  );
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = React.useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipLevel,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `${membershipLevel === "premium" ? "プレミアム" : "VIP"}メンバーシップへのアップグレードが完了しました！`,
        );

        // ユーザー情報を更新
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // 3秒後にホームページにリダイレクト
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.error || "決済処理に失敗しました");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("決済処理に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user, membershipLevel, paymentMethod, router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);

        // すでにVIPの場合は決済不要
        if (userData.membershipLevel === "vip") {
          setSuccess("あなたはすでにVIPメンバーです");
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // URLパラメータから自動的に決済を処理（CSRF脆弱性）
    const urlParams = new URLSearchParams(window.location.search);
    const autoUpgrade = urlParams.get("autoUpgrade");
    const level = urlParams.get("level") as "premium" | "vip";

    if (autoUpgrade === "true" && level) {
      setMembershipLevel(level);
      handlePayment();
    }
  }, [handlePayment, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePayment();
  };

  // CSRF攻撃のデモ用HTML
  const csrfDemoHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>無料ギフトカード</title>
</head>
<body>
  <h1>無料ギフトカードをゲット！</h1>
  <p>下のボタンをクリックして無料ギフトカードを受け取りましょう！</p>
  
  <button id="freeGift">今すぐゲット！</button>
  
  <script>
    document.getElementById('freeGift').addEventListener('click', function() {
      // CSRF攻撃を実行
      window.location.href = "http://localhost:3000/payment?autoUpgrade=true&level=vip";
    });
  </script>
</body>
</html>
  `;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">メンバーシップアップグレード</h1>

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

      {user && user.membershipLevel !== "vip" && !success && (
        <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="currentMembershipLevel"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                現在のメンバーシップレベル
              </label>
              <div
                id="currentMembershipLevel"
                className="bg-gray-100 px-3 py-2 rounded"
              >
                {user.membershipLevel === "free" ? "フリー" : "プレミアム"}
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="membershipLevel"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                アップグレード先
              </label>
              <select
                id="membershipLevel"
                value={membershipLevel}
                onChange={(e) =>
                  setMembershipLevel(e.target.value as "premium" | "vip")
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="premium">プレミアム (¥980/月)</option>
                <option value="vip">VIP (¥1,980/月)</option>
              </select>
            </div>

            <div className="mb-6">
              <label
                htmlFor="paymentMethod"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                お支払い方法
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="credit-card">クレジットカード</option>
                <option value="bank-transfer">銀行振込</option>
                <option value="convenience-store">コンビニ決済</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? "処理中..." : "アップグレードする"}
            </button>
          </form>
        </div>
      )}

      <div className="max-w-md mx-auto mt-12">
        <h2 className="text-xl font-semibold mb-4">CSRF攻撃のデモ</h2>
        <p className="mb-4">
          以下は、CSRFの脆弱性を悪用した攻撃のデモです。別のWebサイトから決済ページへのリダイレクトが自動的に行われ、意図していない決済処理が実行されます。
        </p>

        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <pre className="text-sm">
            <code>{csrfDemoHTML}</code>
          </pre>
        </div>

        <p className="mt-4 text-red-600">
          このようなページを訪問すると、ユーザーが意図しない決済処理が自動的に実行される可能性があります。CSRFトークンを導入することで、このような攻撃を防ぐことができます。
        </p>
      </div>
    </div>
  );
}
