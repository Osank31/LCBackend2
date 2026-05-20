export interface AppError extends Error {
    statusCode: number;
    message: string;
}

export class InternalServerError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=500, name="Internal Server Error") {
        this.statusCode=statusCode
        this.message=message
        this.name=name
    }
}

export class BadRequestError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=400, name="BadRequestError") {
        this.statusCode=statusCode 
        this.message=message
        this.name=name 
    }
}

export class NotFoundError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=404, name="NotFoundError") {
        this.statusCode=statusCode
        this.message=message
        this.name=name
    }
}

export class UnauthorizedError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=401, name="Unauthorized Error") {
        this.statusCode=statusCode 
        this.message=message
        this.name=name
    }
}

export class ForbiddenError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=403, name="ForbiddenError") {
        this.statusCode=statusCode 
        this.message=message
        this.name=name 
    }
}

export class ConflictError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=409, name="ConflictError") {
        this.statusCode=statusCode
        this.message=message
        this.name=name
    }
}

export class NotImplementedError implements AppError {
    statusCode: number;
    message: string;
    name: string;

    constructor( message: string, statusCode=501, name="NotImplementedError") {
        this.statusCode=statusCode || 501
        this.message=message
        this.name=name || "NotImplementedError"
    }
}