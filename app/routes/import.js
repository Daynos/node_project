var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    //moment = require('moment'),
    //mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    Sax = require('sax'),
    HtmlNode = require("./HtmlNode"); 

//var merge = require('merge');
var strict = true,
    options = {
        trim: true,
    },
    saxStream = Sax.createStream(strict, options),
    myHtmlNode = new HtmlNode();
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
    if (node.isSelfClosing) {
        myHtmlNode.emit('close', node);
    } else {
        myHtmlNode.emit('open', node);
    }
});

saxStream.on('text', function(text) {
    myHtmlNode.emit('text', text);
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
            outputFile = path.resolve(global.appRoot, 'tmp/' + req.params.filename + '.xml');

        fs.createReadStream(xmlFile)
            .pipe(saxStream)
            .pipe(fs.createWriteStream(outputFile));
    });

module.exports = router;
