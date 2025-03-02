const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const videoRoutes = require("./routes/videos");
const usersRoutes = require("./routes/users");
const sendEmail = require("./routes/sendEmail");
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/videos", videoRoutes);
app.use("/users", usersRoutes);
app.use("/send-email", sendEmail);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
