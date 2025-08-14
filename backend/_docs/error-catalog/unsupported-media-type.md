# Unsupported Media Type

**Type URI:** `https://docs.yourapp.com/problems/unsupported-media-type`  
**Default Status:** 415  
**I18n Key:** `errors.unsupported_media_type`

## Description

The media type of the request data is not supported.

## Associated Codes

- `VDJ-GEN-BAD-415`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/unsupported-media-type",
  "title": "Unsupported Media Type",
  "status": 415,
  "code": "VDJ-GEN-BAD-415",
  "i18n_key": "errors.unsupported_media_type",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
