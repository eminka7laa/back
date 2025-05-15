const connection = require("../config/connect");




const GetAllAbsence = (req, res) => {
  connection.query("SELECT * FROM absence", (error, data) => {
    if (error) {
      res.status(500).send("Erreur lors de la récupération des données");
      return;
    }

    res.send({ results: data });
  });
};






module.exports = {
  Login,
  GetAllAbsence,
};
