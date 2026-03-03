# ConnectMan - API & SSH Manager

A Postman-like desktop application built with Electron, React, and Tailwind CSS that combines HTTP API testing with SSH terminal access.

## Features Implemented

### 1. Database Integration (SQLite)
- **File**: `electron/database.ts`
- Manages servers, collections, requests, and request history
- IPC handlers exposed to renderer process for secure database access
- Tables: `servers`, `collections`, `requests`, `requestHistory`

### 2. SSH Client
- **File**: `electron/ssh.ts`
- Built with `ssh2` library for secure SSH connections
- Session management with support for password and key-based authentication
- Real-time command execution with output streaming

### 3. Electron IPC Handlers
- **File**: `electron/main.ts`
- Database operations: `db:addServer`, `db:getServers`, `db:deleteServer`, etc.
- Collections CRUD: `db:addCollection`, `db:getCollections`, `db:deleteCollection`
- SSH operations: `ssh:connect`, `ssh:executeCommand`, `ssh:disconnect`, `ssh:isConnected`
- All handlers properly integrated with database and SSH services

### 4. Postman-like Design Theme
- **File**: `src/index.css`
- Dark theme with orange accents (#FF6C37) matching Postman's design
- Color system: Background (#1C1C1C), Sidebar (#262626), Card (#2D2D2D)
- Terminal colors with green text (#00FF00) for output
- Semantic design tokens for consistent theming

### 5. Collections System
- **Components**:
  - `CollectionModal.tsx`: Create/edit collections
  - `CollectionTree.tsx`: Tree view of collections and requests
  - `Sidebar.tsx`: Enhanced sidebar with collection management
- Supports hierarchical organization: Collections → Requests
- Add, edit, delete collections and requests
- Persistent storage in SQLite

### 6. Request Builder
- **Components**:
  - `RequestBuilder.tsx`: Main request interface
  - `RequestTabs.tsx`: Tabbed interface for Params, Headers, Body, Auth
  - `ResponsePane.tsx`: Response viewer with headers and body tabs
- Postman-style UI with method selector and URL input
- Support for GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- Real-time request/response handling with timing information

### 7. SSH Terminal & Connection Manager
- **Components**:
  - `SSHConnector.tsx`: Server selection and session management
  - `SSHTerminal.tsx`: Interactive terminal with command execution
- Multi-session support for multiple servers
- Status indicators showing connection state
- Real-time command output with color-coded messages
- Password and private key authentication support

### 8. Server Management
- **Components**:
  - `ServerList.tsx`: Server list and management
  - `AddServerModal.tsx`: Server creation with SSH configuration
- Integrated SSH connectivity from server list
- Support for mixed connection types: SSH only, HTTP only, or both
- Authentication options: password or private key

## Database Schema

### servers
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- host (TEXT)
- port (INTEGER, default: 22)
- username (TEXT)
- password (TEXT)
- privateKey (TEXT)
- connectionType (TEXT: 'ssh', 'http', 'both')
- createdAt, updatedAt (DATETIME)
```

### collections
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- createdAt, updatedAt (DATETIME)
```

### requests
```sql
- id (INTEGER PRIMARY KEY)
- collectionId (INTEGER FK)
- name (TEXT)
- method (TEXT: GET, POST, etc.)
- url (TEXT)
- headers (JSON)
- body (TEXT)
- params (JSON)
- auth (JSON)
- createdAt, updatedAt (DATETIME)
```

### requestHistory
```sql
- id (INTEGER PRIMARY KEY)
- requestId (INTEGER FK)
- method, url (TEXT)
- statusCode, responseTime (INTEGER)
- responseBody (TEXT)
- createdAt (DATETIME)
```

## Dependencies Added

```json
{
  "ssh2": "^1.15.0",
  "sqlite3": "^5.1.7"
}
```

## Key Implementation Details

1. **IPC Communication**: All database and SSH operations go through Electron's IPC for security
2. **Async Operations**: All database queries return Promises for reliable async/await handling
3. **Color System**: Using design tokens (CSS variables) for consistent theming
4. **Error Handling**: User-friendly error messages in modals and alerts
5. **Session Management**: Active SSH sessions tracked with unique IDs
6. **Request State**: Full request state management with collections

## How to Use

### Adding a Server
1. Click "Servers" tab in Dashboard
2. Click "+ Add Server"
3. Fill in server details (name, host, port, username)
4. Choose authentication method (password or private key)
5. Select connection type (SSH, HTTP, or Both)
6. Click "Save Server"

### SSH Terminal
1. In Servers tab, click "SSH Terminal"
2. Select a server from the list
3. Click "Connect"
4. Once connected, type commands and press Enter
5. View real-time output in the terminal

### API Testing
1. Click "API Requests" tab
2. Click "+ Collection" to create a collection
3. Expand collection and add requests
4. Select a request to view it
5. Modify method, URL, headers, params, body
6. Click "Send" to execute request
7. View response in the Response pane

## Notes

- All data is persisted in SQLite (database file located in user's application data directory)
- SSH sessions are maintained for the duration of the application session
- HTTP requests are made directly from the renderer process with CORS consideration
- Private key paths should be the absolute path to the private key file
- Terminal supports multiple simultaneous SSH sessions with tab switching

## Future Enhancements

- Request history and replay functionality
- Request chaining and automation
- Environment variables for dynamic values
- WebSocket support
- GraphQL query builder
- Advanced authentication (OAuth, JWT)
- Request/response logging and debugging
- Collaboration features
