var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    //mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    Parsoid = require('parsoid'); //npm Wiki Parser

var merge = require('merge');
var strict = true,
    options = {
        trim: true,
    },
    saxStream = require("sax").createStream(strict, options);

//var ItemData = require('../models/item.js');

var openedNodes = [];
var currentDepth = 0;

//var currentItem = {};
//var currentDesign = {};

function openNode(node) {
    //console.log(node);
    currentDepth++;
    openedNodes[currentDepth] = {
        depth: currentDepth,
        name: node.name,
        attrs: node.attributes,
    }
}

function closeNode(node) {
    //console.log(node);
    currentDepth--;
}

function parseXmlText(name, attrs, text) {
    if ('' == text || null === text) {
        return;
    }

    switch (name) {
        case 'text':
            Parsoid.parse(text, { pdoc: true }).then(function(pdoc) {
                var i,
                    template,
                    templateName = null,
                    templates = pdoc.filterTemplates(),
                    updateObject = {
                        item: {},
                        itemData: {},
                        designs: []
                    },
                    currentItem = null,
                    currentDesign = null,
                    currentItemName = null;
                

                for (i in templates) {
                    template = templates[i];
                    templateName = template.name.trim();
                    switch (templateName) {
                        case 'Landmark Design':
                            var id = template.get('id').value.get(0).toString();
                            var name = template.get('creates').value.get(0).toString();
                            var quantity = template.get('quantity').value.get(0).toString();
                            var craftingStation = template.get('crafting station').value.get(0).toString();

                            currentItemName = name;
                            currentDesign = {
                                name: name,
                                quantity: quantity,
                                craftingStation: craftingStation,
                                components: [],
                            };

                            //console.log('========= LANDMARK DESIGN =========');
                            //console.log(updateObject);

                            break;
                        case 'Landmark Design Component Data':
                            //console.log(template.params);
                            if (!currentDesign.components) {
                                currentDesign.components = [];
                            }

                            var name = template.get('component').value.get(0).toString();
                            var quantity = template.get('quantity').value.get(0).toString();

                            currentDesign.components.push({
                                quantity: quantity,
                                name: name
                            });

                            //console.log('========= LANDMARK DESIGN COMPONENT DATA =========');
                            //console.log(updateObject);

                            break;
                        default:
                            break;
                    }
                }

                currentItem = loadJSON(currentItemName);
                currentItem = addToJson(templateName, currentItem, updateObject);
                saveJSON(currentItemName, currentItem);

            }).done();

            break;
        default:
            break;
    }
}

/*function switchTag(name, attrs, text) {
    switch (name) {
        case 'text':
            //console.log(attrs, text);
            addToJson({
                property: 'text',
                value: text,
            })
            break;
        default:
            break;
    }
}*/

function loadJSON(itemName) {
    var jsonFile = path.resolve(global.appRoot, 'datas/json/' + itemName + '.json'),
        json = {};

    /*fs.readFile(jsonFile, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        currentItem = JSON.parse(data, function(){
            
        });
    });*/
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
                console.log('`' + jsonFile + '` NOT saved');
                throw err;
            }
            console.log('`' + jsonFile + '` saved');
        });
    } catch (e) {
        if (err) {
            console.log('`' + jsonFile + '` NOT saved');
            throw err;
        }

    }

    return true;
}

// === SAX STREAM

saxStream.on("error", function(e) {
    // unhandled errors will throw, since this is a proper node 
    // event emitter. 
    console.error("error!", e)
        // clear the error 
    this._parser.error = null
    this._parser.resume()
});

saxStream.on("opentag", function(node) {
    //console.log(node);
    if (node.isSelfClosing) {
        closeNode(node);
    } else {
        openNode(node);
    }
});

saxStream.on('text', function(text) {
    var currentNode = openedNodes[currentDepth];
    //console.log(currentNode);
    if ('undefined' != typeof currentNode) {
        //console.log(currentNode);
        parseXmlText(currentNode.name, currentNode.attrs, text);
    }
});

saxStream.on('end', function(name) {
    console.log(currentDesign);
    console.log("saxStream END");
});


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

router.route('/xml/:filename')
    .get(function(req, res) {
        var twigTemplate = 'output/json/mediawiki',
            xmlFile = path.resolve(global.appRoot, 'datas/xml/' + req.params.filename + '.xml'),
            outputFile = path.resolve(global.appRoot, 'tmp/' + req.params.filename + '.xml'),
            xmlData;

        fs.createReadStream(xmlFile)
            .pipe(saxStream)
            .pipe(fs.createWriteStream(outputFile));
    });

module.exports = router;
