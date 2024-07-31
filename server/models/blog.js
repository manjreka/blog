const mongoose = require('mongoose')

const blogsSchema = new mongoose.Schema({
    title: {type: String, require: true},
    content: {type: String, require: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    status: {type: String, enum: ["draft", "published" ], default: 'draft'},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}]
},
{timestamps: true}
)

const blog = mongoose.model('blog', blogsSchema)

module.exports = blog