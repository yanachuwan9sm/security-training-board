import { db } from '@/app/_utils/db';
import { generateToken } from '@/app/_utils/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.getUserByEmail(email);

    if(user === null){
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // ユーザーが存在しないか、パスワードが一致しない場合
    if (!user || user.password !== password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // トークンを生成
    const token = generateToken(user);

    return Response.json({ 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        membershipLevel: user.membershipLevel,
        profilePicture: user.profilePicture
      } 
    }, { 
      status: 200,
      headers: {
        // 意図的に脆弱な設定
        'Set-Cookie': `token=${token}; Path=/; SameSite=None;`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}