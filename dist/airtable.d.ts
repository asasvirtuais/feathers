import { Service } from '@feathersjs/feathers';
import type { Params as FeathersParams } from '@feathersjs/feathers';
import { Query } from './query';
export type Params = FeathersParams<Query>;
export type AirtableRecord<Fields = {}> = {
    id: string;
    fields: Fields;
};
export declare function mapAirtableRecordToObject<Fields = {}>(record: AirtableRecord<Fields>): {
    id: string;
} & Fields;
export declare function mapObjectToAirtableRecord<Data = {}>(data: Data): {
    fields: Data;
};
export interface AirtableAPI {
    query(params: Record<string, any>): {
        get(): {
            json<T>(): Promise<T>;
        };
    };
    url(path: string): {
        get(): {
            json<T>(): Promise<T>;
        };
        delete(): {
            json<T>(): Promise<T>;
        };
    };
    post(data: any): {
        json<T>(): Promise<T>;
    };
    patch(data: any): {
        json<T>(): Promise<T>;
    };
    put(data: any): {
        json<T>(): Promise<T>;
    };
}
export declare function createAirtableService<T = any, D = Partial<T>>(api: AirtableAPI): Service<T, D, Params>;
