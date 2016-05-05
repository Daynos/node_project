var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    //mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//var ItemData = require('../models/item.js');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

function getTimestamp() {
    return moment().toISOString();
}

function formatDate(date) {
    return moment(date, 'YYYYMMDD').format('YYYY/MM/DD');
}

router.route('/:item_id')
    .get(function(req, res) {
        var xmlTemplate = 'output/xml/mediawiki',
            jsonFile = path.resolve(global.appRoot, 'datas/json/' + req.params.item_id + '.json'),
            jsonData;

        fs.readFile(jsonFile, 'utf8', function(err, data) {
            var jsonData;

            if (err) {
                throw err;
            }

            jsonData = JSON.parse(data);
            jsonData.timestamp = getTimestamp();

            res.render(xmlTemplate, jsonData, function(err, html) {
                var filename = global.appRoot + '/tmp/' + req.params.item_id + '.xml';
                fs.writeFile(filename, html, function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log('The file `'+filename+'` was saved!');

                    res.sendFile(filename);
                });

            });
        });
    });

module.exports = router;
