import { z } from "zod";

export const PlanIntervalSchema = z.enum([
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "YEARLY",
]);

export const PlanSchema = z.object({
    id: z.string().cuid().optional(),

    name: z.string().min(1, "Name is required"),

    description: z.string().nullable().optional(),

    amount: z
        .number()
        .int()
        .nonnegative("Amount must be a positive integer"),

    currency: z.string().default("INR"),

    interval: PlanIntervalSchema.default("MONTHLY"),

    intervalCount: z
        .number()
        .int()
        .positive("Interval count must be greater than 0")
        .default(1),

    role: z.string().nullable().optional(),

    isActive: z.boolean().default(true),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const UpdatePlanSchema = PlanSchema.partial();
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;
export type PlanInput = z.infer<typeof PlanSchema>;