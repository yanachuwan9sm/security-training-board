import { prisma } from "@/app/_utils/prisma";
import { sessionStore } from "@/app/_utils/session/store";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = prisma.user.findUnique({
      where: { email },
    });

    if (user === null) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // ユーザーが存在しないか、パスワードが一致しない場合
    if (!user || user.password !== password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await sessionStore.set(user);

    return Response.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          membershipLevel: user.membershipLevel,
          profilePicture: user.profilePicture,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
