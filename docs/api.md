# API

Classify The Web Utilizes a REST-ful HTTP API to interact with the underlying database instance.

## Types

### Site Category

A site category contains both a name and id number. This represents a particular category of websites.

| Name | Type | Description |
| --- | --- | --- |
| id | number | The id of the category |
| name | string | The name of the category |

## Check API Availability

### GET `/check`

Returns a 200 OK response if the API server is online and available

## Query Valid Site Category Types

### GET `/categories`

Get all currently stored category IDs and names.

Returns a 200 OK response with an array of [Site Categories](#site-category).

### POST `/categories`

Create a new category by name.

Returns a 200 OK response with the created [Site Category](#site-category).

Possible error responses include:

| Code | Reason |
| --- | --- |
| 401 | The client did not authenticate with their admin key properly |
| 409 | The category already exists |

## Query Site Classifications

### GET `/sites`

Find a site's category and when it was added.

Returns a 200 OK response with the found [Site Classification](#site-classification).

Possible error responses include:
| Code | Reason |
| --- | --- |
| 404 | The provided domain does not have an assigned category |

### POST `/sites`

Create a new classification for a given site.

Returns a 200 OK response with the created [Site Classification](#site-classification).

Possible error responses include:
| Code | Reason |
| --- | --- |
| 400 | The provided category ID is invalid |
| 401 | The client did not authenticate with their admin key properly |
| 409 | A classification already exists for that site |

### PUT `/sites`

Bulk updates the classification for an array of sites.

Returns a 200 OK response with the array of domains and the category assigned.
