# Backend Implementation Todo List for Live Chat Support System

## Overview

Based on the frontend implementation analysis, this document outlines the complete backend requirements for implementing a live chat support system with admin-customer communication through a chatbot panel.

## Database Models

### 1. Ticket Model

```javascript
{
  _id: ObjectId,
  ticketId: String (unique identifier like "TKT-12345"),
  customerId: String,
  customerSocketId: String (for real-time connection),
  status: Enum['open', 'assigned', 'pending', 'resolved', 'closed'],
  priority: Enum['low', 'normal', 'high', 'urgent'],
  assignedAgent: ObjectId (reference to Agent),
  department: String,
  subject: String,
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    connectedAt: Date,
    lastSeen: Date,
    userAgent: String,
    ipAddress: String
  },
  agentInfo: {
    name: String,
    department: String,
    assignedAt: Date
  },
  messages: [Message Schema],
  tags: [String],
  metadata: {
    source: Enum['web', 'mobile', 'api'],
    category: String,
    subcategory: String,
    escalated: Boolean,
    escalatedAt: Date,
    escalatedBy: ObjectId,
    rating: Number (1-5),
    feedback: String
  },
  resolutionInfo: {
    resolvedAt: Date,
    resolvedBy: ObjectId,
    resolutionNotes: String,
    resolutionTime: Number (in minutes)
  },
  closedAt: Date,
  closedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Message Model

```javascript
{
  _id: ObjectId,
  content: String,
  sender: Enum['customer', 'agent', 'system'],
  senderId: String,
  timestamp: Date,
  read: Boolean,
  messageType: Enum['text', 'file', 'image', 'system_notification'],
  metadata: Object (for attachments, emoji reactions, etc.)
}
```

### 3. Agent Model

```javascript
{
  _id: ObjectId,
  agentId: String (unique),
  name: String,
  email: String,
  department: String,
  role: Enum['agent', 'supervisor', 'admin'],
  status: Enum['available', 'busy', 'away', 'offline'],
  skills: [String],
  languages: [String],
  maxConcurrentTickets: Number,
  isActive: Boolean,
  lastLoginAt: Date,
  lastLogoutAt: Date,
  currentSocketId: String,
  metrics: {
    totalTicketsHandled: Number,
    avgResponseTime: Number,
    avgResolutionTime: Number,
    customerSatisfactionRating: Number,
    totalRatings: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Notification Model

```javascript
{
  _id: ObjectId,
  type: Enum['new_ticket', 'ticket_assigned', 'new_message', 'ticket_status_change', 'customer_disconnect', 'agent_offline', 'priority_escalation'],
  title: String,
  message: String,
  priority: Enum['low', 'normal', 'high', 'urgent'],
  relatedData: {
    ticketId: ObjectId,
    customerId: String,
    agentId: ObjectId,
    messageId: ObjectId
  },
  isActive: Boolean,
  createdAt: Date,
  recipients: {
    agents: [{
      agentId: ObjectId,
      read: Boolean,
      readAt: Date
    }]
  }
}
```

## API Endpoints

### Ticket Management APIs

#### 1. Get Tickets (Paginated with Filters)

```
GET /api/tickets
Query Parameters:
- status: string (open, pending, resolved, closed)
- agentId: string
- customerId: string
- priority: string (low, normal, high, urgent)
- department: string
- page: number (default: 1)
- limit: number (default: 20)
- sortBy: string (createdAt, updatedAt, priority)
- sortOrder: string (asc, desc)
- dateFrom: string (ISO date)
- dateTo: string (ISO date)

Response:
{
  success: boolean,
  data: {
    tickets: Ticket[],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number,
      hasNextPage: boolean,
      hasPrevPage: boolean
    },
    statistics: {
      totalOpen: number,
      totalPending: number,
      totalResolved: number,
      totalClosed: number,
      avgResponseTime: number,
      avgResolutionTime: number
    }
  }
}
```

#### 2. Get Single Ticket

```
GET /api/tickets/:ticketId
Response:
{
  success: boolean,
  data: {
    ticket: Ticket (with populated messages and agent info)
  }
}
```

#### 3. Create Ticket

```
POST /api/tickets
Body:
{
  customerId: string,
  customerInfo: {
    name: string,
    email: string,
    phone: string,
    userAgent: string,
    ipAddress: string
  },
  subject: string,
  department: string,
  priority: string,
  initialMessage: string,
  metadata: {
    source: string,
    category: string
  }
}

Response:
{
  success: boolean,
  data: {
    ticket: Ticket
  }
}
```

#### 4. Update Ticket Status

```
PATCH /api/tickets/:ticketId/status
Body:
{
  status: string,
  agentId: string (optional),
  notes: string (optional)
}

Response:
{
  success: boolean,
  data: {
    ticket: {
      ticketId: string,
      status: string,
      updatedAt: string
    }
  }
}
```

#### 5. Assign Ticket to Agent

```
PATCH /api/tickets/:ticketId/assign
Body:
{
  agentId: string
}

Response:
{
  success: boolean,
  data: {
    ticket: Ticket,
    agent: Agent
  }
}
```

#### 6. Add Message to Ticket

```
POST /api/tickets/:ticketId/messages
Body:
{
  content: string,
  sender: string ('customer' | 'agent' | 'system'),
  senderId: string,
  messageType: string (default: 'text'),
  metadata: object (optional)
}

Response:
{
  success: boolean,
  data: {
    message: Message,
    ticket: Ticket (updated)
  }
}
```

#### 7. Mark Messages as Read

```
PATCH /api/tickets/:ticketId/messages/read
Body:
{
  sender: string (default: 'customer')
}

Response:
{
  success: boolean,
  data: {
    markedCount: number
  }
}
```

#### 8. Update Ticket Priority

```
PATCH /api/tickets/:ticketId/priority
Body:
{
  priority: string,
  agentId: string (optional)
}

Response:
{
  success: boolean,
  data: {
    ticket: Ticket
  }
}
```

#### 9. Search Tickets

```
GET /api/tickets/search/:query
Query Parameters:
- limit: number
- page: number

Response:
{
  success: boolean,
  data: {
    tickets: Ticket[],
    pagination: PaginationInfo
  }
}
```

#### 10. Get Ticket Statistics

```
GET /api/tickets/stats/overview
Query Parameters:
- department: string
- agentId: string
- dateFrom: string
- dateTo: string

Response:
{
  success: boolean,
  data: {
    totalTickets: number,
    openTickets: number,
    pendingTickets: number,
    resolvedTickets: number,
    closedTickets: number,
    avgResponseTime: number,
    avgResolutionTime: number,
    customerSatisfactionRating: number,
    ticketsByPriority: object,
    ticketsByDepartment: object,
    dailyTicketCounts: array
  }
}
```

### Agent Management APIs

#### 11. Get Agents

```
GET /api/agents
Query Parameters: (same pagination pattern as tickets)
- department: string
- status: string
- isActive: boolean
- page, limit, sortBy, sortOrder

Response:
{
  success: boolean,
  data: {
    agents: Agent[],
    pagination: PaginationInfo
  }
}
```

#### 12. Get Agent Details

```
GET /api/agents/:agentId
Response:
{
  success: boolean,
  data: {
    agent: Agent,
    activeTickets: Ticket[],
    recentTickets: Ticket[],
    activeTicketsCount: number
  }
}
```

#### 13. Update Agent Status

```
PATCH /api/agents/:agentId/status
Body:
{
  status: string
}

Response:
{
  success: boolean,
  data: {
    agent: Agent
  }
}
```

#### 14. Get Agent Tickets

```
GET /api/agents/:agentId/tickets
Query Parameters: (filtering options)

Response:
{
  success: boolean,
  data: {
    tickets: Ticket[],
    pagination: PaginationInfo
  }
}
```

#### 15. Get Agent Notifications

```
GET /api/agents/:agentId/notifications
Query Parameters:
- unreadOnly: boolean
- limit: number

Response:
{
  success: boolean,
  data: {
    notifications: Notification[]
  }
}
```

#### 16. Mark Notification as Read

```
PATCH /api/agents/:agentId/notifications/:notificationId/read

Response:
{
  success: boolean,
  data: {
    notification: Notification
  }
}
```

#### 17. Get Available Agents

```
GET /api/agents/available/for-assignment
Query Parameters:
- department: string
- skills: string[] (multiple skill parameters)

Response:
{
  success: boolean,
  data: {
    availableAgents: Agent[],
    totalAvailable: number
  }
}
```

### Dashboard APIs

#### 18. Get Dashboard Statistics

```
GET /api/dashboard/stats
Response:
{
  success: boolean,
  data: {
    totalTickets: number,
    activeTickets: number,
    pendingTickets: number,
    resolvedToday: number,
    avgResponseTime: number,
    onlineAgents: number,
    totalAgents: number,
    customerSatisfaction: number,
    recentActivity: Activity[]
  }
}
```

#### 19. Get Online Agents

```
GET /api/dashboard/agents
Response:
{
  success: boolean,
  data: {
    onlineAgents: Agent[],
    agentStats: object
  }
}
```

## Socket.IO Implementation

### Server Setup

```javascript
// Socket namespaces
/agent - for admin/agent connections
/customer - for customer connections

// Authentication middleware for agents
io.of('/agent').use((socket, next) => {
  // Verify agent token/session
  // Attach agent info to socket
});
```

### Socket Events

#### Agent Socket Events (Admin Side)

**Incoming Events (from admin frontend):**

- `authenticate` - Agent login with credentials
- `send_message` - Send message to customer
- `update_ticket_status` - Change ticket status
- `update_status` - Change agent availability status
- `get_ticket_details` - Request ticket information
- `typing` - Agent typing indicator
- `notification_read` - Mark notification as read
- `notifications_read_all` - Mark all notifications as read

**Outgoing Events (to admin frontend):**

- `auth_success` - Authentication successful
- `auth_error` - Authentication failed
- `customer_message` - New message from customer
- `new_ticket` - New ticket created
- `ticket_updated` - Ticket status/info changed
- `ticket_details` - Response to get_ticket_details
- `customer_typing` - Customer typing indicator
- `notification` - New notification
- `notifications_marked_read` - Notifications marked as read
- `agent_status_change` - Another agent's status changed
- `customer_disconnected` - Customer left chat
- `message_sent` - Confirmation of sent message
- `status_updated` - Agent status update confirmation
- `error` - Error occurred

#### Customer Socket Events (Customer Side)

**Incoming Events (from customer chatbot):**

- `customer_connect` - Customer joins chat
- `customer_message` - Customer sends message
- `customer_disconnect` - Customer leaves chat
- `customer_typing` - Customer typing indicator

**Outgoing Events (to customer chatbot):**

- `agent_message` - Message from agent
- `agent_assigned` - Agent assigned to ticket
- `agent_typing` - Agent typing indicator
- `ticket_status_change` - Ticket status updated
- `connection_established` - Connection confirmed
- `error` - Error occurred

### Socket Event Handlers Implementation

#### Agent Socket Handlers

```javascript
// Agent authentication
socket.on("authenticate", async (data) => {
  // Verify agent credentials
  // Update agent status to online
  // Join agent-specific rooms
  // Emit auth_success or auth_error
});

// Send message to customer
socket.on("send_message", async (data) => {
  // Save message to database
  // Emit to customer socket
  // Update ticket's last message
  // Send confirmation to agent
});

// Update ticket status
socket.on("update_ticket_status", async (data) => {
  // Update ticket in database
  // Notify customer of status change
  // Notify other agents if needed
  // Create system notification
});

// Agent status update
socket.on("update_status", async (data) => {
  // Update agent status in database
  // Notify other agents
  // Handle ticket reassignment if going offline
});
```

#### Customer Socket Handlers

```javascript
// Customer connects
socket.on("customer_connect", async (data) => {
  // Create or find existing ticket
  // Add customer to appropriate rooms
  // Notify available agents
  // Send connection confirmation
});

// Customer sends message
socket.on("customer_message", async (data) => {
  // Save message to database
  // Notify assigned agent or available agents
  // Update ticket's last activity
  // Auto-assign agent if none assigned
});
```

## Business Logic Implementation

### 1. Ticket Auto-Assignment System

```javascript
class TicketAssignmentService {
  async autoAssignTicket(ticket) {
    // Find available agents in department
    // Consider agent workload, skills, response time
    // Assign to best match
    // Notify agent via socket
    // Update ticket status
  }

  async reassignOnAgentOffline(agentId) {
    // Find all open tickets for offline agent
    // Reassign to available agents
    // Notify customers of agent change
  }
}
```

### 2. Real-time Notification System

```javascript
class NotificationService {
  async createNotification(type, data) {
    // Create notification in database
    // Determine target agents
    // Send via socket to online agents
    // Store for offline agents
  }

  async sendToAgents(notification, agentIds) {
    // Send to connected sockets
    // Mark as sent/delivered
  }
}
```

### 3. Message Processing Service

```javascript
class MessageService {
  async processMessage(ticketId, messageData) {
    // Save message to database
    // Update ticket timestamp
    // Check for auto-responses
    // Trigger notifications
    // Update read status
  }

  async handleTypingIndicator(ticketId, sender, isTyping) {
    // Broadcast typing status to relevant parties
    // Set timeout for auto-clear
  }
}
```

### 4. Analytics and Metrics Service

```javascript
class AnalyticsService {
  async calculateResponseTime(ticketId) {
    // Calculate time between customer message and agent response
  }

  async calculateResolutionTime(ticketId) {
    // Calculate time from ticket creation to resolution
  }

  async updateAgentMetrics(agentId) {
    // Update agent performance metrics
    // Calculate averages
  }
}
```

## Database Indexes for Performance

```javascript
// Tickets Collection
db.tickets.createIndex({ status: 1, createdAt: -1 });
db.tickets.createIndex({ assignedAgent: 1, status: 1 });
db.tickets.createIndex({ customerId: 1, createdAt: -1 });
db.tickets.createIndex({ department: 1, priority: -1 });
db.tickets.createIndex({ updatedAt: -1 });

// Messages Collection (if separate)
db.messages.createIndex({ ticketId: 1, timestamp: -1 });
db.messages.createIndex({ sender: 1, read: 1 });

// Agents Collection
db.agents.createIndex({ department: 1, status: 1 });
db.agents.createIndex({ isActive: 1, status: 1 });

// Notifications Collection
db.notifications.createIndex({
  "recipients.agents.agentId": 1,
  "recipients.agents.read": 1,
});
db.notifications.createIndex({ createdAt: -1, isActive: 1 });
```

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/chat_support
REDIS_URL=redis://localhost:6379

# Socket.IO
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
SOCKET_IO_PORT=3001

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Notification Settings
EMAIL_SERVICE_ENABLED=true
SMS_SERVICE_ENABLED=false
```

## Error Handling and Validation

### Request Validation Schemas

```javascript
// Ticket Creation Schema
const createTicketSchema = {
  customerId: { type: "string", required: true, minLength: 1 },
  customerInfo: {
    type: "object",
    properties: {
      name: { type: "string", required: true },
      email: { type: "string", format: "email" },
      phone: { type: "string", pattern: "^[+]?[0-9-() ]+$" },
    },
  },
  subject: { type: "string", required: true, maxLength: 200 },
  department: { type: "string", required: true },
  priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
};

// Message Creation Schema
const messageSchema = {
  content: { type: "string", required: true, maxLength: 5000 },
  sender: { type: "string", enum: ["customer", "agent", "system"] },
  messageType: {
    type: "string",
    enum: ["text", "file", "image", "system_notification"],
  },
};
```

### Error Response Format

```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      {
        field: 'email',
        message: 'Invalid email format'
      }
    ]
  }
}
```

## Security Considerations

1. **Input Validation**: Sanitize all user inputs
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Authentication**: Secure JWT-based authentication for agents
4. **CORS**: Configure proper CORS settings for socket connections
5. **File Upload**: Validate file types and sizes for attachments
6. **SQL Injection**: Use parameterized queries (MongoDB injection prevention)
7. **XSS Prevention**: Sanitize message content before storage/display

## Testing Requirements

### Unit Tests

- API endpoint testing
- Socket event handling
- Business logic validation
- Database operations

### Integration Tests

- Full chat flow testing
- Real-time communication testing
- Agent assignment logic
- Notification delivery

### Load Testing

- Concurrent user handling
- Socket connection limits
- Database performance
- Memory usage optimization

This comprehensive backend implementation will support the frontend live chat system with real-time communication, proper ticket management, and scalable architecture for admin-customer support interactions.

# Integration Plan: Website Chat + Meta Messenger

## 1) High-level Flow

- **Website users** → your **web chat widget** → **Socket.IO** → **Express** → **DB** → **admin panel (Socket.IO)**.
- **Messenger users** → **Meta Webhooks** → **Express** → **DB** → **admin panel (Socket.IO)**.
- **Admin replies** (from React) → **Express**
  - If the conversation channel is **web**, broadcast to the website user via **Socket.IO**.
  - If the channel is **messenger**, send via **Graph API Send API** to the user on Messenger.

👉 Store everything in a shared `conversations/messages` collection with a `channel` field: `"web"` or `"messenger"`.

---

## 2) Meta (Facebook) Messenger Prerequisites (One-time Setup)

1. Create a **Meta App** → add **Messenger** product.
2. Create/Use a **Facebook Page** and link it to the app.
3. Generate a **Page Access Token** (store securely).
4. Set a **Webhook** (callback URL + verify token) and subscribe to:
   - `messages`
   - `message_deliveries`
   - `messaging_postbacks`
   - `message_reads`
5. Add required permissions:
   - `pages_messaging`
   - `pages_manage_metadata`  
     _(Request review for production)_
6. Use an **HTTPS** public URL for the webhook (use **ngrok** during development).
