import amqplib, { Channel } from "amqplib";
import logger from "./logger.config";

export interface QueueConnection {
    channel: Channel;
    queue: string;
}

let channel: Channel;
let queue = {
    updateUserRole: "user.updateUserRole",
};

export async function connectToQueue() {
    try {
        const connection = await amqplib.connect(
            process.env.RABBITMQ_URL || "amqp://localhost"
        );

        channel = await connection.createChannel();

        await channel.assertQueue(queue.updateUserRole);

        logger.info("Connected to RabbitMQ")
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

export { channel, queue };