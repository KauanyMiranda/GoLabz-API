import { db } from "../db.js";

export const saveMolecule = async (req, res) => {
  try {
    const {
      nome_comum,
      nomenclatura,
      formula_molecular,
      smiles,
      massa_molar,
      aparencia,
      densidade,
      ponto_fusao,
      ponto_ebulicao,
      solubilidade,
      principais_riscos,
      nfpa_704,
      frases_r,
      frases_s,
      ponto_fulgor,
      inflamavel,
      composto,
      classificacao_organica_geral,
      classificacao_inorganica_geral,
      funcao_quimica_especifica,
      tipo_saturacao,
      tipo_cadeia,
      tipo_cadeia_carbonica,
    } = req.body;

    await db.query(
      `INSERT INTO molecules (
        nome_comum, nomenclatura, formula_molecular, smiles, massa_molar,
        aparencia, densidade, ponto_fusao, ponto_ebulicao, solubilidade,
        principais_riscos, nfpa_704, frases_r, frases_s, ponto_fulgor,
        inflamavel, composto, classificacao_organica_geral,
        classificacao_inorganica_geral, funcao_quimica_especifica,
        tipo_saturacao, tipo_cadeia, tipo_cadeia_carbonica
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nome_comum = VALUES(nome_comum),
        nomenclatura = VALUES(nomenclatura),
        smiles = VALUES(smiles),
        massa_molar = VALUES(massa_molar),
        aparencia = VALUES(aparencia),
        densidade = VALUES(densidade),
        ponto_fusao = VALUES(ponto_fusao),
        ponto_ebulicao = VALUES(ponto_ebulicao),
        solubilidade = VALUES(solubilidade),
        principais_riscos = VALUES(principais_riscos),
        nfpa_704 = VALUES(nfpa_704),
        frases_r = VALUES(frases_r),
        frases_s = VALUES(frases_s),
        ponto_fulgor = VALUES(ponto_fulgor),
        inflamavel = VALUES(inflamavel),
        composto = VALUES(composto),
        classificacao_organica_geral = VALUES(classificacao_organica_geral),
        classificacao_inorganica_geral = VALUES(classificacao_inorganica_geral),
        funcao_quimica_especifica = VALUES(funcao_quimica_especifica),
        tipo_saturacao = VALUES(tipo_saturacao),
        tipo_cadeia = VALUES(tipo_cadeia),
        tipo_cadeia_carbonica = VALUES(tipo_cadeia_carbonica)`,
      [
        nome_comum || null,
        nomenclatura || null,
        formula_molecular || null,
        smiles || null,
        massa_molar || null,
        aparencia || null,
        densidade || null,
        ponto_fusao || null,
        ponto_ebulicao || null,
        solubilidade || null,
        JSON.stringify(principais_riscos || null),
        JSON.stringify(nfpa_704 || null),
        JSON.stringify(frases_r || null),
        JSON.stringify(frases_s || null),
        ponto_fulgor || null,
        inflamavel || null,
        composto || null,
        classificacao_organica_geral || null,
        classificacao_inorganica_geral || null,
        funcao_quimica_especifica || null,
        tipo_saturacao || null,
        tipo_cadeia || null,
        tipo_cadeia_carbonica || null,
      ]
    );

    const [rows] = await db.query(
      "SELECT id FROM molecules WHERE formula_molecular = ?",
      [formula_molecular]
    );

    res.status(201).json({ id: rows[0]?.id, message: "Molécula salva com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMoleculeByFormula = async (req, res) => {
  try {
    const { formula } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM molecules WHERE formula_molecular = ?",
      [formula]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Molécula não encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
