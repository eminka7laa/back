const connection = require("../config/connect");
const moment = require('moment');

const Login = async (req, res) => {
  
  const { numinscri } = req.body;

  if (!numinscri) {
    return res.status(400).json({ 
      success: false,
      message: 'Le champ "numinscri" est requis.' 
    });
  }

  connection.query(
    'SELECT * FROM eleve WHERE numinscri = ?', 
    [numinscri], 
    (error, results) => {
      if (error) {
        console.error('Erreur SQL :', error);
        return res.status(500).json({ 
          success: false,
          message: 'Erreur serveur.', 
          error 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Aucun élève trouvé avec ce numéro d\'inscription.' 
        });
      }

      const user = results[0];

      // Format date_naissance and login time
      const loginTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const dateNaissance = moment(user.date_naissance).format('YYYY-MM-DD');

      // Replace raw date with formatted one
      user.date_naissance = dateNaissance;

      res.status(200).json({
        success: true,
        message: `Bienvenue ${user.nom || ''}`,
        loginTime: loginTime,
        user
      });
    }
  );
};





const getSanction = (req, res) => {
  const numinscri = req.params.numinscri;

  if (!numinscri) {
    return res.status(400).json({ error: "Le numéro d'inscription de l'élève est requis" });
  }

  const query = `
    SELECT * FROM sanction
    WHERE id_eleve = ?
  `;

  connection.query(query, [numinscri], (error, data) => {
    if (error) {
      console.error("Erreur lors de la récupération des sanctions :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des sanctions", details: error });
    }

    if (data.length === 0) {
      return res.status(404).json({ msg: "Aucune sanction trouvée pour cet élève" });
    }

    res.status(200).json({ sanctions: data });
  });
};
const getGrades = (req, res) => {
  const numinscri = req.params.numinscri;

  if (!numinscri) {
    return res.status(400).json({ error: "Numéro d'inscription requis" });
  }

  const query = `
    SELECT note.id, note.notemat AS note, note.trimestre, matiere.nom AS matiere
    FROM note
    JOIN matiere ON note.idmat = matiere.id
    WHERE note.idelv = ?
  `;

  connection.query(query, [numinscri], (err, results) => {
    if (err) {
      console.error('Erreur récupération notes élève :', err);
      return res.status(500).json({ error: 'Erreur base de données', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucune note trouvée pour cet élève' });
    }

    res.json({ notes: results });
  });
};
 
const getAbsence = (req, res) => {
  const numinscri = req.params.numinscri;

  if (!numinscri) {
    return res.status(400).json({ error: "Numéro d'inscription requis" });
  }

  const query = `
    SELECT 
      a.id,
      a.ideleve,
      a.typeabsence,
      a.causeabsence,
      DATE_FORMAT(a.datedeb, '%Y-%m-%d') AS datedeb,
      DATE_FORMAT(a.datefin, '%Y-%m-%d') AS datefin,
      a.nbrjrs,
      a.description,
      DATE_FORMAT(a.datecreation, '%Y-%m-%d') AS datecreation
    FROM absence a
    INNER JOIN eleve e ON a.ideleve = e.id
    WHERE e.numinscri = ?
    ORDER BY a.datedeb DESC
  `;

  connection.query(query, [numinscri], (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération des absences :", error);
      return res.status(500).json({ error: "Erreur serveur", details: error });
    }

    res.status(200).json({
      success: true,
      message: `Liste des absences pour l'élève avec numéro ${numinscri}`,
      absences: results
    });
  });
};







module.exports = {
  Login,
  getSanction,
  getGrades,
  getAbsence
};
