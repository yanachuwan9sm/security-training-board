// src/app/api/auth/register/route.ts
import { generateToken } from '@/app/_utils/auth';
import { db } from '@/app/_utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 最小限の入力検証（セキュリティトレーニングのため）
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }

    // メールアドレスが既に使用されているかチェック
    if (db.getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // 新しいユーザーを作成
    const newUser = db.createUser({
      username,
      email,
      password, 
      membershipLevel: 'free'
    });

    // トークンを生成
    const token = generateToken(newUser);

    return NextResponse.json({ 
      token, 
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        membershipLevel: newUser.membershipLevel
      } 
    }, { 
      status: 201,
      headers: {
        // 意図的に脆弱な設定
        'Set-Cookie': `token=${token}; Path=/; SameSite=None;`
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}