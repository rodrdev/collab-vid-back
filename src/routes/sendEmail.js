const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rodrigors.dev@gmail.com",
    pass: "cjbo dvdw lvsw xcvz", // Certifique-se de substituir por uma senha válida
  },
});

router.post("/", async (req, res) => {
  const { to, subject, text } = req.body;
  console.log("bateu aqui", to, subject, text);

  if (!to || !subject) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const emailContent = `
    <html>
      <body>
        <a href="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTlqOW1kcmlkM3kxdnBhMTNxbnJ4MzFmamIxa3owMDdheW5ocGRoaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H1dxi6xdh4NGQCZSvz/giphy.gif" target="_blank">
          <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTlqOW1kcmlkM3kxdnBhMTNxbnJ4MzFmamIxa3owMDdheW5ocGRoaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H1dxi6xdh4NGQCZSvz/giphy.gif" alt="Vídeo" width="320" height="240" />
        </a>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Rod" <rodrigors.dev@gmail.com>',
      to,
      subject,
      html: emailContent,
    });

    res.json({ message: "E-mail enviado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao enviar e-mail", details: error.message });
  }
});

module.exports = router;
