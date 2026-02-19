# Bulk Communication API Documentation

## Overview

This document provides the API specifications for the Bulk SMS and Email Campaign Management System. The system uses queue-based processing with Redis + Bull for reliable delivery.

**Base URL**: `/api/v1`

**Authentication**: Bearer Token (JWT)
```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [SMS Campaigns](#sms-campaigns)
2. [Email Campaigns](#email-campaigns)
3. [Queue Management](#queue-management)
4. [Error Codes](#error-codes)
5. [Webhooks](#webhooks)

---

## SMS Campaigns

### 1. Create SMS Campaign

Creates a new bulk SMS campaign with optional scheduling.

**Endpoint**: `POST /bulk-sms/campaign`

**Authentication**: Required

**Permissions**: `BulkCommunication.create`

#### Request Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

#### Request Body

```json
{
  "name": "Summer Sale Promotion",
  "message": "Special offer! Get 20% off on all items. Use code SUMMER20 at checkout.",
  "recipients": [
    "+880171234567",
    "+880181234567",
    "+880191234567"
  ],
  "scheduledFor": "2026-02-15T10:30:00Z",
  "metadata": {
    "source": "product_details",
    "productId": "prod_12345",
    "productName": "Summer Collection",
    "customerCount": 3
  }
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Campaign name for identification |
| `message` | string | Yes | SMS message content (max 160 characters) |
| `recipients` | string[] | Yes | Array of phone numbers in E.164 format |
| `scheduledFor` | string (ISO 8601) | No | Future date/time for scheduled sending |
| `metadata` | object | No | Additional campaign metadata |

#### Response

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "SMS campaign created successfully",
  "data": {
    "campaignId": "sms_camp_abc123xyz",
    "name": "Summer Sale Promotion",
    "status": "queued",
    "totalRecipients": 3,
    "scheduledFor": "2026-02-15T10:30:00Z",
    "createdAt": "2026-02-11T10:00:00Z"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "message",
      "message": "Message cannot exceed 160 characters"
    },
    {
      "field": "recipients",
      "message": "Invalid phone number format: +88017123456"
    }
  ]
}
```

---

### 2. Get SMS Campaign List

Retrieves a paginated list of SMS campaigns with filtering.

**Endpoint**: `GET /bulk-sms/campaigns`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | all | Filter by status (draft, queued, processing, completed, cancelled, failed) |
| `sortBy` | string | No | createdAt | Sort field |
| `sortOrder` | string | No | desc | Sort direction (asc, desc) |
| `search` | string | No | - | Search by campaign name |

#### Example Request

```
GET /bulk-sms/campaigns?page=1&limit=20&status=completed&sortBy=createdAt&sortOrder=desc
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "sms_camp_abc123",
        "name": "Summer Sale Promotion",
        "message": "Special offer! Get 20% off...",
        "status": "completed",
        "totalRecipients": 1500,
        "sentCount": 1450,
        "failedCount": 50,
        "deliveredCount": 1400,
        "successRate": 96.67,
        "progress": 100,
        "scheduledFor": "2026-02-15T10:30:00Z",
        "startedAt": "2026-02-15T10:30:05Z",
        "completedAt": "2026-02-15T10:45:30Z",
        "createdAt": "2026-02-11T10:00:00Z",
        "recipients": [
          {
            "phoneNumber": "+880171234567",
            "status": "delivered",
            "attempts": 1,
            "sentAt": "2026-02-15T10:30:10Z",
            "deliveredAt": "2026-02-15T10:30:15Z"
          },
          {
            "phoneNumber": "+880181234567",
            "status": "failed",
            "attempts": 3,
            "sentAt": "2026-02-15T10:30:12Z",
            "error": "Invalid phone number"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Single SMS Campaign

Retrieves detailed information about a specific campaign.

**Endpoint**: `GET /bulk-sms/campaign/:campaignId`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
GET /bulk-sms/campaign/sms_camp_abc123
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign retrieved successfully",
  "data": {
    "id": "sms_camp_abc123",
    "name": "Summer Sale Promotion",
    "message": "Special offer! Get 20% off...",
    "status": "processing",
    "totalRecipients": 1500,
    "sentCount": 750,
    "failedCount": 15,
    "deliveredCount": 700,
    "successRate": 93.33,
    "progress": 50,
    "scheduledFor": "2026-02-15T10:30:00Z",
    "startedAt": "2026-02-15T10:30:05Z",
    "createdAt": "2026-02-11T10:00:00Z",
    "recipients": [
      {
        "phoneNumber": "+880171234567",
        "status": "delivered",
        "attempts": 1,
        "sentAt": "2026-02-15T10:30:10Z",
        "deliveredAt": "2026-02-15T10:30:15Z"
      }
    ]
  }
}
```

---

### 4. Cancel SMS Campaign

Cancels a queued or processing campaign.

**Endpoint**: `POST /bulk-sms/campaign/:campaignId/cancel`

**Authentication**: Required

**Permissions**: `BulkCommunication.cancel`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
POST /bulk-sms/campaign/sms_camp_abc123/cancel
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign cancelled successfully",
  "data": {
    "campaignId": "sms_camp_abc123",
    "status": "cancelled",
    "cancelledAt": "2026-02-15T10:35:00Z"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "message": "Cannot cancel completed campaign"
}
```

---

### 5. Delete SMS Campaign

Permanently deletes a campaign and its data.

**Endpoint**: `DELETE /bulk-sms/campaign/:campaignId`

**Authentication**: Required

**Permissions**: `BulkCommunication.delete`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
DELETE /bulk-sms/campaign/sms_camp_abc123
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign deleted successfully",
  "data": {
    "campaignId": "sms_camp_abc123",
    "deletedAt": "2026-02-15T11:00:00Z"
  }
}
```

---

## Email Campaigns

### 1. Create Email Campaign

Creates a new bulk email campaign with optional scheduling.

**Endpoint**: `POST /bulk-email/campaign`

**Authentication**: Required

**Permissions**: `BulkCommunication.create`

#### Request Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

#### Request Body

```json
{
  "name": "Weekly Newsletter",
  "subject": "Your Weekly Deals Are Here!",
  "html": "<html><body><h1>Special Offers</h1><p>Check out our amazing deals this week...</p></body></html>",
  "text": "Special Offers\n\nCheck out our amazing deals this week...",
  "recipients": [
    "customer1@example.com",
    "customer2@example.com",
    "customer3@example.com"
  ],
  "scheduledFor": "2026-02-15T10:30:00Z",
  "metadata": {
    "source": "product_details",
    "productId": "prod_12345",
    "productName": "Summer Collection",
    "customerCount": 3
  }
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Campaign name for identification |
| `subject` | string | Yes | Email subject line |
| `html` | string | Yes | HTML email content |
| `text` | string | No | Plain text version (fallback) |
| `recipients` | string[] | Yes | Array of email addresses |
| `scheduledFor` | string (ISO 8601) | No | Future date/time for scheduled sending |
| `metadata` | object | No | Additional campaign metadata |

#### Response

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Email campaign created successfully",
  "data": {
    "campaignId": "email_camp_xyz789",
    "name": "Weekly Newsletter",
    "status": "queued",
    "totalRecipients": 3,
    "scheduledFor": "2026-02-15T10:30:00Z",
    "createdAt": "2026-02-11T10:00:00Z"
  }
}
```

---

### 2. Get Email Campaign List

Retrieves a paginated list of email campaigns with filtering.

**Endpoint**: `GET /bulk-email/campaigns`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `status` | string | No | all | Filter by status (draft, queued, processing, completed, cancelled, failed) |
| `sortBy` | string | No | createdAt | Sort field |
| `sortOrder` | string | No | desc | Sort direction (asc, desc) |
| `search` | string | No | - | Search by campaign name |

#### Example Request

```
GET /bulk-email/campaigns?page=1&limit=20&status=completed
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "email_camp_xyz789",
        "name": "Weekly Newsletter",
        "subject": "Your Weekly Deals Are Here!",
        "status": "completed",
        "totalRecipients": 5000,
        "sentCount": 4950,
        "failedCount": 50,
        "deliveredCount": 4900,
        "openedCount": 2450,
        "clickedCount": 980,
        "openRate": 50.0,
        "clickRate": 20.0,
        "successRate": 99.0,
        "progress": 100,
        "scheduledFor": "2026-02-15T10:30:00Z",
        "startedAt": "2026-02-15T10:30:05Z",
        "completedAt": "2026-02-15T11:15:30Z",
        "createdAt": "2026-02-11T10:00:00Z",
        "recipients": [
          {
            "email": "customer1@example.com",
            "status": "delivered",
            "attempts": 1,
            "sentAt": "2026-02-15T10:30:10Z",
            "deliveredAt": "2026-02-15T10:30:15Z",
            "openedAt": "2026-02-15T10:35:20Z",
            "clickedAt": "2026-02-15T10:36:45Z"
          },
          {
            "email": "customer2@example.com",
            "status": "failed",
            "attempts": 3,
            "error": "Mailbox full"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### 3. Get Single Email Campaign

Retrieves detailed information about a specific email campaign.

**Endpoint**: `GET /bulk-email/campaign/:campaignId`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
GET /bulk-email/campaign/email_camp_xyz789
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign retrieved successfully",
  "data": {
    "id": "email_camp_xyz789",
    "name": "Weekly Newsletter",
    "subject": "Your Weekly Deals Are Here!",
    "html": "<html><body><h1>Special Offers</h1>...</body></html>",
    "text": "Special Offers\n\n...",
    "status": "processing",
    "totalRecipients": 5000,
    "sentCount": 2500,
    "failedCount": 25,
    "deliveredCount": 2450,
    "openedCount": 500,
    "clickedCount": 150,
    "openRate": 20.0,
    "clickRate": 6.0,
    "successRate": 98.0,
    "progress": 50,
    "scheduledFor": "2026-02-15T10:30:00Z",
    "startedAt": "2026-02-15T10:30:05Z",
    "createdAt": "2026-02-11T10:00:00Z"
  }
}
```

---

### 4. Cancel Email Campaign

Cancels a queued or processing email campaign.

**Endpoint**: `POST /bulk-email/campaign/:campaignId/cancel`

**Authentication**: Required

**Permissions**: `BulkCommunication.cancel`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
POST /bulk-email/campaign/email_camp_xyz789/cancel
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign cancelled successfully",
  "data": {
    "campaignId": "email_camp_xyz789",
    "status": "cancelled",
    "cancelledAt": "2026-02-15T10:35:00Z"
  }
}
```

---

### 5. Delete Email Campaign

Permanently deletes an email campaign and its data.

**Endpoint**: `DELETE /bulk-email/campaign/:campaignId`

**Authentication**: Required

**Permissions**: `BulkCommunication.delete`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID |

#### Example Request

```
DELETE /bulk-email/campaign/email_camp_xyz789
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Campaign deleted successfully",
  "data": {
    "campaignId": "email_camp_xyz789",
    "deletedAt": "2026-02-15T11:00:00Z"
  }
}
```

---

## Queue Management

### SMS Queue Statistics

Retrieves real-time statistics about SMS queue.

**Endpoint**: `GET /bulk-sms/queue/stats`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Queue statistics retrieved successfully",
  "data": {
    "waiting": 150,
    "active": 5,
    "completed": 5000,
    "failed": 25,
    "delayed": 10,
    "total": 5190
  }
}
```

---

### Email Queue Statistics

Retrieves real-time statistics about email queue.

**Endpoint**: `GET /bulk-email/queue/stats`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Queue statistics retrieved successfully",
  "data": {
    "waiting": 200,
    "active": 10,
    "completed": 8000,
    "failed": 50,
    "delayed": 20,
    "total": 8280
  }
}
```

---

### Get Failed SMS Jobs

Retrieves list of failed SMS jobs for retry.

**Endpoint**: `GET /bulk-sms/queue/failed`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page |
| `campaignId` | string | No | - | Filter by campaign |

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Failed jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "job_123",
        "campaignId": "sms_camp_abc123",
        "phoneNumber": "+880171234567",
        "error": "Invalid phone number",
        "attempts": 3,
        "failedAt": "2026-02-15T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

### Retry Failed SMS Job

Retries a failed SMS job.

**Endpoint**: `POST /bulk-sms/queue/job/:jobId/retry`

**Authentication**: Required

**Permissions**: `BulkCommunication.cancel`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | Yes | Job ID |

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Job queued for retry",
  "data": {
    "jobId": "job_123",
    "retryAt": "2026-02-15T10:36:00Z"
  }
}
```

---

### Get Job Status

Retrieves status of a specific job.

**Endpoint**: `GET /bulk-sms/queue/job/:jobId/status`

**Authentication**: Required

**Permissions**: `BulkCommunication.view`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | Yes | Job ID |

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "id": "job_123",
    "status": "failed",
    "attempts": 3,
    "createdAt": "2026-02-15T10:30:00Z",
    "processedAt": "2026-02-15T10:35:00Z",
    "failedAt": "2026-02-15T10:35:00Z",
    "error": "Invalid phone number"
  }
}
```

---

## Error Codes

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
    }
  ]
}
```

### Common Error Messages

| Error | Description |
|-------|-------------|
| `Invalid token` | Authentication token is invalid or expired |
| `Insufficient permissions` | User lacks required permission |
| `Campaign not found` | Campaign ID does not exist |
| `Invalid phone number format` | Phone number not in E.164 format |
| `Invalid email format` | Email address is malformed |
| `Message exceeds 160 characters` | SMS message too long |
| `Scheduled time must be in future` | Cannot schedule in the past |
| `Cannot cancel completed campaign` | Campaign already finished |
| `Cannot cancel processing campaign` | Campaign already started |
| `Recipients array is empty` | No recipients provided |
| `Campaign name is required` | Missing campaign name |

---

## Webhooks

### Email Tracking Webhooks

The system sends webhooks for email engagement tracking.

#### Open Event

Triggered when recipient opens email.

**Payload**:

```json
{
  "event": "email.opened",
  "timestamp": "2026-02-15T10:35:20Z",
  "data": {
    "campaignId": "email_camp_xyz789",
    "recipientId": "recipient_123",
    "email": "customer1@example.com",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Click Event

Triggered when recipient clicks link in email.

**Payload**:

```json
{
  "event": "email.clicked",
  "timestamp": "2026-02-15T10:36:45Z",
  "data": {
    "campaignId": "email_camp_xyz789",
    "recipientId": "recipient_123",
    "email": "customer1@example.com",
    "url": "https://example.com/product/123",
    "ipAddress": "192.168.1.1"
  }
}
```

### SMS Delivery Webhooks

#### Delivery Receipt

Triggered when SMS is delivered.

**Payload**:

```json
{
  "event": "sms.delivered",
  "timestamp": "2026-02-15T10:30:15Z",
  "data": {
    "campaignId": "sms_camp_abc123",
    "recipientId": "recipient_456",
    "phoneNumber": "+880171234567",
    "status": "delivered"
  }
}
```

---

## Campaign Status Flow

### SMS Campaign Status Flow

```
draft → queued → processing → completed
                     ↓
                  cancelled
                     ↓
                  failed
```

### Email Campaign Status Flow

```
draft → queued → processing → completed
                     ↓
                  cancelled
                     ↓
                  failed
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `draft` | Campaign created but not yet submitted |
| `queued` | Campaign scheduled and waiting in queue |
| `processing` | Campaign is actively sending messages |
| `completed` | All messages sent successfully |
| `cancelled` | Campaign cancelled by user |
| `failed` | Campaign failed after 3 retry attempts |

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| Create Campaign | 10 per minute |
| Get Campaigns | 100 per minute |
| Get Single Campaign | 200 per minute |
| Cancel Campaign | 20 per minute |
| Delete Campaign | 10 per minute |
| Queue Stats | 60 per minute |

---

## Best Practices

1. **Scheduling**: Always schedule campaigns during off-peak hours for better delivery rates
2. **Batch Size**: Keep campaigns under 10,000 recipients for optimal performance
3. **Retries**: Failed jobs are automatically retried 3 times with exponential backoff
4. **HTML Emails**: Always provide plain text version as fallback
5. **Phone Format**: Use E.164 format for all phone numbers (e.g., +880171234567)
6. **Unsubscribe**: Include unsubscribe link in all email campaigns
7. **Testing**: Test campaigns with small recipient groups before full send

---

## Testing Examples

### cURL Examples

#### Create SMS Campaign

```bash
curl -X POST https://api.example.com/api/v1/bulk-sms/campaign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "message": "Test message",
    "recipients": ["+880171234567"]
  }'
```

#### Get Email Campaigns

```bash
curl -X GET "https://api.example.com/api/v1/bulk-email/campaigns?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Cancel Campaign

```bash
curl -X POST https://api.example.com/api/v1/bulk-sms/campaign/sms_camp_abc123/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-11 | Initial release |
