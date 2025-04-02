import { NextResponse } from 'next/server';
import { db } from '@/app/_utils/db';

// 盗まれたトークンを保存するエンドポイント（攻撃者のサーバーを模倣）
export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    db.storeToken(token);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 盗まれたトークンのリストを取得するエンドポイント（実際は用途はないが確認用として立てる）
export async function GET() {
  try {
    const tokens = db.getStolenTokens();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching stolen tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}