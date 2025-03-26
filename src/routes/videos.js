const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const videos = await prisma.video.findMany();
  res.json(videos);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isNaN(id) && id.length !== 36) {
    return res.status(400).json({ error: "ID must be a valid UUID" });
  }

  const videos = await prisma.video.findMany({
    where: {
      userId: id,
    },
  });

  res.json(videos);
});

router.post("/", async (req, res) => {
  const { title, url, description, influencerId, senderName } = req.body;

  const userExists = await prisma.user.findUnique({
    where: { id: influencerId },
  });

  if (!userExists) {
    return res.status(400).json({ error: "Usuário não encontrado" });
  }

  const newVideo = await prisma.video.create({
    data: {
      title,
      url,
      description,
      senderName,
      userId: influencerId,
    },
  });

  res.status(201).json(newVideo);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.video.delete({ where: { id: parseInt(id, 10) } });
  res.status(204).send();
});

module.exports = router;
