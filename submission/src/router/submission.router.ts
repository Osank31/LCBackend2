import { Router } from "express";
import { createSubmission } from "../controller/submission.controller";

const router = Router()

router.post("/", createSubmission)

export default router