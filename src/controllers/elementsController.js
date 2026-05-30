import { db } from "../db.js";

export const getAllElements = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM elements ORDER BY atomic_number ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getElementByNumber = async (req, res) => {
  try {
    const { number } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM elements WHERE atomic_number = ?",
      [number]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Elemento não encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
