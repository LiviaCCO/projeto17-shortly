import { Router } from "express";
import transactionsRouter from "./transactions.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();
router.use(authRouter);
router.use(transactionsRouter);

export default router