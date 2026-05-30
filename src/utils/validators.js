export function validateCPF(cpf) {
  const cleanCpf = cpf.replace(/\D/g, "");

  if (cleanCpf.length !== 11) return false;
  if (/(\d)\1{10}/.test(cleanCpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(cleanCpf[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cleanCpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cleanCpf[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cleanCpf[10])) return false;

  return true;
}

export function validateDateISO(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const [year, month, day] = date.split("-").map(Number);

  if (year < 1900) return false;

  const data = new Date(year, month - 1, day);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (
    data.getFullYear() !== year ||
    data.getMonth() !== month - 1 ||
    data.getDate() !== day
  ) {
    return false;
  }

  if (data > hoje) return false;

  return true;
}

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePassword(password) {
  return /^(?=.*\d).{8,}$/.test(password);
}
