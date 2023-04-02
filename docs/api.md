# API

Classify The Web Utilizes a REST-ful HTTP API to interact with the underlying database instance.

## Check API Availability

### GET `/check`

Returns a 200 OK response if the API server is online and available

## Query Valid Site Category Types

### GET `/categories`

Returns a 200 OK response on success. Returns an array of objects of the following schema

| Name | Type | Description |
| --- | --- | --- |
| id | number | The id of the category |
| name | string | The name of the category |
