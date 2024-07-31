const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    blogId: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    status: {type: String, enum: ['pending', 'posted', 'denied'], default: 'pending'}
}, {timestamps: true})

const comment = mongoose.model('comment', commentSchema)

module.exports = comment