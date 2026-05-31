import crypto from "crypto";
import nodemailer from "nodemailer";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP não configurado. Verifique as variáveis de ambiente.");
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendResetEmail(to, resetLink) {
  const t = await getTransporter();
  const from = process.env.SMTP_FROM || "GoLabz <no-reply@golabz.com>";

const info = await t.sendMail({
  from,
  to,
  subject: "Redefina sua senha - GoLabz",
  text: `Recebemos uma solicitação para redefinir a senha da sua conta GoLabz.

Acesse o link abaixo para criar uma nova senha:
${resetLink}

Este link é válido por 15 minutos.

Se você não fez essa solicitação, ignore este e-mail.`,

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
      <h2 style="color: #6E5BD7;">Redefina sua senha</h2>

      <p>Recebemos uma solicitação para redefinir a senha da sua conta <strong>GoLabz</strong>.</p>

      <p>Clique no botão abaixo para criar uma nova senha:</p>

      <a
        href="${resetLink}"
        style="
          display: inline-block;
          background-color: #6E5BD7;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
        "
      >
        Redefinir senha
      </a>

      <p style="margin-top: 24px;">
        Este link é válido por <strong>15 minutos</strong>.
      </p>

      <p style="font-size: 14px; color: #666;">
        Se você não solicitou a redefinição de senha, pode ignorar este e-mail.
      </p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #999;">
        Caso o botão não funcione, copie e cole o link abaixo no navegador:
      </p>

      <p style="font-size: 12px; word-break: break-all; color: #666;">
        ${resetLink}
      </p>
    </div>
  `,
});
  console.log("📨 E-mail de redefinição enviado:", info.messageId);
  return info;
}

export async function sendVerificationEmail(to, verifyLink) {
  const t = await getTransporter();
  const from = process.env.SMTP_FROM || "GoLabz <no-reply@golabz.com>";

  const info = await t.sendMail({
    from,
    to,
    subject: "Confirme seu e-mail - GoLabz",

    text: `Bem-vindo(a) ao GoLabz!

Para concluir seu cadastro e ativar sua conta, acesse o link abaixo:

${verifyLink}

Este link é válido por 24 horas.

Se você não criou uma conta no GoLabz, ignore este e-mail.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
        <h2 style="color: #6E5BD7;">Confirme seu e-mail</h2>

        <p>Seja bem-vindo(a) ao <strong>GoLabz</strong>!</p>

        <p>
          Para concluir seu cadastro e ativar sua conta, clique no botão abaixo:
        </p>

        <a
          href="${verifyLink}"
          style="
            display: inline-block;
            background-color: #6E5BD7;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Confirmar e-mail
        </a>

        <p style="margin-top: 24px;">
          Este link é válido por <strong>24 horas</strong>.
        </p>

        <p style="font-size: 14px; color: #666;">
          Após a confirmação, sua conta estará pronta para uso.
        </p>

        <p style="font-size: 14px; color: #666;">
          Se você não criou uma conta no GoLabz, pode ignorar este e-mail.
        </p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #999;">
          Caso o botão não funcione, copie e cole o link abaixo no navegador:
        </p>

        <p style="font-size: 12px; word-break: break-all; color: #666;">
          ${verifyLink}
        </p>
      </div>
    `,
  });

  console.log("📨 E-mail de verificação enviado:", info.messageId);
  return info;
}
