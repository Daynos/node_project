'use strict';
var Parsoid = require('parsoid');
var LandmarkDesign = require('./LandmarkDesign');

module.exports = LandmarkItem;

function LandmarkItem(object) {
    //console.log('========= LANDMARK ITEM =========');

    this.template = 'Landmark Item';
    this.id = null;
    this.name = null;
    this.history = [];
    this.itemData = {};
    this.designs = [];

    if (object instanceof Parsoid.PTemplate) {
        this.id = object.get('id').value.get(0).toString();
        this.name = object.get('creates').value.get(0).toString();
    } else if (object instanceof Object) {
        this.name = object.name ? object.name : null;
        this.id = object.id ? object.id : this.name;
    }
}

LandmarkItem.prototype.loadJSON = function(json) {
    var self = this;

    this.name = json.name ? json.name : null;
    this.id = json.id ? json.id : this.name;
    //this.history = json.history ? json.history : [];
    //this.itemData = json.itemData ? json.itemData : {};
    if (json.designs instanceof Array) {
        json.designs.forEach(function(jsonDesign) {
            var design = new LandmarkDesign();
            design.loadJSON(jsonDesign);
            self.addDesign(design);
        });
    }    
    
    console.log('=========== LOAD ITEM : ', this);

}

LandmarkItem.prototype.toJSON = function() {
    var localDesigns = [];

    this.designs.forEach(function(design) {
        localDesigns.push(design.toJSON());
    });

    return {
        template: this.template,
        id: this.id,
        name: this.name,
        history: this.history,
        itemData: this.itemData,
        designs: localDesigns
    };
};

LandmarkItem.prototype.addDesign = function(design) {

    if (typeof design.id == 'undefined') {
        return false;
    }
    
    for (var i = 0, designLength = this.designs.length; i < designLength; i++) {
        if (this.designs[i].id == design.id) {
            return false;
        }
    }
    
    this.designs.push(design);
    return true;
};

LandmarkItem.prototype.addDesignComponentData = function(designComponentData) {
    this.designs[this.designs.length - 1].addDesignComponentData(designComponentData);
};