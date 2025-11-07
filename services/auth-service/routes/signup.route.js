import express from "express";
import { signup } from "../controllers/signup_controller.js";

const router = express.Router();

router.post("/signup", signup);

export default router;
