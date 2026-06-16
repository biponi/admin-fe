# Operation Request System Documentation

## Overview

The Operation Request System is a centralized, polymorphic approval workflow system for managing deletion requests across different entity types (products, categories, manufacturers, etc.). It provides a complete audit trail, automatic timeout handling, and notification integration.

## Key Features

- ✅ **Polymorphic Design**: Single collection handles multiple entity types
- ✅ **Automatic Inactivation**: Products become inactive on request creation
- ✅ **72-Hour Timeout**: Auto-reactivation if no action taken
- ✅ **Complete Audit Trail**: Full history with snapshots
- ✅ **Notification Integration**: Alerts to admins and requesters
- ✅ **Role-Based Permissions**: Admin vs user access control
- ✅ **Extensible**: Easy to add new operation types

## Workflow States

```
┌─────────────┐     approve      ┌──────────────┐
│   PENDING   │ ─────────────────►│   APPROVED   │
└─────────────┘                   └──────────────┘
      │                                  │
      │ reject                           │ permanent
      ▼                                  ▼
┌─────────────┐                   ┌──────────────┐
│  REJECTED   │                   │    DELETED   │
└─────────────┘                   └──────────────┘
      │
      │ cancel (requester)
      ▼
┌─────────────┐
│  CANCELLED  │
└─────────────┘

      │ 72h timeout
      ▼
┌──────────────┐
│TIMEOUT_EXPIRED│
└──────────────┘
```

## API Endpoints

### 1. Create Product Deletion Request

**Endpoint**: `POST /api/v1/operation-request/product-delete/:productId`

**Authentication**: Required

**Access Level**: Any authenticated user

**Request Body**:
```json
{
  "reason": "Product is obsolete and no longer sold"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "OPREQ-1234567890-abc123",
    "operationType": "product_delete",
    "targetId": "prod-123",
    "targetName": "Sample Product",
    "requester": "John Doe",
    "reason": "Product is obsolete",
    "status": "pending",
    "requestedAt": "2025-06-16T10:00:00Z",
    "expiresAt": "2025-06-19T10:00:00Z",
    "isExpired": false
  },
  "message": "Product deletion request created successfully. Product is now inactive pending approval."
}
```

**Effect**:
- Product becomes `active: false`
- Product stores `deletionRequestId` and `previousActiveState`
- Notification sent to all admins
- Request expires in 72 hours

---

### 2. Get All Requests

**Endpoint**: `GET /api/v1/operation-request/requests`

**Authentication**: Required

**Access Level**:
- **Admin**: View all requests
- **Non-Admin**: View only own requests

**Query Parameters**:
```
status: pending | approved | rejected | cancelled | timeout_expired
operationType: product_delete | category_delete | manufacturer_delete
targetId: string (filter by entity ID)
requesterId: string (filter by user ID)
startDate: ISO date string
endDate: ISO date string
page: number (default: 1)
limit: number (default: 20)
```

**Example Request**:
```
GET /api/v1/operation-request/requests?status=pending&page=1&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "OPREQ-1234567890-abc123",
      "operationType": "product_delete",
      "targetType": "Product",
      "targetId": "prod-123",
      "targetName": "Sample Product",
      "requester": "John Doe",
      "reason": "Product is obsolete",
      "status": "pending",
      "requestedAt": "2025-06-16T10:00:00Z",
      "expiresAt": "2025-06-19T10:00:00Z",
      "isExpired": false,
      "approver": null,
      "actionAt": null,
      "adminNotes": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 3. Get Single Request

**Endpoint**: `GET /api/v1/operation-request/request/:id`

**Authentication**: Required

**Access Level**:
- **Admin**: View any request
- **Non-Admin**: View only own requests

**Response**: Same format as single request in Get All Requests

---

### 4. Approve Request (Admin Only)

**Endpoint**: `PUT /api/v1/operation-request/:id/approve`

**Authentication**: Required

**Access Level**: Admin only (requires `product.delete` permission)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "OPREQ-1234567890-abc123",
    "status": "approved",
    "approver": "Admin User",
    "actionAt": "2025-06-16T11:00:00Z"
  },
  "message": "Deletion request approved and processed successfully"
}
```

**Effect**:
- Product soft-deleted (`deletedAt` set to current date)
- `deletionRequestId` cleared from product
- Notification sent to requester
- Request cannot be modified further

---

### 5. Reject Request (Admin Only)

**Endpoint**: `PUT /api/v1/operation-request/:id/reject`

**Authentication**: Required

**Access Level**: Admin only (requires `product.delete` permission)

**Request Body**:
```json
{
  "adminNotes": "Product still has active inventory, cannot delete"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "OPREQ-1234567890-abc123",
    "status": "rejected",
    "approver": "Admin User",
    "actionAt": "2025-06-16T11:00:00Z",
    "adminNotes": "Product still has active inventory"
  },
  "message": "Deletion request rejected. Product has been restored to active state."
}
```

**Effect**:
- Product restored to `previousActiveState`
- `deletionRequestId` and `previousActiveState` cleared
- Notification sent to requester
- Request cannot be modified further

---

### 6. Cancel Request (Requester Only)

**Endpoint**: `PUT /api/v1/operation-request/:id/cancel`

**Authentication**: Required

**Access Level**: Original requester only (while status is pending)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "OPREQ-1234567890-abc123",
    "status": "cancelled",
    "approver": "John Doe",
    "actionAt": "2025-06-16T10:30:00Z"
  },
  "message": "Deletion request cancelled. Product has been restored to active state."
}
```

**Effect**:
- Product restored to `previousActiveState`
- Notification sent to admins
- Request cannot be modified further

---

### 7. Get My Requests

**Endpoint**: `GET /api/v1/operation-request/my-requests`

**Authentication**: Required

**Access Level**: Any authenticated user (returns only own requests)

**Query Parameters**:
```
status: filter by status
operationType: filter by operation type
page: number (default: 1)
limit: number (default: 20)
```

**Response**: Same as Get All Requests

---

### 8. Get Statistics (Admin Only)

**Endpoint**: `GET /api/v1/operation-request/statistics`

**Authentication**: Required

**Access Level**: Admin only

**Query Parameters**:
```
startDate: ISO date string (optional)
endDate: ISO date string (optional)
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "operationType": "product_delete",
      "totalRequests": 150,
      "pending": 12,
      "approved": 85,
      "rejected": 38,
      "cancelled": 10,
      "timeoutExpired": 5
    }
  ]
}
```

## Database Schema

### OperationRequest Collection

```javascript
{
  id: String,                    // Unique request ID (OPREQ-*)
  operationType: String,         // 'product_delete', 'category_delete', etc.
  targetId: String,              // Entity ID being deleted
  targetType: String,            // 'Product', 'Category', 'Manufacturer'
  targetSnapshot: Object,        // Entity data snapshot for audit

  requester: {
    userId: String,
    userName: String,
    userEmail: String,
    requestedAt: Date
  },

  reason: String,                // Optional reason from requester

  status: String,                // 'pending', 'approved', 'rejected', 'cancelled', 'timeout_expired'

  approver: {
    userId: String,
    userName: String,
    actionAt: Date
  },

  adminNotes: String,            // Optional admin notes

  expiresAt: Date,               // 72 hours from requestedAt
  timeoutProcessed: Boolean,     // Whether timeout has been processed

  ipAddress: String,
  userAgent: String,

  timestamps: {
    createdAt: Date,
    updatedAt: Date
  }
}
```

### Product Model (New Fields)

```javascript
{
  // ... existing fields ...

  deletionRequestId: String,     // Links to pending deletion request
  previousActiveState: Boolean   // Remembers state before request
}
```

## Notification Types

### 1. operation_request_created
- **Recipients**: All admins
- **Priority**: High
- **Channels**: FCM, In-App
- **Data**:
  - requestId, operationType, targetId, targetName
  - requesterName, requesterId, expiresAt, reason

### 2. operation_request_approved
- **Recipients**: Requester
- **Priority**: Normal
- **Channels**: FCM, In-App
- **Data**:
  - requestId, targetId, targetName
  - approverName, approvedAt

### 3. operation_request_rejected
- **Recipients**: Requester
- **Priority**: Normal
- **Channels**: FCM, In-App
- **Data**:
  - requestId, targetId, targetName
  - rejecterName, rejectedAt, adminNotes

### 4. operation_request_cancelled
- **Recipients**: All admins
- **Priority**: Low
- **Channels**: In-App
- **Data**:
  - requestId, targetId, targetName, requesterName

### 5. operation_request_timeout
- **Recipients**: Requester and Admins
- **Priority**: Normal (requester), Low (admins)
- **Channels**: FCM, In-App
- **Data**:
  - requestId, targetId, targetName, expiresAt

## Timeout Processing

### Automatic 72-Hour Timeout

The system includes an automatic timeout processor that:

1. **Runs**: Every hour (configurable)
2. **Checks**: For pending requests where `expiresAt < now`
3. **Actions**:
   - Sets status to `timeout_expired`
   - Restores product to active state
   - Marks `timeoutProcessed: true`
   - Sends notifications to requester and admins

### Configuration

Located in: `/service/scheduler/operationRequestTimeoutScheduler.js`

```javascript
// Default: Check every hour
timeoutProcessor.start(60 * 60 * 1000);
```

### Manual Processing

To manually trigger timeout processing:

```javascript
const operationRequestService = require('./service/operationRequest/operationRequestService');
await operationRequestService.processExpiredRequests();
```

## Extending to Other Entity Types

### Example: Add Category Deletion

The polymorphic design makes it easy to add new entity types:

#### 1. Update OperationRequest Model Enums

```javascript
// model/operationRequest.js
operationType: {
  enum: ['product_delete', 'category_delete', 'manufacturer_delete']
}

targetType: {
  enum: ['Product', 'Category', 'Manufacturer']
}
```

#### 2. Add Category Model Fields

```javascript
// model/category.js
{
  deletionRequestId: String,
  previousActiveState: Boolean
}
```

#### 3. Add Service Methods

```javascript
// service/operationRequest/operationRequestService.js

async createCategoryDeletionRequest(categoryId, user, reason, ipAddress, userAgent) {
  // Similar to createProductDeletionRequest
  // Use Category model instead of Product
}

async _performCategoryDeletion(request) {
  // Soft delete category
}

async _restoreCategory(request) {
  // Restore category
}
```

#### 4. Add Controller

```javascript
// routes/v1/operation-request/controllers.js

async createCategoryDeletionRequest(req, res) {
  const { categoryId } = req.params;
  // Call service
}
```

#### 5. Add Route

```javascript
// routes/v1/operation-request/routes.js

router.post("/category-delete/:categoryId", createCategoryDeletionRequest);
```

**No new database collections needed!** The polymorphic design handles all operation types in a single collection.

## Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "A pending deletion request already exists for this product"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "User not authenticated"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "You don't have permission to view this request"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found or already deleted"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Admin endpoints require role-based permissions
3. **Ownership**: Non-admin users can only view/cancel their own requests
4. **Audit Trail**: All actions logged with user, timestamp, IP
5. **Idempotency**: Cannot approve/reject same request twice
6. **Timeout Protection**: Automatic restoration after 72h

## Testing Checklist

### Basic Workflow
- [ ] User creates deletion request → Product becomes inactive
- [ ] Admin approves → Product permanently deleted
- [ ] Admin rejects → Product becomes active again
- [ ] Requester cancels → Product becomes active again
- [ ] 72h timeout → Auto-reactivation

### Permissions
- [ ] Non-admin cannot approve/reject requests
- [ ] Non-admin can only view own requests
- [ ] Requester can cancel own pending requests
- [ ] Non-requester cannot cancel requests

### Edge Cases
- [ ] Multiple requests for same product → Second request blocked
- [ ] Approve non-pending request → Error
- [ ] Cancel already processed request → Error
- [ ] Deleted product → Cannot create request
- [ ] Concurrent approvals → Handled by status validation

### Notifications
- [ ] Admin notified on request creation
- [ ] Requester notified on approval
- [ ] Requester notified on rejection
- [ ] Admin notified on cancellation
- [ ] Both notified on timeout

## File Structure

```
biponi-express/
├── model/
│   ├── operationRequest.js              # Main polymorphic schema
│   └── product.js                       # Product model (updated)
├── routes/v1/
│   ├── operation-request/
│   │   ├── routes.js                    # API endpoints
│   │   └── controllers.js               # Request handlers
│   └── index.js                         # Main router (updated)
├── service/
│   ├── operationRequest/
│   │   ├── operationRequestService.js  # Business logic
│   │   └── timeoutProcessor.js          # 72h timeout handler
│   ├── notification/
│   │   └── notificationService.js       # Notifications (uses existing)
│   └── scheduler/
│       └── operationRequestTimeoutScheduler.js  # Cron integration
└── app.js                               # Main app (updated)
```

## Support & Maintenance

### Logs

The system logs all important operations:

```
[OperationRequestService] Creating deletion request for product prod-123
[OperationRequestService] Request OPREQ-123 approved by admin-1
[TimeoutProcessor] Processed 3 expired requests in 245ms
[OperationRequestService] Error approving request: Request not found
```

### Monitoring

Monitor these metrics:
- Pending request count (should not grow unbounded)
- Timeout processing success rate
- Notification delivery success
- Average time to approval/rejection

### Troubleshooting

**Issue**: Products not reactivating after timeout
- Check: Timeout processor is running
- Check: MongoDB connection
- Check: Request status and timeoutProcessed flag

**Issue**: Notifications not sending
- Check: Notification service configuration
- Check: FCM channel status
- Check: Admin user FCM tokens

**Issue**: Duplicate requests allowed
- Check: Existing request validation in service
- Check: Index on targetId + status

## Future Enhancements

Potential improvements for future versions:

1. **Batch Operations**: Allow approval/rejection of multiple requests
2. **Delegation**: Allow admin to delegate approval to another admin
3. **Comments**: Add comment thread for requests
4. **Escalation**: Auto-escalate old pending requests
5. **Webhooks**: Send webhooks to external systems
6. **Analytics Dashboard**: Request metrics and trends
7. **Custom Workflows**: Configurable approval flows
8. **Reason Codes**: Standardized rejection/approval reasons

## API Versioning

Current version: `v1`

Base URL: `/api/v1/operation-request`

Breaking changes will increment the version number.

---

**Last Updated**: June 16, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
