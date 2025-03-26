const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, isInfluencer, channelName } = req.body;
  console.log(req.body);
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      isInfluencer,
      channelName,
    },
  });

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    isInfluencer: newUser.isInfluencer,
    channelName: newUser.channelName,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: "Usuário não encontrado" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ error: "Senha incorreta" });
  }

  const token = jwt.sign(
    { userId: user.id, isInfluencer: user.isInfluencer },
    "SECRET_KEY",
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      isInfluencer: user.isInfluencer,
      channelName: user.channelName,
    },
  });
});

// Endpoint para editar o nome, email e status de influenciador
router.put("/edit/:id", async (req, res) => {
  const { name, email, isInfluencer } = req.body;
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      name: name || user.name,
      email: email || user.email,
      isInfluencer:
        isInfluencer !== undefined ? isInfluencer : user.isInfluencer,
    },
  });

  res.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    isInfluencer: updatedUser.isInfluencer,
  });
});

router.put("/edit-password/:id", async (req, res) => {
  console.log("caiu aqui");
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;

  console.log(id);

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Senha atual incorreta" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: {
      password: hashedPassword,
    },
  });

  res.json({
    id: updatedUser.id,
    message: "Senha atualizada com sucesso",
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(400).json({ error: "Usuário não encontrado" });
  }

  const token = jwt.sign({ userId: user.id }, "SECRET_KEY", {
    expiresIn: "1h",
  });

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "rodrigors.dev@gmail.com",
    to: email,
    subject: "Recuperação de senha",
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Erro ao enviar email de recuperação" });
    }
    res.json({ message: "Email enviado com sucesso!" });
  });
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    const userId = decoded.userId;

    if (!password) {
      return res.status(400).json({ error: "Nova senha é obrigatória" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "Token inválido ou expirado" });
  }
});

module.exports = router;
