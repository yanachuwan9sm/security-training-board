// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import PostForm from "./_components/PostForm";
import PostList from "./_components/PostList";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handlePostCreated = () => {
    // 投稿一覧を更新するためのカウンターをインクリメント
    setRefreshPosts((prev) => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">セキュリティ研修掲示板</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">説明</h2>
        <p className="mb-2">
          この掲示板はセキュリティ研修用に意図的に脆弱性を持たせています。
        </p>
        <p className="mb-2">以下のセキュリティリスクを体験できます：</p>
        <ul className="list-disc ml-6 mb-4">
          <li>XSS (クロスサイトスクリプティング)</li>
          <li>CSRF (クロスサイトリクエストフォージェリ)</li>
          <li>APIキー漏洩</li>
          <li>サーバー側のバリデーション不足</li>
          <li>SSRF (サーバーサイドリクエストフォージェリ)</li>
        </ul>
        <p className="text-red-600 font-medium">
          注意:
          このアプリケーションは研修目的のみで使用してください。実際のプロダクションシステムでは絶対に使用しないでください。
        </p>
      </div>

      {isLoggedIn ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PostForm onPostCreated={handlePostCreated} />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">投稿一覧</h2>
            <PostList key={refreshPosts} />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4">投稿するにはログインしてください</p>
          <h2 className="text-xl font-semibold mb-4">投稿一覧</h2>
          <PostList />
        </div>
      )}
    </main>
  );
}
