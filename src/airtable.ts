import { Service } from '@feathersjs/feathers'
import type { Params as FeathersParams } from '@feathersjs/feathers'
import { Query, mapQuery } from './query'
import sdk from '@asasvirtuais/airtable'

export type Params = FeathersParams<Query>

export type AirtableRecord<Fields = {}> = {
  id: string
  fields: Fields
}

// Map an Airtable record to a plain object with id and fields
export function mapAirtableRecordToObject<Fields = {}>(record: AirtableRecord<Fields>) {
  return {
    id: record.id,
    ...record.fields,
  }
}

// Map a plain object to Airtable record format
export function mapObjectToAirtableRecord<Data = {}>(data: Data) {
  return {
    fields: { ...data },
  }
}

// Main service factory for Airtable
export function createAirtableService<T = any, D = Partial<T>>(baseId: string, tableId: string): Service<T, D, Params> {
  
  // Helper to build query params for Airtable API
  function buildQueryParams(selectOptions: any): Record<string, any> {
    const params: Record<string, any> = {}
    if (selectOptions.filterByFormula) params['filterByFormula'] = selectOptions.filterByFormula
    if (selectOptions.maxRecords) params['maxRecords'] = selectOptions.maxRecords
    if (selectOptions.fields) params['fields[]'] = selectOptions.fields
    if (selectOptions.sort) {
      selectOptions.sort.forEach((s: any, i: number) => {
        params[`sort[${i}][field]`] = s.field
        params[`sort[${i}][direction]`] = s.direction
      })
    }
    return params
  }

  const api = sdk.api.base(baseId).table(tableId)

  return {
    async find(params: Params = {}) {
      const query = params?.query || {}
      const selectOptions: any = {}
      let skip = 0

      if (Object.keys(query).length > 0) {
        const { $limit, $sort, $select, $skip, ...restQuery } = query

        const filterFormula = mapQuery(restQuery)
        if (filterFormula) selectOptions.filterByFormula = filterFormula

        if ($sort) {
          selectOptions.sort = Object.keys($sort)
            .filter((key) => key !== "id")
            .map((key) => ({
              field: key,
              direction: $sort[key] as 1 | -1 > 0 ? "asc" : "desc"
            }))
        }

        if ($select) selectOptions.fields = $select
        if ($limit) selectOptions.maxRecords = parseInt(`${$limit}`)

        if ($skip) {
          skip = parseInt(`${$skip}`)
          selectOptions.maxRecords = (selectOptions.maxRecords || 0) + skip
        }
      }

      const paramsObj = buildQueryParams(selectOptions)
      const response = await api.query(paramsObj).get().json<any>()
      const records = (response.records || []).map(mapAirtableRecordToObject)
      if (skip) return records.slice(skip)
      return records
    },

    async setup(app) {
      // Setup hook if needed
    },

    async get(id, params) {
      const response = await api.url(`/${id}`).get().json<any>()
      return mapAirtableRecordToObject(response)
    },

    async create(data, params) {
      if (Array.isArray(data)) {
        return (await Promise.all(data.map((item) => this.create!(item, params)))) as any
      }
      const payload = { records: [mapObjectToAirtableRecord(data)] }
      const response = await api.post(payload).json<any>()
      return mapAirtableRecordToObject(response.records[0])
    },

    async patch(id, data, params) {
      let recordsPayload
      if (id) {
        recordsPayload = [{ id, ...mapObjectToAirtableRecord(data) }]
      } else if (Array.isArray(data)) {
        recordsPayload = data.map((item) => mapObjectToAirtableRecord(item))
      } else {
        recordsPayload = [{ id, fields: {} }]
      }
      const payload = { records: recordsPayload }
      const response = await api.patch(payload).json<any>()
      return Array.isArray(response.records)
        ? response.records.map(mapAirtableRecordToObject)
        : mapAirtableRecordToObject(response.records)
    },

    async update(id, data, params) {
      let recordsPayload
      if (id) {
        const updatedData = { ...data, id } as any
        recordsPayload = [mapObjectToAirtableRecord(updatedData)]
      } else {
        recordsPayload = [mapObjectToAirtableRecord(data)]
      }
      const payload = { records: recordsPayload }
      const response = await api.put(payload).json<any>()
      return Array.isArray(response.records)
        ? mapAirtableRecordToObject(response.records[0])
        : mapAirtableRecordToObject(response.records)
    },

    async remove(id, params) {
      if (!id) {
        const records = await this.find!(params)
        if (Array.isArray(records)) {
          return Promise.all(records.map((rec: any) => this.remove!(rec.id, params))) as any
        }
        return [] as any
      }
      const response = await api.url(`/${id}`).delete().json<any>()
      return response.deleted ? { id, deleted: true } : response
    }
  }
}