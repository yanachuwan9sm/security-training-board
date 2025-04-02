import { NextResponse } from 'next/server';
import { prisma } from '@/app/_utils/prisma';
import { getTokenFromRequest, verifyToken } from '@/app/_utils/auth';

export async function POST(req: Request) {
  try {
    // CSRFに脆弱な実装（Origin/RefererチェックなしOriginヘッダーやCSRFトークンをチェック無し）    
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { membershipLevel, paymentMethod } = await req.json();

    // 支払い方法の検証を最小限に
    if (!membershipLevel || !paymentMethod) {
      return NextResponse.json({ error: 'Membership level and payment method are required' }, { status: 400 });
    }

    // 有効なメンバーシップレベルかチェック
    if (!['premium', 'vip'].includes(membershipLevel)) {
      return NextResponse.json({ error: 'Invalid membership level' }, { status: 400 });
    }

    // 支払い処理（実際には決済システムと連携）
    console.log(`Processing payment for user ${user.id} to upgrade to ${membershipLevel}`);
    
    // ユーザーのメンバーシップレベルを更新
    const updatedUser = prisma.user.update({
      where: { id: user.id },
      data: { membershipLevel }
    });
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${membershipLevel}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        membershipLevel: updatedUser.membershipLevel
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}