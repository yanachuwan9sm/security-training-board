import { cookies } from "next/headers";
import { createClient } from "redis";
import { v4 as uuid } from "uuid";
import { decrypt, encrypt } from "./jwt";
import { z } from "zod";
import { revalidateTag } from "next/cache";

const redis = createClient({
  url: process.env.KV_REST_API_URL ?? "",
});

export const SESSION_COOKIE_NAME = "sessionId";

const Authenticated = z.object({
  status: z.literal("authenticated"),
  github: z.object({
    accessToken: z.string(),
    tokenType: z.string(),
    scope: z.string(),
  }),
});

const PreAuthenticated = z.object({
  status: z.literal("preauthenticated"),
  state: z.string().min(1).optional(),
});

export const SessionSchema =
  z.discriminatedUnion("status", [Authenticated, PreAuthenticated])
  .optional();

export type SessionValues = z.infer<typeof SessionSchema>;

export const sessionStore = {
  async get() {
    return await getRedisSession();
  },
  async start(initialValue: SessionValues) {
    if ((await cookies()).get(SESSION_COOKIE_NAME)?.value !== undefined) {
      throw new Error("Session already started");
    }
    const sessionId = uuid();
    await redis.set(sessionId, JSON.stringify(initialValue));
    const cookieValue = await encrypt({ sessionId });
    (await cookies()).set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: process.env.XSS_SECURITY_ENABLED === 'true',
      secure: process.env.XSS_SECURITY_ENABLED === 'true',
    });
  },
  async update(updateFunc: (prev: SessionValues) => SessionValues) {
    const sessionId = await getSessionId();

    if (sessionId === undefined) {
      throw new Error("Session not started");
    }

    const oldSession = await getRedisSession();
    const newSession = SessionSchema.parse(updateFunc(oldSession));
    await redis.set(sessionId, JSON.stringify(newSession));
    revalidateTag("session");
  },

  async delete() {
    const sessionId = await getSessionId();
    if (sessionId === undefined) {
      throw new Error("Session not started");
    }
    await redis.del(sessionId);
    (await cookies()).delete(SESSION_COOKIE_NAME);
  },
};

async function getSessionId() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME);
  if (cookie === undefined) {
    return undefined;
  }
  const { sessionId } = await decrypt(cookie.value);
  return sessionId;
}

async function getRedisSession() {
  const sessionId = await getSessionId();
  if (sessionId === undefined) return undefined;
  const session = await redis.get(sessionId);
  if (session) {
    try {
      const sessionJson = JSON.parse(session);
      return SessionSchema.parse(sessionJson);
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }
}
