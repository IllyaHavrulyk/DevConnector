const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const PostModel = require("../../models/Post");
const UserModel = require("../../models/User");

// @route POST api/posts
// @desc  Create a post
// @access Private
router.post("/", [auth, [
    check('text', "Text is required.").not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await UserModel.findById(req.user.id).select("-password");
        const newPost = new Post({
            text: req.body.text,
            avatar: user.avatar,
            name: user.name,
            user: user.id
        })

        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
});

// @route GET api/posts
// @desc  Get all posts
// @access Private
router.get("/", auth, async (req, res) => {
    try {
        let posts = await PostModel.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})

// @route GET api/posts/:post_id
// @desc  Get post by id.
// @access Private
router.get("/:post_id", auth, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.post_id);
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ msg: "Post does not exist." })
        }
        res.status(500).send("Internal server error.")
    }
})

// @route DELETE api/posts/:post_id
// @desc  Delete post by id.
// @access Private
router.delete("/:post_id", auth, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.post_id);

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        await post.remove();

        res.json({ msg: "Post removed" });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ msg: "Post does not exist." })
        }
        res.status(500).send("Internal server error.");
    }
})

// @route PUT api/posts/like/:post_id
// @desc  Like a post.
// @access Private
router.put("/like/:post_id", auth, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.post_id);
        //Check if post had already been liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "You've already liked that post." })
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})

// @route PUT api/posts/unlike/:post_id
// @desc  Remove like from a post.
// @access Private
router.put("/unlike/:post_id", auth, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.post_id);
        //Check if post had already been liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "Post hasn't been liked yet." })
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1)

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})

// @route PUT api/posts/like/:post_id
// @desc  Like a post.
// @access Private
router.put("/comment/:post_id", [auth, [
    check('text', "Text is required")
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await UserModel.findById(req.user.id).select("-password");
        const post = await PostModel.findById(req.params.post_id);
        //Check if post had already been liked by the user

        const newComment = {
            text: req.body.text,
            name: user.name,
            user: req.user.id,
            avatar: user.avatar
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
})

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc  Delete comment from a post.
// @access Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.post_id);

        //Pull out comment from a post.
        const comment = post.comments.find(comment => comment.id.toString() === req.params.comment_id);

        //Check if comment exists
        if (!comment) {
            return res.status(404).json({ msg: "Comment does not exist." })
        }

        //Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User is not authorized" });
        }

        //Get remove index
        const removeIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id);

        //Remove comment from post.
        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json({ msg: "Comment removed", comments: post.comments })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})
module.exports = router;