import express from "express";
import * as dotenv from 'dotenv';
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js"
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({ path: "./.env.dev" });

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true   // accept cookies
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(userRouter);

app.get("/", (req, res) => {
    res.send("backend root");
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, "localhost", (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on port", server.address().port);
});
