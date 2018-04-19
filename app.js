/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    bodyParser = require('body-parser'),
    elasticsearch = require('elasticsearch');


var app = express();
app.config = require((process.env.NODE_ENV === 'test') ? './config-test' : './config');

// Set database
app.esClient = new elasticsearch.Client({
    host: app.config.elasticsearch.uri,
    api: '5.0'
});

app.esClient.ping({
    // Ping usually has a 3000ms timeout
    requestTimeout: 3000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('Successfully connected to elasticsearch: ' + app.config.elasticsearch.uri);
    }
});

// View engine setup
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));

// Enable cross-origin resource sharing - CORS http://enable-cors.org/index.html
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Credentials', true);

    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '1mb'}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.sendDefaultSuccessMessage = function () {
        res.json({
            message: 'Success.'
        });
    };
    next();
});

app.get('/', function (req, res) {
    res.render('index');
});
app.get('/student', function (req, res) {
    res.render('student');
});

var fs = require('fs');
app.get('/pre/:token', function (req, res) {
    var token = req.params.token;
    // Loop through all the files in the temp directory
    var dir = './pre/';
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.json({message: 'Not found!'});
        }

        files.forEach(function (file, index) {
            // Make one pass and make the file complete
            var content = fs.readFileSync(dir + file, 'utf8');

            if (content.indexOf(token.toUpperCase()) !== -1) {
                var lines = content.split('\n');
                lines.forEach(function (line) {
                    if (line.indexOf(token.toUpperCase()) !== -1) {
                        return res.json({line: line});
                    }
                });
            }
        });
    });
});

app.get('/post/:token', function (req, res) {
    var token = req.params.token;
    // Loop through all the files in the temp directory
    var dir = './post/';
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.json({message: 'Not found!'});
        }

        files.forEach(function (file, index) {
            // Make one pass and make the file complete
            var content = fs.readFileSync(dir + file, 'utf8');

            if (content.indexOf(token.toUpperCase()) !== -1) {
                var lines = content.split('\n');
                lines.forEach(function (line) {
                    if (line.indexOf(token.toUpperCase()) !== -1) {
                        return res.json({line: line});
                    }
                });
            }
        });
    });
});


// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    var info = {
        message: err.message
    };
    info.stack = err.stack;
    res.status(err.status || 500).json(info);
});

module.exports = app;
