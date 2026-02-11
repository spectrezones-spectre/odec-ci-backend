import "./config/environment.js";
import app from "./app.js";

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`ODEC backend ready on port ${PORT}`);
});
