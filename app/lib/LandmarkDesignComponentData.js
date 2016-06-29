'use strict';

var Parsoid = require('parsoid');

module.exports = LandmarkDesignComponentData;

function LandmarkDesignComponentData(object) {
    //console.log('========= LANDMARK DESIGN COMPONENT DATA =========');

    this.template = 'Landmark Design Component Data';
    this.name = null;
    this.quantity = null;
    
    if (object instanceof Parsoid.PTemplate) {
        this.name = object.get('component').value.get(0).toString();
        this.quantity = object.get('quantity').value.get(0).toString();
    }
    
    //console.log (this.toJSON());
}

LandmarkDesignComponentData.prototype.toJSON = function() {
    return {
        template: this.template,
        name: this.name,
        quantity: this.quantity
    };
};