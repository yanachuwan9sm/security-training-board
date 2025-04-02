import { NextResponse } from 'next/server';
import { withPremium } from '@/app/_utils/auth';

// プレミアムユーザー向けの特別なデータを取得
export const GET = withPremium(async (req, user) => {
  try {
    // 本来はプレミアムユーザーのみがアクセスできるべき機密データ
    const premiumContent = {
      specialFeatures: [
        'Advanced analytics',
        'Priority support',
        'Exclusive content',
        'API access',
      ],
      secretInfo: 'This is confidential information only for premium users',
      userDetails: {
        id: user.id,
        username: user.username,
        membershipLevel: user.membershipLevel
      }
    };
    
    return NextResponse.json(premiumContent);
  } catch (error) {
    console.error('Error fetching premium content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});