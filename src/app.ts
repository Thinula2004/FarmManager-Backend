import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import farmRoutes from "./routes/farmRoutes";
import animalRoutes from "./routes/animalRoutes";
import batchRoutes from "./routes/batchRoutes";
import feedRoutes from "./routes/feedRoutes";
import visitRoutes from "./routes/visitRoutes";
import userRoutes from "./routes/userRoutes";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Farm Manager API",
            version: "1.0.0",
            description: "API documentation",
        },
    },
    apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/animal", animalRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/visit", visitRoutes);

export default app;