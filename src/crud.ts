import { Application } from '@feathersjs/feathers'
import { CRUD, FindProps, CreateProps, UpdateProps, RemoveProps, ListProps } from '@asasvirtuais/crud'

export const crud = <Readable, Writable = Readable>(feathers: Application): CRUD<Readable, Writable> => {
    return {
        async find({ table, id }){
            return feathers.service(table).get(id)
        },
    
        async create({ table, data }) {
            return feathers.service(table).create(data as any)
        },
    
        async update({ table, id, data }) {
            return feathers.service(table).patch(id, data)
        },
    
        async remove({ table, id }) {
            return feathers.service(table).remove(id)
        },
    
        async list({ table, query }) {
            const result = await feathers.service(table).find({ query })
            return Array.isArray(result) ? result : result.data || []
        }
    }
}