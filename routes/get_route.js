const express = require("express");
const getController = require("../controller/get");

const router = express.Router();

router.get("/getlanguages",getController.getlanguages);
//router.get("/savequestion",postController.savequestion);
router.get("/getcomplexity",getController.getcomplexity);
router.get("/getmodules",getController.getmodules);



module.exports = router;
