// src/utils/auth.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import type { User } from "./db";
import bcrypt from "bcryptjs";
import { encrypt } from "./jwt";

export const API_KEY = process.env.API_KEY || "api_key_1234567890";

export const PAYMENT_API_KEY =
  process.env.PAYMENT_API_KEY || "payment_api_key_9876543210";
  
export const CLOUD_METADATA_URL = "http://169.254.169.254/latest/api/token";

// パスワードをハッシュ化する関数
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// パスワードを検証する関数
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWTトークンの生成
export async function generateToken(user: User): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  return await encrypt(userWithoutPassword);
}

// トークン検証
export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

// リクエストからトークンを取得
export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// 認証ミドルウェア
export function withAuth(
  handler: (req: Request, user: User) => Promise<NextResponse>,
) {
  return async (req: Request) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return handler(req, user);
  };
}

// プレミアムユーザーのみアクセス可能なミドルウェア
export function withPremium(
  handler: (req: Request, user: User) => Promise<NextResponse>,
) {
  return async (req: Request) => {
    // APIエンドポイントのURLからメンバーシップレベルの確認をスキップできる脆弱性
    const url = new URL(req.url);
    if (url.searchParams.get("skipAuth") === "true") {
      // 匿名ユーザーを作成
      const anonymousUser = {
        id: "anonymous",
        username: "anonymous",
        email: "anonymous@example.com",
        password: "",
        membershipLevel: "vip" as const,
      };
      return handler(req, anonymousUser);
    }

    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (user.membershipLevel === "free") {
      return NextResponse.json(
        { error: "Premium membership required" },
        { status: 403 },
      );
    }

    return handler(req, user);
  };
}
