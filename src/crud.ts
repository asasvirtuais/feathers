import { Application } from '@feathersjs/feathers'
import { CRUD, FindProps, CreateProps, UpdateProps, RemoveProps, ListProps } from '@asasvirtuais/crud'

export const crud = <Readable, Writable = Readable>(feathers: Application): CRUD<Readable, Writable> => {
    return {
        async find({ table, id }: FindProps): Promise<Readable> {
            return feathers.service(table).get(id)
        },
    
        async create({ table, data }: CreateProps<Writable>): Promise<Readable> {
            return feathers.service(table).create(data as any)
        },
    
        async update({ table, id, data }: UpdateProps<Writable>): Promise<Readable> {
            return feathers.service(table).patch(id, data as any)
        },
    
        async remove({ table, id }: RemoveProps): Promise<Readable> {
            return feathers.service(table).remove(id)
        },
    
        async list({ table, query }: ListProps<Readable>): Promise<Readable[]> {
            const result = await feathers.service(table).find({ query })
            return Array.isArray(result) ? result : result.data || []
        }
    }
}