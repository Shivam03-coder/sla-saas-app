import { Request, Response, NextFunction } from "express";

//  AsyncHandler

export const AsyncHandler = (
  asyncFunction: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

//API ERROR FUNCTION

export class ApiError extends Error {
  statusCode: number;
  status: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.status = statusCode > 400 && statusCode < 500 ? "fail" : "error";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

//API RESPOSNE FUNCTION

export class ApiResponse {
  status: string;
  statuscode: number;
  message: string;
  data?: any;

  constructor(statuscode: number, message: string, data?: any) {
    this.status = "Sucess";
    this.statuscode = statuscode;
    this.message = message;
    this.data = data;
  }
}
