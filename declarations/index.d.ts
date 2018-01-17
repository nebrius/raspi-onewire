/// <reference types="node" />
import { Peripheral } from 'raspi-peripheral';
export declare type Callback<T> = (readErr: string | Error | undefined, value: T | undefined) => void;
export declare class OneWire extends Peripheral {
    private _deviceIdMapping;
    constructor();
    searchForDevices(cb: Callback<number[][]>): void;
    read(deviceID: number[], numBytesToRead: number, cb: Callback<Buffer>): void;
    readAllAvailable(deviceID: number[], cb: Callback<Buffer>): void;
    private _convertIDToMappingKey(deviceID);
    private _getNameFromID(deviceID);
}
