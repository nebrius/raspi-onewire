/// <reference types="node" />
import { Peripheral } from 'raspi-peripheral';
export declare class OneWire extends Peripheral {
    constructor();
    searchForDevices(cb: (err: string | Error | undefined, devices: string[] | undefined) => void): void;
    read(deviceID: string, numBytesToRead: number, cb: (err: string | Error | undefined, data: Buffer | undefined) => void): void;
    readAllAvailable(deviceID: string, cb: (err: string | Error | undefined, data: Buffer | undefined) => void): void;
}
