import mongoose, { Document } from "mongoose";
import { createEmbedding } from "../utils/openai.embedding";

export interface ITestCase {
    input: string;
    output: string;
}

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    testCases: ITestCase[];
    editorial: string;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date;
}

const testCaseSchema = new mongoose.Schema<ITestCase>(
    {
        input: { type: String, required: true },
        output: { type: String, required: true },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                const obj = ret as any;
                delete obj._id;
                delete obj.__v;
                return obj;
            },
        },
    }
);

const problemSchema = new mongoose.Schema<IProblem>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },

        difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"],
        },

        editorial: { type: String, default: "" },

        embedding: {
            type: [Number],
            default: [],
            index: false,
        },

        testCases: [testCaseSchema],
    },
    { timestamps: true }
);

problemSchema.pre("save", async function (this: IProblem) {
    if (!this.embedding?.length) {
        const embeddingText = `
            Title: ${this.title}
            Description: ${this.description}
            Difficulty: ${this.difficulty}
        `;

        this.embedding = await createEmbedding(embeddingText);
    }
});

const Problem = mongoose.model<IProblem>("Problem", problemSchema);

export default Problem;