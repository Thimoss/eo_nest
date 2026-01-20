# EO Nest API Documentation

Base URL
- http://localhost:3002

Authentication
- Login via `POST /auth/login` to get `access_token`.
- Send header: `Authorization: Bearer <token>`.

Response shape (most endpoints)
```json
{
  "statusCode": 200,
  "message": "string",
  "data": {}
}
```

Notes
- Some endpoints still return placeholder strings (see Users and Sector).
- File uploads use `multipart/form-data`, field name `file`, PDF only, max 1 MB.
- Default admin is created at startup if none exists.
  - Email: `admin@example.com`
  - Password: `ADMIN_DEFAULT_PASSWORD` from `.env`
- Default password for newly created users: `USER_DEFAULT_PASSWORD` from `.env`
- User delete is soft delete (`deletedAt` set). Deleted users are hidden from list and cannot login.

---

## System

### GET /
Returns a plain string.

Example
```bash
curl "http://localhost:3002/"
```

Response
```text
Hello World!
```

---

## Auth

### POST /auth/login
Login and get access token.

Body (JSON)
- `email` (string, required)
- `password` (string, required, 6-20 chars)

Example
```bash
curl -X POST "http://localhost:3002/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123Password"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Login berhasil",
  "access_token": "JWT_TOKEN"
}
```

### GET /auth/profile
Get profile for the current user.

Headers
- `Authorization: Bearer <token>`

Example
```bash
curl "http://localhost:3002/auth/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Profile details fetched successfully",
  "data": {
    "id": 1,
    "name": "Admin Default",
    "email": "admin@example.com",
    "phoneNumber": "1234567890",
    "role": "ADMIN",
    "createdAt": "2026-01-20T00:00:00.000Z",
    "updatedAt": "2026-01-20T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## Users
All endpoints here require `Authorization: Bearer <token>`.

### POST /users/create (ADMIN only)
Create a new user. Password is set from `USER_DEFAULT_PASSWORD`.

Body (JSON)
- `name` (string, required)
- `email` (string, required)
- `phoneNumber` (string, required)
- `position` (string, required)

Example
```bash
curl -X POST "http://localhost:3002/users/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"User A","email":"usera@example.com","phoneNumber":"08123456789","position":"Supervisor"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "User has been successfully created",
  "data": {
    "id": 10,
    "name": "User A",
    "email": "usera@example.com",
    "phoneNumber": "08123456789",
    "position": "Supervisor",
    "role": "USER",
    "createdAt": "2026-01-20T00:00:00.000Z",
    "updatedAt": "2026-01-20T00:00:00.000Z",
    "deletedAt": null
  }
}
```

### GET /users/list
List active users (role USER only).

Query params
- `name` (string, optional)
- `page` (number, optional, default 1)
- `pageSize` (number, optional, default 10)

Example
```bash
curl "http://localhost:3002/users/list?name=andi&page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "User list retrieved successfully",
  "data": {
    "list": [],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

### GET /users/:id
Currently returns a placeholder string.

Example
```bash
curl "http://localhost:3002/users/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```text
This action returns a #1 user
```

### PATCH /users/update/:id
Update user fields.

Body (JSON)
- `name` (string, optional)
- `email` (string, optional)
- `phoneNumber` (string, optional)
- `position` (string, optional)

Example
```bash
curl -X PATCH "http://localhost:3002/users/update/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"User Baru","phoneNumber":"08120000000","position":"Supervisor"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Update Successful",
  "data": {
    "id": 1,
    "name": "User Baru",
    "email": "user@example.com",
    "phoneNumber": "08120000000",
    "position": "Supervisor",
    "role": "USER"
  }
}
```

### PATCH /users/change-password/:id
Change password for a user (must provide old password).

Body (JSON)
- `oldPassword` (string, required)
- `newPassword` (string, required)
- `confirmNewPassword` (string, required)

Example
```bash
curl -X PATCH "http://localhost:3002/users/change-password/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"OldPass123","newPassword":"NewPass123","confirmNewPassword":"NewPass123"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Password successfully reset"
}
```

### PATCH /users/reset-password/:id (ADMIN only)
Reset password to `USER_DEFAULT_PASSWORD`.

Example
```bash
curl -X PATCH "http://localhost:3002/users/reset-password/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Password successfully reset"
}
```

### DELETE /users/remove/:id (ADMIN only)
Soft delete a user (sets `deletedAt`).

Example
```bash
curl -X DELETE "http://localhost:3002/users/remove/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

## Category

### POST /category/create
Create category.

Body (JSON)
- `name` (string, required)
- `code` (string, required)
- `reference` (string, required)
- `location` (string, required)

Example
```bash
curl -X POST "http://localhost:3002/category/create" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kategori A","code":"CAT-001","reference":"Ref A","location":"Jakarta"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Register Successfull",
  "data": {
    "id": 1,
    "name": "Kategori A",
    "slug": "kategori-a",
    "code": "CAT-001",
    "reference": "Ref A",
    "location": "Jakarta",
    "createdAt": "2026-01-20T00:00:00.000Z",
    "updatedAt": "2026-01-20T00:00:00.000Z",
    "deletedAt": null
  }
}
```

### GET /category/list
List categories.

Query params
- `name` (string, optional)
- `page` (number, optional, default 1)
- `pageSize` (number, optional, default 10)

Example
```bash
curl "http://localhost:3002/category/list?name=kat&page=1&pageSize=10"
```

Response
```json
{
  "statusCode": 200,
  "message": "Categories fetched successfully",
  "data": {
    "list": [],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

### GET /category/detail/:id
Get category detail with sectors and items.

Example
```bash
curl "http://localhost:3002/category/detail/1"
```

Response
```json
{
  "statusCode": 200,
  "message": "Category details fetched successfully",
  "data": {
    "id": 1,
    "name": "Kategori A",
    "slug": "kategori-a",
    "sectors": [
      {
        "id": 2,
        "no": "1",
        "items": []
      }
    ]
  }
}
```

### PATCH /category/update/:id
Update category (all fields required).

Body (JSON)
- `name` (string, required)
- `code` (string, required)
- `reference` (string, required)
- `location` (string, required)

Example
```bash
curl -X PATCH "http://localhost:3002/category/update/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kategori Baru","code":"CAT-001","reference":"Ref A","location":"Jakarta"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Update Successful",
  "data": {
    "id": 1,
    "name": "Kategori Baru",
    "slug": "kategori-baru",
    "code": "CAT-001",
    "reference": "Ref A",
    "location": "Jakarta"
  }
}
```

### DELETE /category/delete/:id
Delete a category.

Example
```bash
curl -X DELETE "http://localhost:3002/category/delete/1"
```

Response
```json
{
  "statusCode": 200,
  "message": "Category deleted successfully"
}
```

---

## Sector

### POST /sector/create
Create sector under category.

Body (JSON)
- `no` (string, required)
- `name` (string, required)
- `source` (string, optional)
- `categoryId` (number, required)

Example
```bash
curl -X POST "http://localhost:3002/sector/create" \
  -H "Content-Type: application/json" \
  -d '{"no":"1","name":"Sektor A","source":"2025","categoryId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Sector created successfully",
  "data": {
    "id": 1,
    "no": "1",
    "name": "Sektor A",
    "categoryId": 1,
    "categoryCode": "CAT-001"
  }
}
```

### GET /sector
Currently returns a placeholder string.

Example
```bash
curl "http://localhost:3002/sector"
```

Response
```text
This action returns all sector
```

### GET /sector/:id
Currently returns a placeholder string.

Example
```bash
curl "http://localhost:3002/sector/1"
```

Response
```text
This action returns a #1 sector
```

### PATCH /sector/update/:id
Update sector.

Body (JSON)
- `no` (string, required)
- `name` (string, required)
- `source` (string, optional)
- `categoryId` (number, required)

Example
```bash
curl -X PATCH "http://localhost:3002/sector/update/1" \
  -H "Content-Type: application/json" \
  -d '{"no":"1","name":"Sektor Baru","source":"2025","categoryId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Sector and associated items updated successfully",
  "data": {
    "id": 1,
    "no": "1",
    "name": "Sektor Baru",
    "categoryId": 1,
    "categoryCode": "CAT-001"
  }
}
```

### DELETE /sector/delete/:id
Delete a sector.

Example
```bash
curl -X DELETE "http://localhost:3002/sector/delete/1"
```

Response
```json
{
  "statusCode": 200,
  "message": "Sector removed successfully"
}
```

---

## Item

### POST /item/create
Create item. Uses `multipart/form-data`.

Form fields
- `no` (string, required)
- `name` (string, required)
- `source` (string, optional)
- `minimum` (string number, optional)
- `unit` (string, optional)
- `materialPricePerUnit` (string number, optional)
- `feePricePerUnit` (string number, optional)
- `singleItem` (string, required: "true" or "false")
- `sectorId` (string number, required)
- `file` (PDF, optional, max 1 MB)

Example
```bash
curl -X POST "http://localhost:3002/item/create" \
  -F "no=1" \
  -F "name=Item A" \
  -F "source=2025" \
  -F "minimum=1" \
  -F "unit=kg" \
  -F "materialPricePerUnit=1000" \
  -F "feePricePerUnit=200" \
  -F "singleItem=true" \
  -F "sectorId=1" \
  -F "file=@/path/to/file.pdf"
```

Response
```json
{
  "statusCode": 200,
  "message": "Item created successfully",
  "data": {
    "id": 1,
    "no": "1",
    "name": "Item A",
    "sectorId": 1,
    "singleItem": true,
    "pdfUrl": "/uploads/uuid.pdf"
  }
}
```

### PATCH /item/update/:id
Update item. Uses `multipart/form-data`.

Form fields: same as `/item/create`.

Example
```bash
curl -X PATCH "http://localhost:3002/item/update/1" \
  -F "no=1" \
  -F "name=Item A Updated" \
  -F "singleItem=true" \
  -F "sectorId=1" \
  -F "file=@/path/to/file.pdf"
```

Response
```json
{
  "statusCode": 200,
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "name": "Item A Updated"
  }
}
```

### GET /item/search
Search items (only `singleItem = true`).

Query params
- `keyword` (string, required)

Example
```bash
curl "http://localhost:3002/item/search?keyword=cement"
```

Response
```json
{
  "statusCode": 200,
  "message": "Items found successfully",
  "data": []
}
```

### DELETE /item/delete/:id
Delete an item.

Example
```bash
curl -X DELETE "http://localhost:3002/item/delete/1"
```

Response
```json
{
  "statusCode": 200,
  "message": "Item removed successfully"
}
```

---

## Document
All endpoints here require `Authorization: Bearer <token>`.

### POST /document/create
Create a document. `checkedById` and `confirmedById` must be different and not the creator.

Body (JSON)
- `name` (string, required)
- `checkedById` (number, required)
- `confirmedById` (number, required)

Example
```bash
curl -X POST "http://localhost:3002/document/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dokumen A","checkedById":2,"confirmedById":3}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Document created successfully",
  "data": {
    "id": 1,
    "name": "Dokumen A",
    "slug": "dokumen-a-20260120000000"
  }
}
```

### GET /document/list
List documents created by the current user.

Query params
- `sortBy` (string, optional: `asc`, `desc`, `recent`, `least`)

Example
```bash
curl "http://localhost:3002/document/list?sortBy=recent" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Items found successfully",
  "data": []
}
```

### GET /document/detail/:slug
Get document detail. Calculates totals and requires `percentageBenefitsAndRisks` set.

Example
```bash
curl "http://localhost:3002/document/detail/dokumen-a-20260120000000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Documents found successfully",
  "data": {
    "id": 1,
    "name": "Dokumen A",
    "jobSections": [],
    "totalMaterialPrice": 0,
    "totalFeePrice": 0,
    "totalPrice": 0
  }
}
```

### PATCH /document/update/:id
Update document name or assigned checker/confirmer.

Body (JSON)
- `name` (string, optional)
- `checkedById` (number, optional)
- `confirmedById` (number, optional)

Example
```bash
curl -X PATCH "http://localhost:3002/document/update/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dokumen A Updated","checkedById":2,"confirmedById":3}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Document  updated successfully",
  "data": {
    "id": 1,
    "name": "Dokumen A Updated",
    "slug": "dokumen-a-updated-20260120000000"
  }
}
```

### PATCH /document/update/general-info/:slug
Update general info.

Body (JSON)
- `job` (string, optional)
- `location` (string, optional)
- `base` (string, optional)

Example
```bash
curl -X PATCH "http://localhost:3002/document/update/general-info/dokumen-a-20260120000000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job":"Pekerjaan A","location":"Jakarta","base":"Base A"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Document general info updated successfully",
  "data": {
    "id": 1,
    "job": "Pekerjaan A",
    "location": "Jakarta",
    "base": "Base A"
  }
}
```

### PATCH /document/update/percentage/:slug
Update percentage for benefits and risks.

Body (JSON)
- `percentageBenefitsAndRisks` (number, required)

Example
```bash
curl -X PATCH "http://localhost:3002/document/update/percentage/dokumen-a-20260120000000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"percentageBenefitsAndRisks":10}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Percentage benefits and risks updated successfully",
  "data": {
    "id": 1,
    "percentageBenefitsAndRisks": 10
  }
}
```

### PATCH /document/update/recapitulation-location/:slug
Update recapitulation location.

Body (JSON)
- `recapitulationLocation` (string, required)

Example
```bash
curl -X PATCH "http://localhost:3002/document/update/recapitulation-location/dokumen-a-20260120000000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recapitulationLocation":"Jakarta"}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Recapitulation location updated successfully",
  "data": {
    "id": 1,
    "recapitulationLocation": "Jakarta"
  }
}
```

### DELETE /document/delete/:id
Delete document.

Example
```bash
curl -X DELETE "http://localhost:3002/document/delete/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Document deleted successfully"
}
```

---

## Job Section
All endpoints here require `Authorization: Bearer <token>`.

### POST /job-section/create
Create job section for a document.

Body (JSON)
- `name` (string, required)
- `documentId` (number, required)

Example
```bash
curl -X POST "http://localhost:3002/job-section/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pekerjaan A","documentId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Job section created successfully",
  "data": {
    "id": 1,
    "name": "Pekerjaan A",
    "documentId": 1
  }
}
```

### PATCH /job-section/update/:id
Update job section. `documentId` is required in body.

Body (JSON)
- `name` (string, required)
- `documentId` (number, required)

Example
```bash
curl -X PATCH "http://localhost:3002/job-section/update/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pekerjaan A Updated","documentId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Job section updated successfully",
  "data": {
    "id": 1,
    "name": "Pekerjaan A Updated",
    "documentId": 1
  }
}
```

### DELETE /job-section/delete/:id
Delete job section.

Example
```bash
curl -X DELETE "http://localhost:3002/job-section/delete/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Job section removed successfully"
}
```

---

## Item Job Section
All endpoints here require `Authorization: Bearer <token>`.

### POST /item-job-section/create
Create item for a job section.

Body (JSON)
- `name` (string, required)
- `volume` (number, required)
- `minimumVolume` (number, required)
- `materialPricePerUnit` (number, required)
- `feePricePerUnit` (number, required)
- `unit` (string, required)
- `information` (string, required)
- `jobSectionId` (number, required)

Example
```bash
curl -X POST "http://localhost:3002/item-job-section/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Item Pekerjaan A","volume":10,"minimumVolume":1,"materialPricePerUnit":1000,"feePricePerUnit":200,"unit":"m","information":"Info","jobSectionId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Item job section created successfully",
  "data": {
    "id": 1,
    "name": "Item Pekerjaan A",
    "jobSectionId": 1
  }
}
```

### PATCH /item-job-section/update/:id
Update item job section.

Body (JSON): same as `/item-job-section/create`.

Example
```bash
curl -X PATCH "http://localhost:3002/item-job-section/update/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Item Pekerjaan A Updated","volume":12,"minimumVolume":1,"materialPricePerUnit":1000,"feePricePerUnit":200,"unit":"m","information":"Info","jobSectionId":1}'
```

Response
```json
{
  "statusCode": 200,
  "message": "Item job section updated successfully",
  "data": {
    "id": 1,
    "name": "Item Pekerjaan A Updated",
    "jobSectionId": 1
  }
}
```

### DELETE /item-job-section/delete/:id
Delete item job section.

Example
```bash
curl -X DELETE "http://localhost:3002/item-job-section/delete/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response
```json
{
  "statusCode": 200,
  "message": "Item job section removed successfully"
}
```
