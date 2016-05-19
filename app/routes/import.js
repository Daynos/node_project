var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    //mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var merge = require('merge');
var strict = true,
    options = {
        trim: true,
    },
    saxStream = require("sax").createStream(strict, options);

//var ItemData = require('../models/item.js');

var openedNodes = [];
var currentDepth = 0;

var currentItem = {};
var currentDesign = {};

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

function switchTag(name, attrs, text) {
    switch (name) {
        case 'title':
            console.log(attrs, text);
            addToJson({
                property: 'title',
                value: text,
            })
            break;
        default:
            break;
    }
}

function addToJson(object) {
    var updateObject;
    //console.log ('addToJson', object);
    switch (object.property) {
        case 'name':
            updateObject = {
                item: {
                    name: object.value,
                },
                itemData: {
                    id: object.value,
                    name: object.value,
                },
            };
            break;
        case 'description':
            updateObject = {
                itemData: {
                    description: object.value,
                },
            };
            break;
            /*case 'craftingStation':
                updateObject = {
                    designs: [{
                        craftingStation: object.value,
                    }],
                };
                break; */
    }
    merge.recursive(currentItem, updateObject);
    console.log(currentItem);
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
        switchTag(currentNode.name, currentNode.attrs, text);
    }
});

saxStream.on('end', function(name) {
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
