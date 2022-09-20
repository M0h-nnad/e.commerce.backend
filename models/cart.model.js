const mongoose = require('mongoose');

const CartSubItem = new mongoose.Schema({
    item:{type:mongoose.Schema.Types.ObjectId,required:true},
    itemCondition:{type:mongoose.Schema.Types.ObjectId, required:true}
})

const CartShema = new mongoose.Schema({
    items:[CartSubItem],
    owner:{type:mongoose.Schema.Types.ObjectId}
})

module.exports = mongoose.model('Cart',CartShema);