const express = require("express");
const app = express();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

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


app.listen(5000, () => console.log("Server up and running ..."));
