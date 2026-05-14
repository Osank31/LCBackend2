import mongoose from "mongoose";
import { string } from "zod";

export interface ITestCase {
    input: string;
    output: string;
}

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    testCases: Array<ITestCase>
    editorial: string;
}

const testCaseSchema = new mongoose.Schema<ITestCase>({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    }
},  {
    toJSON: {
        transform: (_doc, ret)=>{
            const obj = ret as any
            
            delete obj._id
            delete obj.__v

            return obj
        }
    }
});

const problemSchema = new mongoose.Schema<IProblem>({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    difficulty: {
        type: String,
        required: [true, "Difficulty is required"],
    },
    editorial: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: [true, "Editorial is required"],
    },
    testCases: [testCaseSchema]
}, {
    timestamps: true
})


const Problem = mongoose.model<IProblem>("Problem", problemSchema)

export default Problem;