require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* connection to db */
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const userSchema = new Schema({
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true, minlength:8},
    username: {type:String, required:true, unique:true}
});

const blogSchema = new Schema({
    title: {type:String, required:true},
    text: {type:String, required:true},
    song: {
        name: String,
        artist: String,
        image: String,
        url: {type:String, required:true}
    },
    author: {type:Schema.Types.ObjectId, ref:'User', required:true},
    createdAt: {type:Date, default:Date.now},
    updatedAt: {type:Date, default:Date.now}
});

const commentSchema = new Schema({
    post: {type:Schema.Types.ObjectId, ref:'Blog', required:true},
    author: {type: Schema.Types.ObjectId, ref:'User', required:true},
    text: {type:String, required:true},
    createdAt: {type:Date, default:Date.now}
});

const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {User, Blog, Comment};