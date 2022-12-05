import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js"
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./database/dbWrapper.js";
import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.dev" });    // load .env file

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true                   // accept cookies
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());                      // set security headers

// setup req rate limiting
const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 80
});
app.use(generalLimiter);

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 6, // Limit each IP to 6 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/auth/login", authLimiter);

app.use(authRouter);
app.use(userRouter);


// last middleware handles not found
app.use(function (req, res){
	res.sendStatus(404);
});

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, HOST, (error) => {
    if (error) console.log(error);
    console.log("Server is running on port", server.address().port);
    db.setupConnectionPooling();           // use DB connection pool
});
