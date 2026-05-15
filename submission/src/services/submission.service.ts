import { CreateSubmissionInput } from "../validations/submission.validation";
import {channel, queue} from "../config/rabbitMQ.config"
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/AppError";
import axios from "axios";
import { PROBLEM_SERVICE_URL } from "../constants/constants";
import mongoose from "mongoose";

export const createSubmissionService = async (data: CreateSubmissionInput) => {
    const {problemId, code, language, status} = data
    
    if (!channel || !queue) {
        throw new InternalServerError("Rabbit Mq chnnel or queue not found")
    }
    
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new BadRequestError("Invalid problem id")
    }
    // console.log("here")

    
    const problemDataResponse = await axios.get(`${PROBLEM_SERVICE_URL}/api/v1/problems/${problemId}`)

    if (!problemDataResponse?.data?.success) {
        throw new NotFoundError("Problem not found")
    }

    const problemData = problemDataResponse.data

    channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        problemData,
        code,
        language,
        status
    })));

    return;
}