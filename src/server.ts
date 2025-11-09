import { app } from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Bumi backend running on http://localhost:${config.port}`);
});
