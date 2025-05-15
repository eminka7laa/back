const express = require('express');
const router = express.Router();
const {
    addNote,
    Login,
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
    registerAdmin
} = require('../controllers/AdminController');

// Student routes
router.post('/admin/notes/:id', addNote);
router.post('/admin/login', Login)
router.post("/admin/eleve",addEleve)
router.delete("/admin/eleves/:numinscri", deleteEleve);
router.post("/admin/matiere",addMatiere);
router.delete("/admin/matieres/:id", deleteMatiere);
router.post("/admin/sanctions/:numinscri", addSanction);
router.delete("/admin/sanctions/:numinscri", deleteSanction);
router.get('/admin/notes/:id', getNotesByEleve);
router.get('/admin',GetAllEleve)
router.post('/admin/absence',addAbsence)
router.delete("/admin/absence/:id",deleteAbsence)
router.get("/admin/absences",getAllAbsences)
router.post("/admin/register",registerAdmin)





module.exports = router; 