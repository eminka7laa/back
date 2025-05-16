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
    registerAdmin,
    updateEleve,
    updateAbsence,
    getElevesCount,
    getAbncesCount
} = require('../controllers/AdminController');

// Student routes
router.post('/admin/notes/:id', addNote);
router.post('/admin/login', Login)
router.post("/admin/eleve/add",addEleve)
router.post("/admin/matiere",addMatiere);
router.post("/admin/sanctions/:numinscri", addSanction);
router.post('/admin/absence',addAbsence)
router.post("/admin/register",registerAdmin)


router.delete("/admin/eleves/:numinscri", deleteEleve);
router.delete("/admin/matieres/:id", deleteMatiere);
router.delete("/admin/sanctions/:numinscri", deleteSanction);
router.delete("/admin/absence/:id",deleteAbsence)

router.get('/admin/notes/:id', getNotesByEleve);
router.get('/admin/all',GetAllEleve)
router.get("/admin/absences",getAllAbsences)
router.get("/admin/eleves/count",getElevesCount)
router.get("/admin/absences/count",getAbncesCount)

router.put('/admin/eleve/update/:numinscri',updateEleve)
router.put('/admin/absence/:id', updateAbsence)


module.exports = router; 