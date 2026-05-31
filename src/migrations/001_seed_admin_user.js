import "dotenv/config";
import { db } from "../db.js";
import bcrypt from "bcrypt";

async function migrate() {
  try {
    const email = "kauany.m.dantas@gmail.com";
    const plainPassword = "kauany123";

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      console.log("⚠️  Usuário administrador já existe. Pulando migration...");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await db.query(
      `INSERT INTO users (nome, cpf, data_nascimento, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
      ["Administrador", "05876201294", "2000-01-01", email, passwordHash]
    );

    console.log("✅ Usuário administrador criado com sucesso!");
    console.log(`   Email: ${email}`);
  } catch (err) {
    console.error("❌ Erro ao executar migration:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
