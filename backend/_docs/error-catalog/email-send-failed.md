# Email send failed

**Type URI:** `https://docs.yourapp.com/problems/email-send-failed`  
**Default Status:** 500  
**I18n Key:** `email.send.failed`

## Description

Failed to send email due to a server error.

## Associated Codes

- `VDJ-EMAIL-SEND-500`

## Example Response

```json
{
  "type": "https://docs.yourapp.com/problems/email-send-failed",
  "title": "Email send failed",
  "status": 500,
  "code": "VDJ-EMAIL-SEND-500",
  "i18n_key": "email.send.failed",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}
```
