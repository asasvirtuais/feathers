import { Application } from '@feathersjs/feathers';
import { CRUD } from '@asasvirtuais/crud';
export declare const crud: <Readable, Writable = Readable>(feathers: Application) => CRUD<Readable, Writable>;
