const express = require("express");
const app = express();
const multer  = require('multer')
const documentRoutes = require('./Routes/documentRoutes');
const path = require('path');



app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser").urlencoded({ extended: true });//
const cors = require("cors");//
const EleveRoute = require("./Routes/EleveRoute");
const ResultatRoutes = require('./Routes/ResultatRoutes')
const AdminRoutes = require('./Routes/AdminRoute')
app.use(cors());
app.use(express.json());
app.use(cors());
app.use("/api", bodyParser, EleveRoute);
app.use("/api", bodyParser, ResultatRoutes);
app.use("/api", bodyParser, AdminRoutes);
app.use("/api", bodyParser, documentRoutes);



app.listen(5000, () => console.log("Server up and running ..."));
