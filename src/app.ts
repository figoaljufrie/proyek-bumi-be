import express from "express";
import cors from "cors";
import { config } from "./config";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_, res) => {
  res.send(`Bumi API is running in ${config.nodeEnv} mode`);
});
