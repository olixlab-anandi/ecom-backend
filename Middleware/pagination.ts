import { Request, Response, NextFunction } from "express";

export const pagination = (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) ;
    const page = parseInt(req.query.page as string) ;

    // Use type assertion to avoid TS error
    (req as any).pagination = {
        limit,
        skip: (page - 1) * limit,
    };

    next();
};
