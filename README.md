# Night Club API

## Installation

```bash
npm install
```

## Running the API

```bash
npm start
```

The API will be available at [http://localhost:4000](http://localhost:4000).

For local development with auto-reload:

```bash
npm run dev
```

Useful data scripts:

```bash
npm run backup-db
npm run reset-db
npm run seed
```

`reset-db` and `seed` both restore `db.json` from `db_backup.json`.

## Health Check

Use [http://localhost:4000/health](http://localhost:4000/health) to confirm that the server is running.

Example response:

```json
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": "2026-04-27T08:00:00.000Z"
}
```

## API Contract

Core read endpoints:

- `GET /events`
- `GET /blogposts`
- `GET /blogposts/:id`
- `GET /blogposts/:id?_embed=comments`
- `GET /comments?blogpostId=:id`
- `GET /gallery`
- `GET /testimonials`

Core write endpoints:

- `POST /comments`
- `POST /contact_messages`
- `POST /newsletters`
- `POST /reservations`
- `DELETE /comments/:id`
- `DELETE /reservations/:id`

System endpoint:

- `GET /health`

## Validation And Errors

The server now validates write requests for these collections:

- `events`
- `blogposts`
- `comments`
- `gallery`
- `testimonials`
- `contact_messages`
- `reservations`
- `newsletters`

Validation errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      {
        "field": "email",
        "message": "email must be a valid email address.",
        "code": "invalid"
      }
    ]
  }
}
```

Newsletter signups also reject duplicate email addresses with HTTP `409 Conflict`.

Common status codes:

- `200 OK` for successful reads and health checks
- `201 Created` for successful `POST` requests
- `400 Bad Request` with `VALIDATION_ERROR` for invalid payloads
- `404 Not Found` with `NOT_FOUND` for unknown routes
- `409 Conflict` with `RESOURCE_CONFLICT` for duplicate newsletter signups
- `500 Internal Server Error` with `INTERNAL_SERVER_ERROR` for unexpected server failures

## Documentation

Docs are located at [http://localhost:4000](http://localhost:4000).

**Note:** Authentication has been removed from this API. You can access all endpoints without an access token.

Read about `json-server` features like pagination, embedding and filtering at [npmjs.com/package/json-server](https://www.npmjs.com/package/json-server).
