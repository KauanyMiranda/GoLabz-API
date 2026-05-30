import { db } from "../db.js";

export const getSearchHistory = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const [rows] = await db.query(
      `SELECT * FROM user_search_history
       WHERE user_id = ?
       ORDER BY \`timestamp\` DESC
       LIMIT ?`,
      [req.user.id, limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSearchHistory = async (req, res) => {
  try {
    const { nome, formula, tipo, molecule, timestamp } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    await db.query(
      "DELETE FROM user_search_history WHERE user_id = ? AND nome = ?",
      [req.user.id, nome]
    );

    await db.query(
      `INSERT INTO user_search_history (user_id, nome, formula, tipo, molecule, \`timestamp\`)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        nome,
        formula || null,
        tipo || null,
        JSON.stringify(molecule || null),
        timestamp || Date.now(),
      ]
    );

    res.status(201).json({ message: "Pesquisa salva" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearSearchHistory = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM user_search_history WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ message: "Histórico limpo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
