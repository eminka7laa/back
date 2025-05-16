const connection = require("../config/connect");
const bcrypt = require('bcrypt');


const registerAdmin = async (req, res) => {
  const { email, password, nom, prenom } = req.body;

  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({ error: 'Tous les champs sont requis : email, password, nom, prenom.' });
  }

  // Vérifier si l'email existe déjà
  connection.query('SELECT * FROM admin WHERE email = ?', [email], async (err, result) => {
    if (err) {
      console.error('Erreur base de données :', err);
      return res.status(500).json({ error: 'Erreur interne', details: err });
    }

    if (result.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO admin (email, password, nom, prenom)
        VALUES (?, ?, ?, ?)
      `;

      connection.query(query, [email, hashedPassword, nom, prenom], (errInsert, resultInsert) => {
        if (errInsert) {
          console.error('Erreur insertion admin :', errInsert);
          return res.status(500).json({ error: 'Erreur lors de la création du compte', details: errInsert });
        }

        // Crée une date actuelle au format YYYY-MM-DD
        const dateCreation = new Date().toISOString().split('T')[0];

        res.status(201).json({
          message: 'Administrateur enregistré avec succès.',
          admin: {
            id: resultInsert.insertId,
            email,
            nom,
            prenom,
            datecreation: dateCreation
          }
        });
      });
    } catch (err) {
      console.error('Erreur lors du hash du mot de passe :', err);
      res.status(500).json({ error: 'Erreur interne' });
    }
  });
};
// Contrôleur de connexion admin
const Login = (req, res) => {
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

    // Comparaison sécurisée avec bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ msg: 'Erreur serveur' });
      }

      if (!isMatch) {
        return res.status(401).send({ msg: 'Mot de passe incorrect' });
      }

      // On ne renvoie pas le mot de passe dans la réponse
      const { password, ...userData } = user;

      res.status(200).send({
        msg: 'Bienvenue',
        user: userData,
        nom: userData.nom,
      });
    });
  });
};



// Contrôleur d'ajout de note
const addNote = (req, res) => {
  const { idelv, matiere, note, trimestre, remarque } = req.body;

  if (!idelv || !matiere || note === undefined || !trimestre) {
    return res.status(400).json({
      error: 'Tous les champs idelv, matiere, note et trimestre sont requis.'
    });
  }

  if (isNaN(note)) {
    return res.status(400).json({ error: 'La note doit être un nombre.' });
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

    // Vérifier que la matière existe (par nom)
    connection.query('SELECT * FROM matiere WHERE nom = ?', [matiere], (errMat, matieres) => {
      if (errMat) {
        console.error('Erreur vérification matière:', errMat);
        return res.status(500).json({ error: 'Erreur base de données', details: errMat });
      }

      if (matieres.length === 0) {
        return res.status(404).json({ error: `Matière "${matiere}" non trouvée.` });
      }

      const idmat = matieres[0].id;

      // Insertion de la note
      const query = 'INSERT INTO note (idelv, idmat, notemat, trimestre, remarque) VALUES (?, ?, ?, ?, ?)';
      connection.query(query, [idelv, idmat, note, trimestre, remarque], (errInsert, result) => {
        if (errInsert) {
          console.error('Erreur insertion note:', errInsert);
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de la note', details: errInsert });
        }

        res.status(201).json({
          id: result.insertId,
          message: 'Note ajoutée avec succès'
        });
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
const updateEleve = (req, res) => {
  const { numinscri } = req.params;
  const {
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

  if (!numinscri) {
    return res.status(400).json({ error: "Le numéro d'inscription est requis." });
  }

  // Ici on peut ajouter une validation des champs (optionnel)
  if (
    !nom || !prenom || !nompere || !nommere ||
    !datenais || !numtel || !classe || !etablisement || !gouver || !dre
  ) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const query = `
    UPDATE eleve SET
      nom = ?,
      prenom = ?,
      nompere = ?,
      nommere = ?,
      datenais = ?,
      numtel = ?,
      classe = ?,
      etablisement = ?,
      gouver = ?,
      dre = ?
    WHERE numinscri = ?
  `;

  const values = [
    nom,
    prenom,
    nompere,
    nommere,
    datenais,
    numtel,
    classe,
    etablisement,
    gouver,
    dre,
    numinscri
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de l'élève :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Aucun élève trouvé avec ce numéro d'inscription." });
    }

    res.status(200).json({ message: "Élève mis à jour avec succès." });
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
const getElevesCount = (req, res) => {
  const query = "SELECT COUNT(*) AS total FROM eleve";

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send("Erreur lors du comptage des élèves");
      return;
    }

    res.send({ totalEleves: results[0].total });
  });
};

const getAbncesCount = (req, res) => {
  const query = "SELECT COUNT(*) AS total FROM absence";

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send("Erreur lors du comptage des absences");
      return;
    }

    res.send({ tolalAbsences: results[0].total });
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


const updateAbsence = (req, res) => {
  const id = req.params.id;
  const { ideleve, typeabsence, causeabsence, datedeb, datefin, nbrjrs } = req.body;

  // Vérifier que l'id est fourni
  if (!id) {
    return res.status(400).json({ error: "L'id de l'absence est requis." });
  }

  // Vérifier que tous les champs nécessaires sont présents
  if (!ideleve || !typeabsence || !causeabsence || !datedeb || !datefin || !nbrjrs) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const query = `
    UPDATE absence
    SET ideleve = ?, typeabsence = ?, causeabsence = ?, datedeb = ?, datefin = ?, nbrjrs = ?
    WHERE id = ?
  `;

  const values = [ideleve, typeabsence, causeabsence, datedeb, datefin, nbrjrs, id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la modification de l'absence :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Absence non trouvée." });
    }

    res.status(200).json({ message: "Absence modifiée avec succès." });
  });
};


const getAllAbsences = (req, res) => {
  const query = `
    SELECT 
      a.id,
      a.ideleve,
      e.nom,
      e.prenom,
      a.typeabsence,
      a.causeabsence,
      a.datedeb,
      a.datefin,
      a.nbrjrs
    FROM absence a
    JOIN eleve e ON a.ideleve = e.numinscri
    ORDER BY a.datedeb DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des absences :', err);
      return res.status(500).json({ error: 'Erreur base de données', details: err });
    }

    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const absences = results.map(abs => ({
      ...abs,
      datedeb: formatDate(abs.datedeb),
      datefin: formatDate(abs.datefin)
    }));

    res.status(200).json({ absences });
  });
};


const getAllNotes = (req,res) => {
   const query = `
    SELECT 
     *
    FROM absence a
    JOIN eleve e ON a.ideleve = e.numinscri
    ORDER BY a.datedeb DESC
  `;
}




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
    deleteAbsence,
    getAllAbsences,
    registerAdmin,
    updateEleve,
    updateAbsence,
    getElevesCount,
    getAbncesCount

};
