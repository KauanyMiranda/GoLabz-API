import {
  validateCPF,
  validateDateISO,
  validateEmail,
  validatePassword,
} from "../utils/validators.js";

export const validateRegister = (req, res, next) => {
  const errors = [];
  const { nome, cpf, data_nascimento, celular, email, password } = req.body;

  if (!nome || !nome.trim()) {
    errors.push({ field: "nome", message: "O nome é obrigatório" });
  }

  if (!cpf || !cpf.trim()) {
    errors.push({ field: "cpf", message: "O CPF é obrigatório" });
  } else if (!validateCPF(cpf)) {
    errors.push({ field: "cpf", message: "CPF inválido" });
  }

  if (!data_nascimento || !data_nascimento.trim()) {
    errors.push({
      field: "data_nascimento",
      message: "A data de nascimento é obrigatória",
    });
  } else if (!validateDateISO(data_nascimento)) {
    errors.push({
      field: "data_nascimento",
      message: "Data de nascimento inválida",
    });
  }

  if (!celular || !celular.trim()) {
    errors.push({ field: "celular", message: "O celular é obrigatório" });
  }

  if (!email || !email.trim()) {
    errors.push({ field: "email", message: "O e-mail é obrigatório" });
  } else if (!validateEmail(email)) {
    errors.push({ field: "email", message: "E-mail inválido" });
  }

  if (!password || !password.trim()) {
    errors.push({ field: "password", message: "A senha é obrigatória" });
  } else if (!validatePassword(password)) {
    errors.push({
      field: "password",
      message: "A senha deve ter no mínimo 8 caracteres e conter pelo menos um número",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
