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

import { join } from 'path';
import { readFile, exists, open, read } from 'fs';
import { parallel } from 'async';
import { Peripheral } from 'raspi-peripheral';
import { execSync } from 'child_process';

const ONEWIRE_PIN = 'GPIO4';
const DEVICES_DIR = '/sys/bus/w1/devices/w1_bus_master1';

export type Callback<T> = (readErr: string | Error | undefined, value: T | undefined) => void;

export class OneWire extends Peripheral {

  private _deviceIdMapping: { [ deviceId: string ]: string } = {};

  constructor() {
    super(ONEWIRE_PIN);
    execSync('modprobe w1-gpio');
  }

  public searchForDevices(cb: Callback<number[][]>): void {
    readFile(join(DEVICES_DIR, 'w1_master_slaves'), (err, deviceNameListData) => {
      if (err) {
        cb(err, undefined);
        return;
      }

      // Clean up the raw data and find out if there are no devices attached (edge case)
      const rawData = deviceNameListData.toString().trim();
      if (rawData.toLowerCase() === 'not found.') {
        cb(undefined, []);
        return;
      }

      // Filter out blank lines and devices whose ID starts with `00` which is technically an error code
      const filteredData = rawData.split('\n')
        .filter((device) => !!device.length)
        .filter((device) => device.indexOf('00') !== 0);

      // Read the device IDs from the device Names
      parallel(filteredData.map((deviceName) => (next: Callback<number[]>) => {
        readFile(join(DEVICES_DIR, deviceName, 'id'), (convertErr, deviceIDData) => {
          if (convertErr) {
            next(convertErr, undefined);
            return;
          }
          const deviceID: number[] = [];
          for (let i = 0; i < 8; i++) {
            deviceID[i] = deviceIDData[i];
          }
          this._deviceIdMapping[this._convertIDToMappingKey(deviceID)] = deviceName;
          next(undefined, deviceID);
        });
      }), (mappingErr, deviceIds) => {
        if (mappingErr || !deviceIds) {
          cb(mappingErr, undefined);
          return;
        }
        cb(undefined, deviceIds as number[][]);
      });
    });
  }

  public read(deviceID: number[], numBytesToRead: number, cb: Callback<Buffer>): void {
    const devicePath = join(DEVICES_DIR, this._getNameFromID(deviceID), 'w1_slave');
    exists(devicePath, (fileExists) => {
      if (!fileExists) {
        cb(new Error(`Unknown device ID ${deviceID}`), undefined);
        return;
      }
      open(devicePath, 'r', (openErr, fd) => {
        if (openErr) {
          cb(openErr, undefined);
          return;
        }
        const data = new Buffer(numBytesToRead); // TODO: convert to Buffer.alloc once Node 4 is EOL'ed
        read(fd, data, 0, numBytesToRead, 0, (readErr, bytesRead) => {
          if (readErr) {
            cb(readErr, undefined);
            return;
          }
          const finalData = new Buffer(bytesRead);
          data.copy(finalData, 0, 0, bytesRead);
          cb(undefined, finalData);
        });
      });
    });
  }

  public readAllAvailable(deviceID: number[], cb: Callback<Buffer>): void {
    const devicePath = join(DEVICES_DIR, this._getNameFromID(deviceID), 'w1_slave');
    exists(devicePath, (fileExists) => {
      if (!fileExists) {
        cb(new Error(`Unknown device ID ${deviceID}`), undefined);
        return;
      }
      readFile(devicePath, cb);
    });
  }

  private _convertIDToMappingKey(deviceID: number[]): string {
    return deviceID.join('-');
  }

  private _getNameFromID(deviceID: number[]): string {
    return this._deviceIdMapping[this._convertIDToMappingKey(deviceID)];
  }

}
