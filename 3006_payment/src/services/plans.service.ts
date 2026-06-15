import { prisma } from "../config/db.condfig";
import {PlanInput, UpdatePlanInput} from "../validations/plans.validation";

export const getAllPlans = () => {
    return prisma.plan.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getPlanById = (id: string) => {
    return prisma.plan.findUnique({
        where: {
            id,
        },
    });
};

export const createPlan = (data: PlanInput) => {
    return prisma.plan.create({
        data,
    });
};

export const updatePlan = (
    id: string,
    data: UpdatePlanInput
) => {
    return prisma.plan.update({
        where: {
            id,
        },
        data,
    });
};

export const deletePlan = (id: string) => {
    return prisma.plan.delete({
        where: {
            id,
        },
    });
};