const connection = require("../config/connect");

// Contrôleur de connexion admin
const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ msg: 'Email et mot de passe requis' });
    }

    connection.query('SELECT * FROM admin WHERE email = ?', [email], (error, data) => {
        if (error) {
            console.error(error);
            return res.status(500).send({ msg: 'Erreur lors de la récupération des données' });
        }

        if (data.length === 0) {
            return res.status(404).send({ msg: 'L\'utilisateur n\'existe pas' });
        }

        const user = data[0];
        if (user.mdp !== password) {
            return res.status(401).send({ msg: 'Mot de passe incorrect' });
        }

        res.status(200).send({ msg: 'Bienvenue', user: user, nom: user.nom });
    });
};

// Contrôleur d'ajout de note
const addNote = (req, res) => {
  const { matiere, note, trimestre } = req.body;
  const idelv = req.params.id;

  if (!idelv || !matiere || !note || !trimestre) {
    return res.status(400).json({ error: 'Tous les champs idelv, matiere, note et trimestre sont requis.' });
  }

  if (isNaN(note) || isNaN(matiere)) {
    return res.status(400).json({ error: 'matiere et note doivent être des nombres.' });
  }

  // Vérifier que l'élève existe
  connection.query('SELECT * FROM eleve WHERE numinscri = ?', [idelv], (err, eleves) => {
    if (err) {
      console.error('Erreur vérification élève:', err);
      return res.status(500).json({ error: 'Erreur base de données', details: err });
    }
    if (eleves.length === 0) {
      return res.status(404).json({ error: `Élève avec numinscri ${idelv} non trouvé.` });
    }

    // Vérifier que la matière existe
    connection.query('SELECT * FROM matiere WHERE id = ?', [matiere], (errMat, matieres) => {
      if (errMat) {
        console.error('Erreur vérification matière:', errMat);
        return res.status(500).json({ error: 'Erreur base de données', details: errMat });
      }
      if (matieres.length === 0) {
        return res.status(404).json({ error: `Matière avec id ${matiere} non trouvée.` });
      }

      // Insertion de la note
      const query = 'INSERT INTO note (idelv, idmat, notemat, trimestre) VALUES (?, ?, ?, ?)';
      connection.query(query, [idelv, matiere, note, trimestre], (errInsert, result) => {
        if (errInsert) {
          console.error('Erreur insertion note:', errInsert);
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de la note', details: errInsert });
        }
        res.status(201).json({ id: result.insertId, message: 'Note ajoutée avec succès' });
      });
    });
  });
};


const getNotesByEleve = (req, res) => {
  const idelv = req.params.id; // numinscri de l'élève

  if (!idelv) {
    return res.status(400).json({ error: "L'identifiant de l'élève est requis." });
  }

  const query = `
    SELECT note.id, note.notemat AS note, note.trimestre, matiere.nom AS matiere
    FROM note
    JOIN matiere ON note.idmat = matiere.id
    WHERE note.idelv = ?
  `;

  connection.query(query, [idelv], (err, results) => {
    if (err) {
      console.error('Erreur récupération notes:', err);
      return res.status(500).json({ error: 'Erreur base de données', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: `Aucune note trouvée pour l'élève ${idelv}` });
    }

    res.json({ notes: results });
  });
};




const addEleve = (req, res) => {
  const {
    numinscri,
    nom,
    prenom,
    nompere,
    nommere,
    datenais,
    numtel,
    classe,
    etablisement,
    gouver,
    dre
  } = req.body;

  // Vérifier que tous les champs sont fournis
  if (
    !numinscri || !nom || !prenom || !nompere || !nommere ||
    !datenais || !numtel || !classe || !etablisement || !gouver || !dre
  ) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const query = `
    INSERT INTO eleve (
      numinscri, 
      nom, 
      prenom, 
      nompere, 
      nommere, 
      datenais, 
      numtel, 
      classe, 
      etablisement, 
      gouver, 
      dre
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    numinscri,
    nom,
    prenom,
    nompere,
    nommere,
    datenais,
    numtel,
    classe,
    etablisement,
    gouver,
    dre
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'élève :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    res.status(201).json({
      id: result.insertId,
      message: "Élève ajouté avec succès"
    });
  });
};
const deleteEleve = (req, res) => {
  const { numinscri } = req.params;

  if (!numinscri) {
    return res.status(400).json({ error: "Le numéro d'inscription est requis." });
  }

  const query = "DELETE FROM eleve WHERE numinscri = ?";

  connection.query(query, [numinscri], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'élève :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aucun élève trouvé avec ce numéro d'inscription." });
    }

    res.status(200).json({ message: "Élève supprimé avec succès." });
  });
};

const addMatiere = (req, res) => {
  const { nom, coef } = req.body;

  if (!nom || coef == null) {
    return res.status(400).json({ error: "Le nom et le coefficient sont requis." });
  }

  const query = `
    INSERT INTO matiere (nom, coef)
    VALUES (?, ?)
  `;

  connection.query(query, [nom, coef], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la matière :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    res.status(201).json({
      id: result.insertId,
      message: "Matière ajoutée avec succès"
    });
  });
};
const deleteMatiere = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "L'identifiant de la matière est requis." });
  }

  const query = "DELETE FROM matiere WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la matière :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aucune matière trouvée avec cet identifiant." });
    }

    res.status(200).json({ message: "Matière supprimée avec succès." });
  });
};


const addSanction = (req, res) => {
  const { numinscri } = req.params; // on récupère numinscri dans l'URL
  const { nbrjours, typesanc, typecausesanc } = req.body;

  if (!numinscri || !nbrjours || !typesanc || !typecausesanc) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const query = `
    INSERT INTO sanction (
      id_eleve,  -- ici, on stocke numinscri dans id_eleve
      nbrjours,
      typesanc,
      typecausesanc
    ) VALUES (?, ?, ?, ?)
  `;

  const values = [numinscri, nbrjours, typesanc, typecausesanc];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la sanction :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    res.status(201).json({
      id: result.insertId,
      message: "Sanction ajoutée avec succès"
    });
  });
};

const deleteSanction = (req, res) => {
  const { numinscri } = req.params; // id de la sanction à supprimer

  if (!numinscri) {
    return res.status(400).json({ error: "ID de la sanction requis." });
  }

  const query = `DELETE FROM sanction WHERE id = ?`;

  connection.query(query, [numinscri], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la sanction :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sanction non trouvée." });
    }

    res.status(200).json({ message: "Sanction supprimée avec succès." });
  });
};
const GetAllEleve = (req, res) => {
  connection.query("SELECT * FROM eleve", (error, data) => {
    if (error) {
      res.status(500).send("Erreur lors de la récupération des données");
      return;
    }

    res.send({ results: data });
  });
};

const addAbsence = (req, res) => {
  const { ideleve, typeabsence, causeabsence, datedeb, datefin, nbrjrs } = req.body;

  // Vérification des champs obligatoires
  if (!ideleve || !typeabsence || !causeabsence || !datedeb || !datefin || !nbrjrs) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const query = `
    INSERT INTO absence (
      ideleve,
      typeabsence,
      causeabsence,
      datedeb,
      datefin,
      nbrjrs
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [ideleve, typeabsence, causeabsence, datedeb, datefin, nbrjrs], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'absence :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    res.status(201).json({
      id: result.insertId,
      message: "Absence ajoutée avec succès"
    });
  });
};
const deleteAbsence = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "L'id de l'absence est requis." });
  }

  const query = "DELETE FROM absence WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'absence :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Absence non trouvée" });
    }

    res.status(200).json({ message: "Absence supprimée avec succès" });
  });
};



module.exports = {
    Login,
    addNote,
    addEleve,
    deleteEleve,
    addMatiere,
    deleteMatiere,
    addSanction,
    deleteSanction,
    getNotesByEleve,
    GetAllEleve,
    addAbsence,
    deleteAbsence
};
