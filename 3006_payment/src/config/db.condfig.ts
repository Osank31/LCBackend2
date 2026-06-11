import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import {NEON_DB_URL} from "../constants/constants";

const adapter = new PrismaNeon({
    connectionString: NEON_DB_URL,
});

export const prisma = new PrismaClient({ adapter })