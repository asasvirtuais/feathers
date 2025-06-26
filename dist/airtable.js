import { mapQuery } from './query';
// Map an Airtable record to a plain object with id and fields
export function mapAirtableRecordToObject(record) {
    return {
        id: record.id,
        ...record.fields,
    };
}
// Map a plain object to Airtable record format
export function mapObjectToAirtableRecord(data) {
    return {
        fields: { ...data },
    };
}
// Main service factory for Airtable
export function createAirtableService(api) {
    // Helper to build query params for Airtable API
    function buildQueryParams(selectOptions) {
        const params = {};
        if (selectOptions.filterByFormula)
            params['filterByFormula'] = selectOptions.filterByFormula;
        if (selectOptions.maxRecords)
            params['maxRecords'] = selectOptions.maxRecords;
        if (selectOptions.fields)
            params['fields[]'] = selectOptions.fields;
        if (selectOptions.sort) {
            selectOptions.sort.forEach((s, i) => {
                params[`sort[${i}][field]`] = s.field;
                params[`sort[${i}][direction]`] = s.direction;
            });
        }
        return params;
    }
    return {
        async find(params = {}) {
            const query = params?.query || {};
            const selectOptions = {};
            let skip = 0;
            if (Object.keys(query).length > 0) {
                const { $limit, $sort, $select, $skip, ...restQuery } = query;
                const filterFormula = mapQuery(restQuery);
                if (filterFormula)
                    selectOptions.filterByFormula = filterFormula;
                if ($sort) {
                    selectOptions.sort = Object.keys($sort)
                        .filter((key) => key !== "id")
                        .map((key) => ({
                        field: key,
                        direction: $sort[key] > 0 ? "asc" : "desc"
                    }));
                }
                if ($select)
                    selectOptions.fields = $select;
                if ($limit)
                    selectOptions.maxRecords = parseInt(`${$limit}`);
                if ($skip) {
                    skip = parseInt(`${$skip}`);
                    selectOptions.maxRecords = (selectOptions.maxRecords || 0) + skip;
                }
            }
            const paramsObj = buildQueryParams(selectOptions);
            const response = await api.query(paramsObj).get().json();
            const records = (response.records || []).map(mapAirtableRecordToObject);
            if (skip)
                return records.slice(skip);
            return records;
        },
        async setup(app) {
            // Setup hook if needed
        },
        async get(id, params) {
            const response = await api.url(`/${id}`).get().json();
            return mapAirtableRecordToObject(response);
        },
        async create(data, params) {
            if (Array.isArray(data)) {
                return (await Promise.all(data.map((item) => this.create(item, params))));
            }
            const payload = { records: [mapObjectToAirtableRecord(data)] };
            const response = await api.post(payload).json();
            return mapAirtableRecordToObject(response.records[0]);
        },
        async patch(id, data, params) {
            let recordsPayload;
            if (id) {
                recordsPayload = [{ id, ...mapObjectToAirtableRecord(data) }];
            }
            else if (Array.isArray(data)) {
                recordsPayload = data.map((item) => mapObjectToAirtableRecord(item));
            }
            else {
                recordsPayload = [{ id, fields: {} }];
            }
            const payload = { records: recordsPayload };
            const response = await api.patch(payload).json();
            return Array.isArray(response.records)
                ? response.records.map(mapAirtableRecordToObject)
                : mapAirtableRecordToObject(response.records);
        },
        async update(id, data, params) {
            let recordsPayload;
            if (id) {
                const updatedData = { ...data, id };
                recordsPayload = [mapObjectToAirtableRecord(updatedData)];
            }
            else {
                recordsPayload = [mapObjectToAirtableRecord(data)];
            }
            const payload = { records: recordsPayload };
            const response = await api.put(payload).json();
            return Array.isArray(response.records)
                ? mapAirtableRecordToObject(response.records[0])
                : mapAirtableRecordToObject(response.records);
        },
        async remove(id, params) {
            if (!id) {
                const records = await this.find(params);
                if (Array.isArray(records)) {
                    return Promise.all(records.map((rec) => this.remove(rec.id, params)));
                }
                return [];
            }
            const response = await api.url(`/${id}`).delete().json();
            return response.deleted ? { id, deleted: true } : response;
        }
    };
}
