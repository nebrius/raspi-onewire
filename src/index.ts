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
import { Peripheral } from 'raspi-peripheral';
import { execSync } from 'child_process';

const ONEWIRE_PIN = 'GPIO4';
const DEVICES_DIR = '/sys/bus/w1/devices/w1_bus_master1';

export class OneWire extends Peripheral {

  constructor() {
    super(ONEWIRE_PIN);
    execSync('modprobe w1-gpio');
  }

  public searchForDevices(cb: (err: string | Error | undefined, devices: string[] | undefined) => void): void {
    readFile(join(DEVICES_DIR, 'w1_master_slaves'), (err, data) => {
      if (err) {
        cb(err, undefined);
        return;
      }

      // Clean up the raw data and find out if there are no devices attached (edge case)
      const rawData = data.toString().trim();
      if (rawData.toLowerCase() === 'not found.') {
        cb(undefined, []);
        return;
      }

      // Filter out blank lines and devices whose ID starts with `00` which is technically an error code
      const filteredData = rawData.split('\n')
        .filter((device) => !!device.length)
        .filter((device) => device.indexOf('00') !== 0);
      cb(undefined, filteredData);
    });
  }

  public read(deviceID: string, numBytesToRead: number, cb: (err: string | Error | undefined, data: Buffer | undefined) => void): void {
    const devicePath = join(DEVICES_DIR, deviceID, 'w1_slave');
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

  public readAllAvailable(deviceID: string, cb: (err: string | Error | undefined, data: Buffer | undefined) => void): void {
    const devicePath = join(DEVICES_DIR, deviceID, 'w1_slave');
    exists(devicePath, (fileExists) => {
      if (!fileExists) {
        cb(new Error(`Unknown device ID ${deviceID}`), undefined);
        return;
      }
      readFile(devicePath, cb);
    });
  }

}
