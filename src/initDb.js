import { db } from "./db.js";

export async function initDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(11) UNIQUE,
        data_nascimento DATE,
        celular VARCHAR(15),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url LONGTEXT,
        email_verified TINYINT(1) DEFAULT 0,
        verification_token VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migração: adiciona colunas de verificação de e-mail se não existirem
    try {
      await db.query(`ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0`);
    } catch (e) {
      if (!e.message.includes("Duplicate column")) throw e;
    }
    try {
      await db.query(`ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL`);
    } catch (e) {
      if (!e.message.includes("Duplicate column")) throw e;
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS elements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        atomic_number INT NOT NULL UNIQUE,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        mass VARCHAR(20),
        category VARCHAR(50),
        \`group\` INT,
        period INT
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        formula VARCHAR(255),
        tipo VARCHAR(100),
        molecule JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_favorite (user_id, nome)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        formula VARCHAR(255),
        tipo VARCHAR(100),
        molecule JSON,
        \`timestamp\` BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS molecules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_comum VARCHAR(255),
        nomenclatura VARCHAR(255),
        formula_molecular VARCHAR(255) UNIQUE,
        smiles VARCHAR(500),
        massa_molar VARCHAR(50),
        aparencia VARCHAR(255),
        densidade VARCHAR(50),
        ponto_fusao VARCHAR(50),
        ponto_ebulicao VARCHAR(50),
        solubilidade VARCHAR(255),
        principais_riscos JSON,
        nfpa_704 JSON,
        frases_r JSON,
        frases_s JSON,
        ponto_fulgor VARCHAR(50),
        inflamavel VARCHAR(50),
        composto VARCHAR(100),
        classificacao_organica_geral VARCHAR(255),
        classificacao_inorganica_geral VARCHAR(255),
        funcao_quimica_especifica VARCHAR(255),
        tipo_saturacao VARCHAR(100),
        tipo_cadeia VARCHAR(100),
        tipo_cadeia_carbonica VARCHAR(100)
      )
    `);

    const [elementsCount] = await db.query("SELECT COUNT(*) as count FROM elements");
    if (elementsCount[0].count === 0) {
      await seedElements();
    }

    console.log("✅ Banco de dados inicializado");
  } catch (err) {
    console.error("❌ Erro ao inicializar banco:", err.message);
  }
}

async function seedElements() {
  const elements = [
    [1,"H","Hidrogênio","1.008","nonmetal",1,1],
    [2,"He","Hélio","4.0026","noble-gas",18,1],
    [3,"Li","Lítio","6.94","alkali-metal",1,2],
    [4,"Be","Berílio","9.0122","alkaline-earth",2,2],
    [5,"B","Boro","10.81","metalloid",13,2],
    [6,"C","Carbono","12.011","nonmetal",14,2],
    [7,"N","Nitrogênio","14.007","nonmetal",15,2],
    [8,"O","Oxigênio","15.999","nonmetal",16,2],
    [9,"F","Flúor","18.998","halogen",17,2],
    [10,"Ne","Neônio","20.180","noble-gas",18,2],
    [11,"Na","Sódio","22.990","alkali-metal",1,3],
    [12,"Mg","Magnésio","24.305","alkaline-earth",2,3],
    [13,"Al","Alumínio","26.982","other-metal",13,3],
    [14,"Si","Silício","28.085","metalloid",14,3],
    [15,"P","Fósforo","30.974","nonmetal",15,3],
    [16,"S","Enxofre","32.06","nonmetal",16,3],
    [17,"Cl","Cloro","35.45","halogen",17,3],
    [18,"Ar","Argônio","39.948","noble-gas",18,3],
    [19,"K","Potássio","39.098","alkali-metal",1,4],
    [20,"Ca","Cálcio","40.078","alkaline-earth",2,4],
    [21,"Sc","Escândio","44.956","transition-metal",3,4],
    [22,"Ti","Titânio","47.867","transition-metal",4,4],
    [23,"V","Vanádio","50.942","transition-metal",5,4],
    [24,"Cr","Crômio","51.996","transition-metal",6,4],
    [25,"Mn","Manganês","54.938","transition-metal",7,4],
    [26,"Fe","Ferro","55.845","transition-metal",8,4],
    [27,"Co","Cobalto","58.933","transition-metal",9,4],
    [28,"Ni","Níquel","58.693","transition-metal",10,4],
    [29,"Cu","Cobre","63.546","transition-metal",11,4],
    [30,"Zn","Zinco","65.38","transition-metal",12,4],
    [31,"Ga","Gálio","69.723","other-metal",13,4],
    [32,"Ge","Germânio","72.630","metalloid",14,4],
    [33,"As","Arsênio","74.922","metalloid",15,4],
    [34,"Se","Selênio","78.971","nonmetal",16,4],
    [35,"Br","Bromo","79.904","halogen",17,4],
    [36,"Kr","Criptônio","83.798","noble-gas",18,4],
    [37,"Rb","Rubídio","85.468","alkali-metal",1,5],
    [38,"Sr","Estrôncio","87.62","alkaline-earth",2,5],
    [39,"Y","Ítrio","88.906","transition-metal",3,5],
    [40,"Zr","Zircônio","91.224","transition-metal",4,5],
    [41,"Nb","Nióbio","92.906","transition-metal",5,5],
    [42,"Mo","Molibdênio","95.95","transition-metal",6,5],
    [43,"Tc","Tecnécio","98","transition-metal",7,5],
    [44,"Ru","Rutênio","101.07","transition-metal",8,5],
    [45,"Rh","Ródio","102.91","transition-metal",9,5],
    [46,"Pd","Paládio","106.42","transition-metal",10,5],
    [47,"Ag","Prata","107.87","transition-metal",11,5],
    [48,"Cd","Cádmio","112.41","transition-metal",12,5],
    [49,"In","Índio","114.82","other-metal",13,5],
    [50,"Sn","Estanho","118.71","other-metal",14,5],
    [51,"Sb","Antimônio","121.76","metalloid",15,5],
    [52,"Te","Telúrio","127.60","metalloid",16,5],
    [53,"I","Iodo","126.90","halogen",17,5],
    [54,"Xe","Xenônio","131.29","noble-gas",18,5],
    [55,"Cs","Césio","132.91","alkali-metal",1,6],
    [56,"Ba","Bário","137.33","alkaline-earth",2,6],
    [57,"La","Lantânio","138.91","lanthanide",3,6],
    [58,"Ce","Cério","140.12","lanthanide",null,9],
    [59,"Pr","Praseodímio","140.91","lanthanide",null,9],
    [60,"Nd","Neodímio","144.24","lanthanide",null,9],
    [61,"Pm","Promécio","145","lanthanide",null,9],
    [62,"Sm","Samário","150.36","lanthanide",null,9],
    [63,"Eu","Európio","151.96","lanthanide",null,9],
    [64,"Gd","Gadolínio","157.25","lanthanide",null,9],
    [65,"Tb","Térbio","158.93","lanthanide",null,9],
    [66,"Dy","Disprósio","162.50","lanthanide",null,9],
    [67,"Ho","Hólmio","164.93","lanthanide",null,9],
    [68,"Er","Érbio","167.26","lanthanide",null,9],
    [69,"Tm","Túlio","168.93","lanthanide",null,9],
    [70,"Yb","Itérbio","173.05","lanthanide",null,9],
    [71,"Lu","Lutécio","174.97","lanthanide",null,9],
    [72,"Hf","Háfnio","178.49","transition-metal",4,6],
    [73,"Ta","Tântalo","180.95","transition-metal",5,6],
    [74,"W","Tungstênio","183.84","transition-metal",6,6],
    [75,"Re","Rênio","186.21","transition-metal",7,6],
    [76,"Os","Ósmio","190.23","transition-metal",8,6],
    [77,"Ir","Irídio","192.22","transition-metal",9,6],
    [78,"Pt","Platina","195.08","transition-metal",10,6],
    [79,"Au","Ouro","196.97","transition-metal",11,6],
    [80,"Hg","Mercúrio","200.59","transition-metal",12,6],
    [81,"Tl","Tálio","204.38","other-metal",13,6],
    [82,"Pb","Chumbo","207.2","other-metal",14,6],
    [83,"Bi","Bismuto","208.98","other-metal",15,6],
    [84,"Po","Polônio","209","metalloid",16,6],
    [85,"At","Astato","210","halogen",17,6],
    [86,"Rn","Radônio","222","noble-gas",18,6],
    [87,"Fr","Frâncio","223","alkali-metal",1,7],
    [88,"Ra","Rádio","226","alkaline-earth",2,7],
    [89,"Ac","Actínio","227","actinide",3,7],
    [90,"Th","Tório","232.04","actinide",null,10],
    [91,"Pa","Protactínio","231.04","actinide",null,10],
    [92,"U","Urânio","238.03","actinide",null,10],
    [93,"Np","Netúnio","237","actinide",null,10],
    [94,"Pu","Plutônio","244","actinide",null,10],
    [95,"Am","Américio","243","actinide",null,10],
    [96,"Cm","Cúrio","247","actinide",null,10],
    [97,"Bk","Berquélio","247","actinide",null,10],
    [98,"Cf","Califórnio","251","actinide",null,10],
    [99,"Es","Einstênio","252","actinide",null,10],
    [100,"Fm","Férmio","257","actinide",null,10],
    [101,"Md","Mendelévio","258","actinide",null,10],
    [102,"No","Nobélio","259","actinide",null,10],
    [103,"Lr","Laurêncio","262","actinide",null,10],
    [104,"Rf","Rutherfórdio","267","transition-metal",4,7],
    [105,"Db","Dúbnio","268","transition-metal",5,7],
    [106,"Sg","Seabórgio","271","transition-metal",6,7],
    [107,"Bh","Bóhrio","270","transition-metal",7,7],
    [108,"Hs","Hássio","277","transition-metal",8,7],
    [109,"Mt","Meitnério","278","transition-metal",9,7],
    [110,"Ds","Darmstádio","281","transition-metal",10,7],
    [111,"Rg","Roentgênio","280","transition-metal",11,7],
    [112,"Cn","Copernício","285","transition-metal",12,7],
    [113,"Nh","Nihônio","286","other-metal",13,7],
    [114,"Fl","Fleróvio","289","other-metal",14,7],
    [115,"Mc","Moscóvio","290","other-metal",15,7],
    [116,"Lv","Livermório","293","other-metal",16,7],
    [117,"Ts","Tennesso","294","halogen",17,7],
    [118,"Og","Oganessônio","294","noble-gas",18,7]
  ];

  const placeholders = elements.map(() => "(?,?,?,?,?,?,?)").join(",");
  const flat = elements.flat();
  await db.query(
    `INSERT INTO elements (atomic_number, symbol, name, mass, category, \`group\`, period) VALUES ${placeholders}`,
    flat
  );
  console.log(`🧪 ${elements.length} elementos inseridos`);
}
