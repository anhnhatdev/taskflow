import bcrypt from 'bcrypt';
import { prisma } from '../../index.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

export async function createUser(data: RegisterInput) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
