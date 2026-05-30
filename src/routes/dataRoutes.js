import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAllElements, getElementByNumber } from "../controllers/elementsController.js";
import { getFavorites, addFavorite, removeFavorite, checkFavorite, clearFavorites } from "../controllers/favoritesController.js";
import { getSearchHistory, addSearchHistory, clearSearchHistory } from "../controllers/searchHistoryController.js";
import { saveMolecule, getMoleculeByFormula } from "../controllers/moleculesController.js";

const router = express.Router();

router.get("/elements", getAllElements);
router.get("/elements/:number", getElementByNumber);

router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites", authMiddleware, addFavorite);
router.delete("/favorites/:nome", authMiddleware, removeFavorite);
router.get("/favorites/check/:nome", authMiddleware, checkFavorite);
router.delete("/favorites", authMiddleware, clearFavorites);

router.get("/search-history", authMiddleware, getSearchHistory);
router.post("/search-history", authMiddleware, addSearchHistory);
router.delete("/search-history", authMiddleware, clearSearchHistory);

router.post("/molecules", saveMolecule);
router.get("/molecules/:formula", getMoleculeByFormula);

export default router;
