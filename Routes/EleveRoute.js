const express = require('express');
const router = express.Router();
const {
    GetAllEleve,
    Login,
    getSanction,
    getGrades
} = require('../controllers/eleveController');

// Student routes
router.get('/eleve/:numinscri', getSanction);
router.post('/eleve/login', Login)
router.get('/eleve/notes/:numinscri',getGrades)
module.exports = router; 