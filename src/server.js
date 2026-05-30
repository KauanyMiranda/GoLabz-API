import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import { initDatabase } from "./initDb.js";
import { testConnection } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/", dataRoutes);

app.get("/", (req, res) => {
  res.send("API rodando 🚀 - Documentação em /docs");
});

app.listen(3000, async () => {
  try {
    await testConnection();
    await initDatabase();
    console.log("Servidor rodando na porta 3000");
  } catch (err) {
    console.error("❌ Falha ao iniciar servidor:", err.message);
    process.exit(1);
  }
});