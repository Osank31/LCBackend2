import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({
    connectionString: process.env.NEON_DB_URL!,
});

export const prisma = new PrismaClient({ adapter })