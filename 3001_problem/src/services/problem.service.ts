// services/problem.service.ts

import mongoose from "mongoose";
import Problem from "../models/problem.model";
import {
    BadRequestError,
    NotFoundError,
    NotImplementedError,
} from "../utils/errors/AppError";

export const createProblemService = async (data: any) => {
    return await Problem.create(data);
};

export const getAllProblemsService = async () => {
    return await Problem.find();
};

export const getSingleProblemService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError("Provided id isn't valid");
    }

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new NotFoundError("Problem not found");
    }

    return problem;
};

export const updateProblemService = async (
    id: string,
    data: any
) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError("Provided id isn't valid");
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!updatedProblem) {
        throw new NotImplementedError("Problem couldnt be updated");
    }

    return updatedProblem;
};

export const deleteProblemService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError("Invalid id provided");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
        throw new NotImplementedError("Problem couldnt be deleted");
    }

    return deletedProblem;
};

export const searchProblemsService = async (query: string) => {
    if (!query || query.trim() === "") {
        throw new BadRequestError("Invalid Query");
    }

    const regex = new RegExp(query, "i");

    return await Problem.find({
        $or: [
            { title: { $regex: regex } },
            { description: { $regex: regex } },
        ],
    }).sort({ createdAt: -1 });
};