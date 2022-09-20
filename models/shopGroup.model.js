const mongoose = require('mongoose');

const ShopGroupSchema = new mongoose.Schema({
    name:{type:String,required:[true,'Name Is Required']},
    shops:{type:[mongoose.Schema.Types.ObjectId],ref:"Shop"}
},{timestamps:true})

module.exports = mongoose.model('ShopGroup', ShopGroupSchema);