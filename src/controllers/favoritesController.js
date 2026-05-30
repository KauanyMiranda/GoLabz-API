import { db } from "../db.js";

export const getFavorites = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { nome, formula, tipo, molecule } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    await db.query(
      `INSERT INTO user_favorites (user_id, nome, formula, tipo, molecule)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       formula = VALUES(formula), tipo = VALUES(tipo), molecule = VALUES(molecule), created_at = CURRENT_TIMESTAMP`,
      [req.user.id, nome, formula || null, tipo || null, JSON.stringify(molecule || null)]
    );

    res.status(201).json({ message: "Favorito adicionado" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { nome } = req.params;

    await db.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND nome = ?",
      [req.user.id, nome]
    );

    res.json({ message: "Favorito removido" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { nome } = req.params;

    const [rows] = await db.query(
      "SELECT id FROM user_favorites WHERE user_id = ? AND nome = ?",
      [req.user.id, nome]
    );

    res.json({ isFavorite: rows.length > 0 });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const clearFavorites = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM user_favorites WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ message: "Favoritos limpos" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
