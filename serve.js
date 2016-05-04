"use strict";

// BASE SETUP
// =============================================================================

// Packages wee need
var express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    twig = require('twig'),
    lastPackage = true;

var app = express();

// Models 
var //db = require('./app/models/db'),
    lastModel = true;

// Routes
var indexRoutes = require('./app/routes/index'),
    //bearsRoutes = require('./app/routes/bears'),
    itemRoutes = require('./app/routes/item'),
    itemDataRoutes = require('./app/routes/itemData'),
    designsRoutes = require('./app/routes/designs'),
    lastRoutes = true;

var PORT = process.env.PORT || 3000;

global.appRoot = path.resolve(__dirname);

// Set
app.set('port', PORT);

// Use
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'app/public')));

// TWIG
// =============================================================================
// view engine setup
app.engine('twig', twig.__express);
if (app.get('env') === 'development') {
    twig.cache(false);
}
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'twig');
/*app.set("view options", {
    layout: false
});*/

// This section is optional and used to configure twig.
app.set("twig options", {
    strict_variables: false
});


// ROUTES FOR OUR API
// =============================================================================
app.use('/', indexRoutes);
//app.use('/api', bearsRoutes);
app.use('/item', itemRoutes);
app.use('/itemData', itemDataRoutes);
app.use('/designs', designsRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// START THE SERVER
// =============================================================================

//app.listen(PORT);
app.listen(app.get('port'), function() {
    console.log('Express web server is listening on port ' + app.get('port'));
});
//console.log('server started on port %s', PORT);
