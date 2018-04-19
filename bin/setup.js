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

var Fs = require('fs');
var Path = require('path');
var Handlebars = require('handlebars');

var configTemplatePath = Path.resolve(__dirname, '../config-example.js');
var configPath = Path.resolve(__dirname, '../config.js');

var configValue = require(Path.resolve(__dirname, '../config-values.js'));
var defaultValues = configValue.defaultValues;


var options = {
    encoding: 'utf-8'
};
var source = Fs.readFileSync(configTemplatePath, options);
var configTemplate = Handlebars.compile(source);
Fs.writeFileSync(configPath, configTemplate(defaultValues));
console.log('Setup complete.');
process.exit(0);

