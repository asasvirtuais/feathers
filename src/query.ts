// FeathersJS query types and Airtable formula mapping
// Re-export from @asasvirtuais/crud for consistency
export type { Query, Operators, Filters } from '@asasvirtuais/crud'
import type { Query } from '@asasvirtuais/crud'

// Helper to escape single quotes in values for Airtable formula
function escapeAirtableValue(val: any): string {
  if (typeof val === 'string') {
    return val.replace(/'/g, "\\'")
  }
  return val
}

// Recursively map FeathersJS query to Airtable formula
export function mapQuery(queryParams: Query): string {
  if (typeof queryParams !== "object" || queryParams === null) {
    return String(queryParams)
  }

  // Handle $or
  if (Array.isArray(queryParams.$or)) {
    const orConditions = queryParams.$or
      .map((subQuery: any) => mapQuery(subQuery))
      .filter(Boolean)
    return `OR(${orConditions.join(",")})`
  }

  // Handle AND (default)
  const conditions: string[] = []
  for (const key in queryParams) {
    if (key === '$or') continue
    const value = queryParams[key]

    if (typeof value === 'object' && value !== null) {
      // Operator-based
      for (const op in value) {
        const opValue = value[op]
        switch (op) {
          case '$on':
            conditions.push(
              `FIND('${opValue}', ARRAYJOIN({${key}}, ',')) > 0`
            )
            break
          case '$in':
            conditions.push(
              `OR(${opValue.map((v: any) => `{${key}} = '${escapeAirtableValue(v)}'`).join(",")})`
            )
            break
          case '$nin':
            conditions.push(
              `AND(${opValue.map((v: any) => `NOT({${key}} = '${escapeAirtableValue(v)}')`).join(",")})`
            )
            break
          case '$lt':
            conditions.push(`{${key}} < '${escapeAirtableValue(opValue)}'`)
            break
          case '$lte':
            conditions.push(`{${key}} <= '${escapeAirtableValue(opValue)}'`)
            break
          case '$gt':
            conditions.push(`{${key}} > '${escapeAirtableValue(opValue)}'`)
            break
          case '$gte':
            conditions.push(`{${key}} >= '${escapeAirtableValue(opValue)}'`)
            break
          case '$ne':
            conditions.push(`{${key}} != '${escapeAirtableValue(opValue)}'`)
            break
          default:
            throw new Error(`Invalid Operator ${op} for field ${key}`)
        }
      }
    } else {
      // Simple equality
      conditions.push(`{${key}} = '${escapeAirtableValue(value)}'`)
    }
  }

  if (conditions.length > 1) {
    return `AND(${conditions.join(",")})`
  }
  return conditions[0] || ''
}