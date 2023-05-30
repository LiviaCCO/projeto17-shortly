import { Router } from "express";
import { signUpSchema, loginSchema } from "../schemas/auth.schemas.js";
import { login, signUp } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(signUpSchema), signUp);
authRouter.post("/signin", validateSchema(loginSchema), login);

export default authRouter;