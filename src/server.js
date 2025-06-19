const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const videoRoutes = require("./routes/videos");
const usersRoutes = require("./routes/users");
const authenticateToken = require("./Middleware/authMiddleware");

const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: "https://collab-vid-front.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const publicRoutes = [
  { method: "POST", path: "/videos" },
  { method: "POST", path: "/users/login" },
  { method: "POST", path: "/users/register" },
  { method: "POST", path: "/users/forgot-password" },
  { method: "POST", path: "/users/reset-password" },
];

app.use((req, res, next) => {
  const isPublic = publicRoutes.some(
    (route) => route.method === req.method && req.path.startsWith(route.path)
  );
  if (isPublic) return next();
  authenticateToken(req, res, next);
});

app.use("/videos", videoRoutes);
app.use("/users", usersRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
