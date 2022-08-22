const express = require("express");
const postController = require("../controller/post");

const router = express.Router();

router.post("/savequestion",postController.savequestion);
router.post("/verifyusercode",postController.submitUsercode);
router.post("/uploads",postController.uploads);



module.exports = router;
