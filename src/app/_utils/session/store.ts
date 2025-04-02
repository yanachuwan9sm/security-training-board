import { cookies } from "next/headers";
import { createClient } from "redis";
import { v4 as uuid } from "uuid";
import { decrypt, encrypt } from "./encrypt";
import { UserSchema } from "../schema";
import type { z } from "zod";

const redis = createClient({
  url: process.env.KV_REST_API_URL ?? "",
});

export const SESSION_COOKIE_NAME = "sessionId";

export type ZodUser = z.infer<typeof UserSchema>;

export const sessionStore = {
  async get() {
    return await getRedisSession();
  },

  async set(initialValue: ZodUser) {
    if ((await cookies()).get(SESSION_COOKIE_NAME)?.value !== undefined) {
      throw new Error("Session already started");
    }
    const sessionId = uuid();
    await redis.set(sessionId, JSON.stringify(initialValue));

    const cookieValue = await encrypt({ sessionId });
    (await cookies()).set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: process.env.XSS_SECURITY_ENABLED === 'true',
      secure: process.env.XSS_SECURITY_ENABLED === 'true',
      sameSite: 'none',
    });
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
      return UserSchema.parse(sessionJson);
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }
}
