const mongoose = require('mongoose');


// place commentSchema above hootSchema as it will be referenced inside that object


const commentSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        required: true
      },
    // author property will act as a reference to the User who created the hoot or comment 
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
  );



const hootSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [commentSchema], // embedded commentSchema, no need to compile into a model
},
    { timestamps: true }
);

// { timestamps: true }. This will give our hoot documents createdAt and updatedAt properties. We can use the createdAt property when we want to display the date a hoot post was made.

const Hoot = mongoose.model("Hoot", hootSchema);

module.exports = Hoot;