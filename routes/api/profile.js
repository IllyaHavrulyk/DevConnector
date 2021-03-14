const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");
const { check, validationResult } = require("express-validator");
// @route GET api/profile/me
// @desc  Get user profile
// @access Private

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: "There is no profile with that user." });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error.")
    }
});


// @route POST api/profile
// @desc  Create or update user profile
// @access Private

router.post("/", [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', "At least one skill is required").not().isEmpty(),]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
})

module.exports = router;