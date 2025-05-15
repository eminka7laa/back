const connection = require("../config/connect");

const GetResultatByIDEleve = async (req, res) => {
    const { idenelev } = req.params;
    connection.query(
        "SELECT * FROM resultat WHERE idenelev = ? ",
        [idenelev],

        (error, data) => {
            if (error) {
                res.status(500).send("Erreur lors de la récupération des données");
                return;
            }


            res.send({ results: data[0] })

        }
    );

    const GetResultBySemester = async (req, res) => {
        const {idenelev } = req.params;
        connection.query(
            " SELECT moyeperiexam FROM resultat where codeperiexam=31",
            [idenelev],
        
        (error, data) => {
            if(error) {
                res.status(500).send("Erreur lors de la récupération des données");
                return;
            }
                        res.send({ results: data[0] })

        }
        
    )
    }
};

module.exports = { GetResultatByIDEleve ,}
