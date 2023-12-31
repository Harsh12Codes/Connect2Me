const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create post
router.post("/", async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update post
router.put("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(500).json("Post not found :/");
    }
    try {
        if (post.userId === req.body.userId) {
            const updatedPost = await post.updateOne({ $set: req.body });
            res.status(200).json(updatedPost);
        } else {
            res.status(403).json("You can only update your post :/");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete post
router.delete("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    try {
        if (post.userId === req.body.userId) {
            const updatedPost = await post.deleteOne();
            res.status(200).json(updatedPost);
        } else {
            res.status(403).json("You can only delete your post :/");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
//like post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("You liked the post :)");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("You Disliked the post :(");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get timeline posts
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ userId: friendId });
            }),
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
