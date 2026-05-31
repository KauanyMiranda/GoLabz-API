import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { sendResetEmail, sendVerificationEmail } from "../utils/mailer.js";

export const register = async (req, res) => {
  try {
    const {
      nome,
      data_nascimento,
      email,
      password,
    } = req.body;

    const cpf = req.body.cpf?.replace(/\D/g, "");
    const celular = req.body.celular?.replace(/\D/g, "");

    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const [existingCpf] = await db.query(
      "SELECT id FROM users WHERE cpf = ?",
      [cpf]
    );
    if (existingCpf.length > 0) {
      return res.status(409).json({ error: "CPF já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      `INSERT INTO users 
      (nome, cpf, data_nascimento, celular, email, password_hash, email_verified, verification_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        cpf,
        data_nascimento,
        celular,
        email,
        hashedPassword,
        0,
        verificationToken,
      ]
    );

    const verifyLink = `golabz://VerifyEmail?token=${verificationToken}`;

    try {
      await sendVerificationEmail(email, verifyLink);
    } catch (mailErr) {
      console.error("Erro ao enviar e-mail de verificação:", mailErr.message);
      return res.status(500).json({ error: "Erro ao enviar e-mail de confirmação. Tente fazer login para reenviar." });
    }

    res.status(201).json({
      message: "Usuário criado com sucesso. Verifique seu e-mail para ativar sua conta.",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        id,
        nome,
        cpf,
        data_nascimento,
        celular,
        email,
        avatar_url,
        created_at
      FROM users
      WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    res.json(users[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { avatar_base64 } = req.body;

    if (!avatar_base64 || !avatar_base64.startsWith("data:image/")) {
      return res.status(400).json({ error: "Imagem inválida ou não enviada" });
    }

    await db.query(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatar_base64, req.user.id]
    );

    res.json({
      message: "Avatar atualizado com sucesso",
      avatar_url: avatar_base64,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nome, data_nascimento, celular, avatar_url } = req.body;

    const fields = [];
    const values = [];

    if (nome !== undefined) {
      fields.push("nome = ?");
      values.push(nome);
    }
    if (data_nascimento !== undefined) {
      fields.push("data_nascimento = ?");
      values.push(data_nascimento);
    }
    if (celular !== undefined) {
      fields.push("celular = ?");
      values.push(celular?.replace(/\D/g, ""));
    }
    if (avatar_url !== undefined) {
      fields.push("avatar_url = ?");
      values.push(avatar_url);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(req.user.id);

    await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [updatedUser] = await db.query(
      `SELECT
        id,
        nome,
        cpf,
        data_nascimento,
        celular,
        email,
        avatar_url
      FROM users
      WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser[0],
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.user.id]);
    res.json({ message: "Conta excluída com sucesso" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }

    const [users] = await db.query("SELECT id, nome, email FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.json({
        message: "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      });
    }

    const user = users[0];

    const token = jwt.sign(
      { userId: user.id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `golabz://ResetPassword?token=${token}`;

    try {
      await sendResetEmail(user.email, resetLink);
    } catch (mailErr) {
      console.error("Erro ao enviar e-mail:", mailErr.message);
      return res.status(500).json({ error: "Erro ao enviar e-mail de redefinição. Tente novamente mais tarde." });
    }

    res.json({
      message: "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    if (payload.type !== "password_reset") {
      return res.status(400).json({ error: "Token inválido" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      payload.userId,
    ]);

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
    }

    if (!/^(?=.*\d).{8,}$/.test(newPassword)) {
      return res.status(400).json({ error: "A nova senha deve ter no mínimo 8 caracteres e conter pelo menos um número" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, req.user.id]);

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório" });
    }

    const [users] = await db.query(
      "SELECT id FROM users WHERE verification_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    await db.query(
      "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?",
      [users[0].id]
    );

    res.json({ message: "E-mail confirmado com sucesso" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "E-mail é obrigatório" });
    }

    const [users] = await db.query(
      "SELECT id, nome, email, email_verified, verification_token FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.json({
        message: "Se o e-mail estiver cadastrado, você receberá as instruções de confirmação.",
      });
    }

    const user = users[0];

    if (user.email_verified) {
      return res.json({ message: "Este e-mail já foi confirmado." });
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "UPDATE users SET verification_token = ? WHERE id = ?",
      [newToken, user.id]
    );

    const verifyLink = `golabz://VerifyEmail?token=${newToken}`;

    try {
      await sendVerificationEmail(user.email, verifyLink);
    } catch (mailErr) {
      console.error("Erro ao reenviar e-mail de verificação:", mailErr.message);
      return res.status(500).json({ error: "Erro ao enviar e-mail de confirmação. Tente novamente mais tarde." });
    }

    res.json({
      message: "Se o e-mail estiver cadastrado, você receberá as instruções de confirmação.",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};