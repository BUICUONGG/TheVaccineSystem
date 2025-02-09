import express from "express";
import "dotenv/config";
import usersRouter from "./src/routes/users.routers.js";
<<<<<<< HEAD
import vaccineRouter from "./src/routes/vaccines.routers.js";
=======
import vaccinesRouter from "./src/routes/vaccines.routers.js";
>>>>>>> 3654e8f213246ad6d227d96de6db58dfcfa03805
import connectToDatabase from "./src/config/database.js";

const app = express();
app.use(express.json());
const PORT = 8080 || process.env.MONGO_URI;

connectToDatabase.connect();
// Route mặc định
app.get("", async (req, res) => {
  console.log("Nothing");
  res.send("Hello World");
});

// Routes API hiện tại
<<<<<<< HEAD
app.use("/user", usersRouter);
app.use("/vaccine", vaccineRouter);
=======
//app.use("/user", usersRouter);
app.use("/vaccine", vaccinesRouter);
>>>>>>> 3654e8f213246ad6d227d96de6db58dfcfa03805
// app.use("/admin", adminRouter);
// app.use('staff', staffRouter);

// Route Swagger UI

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
