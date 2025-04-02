"use client";

import React, { useEffect, useState } from "react";

interface Post {
  id: string;
  userId: string;
  author: string;
  content: string;
  createdAt: string;
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/posts");

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "投稿の取得に失敗しました");
      }
    } catch (err) {
      setError("投稿の取得に失敗しました");
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="text-gray-900 text-center py-4">投稿を読み込み中...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-gray-900 text-center py-4">投稿がありません</div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      {posts.map((post) => (
        <div key={post.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium">{post.author}</h3>
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="prose prose-sm max-w-none"
          />
        </div>
      ))}
    </div>
  );
};

export default PostList;
