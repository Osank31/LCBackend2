import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/Response";
import * as PlansService from "../services/plans.service";
import {
    PlanSchema,
    UpdatePlanSchema,
} from "../validations/plans.validation";

// GET /plans
export const getAllPlans = async (
    _: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const plans = await PlansService.getAllPlans();

        sendSuccess(res, plans, "Plans fetched successfully.");
    } catch (e) {
        next(e);
    }
};

// GET /plans/:id
export const getPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const plan = await PlansService.getPlanById(id as string);

        sendSuccess(res, plan, "Plan fetched successfully.");
    } catch (e) {
        next(e);
    }
};

// POST /plans
export const createPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = PlanSchema.parse(req.body);

        const plan = await PlansService.createPlan(validatedData);

        sendSuccess(res, plan, "Plan created successfully.");
    } catch (e) {
        next(e);
    }
};

// PUT /plans/:id
export const updatePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const validatedData = UpdatePlanSchema.parse(req.body);

        const plan = await PlansService.updatePlan(id as string, validatedData);

        sendSuccess(res, plan, "Plan updated successfully.");
    } catch (e) {
        next(e);
    }
};

// DELETE /plans/:id
export const deletePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        await PlansService.deletePlan(id as string);

        sendSuccess(res, null, "Plan deleted successfully.");
    } catch (e) {
        next(e);
    }
};