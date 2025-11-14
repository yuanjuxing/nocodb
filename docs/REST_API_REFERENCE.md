# NocoDB REST API Reference (v2)

Source schema: `packages/nocodb/src/schema/swagger-v2.json` (OpenAPI 3.1.0).

## Usage Essentials

- Base URL: `http://<your-nocodb-host>:8080` by default.
- Authentication: obtain a JWT via `POST /api/v1/auth/user/signin` or API token, then send it as `xc-auth` header (`xc-auth: <token>`).
- All endpoints are namespaced under `/api/v1` or `/api/v2`. Meta endpoints typically live under `/api/v2/meta`, data endpoints under `/api/v2/tables` or `/api/v2/views`.
- Standard request headers: `Content-Type: application/json`, `xc-auth` (if required).
- Pagination pattern: query params `page`, `pageSize`, `sort`, `where` depending on endpoint; responses return `pageInfo` objects.

### cURL Quickstart

```bash
# Sign in and capture the xc-auth token
TOKEN=$(curl -s -X POST \
  https://your-nocodb.example.com/api/v1/auth/user/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password"}' | jq -r .token)

# List tables inside a base
curl -s \
  -H "xc-auth: $TOKEN" \
  https://your-nocodb.example.com/api/v2/meta/bases/p_124hhlkbeasewh/tables
```

## Auth APIs

### Auth

#### `GET /api/v2/meta/bases/{baseId}/users` — List Base Users
List all users in the given base.

- Auth: Required
- Operation ID: `auth-base-user-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/bases/{baseId}/users` — Create Base User
Create a user and add it to the given base

- Auth: Required
- Operation ID: `auth-base-user-add`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Base User Request Model (ex: {"email":"user@example.com","roles":"owner"})
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/meta/bases/{baseId}/users/{userId}` — Delete Base User
Delete a given user in a given base. Exclusive for Super Admin. Access with API Tokens will be blocked.

- Auth: Required
- Operation ID: `auth-base-user-remove`
- Path params: `baseId` · ID Model · required — Unique Base ID; `userId` · ID Model · required — Unique User ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `PATCH /api/v2/meta/bases/{baseId}/users/{userId}` — Update Base User
Update a given user in a given base. Exclusive for Super Admin. Access with API Tokens will be blocked.

- Auth: Required
- Operation ID: `auth-base-user-update`
- Path params: `baseId` · ID Model · required — Unique Base ID; `userId` · ID Model · required — Unique User ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Base User Request Model (ex: {"email":"user@example.com","roles":"owner"})
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/bases/{baseId}/users/{userId}/resend-invite` — Resend User Invitation
Resend Invitation to a specific user

- Auth: Required
- Operation ID: `auth-base-user-resend-invite`
- Path params: `baseId` · ID Model · required — Unique Base ID; `userId` · ID Model · required — Unique User ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

### API Token

#### `GET /api/v2/meta/bases/{baseId}/api-tokens` — List API Tokens in Base
List API Tokens in the given base

- Auth: Required
- Operation ID: `api-token-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → API Token List Model)

#### `POST /api/v2/meta/bases/{baseId}/api-tokens` — Create API Token
Create API Token in a base

- Auth: Required
- Operation ID: `api-token-create`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → API Token Request Model (ex: {"description":"This API token is for ABC application"})
- Success responses: `200` OK (`application/json` → API Token Model)

#### `DELETE /api/v2/meta/bases/{baseId}/api-tokens/{token}` — Delete API Token
Delete the given API Token in base

- Auth: Required
- Operation ID: `api-token-delete`
- Path params: `baseId` · ID Model · required — Unique Base ID; `token` · string · required — API Token
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → number)

## Public APIs

### Public

#### `GET /api/v2/public/calendar-view/{sharedViewUuid}/` — List Shared View Rows
List all shared view rows

- Auth: Optional / Public
- Operation ID: `public-calendar-data-list`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `from_date` · string — From Date; `to_date` · string — To Date; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → Shared View List Model)

#### `GET /api/v2/public/calendar-view/{sharedViewUuid}/countByDate` — Count of Records in Dates in Calendar View

- Auth: Required
- Operation ID: `public-calendar-count`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Query params: `sort` · array<unknown>; `where` · string; `limit` · integer; `offset` · integer
- Header params: `xc-password` · string — Shared view password; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-base/{sharedBaseUuid}/meta` — Get Share Source Meta
Get Share Source Meta

- Auth: Required
- Operation ID: `public-shared-base-get`
- Path params: `sharedBaseUuid` · string · required — Shared Base UUID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-erd/{sharedErdUuid}/meta`

- Auth: Optional / Public
- Operation ID: `public-shared-erd-meta-get`
- Path params: `sharedErdUuid` · string · required
- Request body: n/a
- Success responses: n/a

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/aggregate` — Read Shared View Aggregated Data
Read aggregated data from a given table

- Auth: Optional / Public
- Operation ID: `public-data-table-aggregate`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Query params: `where` · string — Extra filtering; `filterArrJson` · string — Used for multiple filter queries; `aggregation` · array<object> — Used for selective aggregation
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/group/{columnId}` — List Shared View Grouped Data
List Shared View Grouped Data

- Auth: Optional / Public
- Operation ID: `public-grouped-data-list`
- Path params: `sharedViewUuid` · string · required — Shared View UUID; `columnId` · ID Model · required — Unique Column ID
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<object>)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/groupby` — List Shared View Rows
List all shared view rows grouped by a column

- Auth: Optional / Public
- Operation ID: `public-data-group-by`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries; `column_name` · string — Columns to group by
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → Shared View List Model)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/meta` — Get Share View Meta
Get Share View Meta

- Auth: Optional / Public
- Operation ID: `public-shared-view-meta-get`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → View Model & object & object, `application/xml` → object)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/nested/{columnName}` — List Nested Data Relation
List Nested Data Relation

- Auth: Optional / Public
- Operation ID: `public-data-relation-list`
- Path params: `sharedViewUuid` · string · required — Shared View UUID; `columnName` · string · required — Column Name
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/rows` — List Shared View Rows
List all shared view rows

- Auth: Optional / Public
- Operation ID: `public-data-list`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries; `pks` · string — Comma separated list of pks
- Header params: `xc-password` · string — Shared view password
- Request body: n/a
- Success responses: `200` OK (`application/json` → Shared View List Model)

#### `POST /api/v2/public/shared-view/{sharedViewUuid}/rows` — Create Share View Row
Create a new row for the target shared view

- Auth: Optional / Public
- Operation ID: `public-data-create`
- Path params: `sharedViewUuid` · string · required — Shared View UUID
- Header params: `xc-password` · string — Shared view password; `xc-password` · string — Shared view password
- Request body: `multipart/form-data` → object
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/rows/{rowId}/{relationType}/{columnName}` — List Nested List Data
List all nested list data in a given shared view

- Auth: Optional / Public
- Operation ID: `public-data-nested-list`
- Path params: `sharedViewUuid` · string · required — Shared View UUID; `rowId` · object · required — Unique Row ID; `relationType` · string · required — Relation Type; `columnName` · string · required — Column Name
- Query params: `fields` · array<unknown> — Which fields to be shown; `sort` · array<string> | string — The result will be sorted based on `sort` query; `where` · string — Extra filtering; `offset` · integer — Offset in rows; `limit` · integer — Limit in rows; `sortArrJson` · string — Used for multiple sort queries; `filterArrJson` · string — Used for multiple filter queries
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/public/shared-view/{sharedViewUuid}/rows/export/{type}` — Export Rows in Share View
Export all rows in Share View in a CSV / Excel Format

- Auth: Optional / Public
- Operation ID: `public-csv-export`
- Path params: `sharedViewUuid` · string · required — Shared View UUID; `type` · string · required — Export Type
- Request body: n/a
- Success responses: `200` OK (`application/octet-stream` → object)

## Data APIs

### Storage

#### `POST /api/v2/storage/upload-by-url` — Attachment Upload by URL
Upload attachment by URL. Used in Airtable Migration.

- Auth: Required
- Operation ID: `storage-upload-by-url`
- Query params: `path` · string · required — Target File Path
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → array<Attachment Request Model>
- Success responses: n/a

#### `POST /api/v2/storage/upload` — Attachment Upload
Upload attachment

- Auth: Required
- Operation ID: `storage-upload`
- Query params: `path` · string · required — Target File Path
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `multipart/form-data` → Attachment Request Model (ex: {"mimetype":"image/jpeg","path":"download/noco/jango_fett/Table1/attachment/u...)
- Success responses: n/a

## Meta APIs

### Source

#### `POST /api/v2/meta/bases/:baseId/sources/:sourceId/sqlView` — Create sql view

- Auth: Optional / Public
- Operation ID: `create-sql-view`
- Path params: `baseId` · string · required; `sourceId` · string · required
- Request body: `application/json` → object
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/{sourceId}/tables` — List Tables
List all tables in a given Base and Source

- Auth: Required
- Operation ID: `table-list`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Query params: `page` · number; `pageSize` · number; `sort` · string; `includeM2M` · boolean
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200`

#### `POST /api/v2/meta/bases/{baseId}/{sourceId}/tables` — Create Table
Create a new table in a given Base and Source

- Auth: Required
- Operation ID: `table-create`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Table Request Model (ex: {"columns":[{"ai":false,"altered":1,"cdf":"CURRENT_TIMESTAMP on update CURREN...)
- Success responses: `200` OK (`application/json` → Table Model)

#### `GET /api/v2/meta/bases/{baseId}/meta-diff/{sourceId}` — Source Meta Diff
Get the meta data difference between NC_DB and external data sources in a given Source

- Auth: Required
- Operation ID: `source-meta-diff-get`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<object>)

#### `POST /api/v2/meta/bases/{baseId}/meta-diff/{sourceId}` — Synchronise Source Meta
Synchronise the meta data difference between NC_DB and external data sources in a given Source

- Auth: Required
- Operation ID: `source-meta-diff-sync`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/sources/` — List Sources
Get base source list

- Auth: Required
- Operation ID: `source-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → SourceList)

#### `POST /api/v2/meta/bases/{baseId}/sources/` — Create Source
Create a new source on a given base

- Auth: Required
- Operation ID: `source-create`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Source Model & object (ex: {"alias":null,"config":"<ENCRYPTED>","enabled":1,"id":"ds_krsappzu9f8vmo","in...)
- Success responses: `200` OK (`application/json` → Source Model)

#### `DELETE /api/v2/meta/bases/{baseId}/sources/{sourceId}` — Delete Source
Delete the source details of a given base

- Auth: Required
- Operation ID: `source-delete`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/bases/{baseId}/sources/{sourceId}` — Get Source
Get the source details of a given base

- Auth: Required
- Operation ID: `source-read`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Source Model)

#### `PATCH /api/v2/meta/bases/{baseId}/sources/{sourceId}` — Update Source
Update the source details of a given base

- Auth: Required
- Operation ID: `source-update`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · string · required — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"alias":"sakila","type":"mysql2","config":{"client":"mysql2","connection":{"...)
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/meta/bases/{baseId}/sources/{sourceId}/share/erd`

- Auth: Optional / Public
- Operation ID: `source-disable-share-erd`
- Path params: `baseId` · string · required; `sourceId` · string · required
- Request body: n/a
- Success responses: `200` OK

#### `POST /api/v2/meta/bases/{baseId}/sources/{sourceId}/share/erd` — share ERD view

- Auth: Optional / Public
- Operation ID: `source-share-erd`
- Path params: `baseId` · string · required; `sourceId` · string · required
- Request body: n/a
- Success responses: `200` OK (`application/json` → Source Model)

### DB Table

#### `GET /api/v2/meta/bases/{baseId}/tables` — List Tables
List all tables in a given base

- Auth: Required
- Operation ID: `db-table-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Query params: `page` · number; `pageSize` · number; `sort` · string; `includeM2M` · boolean
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200`

#### `POST /api/v2/meta/bases/{baseId}/tables` — Create Table
Create a new table in a given base

- Auth: Required
- Operation ID: `db-table-create`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Table Request Model
- Success responses: `200` OK (`application/json` → Table Model)

#### `POST /api/v2/meta/duplicate/{baseId}/table/{tableId}` — Duplicate Table
Duplicate a table

- Auth: Required
- Operation ID: `db-table-duplicate`
- Path params: `baseId` · ID Model · required — Unique Base ID; `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"excludeData":true,"excludeViews":true})
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/meta/tables/{tableId}` — Delete Table
Delete the table meta data by the given table ID

- Auth: Required
- Operation ID: `db-table-delete`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/tables/{tableId}` — Read Table
Read the table meta data by the given table ID

- Auth: Required
- Operation ID: `db-table-read`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Table Model)

#### `PATCH /api/v2/meta/tables/{tableId}` — Update Table
Update the table meta data by the given table ID

- Auth: Required
- Operation ID: `db-table-update`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"table_name":"users","title":"Users","base_id":"p_124hhlkbeasewh","meta":null})
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/tables/{tableId}/reorder` — Reorder Table
Update the order of the given Table

- Auth: Required
- Operation ID: `db-table-reorder`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"order":0})
- Success responses: `200` OK (`application/json` → boolean)

### DB Table Column

#### `DELETE /api/v2/meta/columns/{columnId}` — Delete Column
Delete the existing column by the given column ID

- Auth: Required
- Operation ID: `db-table-column-delete`
- Path params: `columnId` · string · required
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK

#### `GET /api/v2/meta/columns/{columnId}` — Get Column
Get the existing column by the given column ID

- Auth: Required
- Operation ID: `db-table-column-get`
- Path params: `columnId` · string · required
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK

#### `PATCH /api/v2/meta/columns/{columnId}` — Update Column
Update the existing column by the given column ID

- Auth: Required
- Operation ID: `db-table-column-update`
- Path params: `columnId` · string · required
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Column Request Model
- Success responses: `200` OK (`application/json` → Column Model)

#### `POST /api/v2/meta/columns/{columnId}/primary` — Create Primary Value
Set a primary value on a given column

- Auth: Required
- Operation ID: `db-table-column-primary-column-set`
- Path params: `columnId` · string · required
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `POST /api/v2/meta/tables/{tableId}/columns` — Create Column
Create a new column in a given Table

- Auth: Required
- Operation ID: `db-table-column-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Column Request Model (ex: {"ai":0,"au":0,"source_id":"ds_krsappzu9f8vmo","cc":"","cdf":null,"clen":"45"...)
- Success responses: `200` OK

#### `POST /api/v2/meta/tables/{tableId}/columns/bulk` — Bulk create-update-delete columns
Bulk create-update-delete columns

- Auth: Required
- Operation ID: `db-table-column-bulk`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/tables/{tableId}/columns/hash` — Get columns hash for table
Get columns hash for table

- Auth: Required
- Operation ID: `db-table-column-hash`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

### DB Table Filter

#### `GET /api/v2/meta/filters/{filterGroupId}/children` — Get Filter Group Children
Get Filter Group Children of a given group ID

- Auth: Required
- Operation ID: `db-table-filter-children-read`
- Path params: `filterGroupId` · ID Model · required
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Filter List Model)

#### `DELETE /api/v2/meta/filters/{filterId}` — Delete Filter
Delete the filter data with a given Filter ID

- Auth: Required
- Operation ID: `db-table-filter-delete`
- Path params: `filterId` · ID Model · required — Unique Filter ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/filters/{filterId}` — Get Filter
Get the filter data with a given Filter ID

- Auth: Required
- Operation ID: `db-table-filter-get`
- Path params: `filterId` · ID Model · required — Unique Filter ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Filter Model)

#### `PATCH /api/v2/meta/filters/{filterId}` — Update Filter
Update the filter data with a given Filter ID

- Auth: Required
- Operation ID: `db-table-filter-update`
- Path params: `filterId` · ID Model · required — Unique Filter ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Filter Request Model (ex: {"comparison_op":"eq","comparison_sub_op":null,"fk_column_id":"cl_d7ah9n2qfup...)
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/views/{viewId}/filters` — Get View Filter
Get the filter data in a given View

- Auth: Required
- Operation ID: `db-table-filter-read`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Filter List Model)

#### `POST /api/v2/meta/views/{viewId}/filters` — Create View Filter
Update the filter data in a given View

- Auth: Required
- Operation ID: `db-table-filter-create`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Filter Request Model (ex: {"comparison_op":"eq","comparison_sub_op":null,"fk_column_id":"cl_d7ah9n2qfup...)
- Success responses: `200` OK (`application/json` → Filter Model)

### DB Table Sort

#### `DELETE /api/v2/meta/sorts/{sortId}` — Delete Sort
Delete the sort data by Sort ID

- Auth: Required
- Operation ID: `db-table-sort-delete`
- Path params: `sortId` · string · required — Unique Sort ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/sorts/{sortId}` — Get Sort
Get the sort data by Sort ID

- Auth: Required
- Operation ID: `db-table-sort-get`
- Path params: `sortId` · string · required — Unique Sort ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Sort Model)

#### `PATCH /api/v2/meta/sorts/{sortId}` — Update Sort
Update the sort data by Sort ID

- Auth: Required
- Operation ID: `db-table-sort-update`
- Path params: `sortId` · string · required — Unique Sort ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Sort Request Model (ex: {"direction":"asc","fk_column_id":"cl_l11b769pe2j1ce"})
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/views/{viewId}/sorts` — List View Sorts
List all the sort data in a given View

- Auth: Required
- Operation ID: `db-table-sort-list`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Sort List Model)

#### `POST /api/v2/meta/views/{viewId}/sorts` — Update View Sort
Update the sort data in a given View

- Auth: Required
- Operation ID: `db-table-sort-create`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Sort Request Model & object
- Success responses: `200` OK (`application/json` → number)

### DB Table Webhook

#### `DELETE /api/v2/meta/hooks/{hookId}` — Delete Hook
Delete the exsiting hook by its ID

- Auth: Required
- Operation ID: `db-table-webhook-delete`
- Path params: `hookId` · string · required — Unique Hook ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `PATCH /api/v2/meta/hooks/{hookId}` — Update Hook
Update the exsiting hook by its ID

- Auth: Required
- Operation ID: `db-table-webhook-update`
- Path params: `hookId` · string · required — Unique Hook ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Hook Model (ex: {"active":0,"async":0,"description":"This is my hook description","env":"all"...)
- Success responses: `200` OK (`application/json` → Hook Model)

#### `GET /api/v2/meta/tables/{tableId}/hooks` — List Table Hooks
List all hook records in the given Table

- Auth: Required
- Operation ID: `db-table-webhook-list`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Hook List Model)

#### `POST /api/v2/meta/tables/{tableId}/hooks` — Create Table Hook
Create a hook in the given table

- Auth: Optional / Public
- Operation ID: `db-table-webhook-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Request body: `application/json` → Hook Request Model (ex: {"active":0,"async":0,"description":"This is my hook description","env":"all"...)
- Success responses: `200` OK (`application/json` → Hook Model)

#### `GET /api/v2/meta/tables/{tableId}/hooks/samplePayload/{operation}/{version}` — Get Sample Hook Payload
Get the sample hook payload

- Auth: Required
- Operation ID: `db-table-webhook-sample-payload-get`
- Path params: `tableId` · ID Model · required — Unique Table ID; `operation` · string · required — Hook Operation; `version` · string · required — Hook Version
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/tables/{tableId}/hooks/test` — Test Hook
Test the hook in the given Table

- Auth: Required
- Operation ID: `db-table-webhook-test`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Hook Test Request Model (ex: {"hook":{"active":0,"async":0,"description":"This is my hook description","en...)
- Success responses: `200` OK (`application/json` → object)

### DB Table Webhook Filter

#### `GET /api/v2/meta/hooks/{hookId}/filters` — Get Hook Filter
Get the filter data in a given Hook

- Auth: Required
- Operation ID: `db-table-webhook-filter-read`
- Path params: `hookId` · ID Model · required — Unique Hook ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Filter List Model)

#### `POST /api/v2/meta/hooks/{hookId}/filters` — Create Hook Filter
Create filter(s) in a given Hook

- Auth: Required
- Operation ID: `db-table-webhook-filter-create`
- Path params: `hookId` · ID Model · required — Unique Hook ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Filter Request Model (ex: {"comparison_op":"eq","comparison_sub_op":null,"fk_column_id":"cl_d7ah9n2qfup...)
- Success responses: `200` OK (`application/json` → Filter Model)

### DB View

#### `PATCH /api/v2/meta/form-columns/{formViewColumnId}` — Update Form Column
Update the form column(s) by Form View Column ID

- Auth: Required
- Operation ID: `db-view-form-column-update`
- Path params: `formViewColumnId` · ID Model · required — Unique Form View Column ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Form Column Request Model
- Success responses: `200` OK (`application/json` → Form Column Request Model)

#### `GET /api/v2/meta/forms/{formViewId}` — Get Form
Get the form data by Form ID

- Auth: Required
- Operation ID: `db-view-form-read`
- Path params: `formViewId` · ID Model · required — Unique Form View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Form Model)

#### `PATCH /api/v2/meta/forms/{formViewId}` — Update Form View
Update the form data by Form ID

- Auth: Required
- Operation ID: `db-view-form-update`
- Path params: `formViewId` · ID Model · required — Unique Form View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Form Update Request Model (ex: {"banner_image_url":{"mimetype":"image/jpg","size":32903,"title":"Random-Pict...)
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/galleries/{galleryViewId}` — Get Gallery View
Get the Gallery View data with Gallery ID

- Auth: Required
- Operation ID: `db-view-gallery-read`
- Path params: `galleryViewId` · string · required — Unique Gallery View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Gallery Model)

#### `PATCH /api/v2/meta/galleries/{galleryViewId}` — Update Gallery View
Update the Gallery View data with Gallery ID

- Auth: Required
- Operation ID: `db-view-gallery-update`
- Path params: `galleryViewId` · string · required — Unique Gallery View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Gallery View Update Request Model (ex: {"fk_cover_image_col_id":"cl_ib8l4j1kiu1efx","meta":null})
- Success responses: `200` OK (`application/json` → number)

#### `PATCH /api/v2/meta/grid-columns/{columnId}` — Update Grid Column
Update grid column(s) in the given Grid

- Auth: Required
- Operation ID: `db-view-grid-column-update`
- Path params: `columnId` · ID Model · required — Unique Column ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Grid Column Request Model (ex: {"fk_column_id":"cl_c5knoi4xs4sfpt","label":"My Column","width":"200px"})
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/grids/{gridId}/grid-columns` — List Grid Columns
List all columns in the given Grid

- Auth: Required
- Operation ID: `db-view-grid-columns-list`
- Path params: `gridId` · string · required — Grid View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<Grid Column Model>)

#### `PATCH /api/v2/meta/grids/{viewId}` — Update Grid View
Update Grid View

- Auth: Required
- Operation ID: `db-view-grid-update`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Grid View Update Model (ex: {"row_height":1,"meta":null})
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/kanbans/{kanbanViewId}` — Get Kanban View
Get the Kanban View data by Kanban ID

- Auth: Required
- Operation ID: `db-view-kanban-read`
- Path params: `kanbanViewId` · string · required — Unique Kanban View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Kanban Model)

#### `PATCH /api/v2/meta/kanbans/{kanbanViewId}` — Update Kanban View
Update the Kanban View data with Kanban ID

- Auth: Required
- Operation ID: `db-view-kanban-update`
- Path params: `kanbanViewId` · string · required — Unique Kanban View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Kanban Update Request Model (ex: {"fk_grp_col_id":"cl_g0a89q9xdry3lu","fk_cover_image_col_id":"cl_ib8l4j1kiu1e...)
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/maps/{mapViewId}` — Get Map View
Get the Map View data by Map ID

- Auth: Required
- Operation ID: `db-view-map-read`
- Path params: `mapViewId` · string · required — Unique Map View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Map Model)

#### `PATCH /api/v2/meta/maps/{mapViewId}` — Update Map View
Update the Map View data by Map ID

- Auth: Required
- Operation ID: `db-view-map-update`
- Path params: `mapViewId` · string · required — Unique Map View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Map View Update Request Model (ex: {"fk_geo_data_col_id":"cl_8iw2o4ejzvdyna","meta":null})
- Success responses: `200` OK (`application/json` → number)

#### `POST /api/v2/meta/tables/{tableId}/forms` — Create Form View
Create a new form view in a given Table

- Auth: Required
- Operation ID: `db-view-form-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → ViewCreateReq (ex: {"title":"My Form View","type":1,"copy_from_id":null,"fk_grp_col_id":null,"fk...)
- Success responses: `200` OK (`application/json` → View Model)

#### `POST /api/v2/meta/tables/{tableId}/galleries` — Create Gallery View

- Auth: Required
- Operation ID: `db-view-gallery-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → ViewCreateReq (ex: {"title":"My Gallery View","type":2,"copy_from_id":null,"fk_grp_col_id":null,...)
- Success responses: `200` OK (`application/json` → View Model)

#### `POST /api/v2/meta/tables/{tableId}/grids` — Create Grid View
Create a new grid view in a given Table

- Auth: Required
- Operation ID: `db-view-grid-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → ViewCreateReq (ex: {"title":"My Grid View","type":3,"copy_from_id":null,"fk_grp_col_id":null,"fk...)
- Success responses: `200` OK (`application/json` → View Model)

#### `POST /api/v2/meta/tables/{tableId}/kanbans` — Create Kanban View
Create a new Kanban View

- Auth: Required
- Operation ID: `db-view-kanban-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → ViewCreateReq (ex: {"title":"My Kanban View","type":4,"copy_from_id":null,"fk_grp_col_id":"cl_g0...)
- Success responses: `200` OK (`application/json` → View Model)

#### `POST /api/v2/meta/tables/{tableId}/maps` — Create Map View
Create a new Map View

- Auth: Required
- Operation ID: `db-view-map-create`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → ViewCreateReq (ex: {"title":"My Map View","type":5,"copy_from_id":null,"fk_grp_col_id":null,"fk_...)
- Success responses: `200` OK (`application/json` → View Model)

#### `GET /api/v2/meta/tables/{tableId}/views` — List Views
List all views in a given Table.

- Auth: Required
- Operation ID: `db-view-list`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → View List Model)

#### `DELETE /api/v2/meta/views/{viewId}` — Delete View
Delete the view with the given view Id.

- Auth: Required
- Operation ID: `db-view-delete`
- Path params: `viewId` · ID Model · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `PATCH /api/v2/meta/views/{viewId}` — Update View
Update the view with the given view Id.

- Auth: Required
- Operation ID: `db-view-update`
- Path params: `viewId` · ID Model · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → View Update Request Model (ex: {"title":"Grid View 1","uuid":"e2457bbf-e29c-4fec-866e-fe3b01dba57f","passwor...)
- Success responses: `200` OK (`application/json` → View Model)

#### `POST /api/v2/meta/views/{viewId}/hide-all` — Hide All Columns In View
Hide All Columns in a given View

- Auth: Required
- Operation ID: `db-view-hide-all-column`
- Path params: `viewId` · ID Model · required — Unique View ID
- Query params: `ignoreIds` · array<unknown>
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `POST /api/v2/meta/views/{viewId}/show-all` — Show All Columns In View
Show All Columns in a given View

- Auth: Required
- Operation ID: `db-view-show-all-column`
- Path params: `viewId` · ID Model · required — Unique View ID
- Query params: `ignoreIds` · array<unknown>
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

### DB View Column

#### `GET /api/v2/meta/views/{viewId}/columns` — List Columns In View
List all columns by ViewID

- Auth: Required
- Operation ID: `db-view-column-list`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Column List Model)

#### `POST /api/v2/meta/views/{viewId}/columns` — Create Column in View
Create a new column in a given View

- Auth: Required
- Operation ID: `db-view-column-create`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → View Column Request Model (ex: {"fk_column_id":"cl_m4wkaqgqqjzoeh","show":0,"order":1})
- Success responses: `200` OK (`application/json` → Column Model)

#### `PATCH /api/v2/meta/views/{viewId}/columns/{columnId}` — Update View Column
Update a column in a View

- Auth: Required
- Operation ID: `db-view-column-update`
- Path params: `viewId` · ID Model · required; `columnId` · ID Model · required — Unique Column ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → View Column Update Request Model (ex: {"show":0,"order":1})
- Success responses: `200` OK (`application/json` → number)

### DB View Share

#### `GET /api/v2/meta/tables/{tableId}/share` — List Shared Views
List all shared views in a given Table

- Auth: Required
- Operation ID: `db-view-share-list`
- Path params: `tableId` · ID Model · required — Unique Table ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Shared View List Model)

#### `DELETE /api/v2/meta/views/{viewId}/share` — Delete Shared View
Delete a shared view in a given View.

- Auth: Required
- Operation ID: `db-view-share-delete`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `PATCH /api/v2/meta/views/{viewId}/share` — Update Shared View
Update a shared view in a given View..

- Auth: Required
- Operation ID: `db-view-share-update`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Shared View Request Model
- Success responses: `200` OK (`application/json` → SharedView)

#### `POST /api/v2/meta/views/{viewId}/share` — Create Shared View
Create a shared view in a given View..

- Auth: Required
- Operation ID: `db-view-share-create`
- Path params: `viewId` · string · required — Unique View ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Shared View Request Model)

### Plugin

#### `GET /api/v2/meta/plugins` — List Plugins
List all plugins

- Auth: Required
- Operation ID: `plugin-list`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/plugins/{pluginId}` — Get Plugin
Get the plugin data by ID

- Auth: Optional / Public
- Operation ID: `plugin-read`
- Path params: `pluginId` · string · required — Plugin ID
- Request body: n/a
- Success responses: `200` OK (`application/json` → Plugin Model)

#### `PATCH /api/v2/meta/plugins/{pluginId}` — Update Plugin
Update the plugin data by ID

- Auth: Required
- Operation ID: `plugin-update`
- Path params: `pluginId` · string · required — Plugin ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Plugin Reqeust
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/plugins/{pluginTitle}/status` — Get Plugin Status
Check plugin is active or not

- Auth: Required
- Operation ID: `plugin-status`
- Path params: `pluginTitle` · string · required — Plugin Title
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `POST /api/v2/meta/plugins/test` — Test Plugin
Test if the plugin is working with the given configurations

- Auth: Required
- Operation ID: `plugin-test`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Plugin Test Request Model (ex: {"title":"Plugin Foo","input":"{\"bucket\":\"my-bucket\",\"region\":\"us-west...)
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/plugins/webhook` — Webhook List Plugins
List all webhook plugins

- Auth: Required
- Operation ID: `plugin-webhook-list`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

### Base

#### `GET /api/v2/meta/bases/` — List Bases
List all base meta data

- Auth: Required
- Operation ID: `base-list`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Base List Model)

#### `POST /api/v2/meta/bases/` — Create Base
Create a new base

- Auth: Required
- Operation ID: `base-create`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Base Request Model & object (ex: {"sources":[{"alias":"string","config":null,"enabled":true,"id":"string","inf...)
- Success responses: `200` OK (`application/json` → Base Model)

#### `DELETE /api/v2/meta/bases/{baseId}` — Delete Base
Delete the given base

- Auth: Required
- Operation ID: `base-delete`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/bases/{baseId}` — Get Base
Get the info of a given base

- Auth: Required
- Operation ID: `base-read`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Base Model)

#### `PATCH /api/v2/meta/bases/{baseId}` — Update Base
Update the given base

- Auth: Required
- Operation ID: `base-update`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Base Update Request Model (ex: {"color":"#24716E","meta":null,"title":"My Base","order":1})
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/bases/{baseId}/audits` — List Audits in Base
List all audit data in the given base

- Auth: Required
- Operation ID: `base-audit-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Query params: `offset` · integer; `limit` · integer; `sourceId` · string; `orderBy` · object
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/cost` — Base Cost
Calculate the Base Cost

- Auth: Required
- Operation ID: `base-cost`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/has-empty-or-null-filters` — List Empty & Null Filter
Check if a base contains empty and null filters. Used in `Show NULL and EMPTY in Filter` in Base Setting.

- Auth: Required
- Operation ID: `base-has-empty-or-null-filters`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/info` — Get Base info
Get info such as node version, arch, platform, is docker, rootdb and package version of a given base

- Auth: Required
- Operation ID: `base-meta-get`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/bases/{baseId}/meta-diff` — Meta Diff
Get the meta data difference between NC_DB and external data sources

- Auth: Required
- Operation ID: `base-meta-diff-get`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<object>)

#### `POST /api/v2/meta/bases/{baseId}/meta-diff` — Sync Meta
Synchronise the meta data difference between NC_DB and external data sources

- Auth: Required
- Operation ID: `base-meta-diff-sync`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/meta/bases/{baseId}/shared` — Delete Base Shared Base
Delete Base Shared Base

- Auth: Required
- Operation ID: `base-shared-base-disable`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/bases/{baseId}/shared` — Get Base Shared Base
Get Base Shared Base

- Auth: Required
- Operation ID: `base-shared-base-get`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `PATCH /api/v2/meta/bases/{baseId}/shared` — Update Base Shared Base
Update Base Shared Base

- Auth: Required
- Operation ID: `base-shared-base-update`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Shared Base Request Model (ex: {"password":"password123","roles":"editor"})
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/bases/{baseId}/shared` — Create Base Shared Base
Create Base Shared Base

- Auth: Required
- Operation ID: `base-shared-base-create`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Shared Base Request Model (ex: {"roles":"editor","password":"password123"})
- Success responses: `200` OK (`application/json` → object)

#### `PATCH /api/v2/meta/bases/{baseId}/user` — Base user meta update

- Auth: Optional / Public
- Operation ID: `base-user-meta-update`
- Path params: `baseId` · string · required
- Request body: `application/json` → Base User Meta Request Model
- Success responses: `200` OK

#### `GET /api/v2/meta/bases/{baseId}/visibility-rules` — Get UI ACL
Hide / show views based on user role

- Auth: Required
- Operation ID: `base-model-visibility-list`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Query params: `includeM2M` · boolean
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<object>)

#### `POST /api/v2/meta/bases/{baseId}/visibility-rules` — Create UI ACL
Hide / show views based on user role

- Auth: Required
- Operation ID: `base-model-visibility-set`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Visibility Rule Request Model
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/duplicate/{baseId}` — Duplicate Base
Duplicate a base

- Auth: Required
- Operation ID: `base-duplicate`
- Path params: `baseId` · ID Model · required — Unique Base ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"excludeData":true,"excludeViews":true,"excludeHooks":true})
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/duplicate/{baseId}/{sourceId}` — Duplicate Base Source
Duplicate a base

- Auth: Required
- Operation ID: `base-source-duplicate`
- Path params: `baseId` · ID Model · required — Unique Base ID; `sourceId` · ID Model — Unique Source ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"excludeData":true,"excludeViews":true,"excludeHooks":true})
- Success responses: `200` OK (`application/json` → object)

### Utils

#### `GET /api/v2/meta/audits` — List Audits
List all audits

- Auth: Required
- Operation ID: `utils-audit-list`
- Query params: `row_id` · string · required — Row ID; `fk_model_id` · ID Model · required — Foreign Key to Model
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/audits/rows/{rowId}/update` — Update Audit Row
Update Audit Row

- Auth: Required
- Operation ID: `utils-audit-row-update`
- Path params: `rowId` · object · required — Unique Row ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Audit Row Update Request Model (ex: {"column_name":"baz","fk_model_id":"md_ehn5izr99m7d45","row_id":"1","prev_val...)
- Success responses: `200` OK (`application/json` → Audit Model)

#### `POST /api/v2/meta/axiosRequestMake` — Axios Request
Generic Axios Call

- Auth: Required
- Operation ID: `utils-axios-request-make`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/meta/cache` — Delete Cache
Delete All K/V pairs in NocoCache

- Auth: Required
- Operation ID: `utils-cache-delete`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → boolean)

#### `GET /api/v2/meta/cache` — Get Cache
Get All K/V pairs in NocoCache

- Auth: Required
- Operation ID: `utils-cache-get`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: n/a

#### `DELETE /api/v2/meta/comment/{commentId}` — Delete Comment
Delete comment

- Auth: Required
- Operation ID: `utils-comment-delete`
- Path params: `commentId` · string · required — Comment ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → number)

#### `PATCH /api/v2/meta/comment/{commentId}` — Update Comment
Update comment

- Auth: Required
- Operation ID: `utils-comment-update`
- Path params: `commentId` · string · required — Comment ID
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Comment Update Request Model (ex: {"comment":"This is the comment for the row"})
- Success responses: `200` OK (`application/json` → number)

#### `GET /api/v2/meta/comments` — List Comments
List all comments

- Auth: Required
- Operation ID: `utils-comment-list`
- Query params: `row_id` · string · required — Row ID; `fk_model_id` · ID Model · required — Foreign Key to Model
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/comments` — Comment Rows
Create a new comment in a row. Logged in Audit.

- Auth: Required
- Operation ID: `utils-comment-row`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → Comment Request Model (ex: {"comment":"This is the comment for the row","fk_model_id":"md_ehn5izr99m7d45...)
- Success responses: `200` OK (`application/json` → Comment)

#### `GET /api/v2/meta/comments/count` — Count Comments
Return the number of comments in the given query.

- Auth: Required
- Operation ID: `utils-comment-count`
- Query params: `ids` · required — Comment IDs; `fk_model_id` · ID Model · required — Foreign Key to Model
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → array<object>)

#### `POST /api/v2/meta/connection/select`

- Auth: Optional / Public
- Operation ID: `utils-select-query`
- Request body: `application/json` → object
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/meta/connection/test` — Test DB Connection
Test the DB Connection

- Auth: Required
- Operation ID: `utils-test-connection`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object (ex: {"client":"mysql2","connection":{"host":"localhost","port":"3306","user":"roo...)
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/nocodb/info` — Get App Info
Get the application info such as authType, defaultLimit, version and etc.

- Auth: Required
- Operation ID: `utils-app-info`
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/meta/projects/audits` — List Audits in Project
List all audit data in the given project

- Auth: Required
- Operation ID: `project-audit-list`
- Query params: `offset` · integer; `limit` · integer; `orderBy` · object
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.; `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

## Organisation APIs

## DB Table Webhook Logs

#### `GET /api/v2/meta/hooks/{hookId}/logs` — List Hook Logs
List the log data in a given Hook

- Auth: Required
- Operation ID: `db-table-webhook-logs-list`
- Path params: `hookId` · ID Model · required — Unique Hook ID
- Query params: `limit` · integer; `offset` · integer
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → Hook Log List Model)

## Table Records

#### `DELETE /api/v2/tables/{tableId}/links/{linkFieldId}/records/{recordId}` — Unlink Records
This API endpoint allows you to unlink records from a specific `Link field` and `Record ID`. The request payload is an array of record-ids from the adjacent table for unlinking purposes. Note that, 
- duplicated record-ids will be ignored.
- non-existent record-ids will be ignored.

- Auth: Required
- Operation ID: `db-data-table-row-nested-unlink`
- Path params: `tableId` · string · required — **Table Identifier**; `linkFieldId` · string · required — **Links Field Identifier** corresponding to the relation field `Links` established between tables.; `recordId` · string · required — **Record Identifier** corresponding to the record in this table for which links are being removed.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → array<object> (ex: [{"Id":1},{"Id":2}])
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/tables/{tableId}/links/{linkFieldId}/records/{recordId}` — List Linked Records
This API endpoint allows you to retrieve list of linked records for a specific `Link field` and `Record ID`. The response is an array of objects containing Primary Key and its corresponding display value.

- Auth: Required
- Operation ID: `db-data-table-row-nested-list`
- Path params: `tableId` · string · required — **Table Identifier**; `linkFieldId` · string · required — **Links Field Identifier** corresponding to the relation field `Links` established between tables.; `recordId` · string · required — **Record Identifier** corresponding to the record in this table for which linked records are being fetched.
- Query params: `fields` · string — Allows you to specify the fields that you wish to include from the linked records in your API response. By default, only Primary Key and associated display value field is included.

Example: `fields=field1,field2` will include only 'field1' and 'field2' in the API response. 

Please note that it's essential not to include spaces between field names in the comma-separated list.; `sort` · string — Allows you to specify the fields by which you want to sort linked records in your API response. By default, sorting is done in ascending order for the designated fields. To sort in descending order, add a '-' symbol before the field name.

Example: `sort=field1,-field2` will sort the records first by 'field1' in ascending order and then by 'field2' in descending order.

Please note that it's essential not to include spaces between field names in the comma-separated list.; `where` · string — Enables you to define specific conditions for filtering linked records in your API response. Multiple conditions can be combined using logical operators such as 'and' and 'or'. Each condition consists of three parts: a field name, a comparison operator, and a value.

Example: `where=(field1,eq,value1)~and(field2,eq,value2)` will filter linked records where 'field1' is equal to 'value1' AND 'field2' is equal to 'value2'. 

You can also use other comparison operators like 'ne' (not equal), 'gt' (greater than), 'lt' (less than), and more, to create complex filtering rules.

Please remember to maintain the specified format, and do not include spaces between the different condition components; `offset` · integer — Enables you to control the pagination of your API response by specifying the number of linked records you want to skip from the beginning of the result set. The default value for this parameter is set to 0, meaning no linked records are skipped by default.

Example: `offset=25` will skip the first 25 linked records in your API response, allowing you to access linked records starting from the 26th position.

Please note that the 'offset' value represents the number of linked records to exclude, not an index value, so an offset of 25 will skip the first 25 linked records.; `limit` · integer — Enables you to set a limit on the number of linked records you want to retrieve in your API response. By default, your response includes all the available linked records, but by using this parameter, you can control the quantity you receive.

Example: `limit=100` will constrain your response to the first 100 linked records in the dataset.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/tables/{tableId}/links/{linkFieldId}/records/{recordId}` — Link Records
This API endpoint allows you to link records to a specific `Link field` and `Record ID`. The request payload is an array of record-ids from the adjacent table for linking purposes. Note that any existing links, if present, will be unaffected during this operation.

- Auth: Required
- Operation ID: `db-data-table-row-nested-link`
- Path params: `tableId` · string · required — **Table Identifier**; `linkFieldId` · string · required — **Links Field Identifier** corresponding to the relation field `Links` established between tables.; `recordId` · string · required — **Record Identifier** corresponding to the record in this table for which links are being created.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object | array<object> (ex: [{"Id":4},{"Id":5}])
- Success responses: `200` OK (`application/json` → object)

#### `DELETE /api/v2/tables/{tableId}/records` — Delete Table Records
This API endpoint allows deleting existing records within a specified table identified by an array of Record-IDs, serving as unique identifier for the record. Records to be deleted are input as an array of record-identifiers.

- Auth: Required
- Operation ID: `db-data-table-row-delete`
- Path params: `tableId` · string · required — **Table Identifier**.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object | array<object> (ex: [{"Id":1},{"Id":2}])
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/tables/{tableId}/records` — List Table Records
This API endpoint allows you to retrieve records from a specified table. You can customize the response by applying various query parameters for filtering, sorting, and formatting.

**Pagination**: The response is paginated by default, with the first page being returned initially. The response includes the following additional information in the `pageInfo` JSON block:

- `totalRows`: Indicates the total number of rows available for the specified conditions (if any).
- `page`: Specifies the current page number.
- `pageSize`: Defaults to 25 and defines the number of records on each page.
- `isFirstPage`: A boolean value that indicates whether the current page is the first page of records in the dataset.
- `isLastPage`: A boolean value that indicates whether the current page is the last page of records in the dataset.

The `pageInfo` attributes are particularly valuable when dealing with large datasets that are divided into multiple pages. They enable you to determine whether additional pages of records are available for retrieval or if you've reached the end of the dataset.

- Auth: Required
- Operation ID: `db-data-table-row-list`
- Path params: `tableId` · string · required — **Table Identifier**.
- Query params: `fields` · string — Allows you to specify the fields that you wish to include in your API response. By default, all the fields are included in the response.

Example: `fields=field1,field2` will include only 'field1' and 'field2' in the API response. 

Please note that it's essential not to include spaces between field names in the comma-separated list.; `sort` · string — Allows you to specify the fields by which you want to sort the records in your API response. By default, sorting is done in ascending order for the designated fields. To sort in descending order, add a '-' symbol before the field name.

Example: `sort=field1,-field2` will sort the records first by 'field1' in ascending order and then by 'field2' in descending order.

If `viewId` query parameter is also included, the sort included here will take precedence over any sorting configuration defined in the view.

Please note that it's essential not to include spaces between field names in the comma-separated list.; `where` · string — Enables you to define specific conditions for filtering records in your API response. Multiple conditions can be combined using logical operators such as 'and' and 'or'. Each condition consists of three parts: a field name, a comparison operator, and a value.

Example: `where=(field1,eq,value1)~and(field2,eq,value2)` will filter records where 'field1' is equal to 'value1' AND 'field2' is equal to 'value2'. 

You can also use other comparison operators like 'ne' (not equal), 'gt' (greater than), 'lt' (less than), and more, to create complex filtering rules.

If `viewId` query parameter is also included, then the filters included here will be applied over the filtering configuration defined in the view. 

Please remember to maintain the specified format, and do not include spaces between the different condition components; `offset` · integer — Enables you to control the pagination of your API response by specifying the number of records you want to skip from the beginning of the result set. The default value for this parameter is set to 0, meaning no records are skipped by default.

Example: `offset=25` will skip the first 25 records in your API response, allowing you to access records starting from the 26th position.

Please note that the 'offset' value represents the number of records to exclude, not an index value, so an offset of 25 will skip the first 25 records.; `limit` · integer — Enables you to set a limit on the number of records you want to retrieve in your API response. By default, your response includes all the available records, but by using this parameter, you can control the quantity you receive.

Example: `limit=100` will constrain your response to the first 100 records in the dataset.; `viewId` · string — ***View Identifier***. Allows you to fetch records that are currently visible within a specific view. API retrieves records in the order they are displayed if the SORT option is enabled within that view.

Additionally, if you specify a `sort` query parameter, it will take precedence over any sorting configuration defined in the view. If you specify a `where` query parameter, it will be applied over the filtering configuration defined in the view. 

By default, all fields, including those that are disabled within the view, are included in the response. To explicitly specify which fields to include or exclude, you can use the `fields` query parameter to customize the output according to your requirements.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `PATCH /api/v2/tables/{tableId}/records` — Update Table Records
This API endpoint allows updating existing records within a specified table identified by an array of Record-IDs, serving as unique identifier for the record. Records to be updated are input as an array of key-value pair objects, where each key corresponds to a field name. Ensure that all the required fields are included in the payload, with exceptions for fields designated as auto-increment or those having default values. 

When dealing with 'Links' or 'Link To Another Record' field types, you should utilize the 'Create Link' API to insert relevant data. 

Certain read-only field types will be disregarded if included in the request. These field types include 'Look Up,' 'Roll Up,' 'Formula,' 'Auto Number,' 'Created By,' 'Updated By,' 'Created At,' 'Updated At,' 'Barcode,' and 'QR Code.'

Note that a PATCH request only updates the specified fields while leaving other fields unaffected. Currently, PUT requests are not supported by this endpoint.

- Auth: Required
- Operation ID: `db-data-table-row-update`
- Path params: `tableId` · string · required — **Table Identifier**.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object | array<object> (ex: [{"Id":6,"SingleLineText":"Updated text-1","DateTime":"2023-10-19 08:56:32+00...)
- Success responses: `200` OK (`application/json` → object)

#### `POST /api/v2/tables/{tableId}/records` — Create Table Records
This API endpoint allows the creation of new records within a specified table. Records to be inserted are input as an array of key-value pair objects, where each key corresponds to a field name. Ensure that all the required fields are included in the payload, with exceptions for fields designated as auto-increment or those having default values. 

When dealing with 'Links' or 'Link To Another Record' field types, you should utilize the 'Create Link' API to insert relevant data. 

Certain read-only field types will be disregarded if included in the request. These field types include 'Look Up,' 'Roll Up,' 'Formula,' 'Auto Number,' 'Created By,' 'Updated By,' 'Created At,' 'Updated At,' 'Barcode,' and 'QR Code.'

- Auth: Required
- Operation ID: `db-data-table-row-create`
- Path params: `tableId` · string · required — **Table Identifier**.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: `application/json` → object | array<object> (ex: [{"SingleLineText":"David","LongText":"The sunsets in the small coastal town ...)
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/tables/{tableId}/records/{recordId}` — Read Table Record
This API endpoint allows you to retrieve a single record identified by Record-ID, serving as unique identifier for the record from a specified table.

- Auth: Required
- Operation ID: `db-data-table-row-read`
- Path params: `tableId` · string · required — **Table Identifier**; `recordId` · string · required — Record ID
- Query params: `fields` · string — Allows you to specify the fields that you wish to include in your API response. By default, all the fields are included in the response.

Example: `fields=field1,field2` will include only 'field1' and 'field2' in the API response. 

Please note that it's essential not to include spaces between field names in the comma-separated list.
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)

#### `GET /api/v2/tables/{tableId}/records/count` — Count Table Records
This API endpoint allows you to retrieve the total number of records from a specified table or a view. You can narrow down search results by applying `where` query parameter

- Auth: Required
- Operation ID: `db-data-table-row-count`
- Path params: `tableId` · string · required — **Table Identifier**
- Query params: `viewId` · string — **View Identifier**. Allows you to fetch record count that are currently visible within a specific view.; `where` · string — Enables you to define specific conditions for filtering record count in your API response. Multiple conditions can be combined using logical operators such as 'and' and 'or'. Each condition consists of three parts: a field name, a comparison operator, and a value.

Example: `where=(field1,eq,value1)~and(field2,eq,value2)` will filter records where 'field1' is equal to 'value1' AND 'field2' is equal to 'value2'. 

You can also use other comparison operators like 'ne' (not equal), 'gt' (greater than), 'lt' (less than), and more, to create complex filtering rules.

If `viewId` query parameter is also included, then the filters included here will be applied over the filtering configuration defined in the view. 

Please remember to maintain the specified format, and do not include spaces between the different condition components
- Header params: `xc-auth` · string — Auth Token is a JWT Token generated based on the logged-in user. By default, the token is only valid for 10 hours. However, you can change the value by defining it using environment variable NC_JWT_EXPIRES_IN.
- Request body: n/a
- Success responses: `200` OK (`application/json` → object)
