import { Router } from "express";
import { createEvaluation, updateSubmission } from "../controller/submission.controller";
import { userValidation } from "../middleware/user.validation";

const router = Router()

router.post("/",userValidation, createEvaluation)
router.put("/:submissionId", updateSubmission)

export default router