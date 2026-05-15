import { ConsumeMessage } from "amqplib"
import logger from "../config/logger.config"
import { channel, queue } from "../config/rabbitMQ.config"
import { ELanguage, IEvaluationData } from "../types/evaluation.type"
import { runCode } from "../config/docker.config"

type Language = "python" | "cpp" | "java";
const languageMap: Record<ELanguage, Language> = {
    [ELanguage.py]: "python",
    [ELanguage.cpp]: "cpp",
};


export const startWorker = async () => {
    if (!channel) {
        logger.error("Channel not made")
    }
    channel.consume(queue, async (data: ConsumeMessage | null) => {
        if(!data){
            console.log("No data inside the queue")
            return
        }
        const evaluationData: IEvaluationData = JSON.parse(`${Buffer.from(data?.content)}`)
        channel.ack(data)

        const result = await runCode(languageMap[evaluationData.language], evaluationData.code, evaluationData.problemData.testCases[0].input)

        console.log(result)
    })
}