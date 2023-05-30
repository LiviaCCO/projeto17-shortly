import { Router } from "express";
import { createShorten, getId, getUrl, deleteId, getUser, getRanking } from "../controllers/transaction.controllers.js";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import authValidation from "../middlewares/authValidation.middleware.js";
import { urlSchema, idSchema } from "../schemas/schemas.js";

const transactionsRouter = Router();

transactionsRouter.post("/urls/shorten", authValidation, validateSchema(urlSchema), createShorten);
transactionsRouter.get("/urls/:id", getId);
transactionsRouter.get("/urls/open/:shortUrl", getUrl);
transactionsRouter.delete("/urls/:id", authValidation, validateSchema(idSchema), deleteId);
transactionsRouter.get("/users/me", authValidation, getUser);
transactionsRouter.get("/ranking", getRanking);

export default transactionsRouter