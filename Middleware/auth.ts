import { Request, Response, NextFunction, Errback } from "express"
import jwt from "jsonwebtoken";

const auth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers['access-token'];

        if (!token) {
            res.status(401).json({ data: "Token not Found" })
            return
        }

        const decode = jwt.verify(token as string, process.env.JWT_SECRETE as string);

        if (!decode) {
            res.status(401).json({ data: "Token Expired" })
            return
        }
        next()
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res
                .status(401)
                .json({ message: "Token expired", tokenExpired: true });
            return;
        }
    }

}

export default auth