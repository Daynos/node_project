'use strict';

var Parsoid = require('parsoid');
var LandmarkDesignComponentData = require('./LandmarkDesignComponentData');

module.exports = LandmarkDesign;

function LandmarkDesign(object) {
    //console.log('========= LANDMARK DESIGN =========');

    this.template = 'Landmark Design';
    this.id = null;
    this.name = null;
    this.quantity = null;
    this.craftingStation = null;
    this.components = [];
    
    if (object instanceof Parsoid.PTemplate) {
        this.id = object.get('id').value.get(0).toString();
        this.name = object.get('creates').value.get(0).toString();
        this.quantity = object.get('quantity').value.get(0).toString();
        this.craftingStation = object.get('crafting station').value.get(0).toString();
    }
    
    //console.log(this.toJSON());
}

LandmarkDesign.prototype.loadJSON = function(json) {
    var self = this;

    this.name = json.name ? json.name : null;
    this.id = json.id ? json.id : this.name;
    this.quantity = json.quantity ? json.quantity : null;
    this.craftingStation = json.craftingStation ? json.craftingStation : null;
    if (json.designs instanceof Array) {
        json.components.forEach(function(jsonComponent) {
            var component = new LandmarkDesignComponentData();
            component.loadJSON(jsonComponent);
            self.addDesignComponentData(component);
       });
    }
    
    console.log('=========== LOAD DESIGN : ', this);
}

LandmarkDesign.prototype.toJSON = function() {
    var localComponents = [];
    
    this.components.forEach(function(component){
        localComponents.push(component.toJSON());
    });
    
    return {
        id: this.id,
        template: this.template,
        name: this.name,
        quantity: this.quantity,
        craftingStation: this.craftingStation,
        components: localComponents
    };
};

LandmarkDesign.prototype.addDesignComponentData = function(designComponentData) {

    if (typeof designComponentData.name == 'undefined') {
        return false;
    }
    
    for (var i = 0, designComponentDataLength = this.components.length; i < designComponentDataLength; i++) {
        if (this.components[i].name == designComponentData.name) {
            return false;
        }
    }
    
    this.components.push(designComponentData);
    return true;
};