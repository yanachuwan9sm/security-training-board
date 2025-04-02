// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/app/_utils/db';
import { withAuth } from '@/app/_utils/auth';

// プロフィール情報を取得
export const GET = withAuth(async (req, user) => {
  try {
    // データベースから最新のユーザー情報を取得
    const currentUser = db.getUserById(user.id);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = currentUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// プロフィール情報を更新
export const PUT = withAuth(async (req, user) => {
  try {
    const { username, email, profilePicture } = await req.json();
    
    // 入力検証を最小限に
    const updatedUser = db.updateUser(user.id, {
      ...(username ? { username } : {}),
      ...(email ? { email } : {}),
      ...(profilePicture ? { profilePicture } : {})
    });
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});