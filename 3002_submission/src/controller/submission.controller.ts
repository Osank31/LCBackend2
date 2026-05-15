import { NextFunction, Request, Response } from "express";
import { createSubmissionSchema } from "../validations/submission.validation";
import { sendSuccess } from "../utils/Response";
import { createSubmissionService } from "../services/submission.service";

export const createSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Submission created")
        const validatedData = createSubmissionSchema.parse(req.body)
        const submission = await createSubmissionService(validatedData);

        return sendSuccess(res, submission, "Submission created successfully", 201)
    } catch (error) {
        
    }
}