import OpenAI from "openai";
import { OPENAI_API_KEY } from "../constants/constants.js";

const client = new OpenAI({
    apiKey: OPENAI_API_KEY
})

export const createEmbedding = async (text: string) => {
    const response = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text
    })

    return response.data[0].embedding
}