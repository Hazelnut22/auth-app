import express, { json, urlencoded } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/db_connect.js";
import authRoutes from "./routes/auth_routes.js";
import { globalLimiter } from "./middleware/rate_limiter.js";

dotenv.config();
dbConnect();

const app = express();


// Middleware
const corsOptions = {
    origin: ["http://localhost:3001"],
    credentials: true
}
app.use(cors(corsOptions));
app.use(globalLimiter);

app.use(json({limit: "100mb"}));
app.use(urlencoded({limit: "100mb", extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 6
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/app/auth", authRoutes);

// port
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});