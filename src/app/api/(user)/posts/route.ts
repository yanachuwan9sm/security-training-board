import { getTokenFromRequest, verifyToken } from '@/app/_utils/auth';
import { prisma } from '@/app/_utils/prisma';
import { NextResponse } from 'next/server';

// 全ての投稿を取得
export async function GET() {
  try {
    const posts = prisma.post.findMany();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 新しい投稿を作成
export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { content } = await req.json();

    // コンテンツの検証を行わない（XSS脆弱性のため）
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newPost = prisma.post.create({
      data: {
        userId: user.id,
        author: user.username,
        content // サニタイズしない
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}