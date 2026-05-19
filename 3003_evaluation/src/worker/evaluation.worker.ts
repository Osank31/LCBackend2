import { ConsumeMessage } from "amqplib";
import axios from "axios";

import logger from "../config/logger.config";
import { channel, queue } from "../config/rabbitMQ.config";
import { runCode } from "../config/docker.config";

import {
    ELanguage,
    ESubmissionStatus,
    IEvaluationData,
} from "../types/evaluation.type";

type Language = "python" | "cpp" | "java";

const languageMap: Record<ELanguage, Language> = {
    [ELanguage.py]: "python",
    [ELanguage.cpp]: "cpp",
};

const normalizeOutput = (output: string) => {
    return output.trim();
};

export const startWorker = async () => {
    try {
        if (!channel) {
            logger.error("RabbitMQ channel not initialized");
            return;
        }

        channel.consume(
            queue.submissionCreated,
            async (data: ConsumeMessage | null) => {
                if (!data) {
                    logger.warn("No data received from queue");
                    return;
                }

                try {
                    const evaluationData: IEvaluationData = JSON.parse(
                        data.content.toString()
                    );

                    logger.info(
                        `Processing submission: ${evaluationData.submissionId}`
                    );

                    const results = [];
                    let errorFlag = false;

                    for (
                        let i = 0;
                        i < evaluationData.problemData.testCases.length;
                        i++
                    ) {
                        const currentTestCase =
                            evaluationData.problemData.testCases[i];

                        try {
                            const result = await runCode(
                                languageMap[evaluationData.language],
                                evaluationData.code,
                                currentTestCase.input
                            );

                            const normalizedResult =
                                normalizeOutput(result);

                            const normalizedExpected =
                                normalizeOutput(
                                    currentTestCase.output
                                );

                            const passed =
                                normalizedResult === normalizedExpected;

                            results.push({
                                input: currentTestCase.input,
                                expectedOutput:
                                    currentTestCase.output,
                                output: result,
                                passed,
                            });

                            if (!passed) {
                                errorFlag = true;
                                break;
                            }
                        } catch (executionError) {
                            logger.error(
                                `Code execution failed for submission ${evaluationData.submissionId}`,
                                executionError
                            );

                            errorFlag = true;

                            results.push({
                                input: currentTestCase.input,
                                output: null,
                                passed: false,
                                error: "Runtime Error",
                            });

                            break;
                        }
                    }

                    let submissionStatus: ESubmissionStatus;

                    if (errorFlag) {
                        submissionStatus =
                            ESubmissionStatus.Rejected;
                    } else {
                        submissionStatus =
                            ESubmissionStatus.Accepted;
                    }

                    // console.log(results)

                    try {
                        const response = await axios.put(
                            `http://localhost:3002/${evaluationData.submissionId}`,
                            {
                                problemId:
                                    evaluationData.problemData._id,
                                code: evaluationData.code,
                                language: evaluationData.language,
                                status: submissionStatus,
                            }
                        );

                        if (!response?.data?.success) {
                            throw new Error(
                                "Failed to update submission service"
                            );
                        }
                    } catch (apiError) {
                        logger.error(
                            `Failed updating submission ${evaluationData.submissionId}`,
                            apiError
                        );

                        channel.sendToQueue(
                            queue.submissionCompleted,
                            Buffer.from(
                                JSON.stringify({
                                    results,
                                    submissionId:
                                        evaluationData.submissionId,
                                    problemId:
                                        evaluationData.problemData._id,
                                    status:
                                        ESubmissionStatus.Error,
                                })
                            )
                        );

                        channel.nack(data, false, true);
                        return;
                    }

                    channel.sendToQueue(
                        queue.submissionCompleted,
                        Buffer.from(
                            JSON.stringify({
                                results,
                                submissionId:
                                    evaluationData.submissionId,
                                problemId:
                                    evaluationData.problemData._id,
                                status: submissionStatus,
                                failedTestCase: errorFlag
                                    ? results[results.length - 1]
                                    : null,
                            })
                        )
                    );

                    logger.info(
                        `Finished processing submission: ${evaluationData.submissionId}`
                    );

                    channel.ack(data);
                } catch (processingError) {
                    logger.error(
                        "Error while processing queue message",
                        processingError
                    );

                    channel.nack(data, false, false);
                }
            }
        );

        logger.info("Worker started successfully");
    } catch (error) {
        logger.error("Failed to start worker", error);
    }
};