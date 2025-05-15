const express = require('express');
const router = express.Router();
const {
    GetAllEleve,
    Login,
    getSanction,
    getGrades,
    getAbsence
} = require('../controllers/eleveController');

// Student routes
router.get('/eleve/sanction/:numinscri', getSanction);
router.post('/eleve/login', Login)
router.get('/eleve/notes/:numinscri',getGrades)
router.get('/eleve/absence/:numinscri',getAbsence );
module.exports = router; 