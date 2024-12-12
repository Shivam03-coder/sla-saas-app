import cors from "cors";
import express, { NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import { ApiError } from "./helpers/server-functions";
import { AppRouter } from "./routes/user-auth.routers";
export const app = express();
import cookieParser from "cookie-parser";
import { passport} from "@src/libs/passport-jwt";

// MIDDLE WARES

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ROUTES

app.use("/auth", AppRouter);

//GLOBAL ERROR HANDLER

app.use((err: ApiError, _req: any, res: any, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.json({
      message: err.message,
      statusCode: err.statusCode,
      status: "failed",
    });
  }
});
