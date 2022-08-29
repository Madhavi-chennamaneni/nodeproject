const express = require("express");
const getController = require("../controller/get");

const router = express.Router();

router.get("/getlanguages",getController.getlanguages);
//router.get("/savequestion",postController.savequestion);
router.get("/getcomplexity",getController.getcomplexity);
router.get("/getmodules",getController.getmodules);
router.get("/runjavascriptcode",getController.runcode);
router.get("/getquestions",getController.getquestions);


module.exports = router;
