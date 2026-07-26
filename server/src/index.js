import express, { json, urlencoded } from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./config/db_connect.js";
import authRoutes from "./routes/auth_routes.js";
import { globalLimiter } from "./middleware/rate_limiter.js";
import globalErrorHandler from "./controllers/error_controller.js";

dotenv.config();
dbConnect();

const app = express();


// Middleware
const corsOptions = {
    origin: [process.env.FRONTEND_ORIGIN || "http://localhost:5173"],
    credentials: true
}
app.use(cors(corsOptions));
app.use(globalLimiter);

app.use(json({limit: "10kb"}));
app.use(urlencoded({limit: "10kb", extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 6
    }
}));

app.use(cookieParser());
app.use("/app/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

app.use(globalErrorHandler);

// port
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});