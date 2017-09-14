#!/usr/bin/env node
/*
The MIT License (MIT)

Copyright (c) 2014-2017 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

const fs = require('fs');
const iniBuilder = require('ini-builder');

console.log('Checking if 1-Wire is enabled at boot time');

let config = '';

try {
  config = fs.readFileSync('/boot/config.txt').toString();
} catch (e) {
  if (e.code == 'ENOENT') {
    console.log('/boot/config.txt does not exist, a new one will be created');
  }
}

config = iniBuilder.parse(config, { commentDelimiter: '#' });

const dtoverlay = iniBuilder.findAll(config, [ 'dtoverlay' ]);
let isEnabled = !!dtoverlay.filter((entry) => entry.value === 'w1-gpio').length;
if (!isEnabled) {
  config.push({
    path: [ 'dtoverlay' ],
    value: 'w1-gpio'
  });
  console.log('Enabled 1-Wire at boot time');
  fs.writeFileSync('/boot/config.txt', iniBuilder.serialize(config));
  console.warn('YOU MUST REBOOT YOUR PI BEFORE USING 1-WIRE!');
} else {
  console.log('1-Wire is already enabled at boot time');
}
