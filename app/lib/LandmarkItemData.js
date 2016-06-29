'use strict';
var db = require("../models/db.js");
var schemas = require("../models/schemas.js");
var Parsoid = require('parsoid');
var _ = require("lodash");

function LandmarkItem(object) {
    console.log('========= LANDMARK ITEM DATA =========');

    this.template = 'Landmark Item Data';
    this.data = this.sanitize(object);

    console.log('this.data: ', this.data);
}

LandmarkItem.prototype.data = {};

LandmarkItem.prototype.get = function(name) {
    return this.data[name];
}

LandmarkItem.prototype.set = function(name, value) {
    this.data[name] = value;
}

LandmarkItem.prototype.sanitize = function(data) {
    var schema = schemas.itemData,
        sanitizedData = {};

    data = data || {};

    _.map(_.keys(schema), function(name) {
        try {
            if (data instanceof Parsoid.PTemplate) {
                sanitizedData[name] = data.get(name).value.get(0).toString();
            }
            else {
                sanitizedData[name] = data[name];
            }
        }
        catch (err) {
            console.error(err);
        }
    });

    return _.pick(_.defaults(sanitizedData, schema), _.keys(schema));
}

LandmarkItem.prototype.save = function(callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.get('itemData', {
        id: this.data.id
    }).update(JSON.stringify(this.data)).run(function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}

LandmarkItem.prototype.loadJSON = function(json) {
    var self = this;

    this.name = json.name ? json.name : null;
    this.id = json.id ? json.id : this.name;

    console.log('=========== LOAD ITEM DATA : ', this);

}

LandmarkItem.prototype.toJSON = function() {
    return JSON.stringify(this.data);
};

module.exports = LandmarkItem;