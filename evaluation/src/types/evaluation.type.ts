export interface ITestCase {
    input: string;
    output: string;
}

export enum ELanguage {
    py = "py",
    cpp = "cpp",
}

export enum ESubmissionStatus {
    Pending = "Pending",
    Accepted = "Accepted",
}

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    testCases: Array<ITestCase>
    editorial: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEvaluationData {
    problemData : IProblem;
    code: string;
    language: ELanguage;
    status: ESubmissionStatus;
}