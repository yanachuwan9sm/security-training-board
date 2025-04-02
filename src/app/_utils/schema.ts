import { z } from 'zod';

// MembershipLevelの列挙型
export const MembershipLevelSchema = z.enum(['FREE', 'PREMIUM', 'VIP']);
export type MembershipLevel = z.infer<typeof MembershipLevelSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  profilePicture: z.string().nullable(),
  membershipLevel: MembershipLevelSchema,
});

export const PostSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  author: z.string(),
  userId: z.string().uuid(),
});

export const StolenTokenSchema = z.object({
  id: z.string().uuid(),
  token: z.string(),
  timestamp: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
export type StolenToken = z.infer<typeof StolenTokenSchema>;