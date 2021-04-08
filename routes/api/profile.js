const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");
const PostModel = require("../../models/Post");
const { check, validationResult } = require("express-validator");
// @route GET api/profile/me
// @desc  Get user profile
// @access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile with that user." });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error.");
  }
});

// @route POST api/profile
// @desc  Create or update user profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "At least one skill is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      skills,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (skills) {
      if (typeof skills === "string") {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      } else {
        profileFields.skills = skills.map((skill) => skill.trim());
      }
    }
    if (githubusername) profileFields.githubusername = githubusername;

    //Build social profile fields
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await ProfileModel.findOne({ user: req.user.id });
      //If profile exists, then we need to update it with proper info.
      if (profile) {
        await ProfileModel.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //If profile doesn't exist , so we will create one
      profile = new ProfileModel(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// @route GET api/profile
// @desc  Get all profiles
// @access Public

router.get("/", async (req, res) => {
  try {
    const profile = await ProfileModel.find().populate("user", [
      "name",
      "avatar",
    ]);
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error.");
  }
});

// @route GET api/profile/user/:user_id
// @desc  Get profile by user id.
// @access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found." });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      res.status(400).json({ msg: "Profile not found." });
    }
    res.status(500).send("Server error.");
  }
});

// @route DELETE api/profile
// @desc  Delete profile, user and posts.
// @access Private
router.delete("/", auth, async (req, res) => {
  try {
    //Remove User posts
    await PostModel.deleteMany({ user: req.user.id });
    //Remove profile
    await ProfileModel.findOneAndRemove({ user: req.user.id });
    //Remove user
    await UserModel.findOneAndRemove({ _id: req.user.id });
    //@todo - remove users posts
    res.send("User removed");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error.");
  }
});

// @route PUT api/profile/experience
// @desc  Add profile experience
// @access Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "from  is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      company,
      title,
      description,
    };

    try {
      let profile = await ProfileModel.findOne({ user: req.user.id });

      profile.experience.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error.");
    }
  }
);

// @route DELETE api/profile/experience/:experience_id
// @desc  remove experience from profile
// @access Private
router.delete("/experience/:experience_id", auth, async (req, res) => {
  try {
    let profile = await ProfileModel.findOne({ user: req.user.id });

    //Get index of experience that is going to be deleted
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.experience_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error.");
  }
});

// @route PUT api/profile/education
// @desc  Add education to profile
// @access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School name is required.").not().isEmpty(),
      check("degree", "Degree is required.").not().isEmpty(),
      check("fieldofstudy", "Field of study is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await ProfileModel.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// @route DELETE api/profile/education/:education_id
// @desc  Remove education from profile.
// @access Private
router.delete("/education/:education_id", auth, async (req, res) => {
  try {
    let profile = await ProfileModel.findOne({ user: req.user.id });

    //Get index of removable education.
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.education_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// @route GET api/profile/github/:username
// @desc  Get user repos from github.
// @access Public
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
        }/repos?sort=created:asc&client_id=${config.get(
          "githubClientId"
        )}&client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
      }

      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No github user found." });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});
module.exports = router;
