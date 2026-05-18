import { Router } from "express";
import { createEvaluation } from "../controller/submission.controller";

const router = Router()

router.post("/", createEvaluation)

export default router