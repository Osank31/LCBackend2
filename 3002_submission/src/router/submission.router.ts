import { Router } from "express";
import { createEvaluation, updateSubmission } from "../controller/submission.controller";

const router = Router()

router.post("/", createEvaluation)
router.put("/:submissionId", updateSubmission)

export default router