require('dotenv').config();
const express = require('express');
const path = require('path');
const {authMiddleware} = require('./auth');
const {User, Blog, Comment} = require('./db');
const {getSpotifyData} = require('./api');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* authentication */
app.post('/register', require('./auth').register);
app.post('/login', require('./auth').login);

/* user profile */
app.get('/users/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({message: 'Server error while fetching profile: ' + error.message});
    }
});

app.put('/users/profile', authMiddleware, async (req, res) => {
    try {
        const {email, username} = req.body;
        if (!email || !username) {
            return res.status(400).json({message: 'Email and username are required'});
        }
        const user = await User.findByIdAndUpdate(
            req.user.id, {email, username}, {new: true}
        ).select('-password');
        if (!user) return res.status(404).json({message: 'User not found'});
        res.json(user);
    } catch (error) {
        res.status(500).json({message:'Server error while updating profile: ' + error.message});
    }
});

/* blogs CRUD */
app.post('/blogs', authMiddleware, async (req, res) => {
    try {
        const {title, text, songUrl} = req.body;
        if (!title || !text || !songUrl) {
            return res.status(400).json({message:'Title, text, and song URL are required'});
        }
        const songData = await getSpotifyData(songUrl);
        const blog = new Blog({title, text, song: songData, author: req.user.id});
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({message: 'Server error while creating blog: ' + error.message});
    }
});

app.get('/blogs', authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({author: req.user.id}).populate('author', 'username');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({message:'Server error while fetching blogs: ' + error.message});
    }
});

app.get('/blogs/all', async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'username').sort({createdAt:-1});
        res.json(blogs);
    } catch (error) {
        res.status(500).json({message:'Server error while fetching all blogs: ' + error.message});
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'username');
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({message:'Server error while fetching blog: ' + error.message});
    }
});

app.put('/blogs/:id', authMiddleware, async (req, res) => {
    try {
        const {title, text} = req.body;
        if (!title || !text) {
            return res.status(400).json({message:'Title and text are required'});
        }
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({message:'Blog not found'});
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({message:'Not authorized to edit this blog'});
        }
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id, {title, text, updatedAt: Date.now()}, {new: true}
        ).populate('author', 'username');
        res.json(updatedBlog);
    } catch (error) {
        res.status(500).json({message:'Server error while updating blog: ' + error.message});
    }
});

app.delete('/blogs/:id', authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({message:'Blog not found'});
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({message:'Not authorized to delete this blog'});
        }
        await Comment.deleteMany({post: req.params.id});
        await Blog.findByIdAndDelete(req.params.id);
        res.json({message:'Blog and associated comments deleted successfully'});
    } catch (error) {
        res.status(500).json({message:'Server error while deleting blog: ' + error.message});
    }
});

/* comments CRUD */
app.post('/comments', authMiddleware, async (req, res) => {
    try {
        const { text, postId } = req.body;
        if (!text || !postId) {
            return res.status(400).json({message:'Text and postId are required'});
        }
        const blog = await Blog.findById(postId);
        if (!blog) return res.status(404).json({message:'Blog not found'});
        const comment = new Comment({text, post: postId, author: req.user.id});
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({message:'Server error while creating comment: ' + error.message});
    }
});

app.get('/comments/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({post: req.params.postId}).populate('author', 'username');
        res.json(comments);
    } catch (error) {
        res.status(500).json({message:'Server error while fetching comments: ' + error.message});
    }
});

/* global error handler */
app.use((err, req, res, next) => {
    res.status(500).json({message:'Something went wrong: ' + err.message});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));