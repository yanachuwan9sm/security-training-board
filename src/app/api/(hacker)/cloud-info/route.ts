import { NextResponse } from 'next/server';

// SSRFに脆弱なエンドポイントを再現（攻撃者のサーバーを模倣）
export async function GET(req: Request) {
  try {
    // リクエストからホストヘッダーを取得
    const host = req.headers.get('host') || 'localhost:3000';
    
    // URLパラメータから任意のURLを取得できる脆弱性
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url') || 'http://localhost:3000/api/cloud/metadata';
    
    console.log(`Fetching cloud information from: ${targetUrl}, Host: ${host}`);
    
    // 任意のURLにリクエストを送信できる脆弱性（SSRFに繋がる）
    // この例: 攻撃者はホストヘッダインジェクションを用いることでパブリッククラウドのメタデータAPIにアクセスすることができる
    const response = await fetch(targetUrl, {
      headers: {
        'Host': host
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch cloud information' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cloud information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}