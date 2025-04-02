import { generateToken } from '@/app/_utils/auth';
import { prisma } from '@/app/_utils/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sessionStore } from '@/app/_utils/session/store';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 最小限の入力検証（セキュリティトレーニングのため）
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }

    // メールアドレスが既に使用されているかチェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
        membershipLevel: "free"
      }
    });

    await sessionStore.set(newUser);

    // トークンを生成
    const token = generateToken(newUser);

    return NextResponse.json({ 
      token, 
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