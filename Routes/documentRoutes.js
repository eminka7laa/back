const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connection = require('../config/connect');

// Config multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
};

const upload = multer({ storage, fileFilter });

// Controller addDocument
const addDocument = (req, res) => {
  const { idelv, titre } = req.body;

  if (!idelv || !titre || !req.file) {
    return res.status(400).json({ error: "Tous les champs (idelv, titre, fichier PDF) sont requis." });
  }

  const filepath = req.file.path;

  const query = `
    INSERT INTO documents (
      idelv,
      titre,
      filepath
    ) VALUES (?, ?, ?)
  `;

  connection.query(query, [idelv, titre, filepath], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du document :", err);
      return res.status(500).json({ error: "Erreur base de données", details: err });
    }

    res.status(201).json({
      id: result.insertId,
      message: "Document ajouté avec succès",
      filepath
    });
  });
};

// Route POST pour upload document
router.post('/document', upload.single('pdfFile'), addDocument);

module.exports = router;
