import { Hono } from "hono";
import seedRoutes from "./routes/seed.routes";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Safari Seeder");
});

app.route("/seed", seedRoutes);

export default {
  port: 3002,
  fetch: app.fetch
};
