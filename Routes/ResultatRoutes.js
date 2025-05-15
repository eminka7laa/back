const express = require('express');
const router = express.Router();
const {
    GetResultatByIDEleve
} = require('../controllers/ResultatController');

// Student routes
router.get('/resultat/GetResultatByIDEleve/:idenelev', GetResultatByIDEleve);
module.exports = router; 