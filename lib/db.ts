import { PrismaClient } from '@prisma/client'

// Extend the global type without using namespace
declare global {
    interface Global {
        prisma: PrismaClient | undefined
    }
}

// Create a typed reference to the global object
const globalForPrisma = global as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db
}