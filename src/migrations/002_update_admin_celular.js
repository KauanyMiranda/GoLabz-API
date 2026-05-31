import "dotenv/config";
import { db } from "../db.js";

async function migrate() {
  try {
    const email = "kauany.m.dantas@gmail.com";
    const celular = "69993721227";

    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      console.log("⚠️  Usuário administrador não encontrado. Pulando migration...");
      process.exit(0);
    }

    await db.query(
      "UPDATE users SET celular = ? WHERE email = ?",
      [celular, email]
    );

    console.log("✅ Celular do administrador atualizado com sucesso!");
    console.log(`   Email: ${email}`);
    console.log(`   Celular: ${celular}`);
  } catch (err) {
    console.error("❌ Erro ao executar migration:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
