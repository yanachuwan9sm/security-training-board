// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "../_components/ProfileForm";

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  if (!isLoggedIn) {
    return null; // リダイレクト中は何も表示しない
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </div>
  );
}
