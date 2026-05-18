import { CreateSubmissionInput } from "../validations/submission.validation";
import {channel, queue} from "../config/rabbitMQ.config"
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/AppError";
import axios from "axios";
import { PROBLEM_SERVICE_URL } from "../constants/constants";
import mongoose from "mongoose";
import Submission, { ESubmissionStatus } from "../models/submission.model";

export const evaluationService = async (data: CreateSubmissionInput) => {
    const {problemId, code, language, status} = data
    
    if (!channel || !queue) {
        throw new InternalServerError("Rabbit Mq chnnel or queue not found")
    }
    
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new BadRequestError("Invalid problem id")
    }

    const submission = await Submission.insertOne({
        problemId,
        code,
        language,
        status: ESubmissionStatus.Pending
    });

    
    const problemDataResponse = await axios.get(`${PROBLEM_SERVICE_URL}/api/v1/problems/${problemId}`)

    if (!problemDataResponse?.data?.success) {
        throw new NotFoundError("Problem not found")
    }

    const problemData = problemDataResponse.data.data

    channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        problemData,
        code,
        language,
        status,
        submissionId: submission._id,
    })));

    return;
}