const express = require("express");
const postController = require("../controller/post");

const router = express.Router();

router.post("/runjavascript",postController.runjavascript);
router.post("/savequestion",postController.savequestion);
router.post("/verifyusercode",postController.verifyusercode);

module.exports = router;


    