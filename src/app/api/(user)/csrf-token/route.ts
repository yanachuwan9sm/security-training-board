import { NextResponse } from 'next/server';
// import crypto from 'crypto';

export async function GET() {
  /*
  // CSRFトークンを生成
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // CSRFトークンをHTTPOnlyクッキーとして設定
  const response = NextResponse.json({ success: true });
  
  // クッキーの有効期限を設定（例: 1時間）
  const maxAge = 60 * 60; // 1時間（秒単位）
  
  response.cookies.set({
    name: 'csrf_token',
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/'
  });
  
  // フロントエンドでもCSRFトークンを利用できるように、レスポンスボディにも含める
  return NextResponse.json({ csrfToken });
  */
  
  // 実際の実装（研修用）
  // 脆弱性を残すため、実際にはCSRFトークンを生成・設定しない
  return NextResponse.json({ message: 'CSRF protection disabled for security training' });
}