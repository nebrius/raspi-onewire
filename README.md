Raspi OneWire
=============

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi OneWire is part of the [Raspi.js suite of libraries](https://github.com/nebrius/raspi) that provides access to a software emulated 1-wire interface on a Raspberry Pi.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Raspi IO Contributing Guide](https://github.com/nebrius/raspi-io/blob/master/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 4.0.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

## Installation

First, be sure that you have installed [Raspi.js](https://github.com/nebrius/raspi).

Install with npm:

```Shell
npm install raspi-onewire
```

**Note:** this project is written in [TypeScript](http://www.typescriptlang.org/) and includes type definitions in the package.json file. This means that if you want to use it from TypeScript, you don't need to install a separate @types module.

## Example Usage

In TypeScript/ES2015+:

```JavaScript
import { init } from 'raspi';
import { OneWire } from 'raspi-onewire';

init(() => {
  const bus = new OneWire();
  bus.searchForDevices((err, devices) => {
    bus.readAllAvailable(devices[0], (err, data) => {
      console.log(data);
    });
  });
});
```

In JavaScript/ES5:

```JavaScript
const raspi = require('raspi');
const OneWire = require('raspi-onewire').OneWire;

raspi.init(() => {
  const bus = new OneWire();
  bus.searchForDevices((err, devices) => {
    bus.readAllAvailable(devices[0], (err, data) => {
      console.log(data);
    });
  });
});
```

## API

### new OneWire()

Instantiates a new OneWire instance. Note that OneWire only works on pin `GPIO4`.

_Arguments_: None

### Instance Methods

#### searchForDevices(cb)

Searches for all devices currently attached to the bus.

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call with the results.</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | Error | undefined</td>
          <td>The error, if one occurred, else undefined</td>
        </tr>
        <tr>
          <td>devices</td>
          <td>undefined | Number[][]</td>
          <td>If no error occurred, an array of zero or more device IDs</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### read(deviceID, numBytesToRead, cb)

Reads the specified number of bytes from the device specified.

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>deviceID</td>
    <td>Number[]</td>
    <td>The ID of the device, as returned from <code>searchForDevices</code>.</td>
  </tr>
  <tr>
    <td>numBytesToRead</td>
    <td>Number</td>
    <td>The number of bytes to read.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call with the read data.</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | Error | undefined</td>
          <td>The error, if one occurred, else undefined</td>
        </tr>
        <tr>
          <td>data</td>
          <td>undefined | Buffer</td>
          <td>If no error occurred, the read data. The number of bytes read may be less than <code>numBytesToRead</code> if there are not that many bytes to read at the time of the call.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

#### readAllAvailable(deviceID, cb)

Reads all available bytes from the device specified.

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>deviceID</td>
    <td>Number[]</td>
    <td>The ID of the device, as returned from <code>searchForDevices</code>.</td>
  </tr>
  <tr>
    <td>cb</td>
    <td>Function</td>
    <td>The callback to call with the read data.</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>err</td>
          <td>String | Error | undefined</td>
          <td>The error, if one occurred, else undefined</td>
        </tr>
        <tr>
          <td>data</td>
          <td>undefined | Buffer</td>
          <td>If no error occurred, the read data.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

_Returns_: None

License
=======

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
