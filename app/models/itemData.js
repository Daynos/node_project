// app/models/itemData.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemDataSchema = new Schema({
    deleted: Boolean,
    id: String,
    name: String,
    created: Date,
    updatd: Date,
    icon: String,
    description: String,
    comment: String,
    supercategory: String,
    category: [String],
    quality: String,
});

module.exports = mongoose.model('ItemData', ItemDataSchema);
