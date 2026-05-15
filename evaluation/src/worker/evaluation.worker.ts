import { ConsumeMessage } from "amqplib"
import logger from "../config/logger.config"
import { channel, queue } from "../config/rabbitMQ.config"

export const startWorker = async () => {
    if (!channel) {
        logger.error("Channel not made")
    }
    channel.consume(queue, (data: ConsumeMessage | null) => {
        if(!data){
            console.log("No data inside the queue")
            return
        }
        const evaluationData = JSON.parse(`${Buffer.from(data?.content)}`)
        console.log(evaluationData)
        channel.ack(data)
    })
}