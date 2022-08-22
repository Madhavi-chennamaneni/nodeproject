const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const getRoute = require("./routes/get_route");
const postRoute = require("./routes/post_route");
const updateRoute = require("./routes/update_route");
const deleteRoute = require("./routes/delete_route")
// const db = require("./connections/mysqldb")
// const port = process.env.PORT || 8000


app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	next();
})
app.use(express.text())
app.set("view engine","ejs")

app.use("/api",getRoute);
app.use("/api",postRoute);
//app.use("/api",updateRoute);
//app.use("/api",deleteRoute)


    module.exports = app;
    // module.exports={app:app}