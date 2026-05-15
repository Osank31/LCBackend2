import { CreateSubmissionInput } from "../validations/submission.validation";
import {channel, queue} from "../config/rabbitMQ.config"
import { InternalServerError } from "../utils/errors/AppError";

export const createSubmissionService = async (data: CreateSubmissionInput) => {
    const {problemId, code, language, status} = data
    
    if (!channel || !queue) {
        throw new InternalServerError("Rabbit Mq chnnel or queue not found")
    }

    channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        problemId,
        code,
        language,
        status
    })));
}