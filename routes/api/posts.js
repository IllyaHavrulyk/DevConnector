const express = require("express");
const router = express.Router();

// @route GET api/posts
// @desc  Test route
// @access Public

router.get("/", (req, res) => res.send("Posts api working..."));

module.exports = router;