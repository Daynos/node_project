var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    //mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var ItemData = require('../models/item.js');

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
        var xmlTemplate = 'output/xml/item',
            jsonFile = path.resolve(appRoot, 'datas/json/' + req.params.item_id + '.json'),
            jsonData;

        fs.readFile(jsonFile, 'utf8', function(err, data) {
            var jsonData;

            if (err) {
                throw err;
            }

            jsonData = JSON.parse(data);
            jsonData.title = jsonData.item.name;
            jsonData.timestamp = getTimestamp();

            res.render(xmlTemplate, jsonData);
        });
    });

module.exports = router;
