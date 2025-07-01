import { Application, Service } from "@feathersjs/feathers"
import {
  CRUD,
  FindProps,
  CreateProps,
  UpdateProps,
  RemoveProps,
  ListProps,
} from "@asasvirtuais/crud"

export const crud = (
  feathers: Application<{
    [table: string]: CRUD<any, any>
  }>
): CRUD => {
  return {
    async find(props) {
      return feathers.service(props.table).find(props)
    },

    async create(props) {
      return feathers.service(props.table).create(props)
    },

    async update(props) {
      return feathers.service(props.table).update(props)
    },

    async remove(props) {
      return feathers.service(props.table).remove(props)
    },

    async list(props) {
      return feathers.service(props.table).list(props)
    },
  }
}
