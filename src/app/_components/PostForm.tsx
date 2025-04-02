"use client";

import type React from "react";
import { useState } from "react";

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("投稿内容を入力してください");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("ログインが必要です");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent("");
        onPostCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "投稿の作成に失敗しました");
      }
    } catch (err) {
      setError("投稿の作成に失敗しました");
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg text-gray-900 font-semibold mb-4">
        新しい投稿を作成
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            投稿内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
            rows={4}
            placeholder="HTMLタグや JavaScript も使えます..."
          />
          <p className="text-sm text-gray-500 mt-1">
            HTMLタグやJavaScriptコードも入力できます（XSSを体験するため）
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
