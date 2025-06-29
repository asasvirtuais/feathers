# @asasvirtuais/feathers

A FeathersJS CRUD adapter that integrates with the @asasvirtuais/crud interface.

## Installation

```bash
npm install @asasvirtuais/feathers
```

## Usage

```typescript
import { crud } from '@asasvirtuais/feathers'
import { feathers } from '@feathersjs/feathers'

// Create a FeathersJS application
const app = feathers()

// Create CRUD instance
const feathersCrud = crud(app)

// Use standard CRUD operations
const user = await feathersCrud.find({ table: 'users', id: '123' })
const newUser = await feathersCrud.create({ table: 'users', data: { name: 'John' } })
const updatedUser = await feathersCrud.update({ table: 'users', id: '123', data: { name: 'Jane' } })
const users = await feathersCrud.list({ table: 'users', query: { name: 'John' } })
await feathersCrud.remove({ table: 'users', id: '123' })
```

## Features

- Seamless integration with FeathersJS applications
- Consistent CRUD interface
- TypeScript support
- Props-based API for better readability

## License

ISC