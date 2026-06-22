import {Hono} from "hono";
import { seedEngine } from "../controllers/seed.controller";

const router = new Hono();


router.post("/", seedEngine);


export default router;

