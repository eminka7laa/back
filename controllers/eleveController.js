const connection = require("../config/connect");

const Login = async (req, res) => {
  const { numinscri } = req.body;

  connection.query('SELECT * FROM eleve WHERE numinscri = ?', [numinscri], (error, data) => {
    if (error) {
      console.error(error);
      res.status(200).send({ msg: 'Erreur lors de la récupération des données' });
      return;
    }

    if (data.length === 0) {
      res.status(200).send({ msg: 'L\'utilisateur n\'existe pas' });
      return;
    }

    const user = data[0];

    res.status(200).send({ msg: 'Bienvenue', user: user });
  });
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






module.exports = {
  Login,
  
  getSanction,
  getGrades
};
