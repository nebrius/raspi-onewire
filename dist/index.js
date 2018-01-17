"use strict";
/*
The MIT License (MIT)

Copyright (c) 2014-2017 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
var async_1 = require("async");
var raspi_peripheral_1 = require("raspi-peripheral");
var child_process_1 = require("child_process");
var ONEWIRE_PIN = 'GPIO4';
var DEVICES_DIR = '/sys/bus/w1/devices/w1_bus_master1';
var OneWire = /** @class */ (function (_super) {
    __extends(OneWire, _super);
    function OneWire() {
        var _this = _super.call(this, ONEWIRE_PIN) || this;
        _this._deviceIdMapping = {};
        child_process_1.execSync('modprobe w1-gpio');
        return _this;
    }
    OneWire.prototype.searchForDevices = function (cb) {
        var _this = this;
        fs_1.readFile(path_1.join(DEVICES_DIR, 'w1_master_slaves'), function (err, deviceNameListData) {
            if (err) {
                cb(err, undefined);
                return;
            }
            // Clean up the raw data and find out if there are no devices attached (edge case)
            var rawData = deviceNameListData.toString().trim();
            if (rawData.toLowerCase() === 'not found.') {
                cb(undefined, []);
                return;
            }
            // Filter out blank lines and devices whose ID starts with `00` which is technically an error code
            var filteredData = rawData.split('\n')
                .filter(function (device) { return !!device.length; })
                .filter(function (device) { return device.indexOf('00') !== 0; });
            // Read the device IDs from the device Names
            async_1.parallel(filteredData.map(function (deviceName) { return function (next) {
                fs_1.readFile(path_1.join(DEVICES_DIR, deviceName, 'id'), function (convertErr, deviceIDData) {
                    if (convertErr) {
                        next(convertErr, undefined);
                        return;
                    }
                    var deviceID = [];
                    for (var i = 0; i < 8; i++) {
                        deviceID[i] = deviceIDData[i];
                    }
                    _this._deviceIdMapping[_this._convertIDToMappingKey(deviceID)] = deviceName;
                    next(undefined, deviceID);
                });
            }; }), function (mappingErr, deviceIds) {
                if (mappingErr || !deviceIds) {
                    cb(mappingErr, undefined);
                    return;
                }
                cb(undefined, deviceIds);
            });
        });
    };
    OneWire.prototype.read = function (deviceID, numBytesToRead, cb) {
        var devicePath = path_1.join(DEVICES_DIR, this._getNameFromID(deviceID), 'w1_slave');
        fs_1.exists(devicePath, function (fileExists) {
            if (!fileExists) {
                cb(new Error("Unknown device ID " + deviceID), undefined);
                return;
            }
            fs_1.open(devicePath, 'r', function (openErr, fd) {
                if (openErr) {
                    cb(openErr, undefined);
                    return;
                }
                var data = new Buffer(numBytesToRead); // TODO: convert to Buffer.alloc once Node 4 is EOL'ed
                fs_1.read(fd, data, 0, numBytesToRead, 0, function (readErr, bytesRead) {
                    if (readErr) {
                        cb(readErr, undefined);
                        return;
                    }
                    var finalData = new Buffer(bytesRead);
                    data.copy(finalData, 0, 0, bytesRead);
                    cb(undefined, finalData);
                });
            });
        });
    };
    OneWire.prototype.readAllAvailable = function (deviceID, cb) {
        var devicePath = path_1.join(DEVICES_DIR, this._getNameFromID(deviceID), 'w1_slave');
        fs_1.exists(devicePath, function (fileExists) {
            if (!fileExists) {
                cb(new Error("Unknown device ID " + deviceID), undefined);
                return;
            }
            fs_1.readFile(devicePath, cb);
        });
    };
    OneWire.prototype._convertIDToMappingKey = function (deviceID) {
        return deviceID.join('-');
    };
    OneWire.prototype._getNameFromID = function (deviceID) {
        return this._deviceIdMapping[this._convertIDToMappingKey(deviceID)];
    };
    return OneWire;
}(raspi_peripheral_1.Peripheral));
exports.OneWire = OneWire;
//# sourceMappingURL=index.js.map