var
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Parsoid = require('parsoid'), //npm Wiki Parser;
    LandmarkItem = require('../lib/LandmarkItem'),
    LandmarkItemData = require('../lib/LandmarkItemData'),
    LandmarkDesign = require('../lib/LandmarkDesign'),
    LandmarkDesignComponentData = require('../lib/LandmarkDesignComponentData');

var HtmlNode = function() {
    var self = this,
        currentDepth = 0,
        currentItem = new LandmarkItem(),
        openedNodes = [];

    this.openNode = function(node) {
        //console.log('HtmlNode.openNode');

        currentDepth++;
        openedNodes[currentDepth] = {
            depth: currentDepth,
            name: node.name,
            attrs: node.attributes,
        }
    };

    this.closeNode = function(node) {
        //console.log(node);
        currentDepth--;
    }

    this.textNode = function(text) {
        var currentNode = openedNodes[currentDepth];
        //console.log(currentNode);
        if ('undefined' != typeof currentNode) {
            //console.log(currentNode);
            this.parseXmlText(currentNode.name, currentNode.attrs, text);
        }
    }

    this.parseXmlText = function(name, attrs, text) {
        if ('' == text || null === text) {
            return;
        }

        switch (name) {
            case 'text':
                Parsoid.parse(text, {
                    pdoc: true
                }).then(function(pdoc) {
                    var i,
                        object = {},
                        template = {},
                        templateName = '',
                        templates = pdoc.filterTemplates(),
                        updateObject = {};

                    for (i in templates) {
                        template = templates[i];
                        templateName = template.name.trim();
                        object = self.parseTemplate(templateName, template);
                        self.updateCurrentItem(object);
                    }

                    //currentItem = loadJSON(currentItemName);
                    //currentItem = addToJson(templateName, currentItem, updateObject);
                    //saveJSON(currentItemName, currentItem);

                }).done();

                break;
            default:
                break;
        }
    }

    this.parseTemplate = function(templateName, template) {
        var obj = {};

        switch (templateName) {
            case 'Landmark Item':
                this.saveCurrentItem();
                currentItem = new LandmarkItem(template);
                currentItem.save(function(err, savedItem) {
                    if (err)
                        console.log(err);
                    console.log("Saved Landmark Item: ", savedItem);
                });
                break;
            case 'Landmark Item Data':
                this.saveCurrentItem();
                currentItem = new LandmarkItemData(template);
                break;
            case 'Landmark Design':
                obj = new LandmarkDesign(template);
                if (currentItem.name != obj.name) {
                    this.switchCurrentItemTo(obj.name);
                }
                break;
            case 'Landmark Design Component Data':
                obj = new LandmarkDesignComponentData(template);
                break;
            default:
                break;
        }
        return obj;
    }

    this.switchCurrentItemTo = function(itemName) {
        var json;
        
        this.saveCurrentItem();
        
        currentItem = new LandmarkItem({ name: itemName });
        
        json = this.loadJSON(itemName);
        if (json.name == itemName) {
           currentItem.loadJSON(json);
        } 
    }

    this.saveCurrentItem = function() {
        var itemName = '',
            json = '';
            
        if (currentItem.get) {
            console.log('currentItem: ', currentItem);
            itemName = currentItem.get('name');
            json = currentItem.toJSON();
        } else {
            return;
        }

        console.log('=========== SAVE ITEM `' + itemName + '`');
        this.saveJSON (itemName, json);
    }
    
    this.saveJSON = function(itemName, json) {    
        var jsonFile = path.resolve(global.appRoot, 'datas/json/' + itemName + '.json');        
        
        try {
            fs.writeFile(jsonFile, JSON.stringify(json), 'utf8', function(err, data) {
                if (err) {
                    throw err;
                }
                console.log('`' + jsonFile + '` saved');
            });
        }
        catch (e) {
            console.log('`' + jsonFile + '` NOT saved');
        }

        return true;
    }

    this.loadJSON = function(itemName) {
        var jsonFile = path.resolve(global.appRoot, 'datas/json/' + itemName + '.json'),
            json = {};
        try {
            var json = JSON.parse(fs.readFileSync(jsonFile));
        }
        catch (err) {

        }

        return json;
    }

    this.updateCurrentItem = function(object) {
        if (typeof object != 'undefined' && object.template) {
            switch (object.template) {
                case 'Landmark Design':
                    currentItem.addDesign(object);
                    break;
                case 'Landmark Design Component Data':
                    currentItem.addDesignComponentData(object);
                    break;
                default:
                    break;
            }

        }
    }


    this.on('open', function(node) {
        //console.log(node);
        self.openNode(node);
    });

    this.on('close', function(node) {
        //console.log(node);
        self.closeNode(node);
    });

    this.on('text', function(text) {
        //console.log(text);
        self.textNode(text);
    });
};

/*
//var ItemData = require('../models/item.js');

var openedNodes = [];
var currentDepth = 0;

function loadJSON(itemName) {
    var jsonFile = path.resolve(global.appRoot, 'datas/json/' + itemName + '.json'),
        json = {};
    try {
        var json = JSON.parse(fs.readFileSync(jsonFile));
    } catch (err) {

    }

    return json;
}

function addToJson(templateName, currentItem, object) {
    var updateObject;

    console.log('addToJson', templateName, currentItem, object);

    switch (templateName) {
        case 'Landmark':
            break;
        case 'Landmark Design':
            updateObject = {
                designs: [object]
            };
        case 'Landmark Design Data':
            updateObject = {
                designs: object
            };
            break;
    }

    console.log('addToJson', currentItem, updateObject);

    return merge.recursive(currentItem, updateObject);
}

function saveJSON(itemName, json) {
    var jsonFile = path.resolve(global.appRoot, 'datas/json/' + itemName + '.json');

    //console.log('saveJSON', itemName, json);

    try {
        fs.writeFile(jsonFile, JSON.stringify(json), 'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            console.log('`' + jsonFile + '` saved');
        });
    } catch (e) {
        console.log('`' + jsonFile + '` NOT saved');
    }

    return true;
}
*/

// extend the EventEmitter class using our HtmlNode class
util.inherits(HtmlNode, EventEmitter);

// we specify that this module is a refrence to the HtmlNode class
module.exports = HtmlNode;