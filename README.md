# Document Lifecycle, Template & PDF Rendering Engine

A backend service for creating structured documents, managing
document lifecycle transitions, maintaining an immutable audit
trail, and dynamically rendering document payloads as downloadable
PDF files.

The included registered template reproduces the supplied
VIP Weekend Pass / Jazz Festival ticket.

## Tech Stack

- Bun
- Nitro / H3
- TypeScript
- SQLite
- Drizzle ORM
- Zod
- PDFKit
- QRCode
- Docker / Docker Compose

## Features

- Document creation in DRAFT state
- Strict lifecycle state machine
- Immutable audit trail
- Template registry
- Template-specific Zod validation
- Runtime payload transformation
- Dynamic PDF generation
- QR generation
- Direct PDF download endpoint
- SQLite persistence
- Dockerized deployment

## Document Lifecycle

Allowed transitions:

- `DRAFT -> SENT`
- `DRAFT -> VOIDED`
- `SENT -> SIGNED`
- `SENT -> VOIDED`

`SIGNED` and `VOIDED` are terminal states.

Invalid transitions return HTTP 400.

## Quick Start - Docker

Requirements:

- Docker
- Docker Compose

Start the complete service:

```bash
docker compose up --build
```

The API will be available at:

`http://localhost:3000`

## Local Development

Install dependencies:

```bash
bun install
```

Apply migrations:

```bash
bunx drizzle-kit migrate
```

Start development server:

```bash
bun run dev
```

## Create a Document

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "jazz-festival-ticket",
    "title": "VIP Weekend Pass - Jazz Festival 2026",
    "createdBy": "organizer@riversidejazz.fest",
    "data": {
      "series": "017",
      "ticketNumber": "RJF26-00482",
      "venue": "Willow Bend Riverfront Park"
    }
  }'
```

The response contains the generated document ID.

## Download the PDF

Open:

```
http://localhost:3000/api/documents/<DOCUMENT_ID>/pdf
```

or:

```bash
curl -OJ http://localhost:3000/api/documents/<DOCUMENT_ID>/pdf
```

The endpoint returns:

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="..."`

## Retrieve a Document

```
GET /api/documents/:id
```

## Transition a Document

```
POST /api/documents/:id/transition
```

Example payload:

```json
{
  "action": "SENT",
  "actor": "boxoffice@riversidejazz.fest",
  "note": "Issued ticket to attendee"
}
```

## Audit Trail

```
GET /api/documents/:id/audit-trail
```

Every successful transition records:

- Document ID
- Previous state
- Next state
- Actor
- Timestamp
- Optional note

Audit entries cannot be updated or deleted.

## Architecture

```
HTTP API
   │
   ▼
Document Service
   │
   ├──── State Machine
   │
   ├──── Audit Trail
   │
   ▼
SQLite / Drizzle

Document
   │
   ▼
Template Registry
   │
   ▼
Template Schema
   │
   ▼
Data Transformation
   │
   ▼
PDF Renderer
   │
   ▼
Downloadable PDF
```

The template system separates:

- Schema validation
- Runtime data transformation
- Default fixture data
- Presentation / rendering

The Jazz Festival ticket is currently the registered template,
but additional templates can be added through the same registry.

## Data Integrity

Document state changes and audit-log creation execute inside the
same database transaction.

Audit records are append-only. SQLite triggers prevent UPDATE and
DELETE operations against audit records.

## Tests

With the service running:

```bash
bun test
```

## Design Tradeoffs

### SQLite

SQLite was selected because the assignment permits SQLite and it
keeps evaluator setup lightweight while still demonstrating
relational integrity, foreign keys, transactions, and migrations.

### PDFKit

PDFKit was selected for deterministic server-side PDF rendering
without requiring a browser runtime.

### Template Registry

Template-specific validation and rendering are isolated from
document lifecycle logic so additional templates can be registered
without modifying the lifecycle subsystem.
