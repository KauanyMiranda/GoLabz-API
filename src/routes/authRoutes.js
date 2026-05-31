import express from "express";

import { register, login, getMe, updateProfile, uploadAvatar, deleteAccount, forgotPassword, resetPassword, changePassword, verifyEmail, resendVerificationEmail } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRegister } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, cpf, data_nascimento, celular, email, password]
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: "Formato YYYY-MM-DD"
 *               celular:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "Mínimo 8 caracteres e pelo menos 1 número"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 *       500:
 *         description: Erro interno
 */
router.post("/register", validateRegister, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login e retorna um JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna os dados do usuário logado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/me", authMiddleware, getMe);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Atualiza o perfil do usuário logado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               celular:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno
 */
/**
 * @swagger
 * /auth/avatar:
 *   post:
 *     summary: Atualiza o avatar do usuário logado (base64)
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar_base64:
 *                 type: string
 *                 description: Imagem em base64 (data:image/jpeg;base64,...)
 *     responses:
 *       200:
 *         description: Avatar atualizado com sucesso
 *       400:
 *         description: Imagem inválida
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno
 */
router.post("/avatar", authMiddleware, uploadAvatar);

/**
 * @swagger
 * /auth/account:
 *   delete:
 *     summary: Exclui a conta do usuário logado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno
 */
router.delete("/account", authMiddleware, deleteAccount);

router.put("/profile", authMiddleware, updateProfile);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Instruções enviadas (se o e-mail existir)
 *       400:
 *         description: E-mail não informado
 *       500:
 *         description: Erro interno
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando o token recebido por e-mail
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT enviado por e-mail
 *               password:
 *                 type: string
 *                 description: Nova senha (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido, expirado ou senha muito curta
 *       500:
 *         description: Erro interno
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Altera a senha do usuário logado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Senha atual do usuário
 *               newPassword:
 *                 type: string
 *                 description: Nova senha (mínimo 8 caracteres e pelo menos 1 número)
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta ou token inválido
 *       500:
 *         description: Erro interno
 */
router.put("/change-password", authMiddleware, changePassword);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Confirma o e-mail do usuário via token
 *     tags: [Autenticação]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E-mail confirmado com sucesso
 *       400:
 *         description: Token inválido ou não fornecido
 *       500:
 *         description: Erro interno
 */
router.get("/verify-email", verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenvia o e-mail de confirmação de cadastro
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Instruções enviadas (se o e-mail existir)
 *       400:
 *         description: E-mail não informado
 *       500:
 *         description: Erro interno
 */
router.post("/resend-verification", resendVerificationEmail);

export default router;
