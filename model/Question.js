const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question_id:{
        type:Number
    },
    user_id:{
        type:Number
    },
    name:{
        type:String
    },
    product_id:{
        type:Number
    },
    questions:{
        type:String
    },
    answers:{
        type:String
    },
    status:{
        type:Number
    },
    viewed:{
        type:Number
    },
    created_at:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    },
    updated_at:{
        type: Date,
        default: function() {
            return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
          }
    }
})

const Questions = mongoose.model('product_question',questionSchema);

module.exports = Questions;

// [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   }]
