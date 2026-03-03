# ConnectMan - Server Collection Manager

## Overview

ConnectMan is a Postman-like server management application that organizes SSH connections using **collections** - just like Postman organizes API requests. Instead of managing individual servers in a flat list, servers are grouped into collections (e.g., "Production", "Staging", "Development"), making it easy to manage multiple environments.

## Architecture

### Database Schema

**Collections Table**
- `id` - Primary key
- `name` - Collection name (unique)
- `description` - Optional description
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Servers Table**
- `id` - Primary key
- `collectionId` - Foreign key to collections (cascade delete)
- `name` - Server name
- `host` - Server hostname/IP
- `port` - SSH port (default 22)
- `username` - SSH username
- `password` - Password (optional, if not using keys)
- `privateKey` - Path to private key file (optional)
- `connectionType` - 'ssh', 'http', or 'both'
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**SSH Sessions Table**
- `id` - Primary key
- `serverId` - Foreign key to servers (cascade delete)
- `sessionId` - Unique session identifier
- `status` - Connection status ('connected', 'disconnected')
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Core Components

#### Sidebar (Left Panel)
- Displays collection tree
- Shows servers within each collection
- Add/Delete collections
- Select servers to view details
- **File**: `src/components/Sidebar.tsx`

#### ServerDetail (Right Panel)
- Shows selected server information
- Server connection details (host, port, username, auth type)
- "Connect via SSH" button to open terminal
- Delete server option
- **File**: `src/components/ServerDetail.tsx`

#### SSHTerminal
- Interactive terminal for SSH commands
- Real-time command execution and output
- Connection status indicator
- Supports multiple concurrent sessions
- **File**: `src/components/SSHTerminal.tsx`

#### SSHConnector
- Manages SSH connections
- Displays available servers
- Handles session lifecycle
- **File**: `src/components/SSHConnector.tsx`

#### CollectionModal
- Create/Edit collections
- Modal dialog for collection management
- **File**: `src/components/CollectionModal.tsx`

#### CollectionTree
- Renders hierarchical tree of collections and servers
- Expandable/collapsible collections
- Server selection and deletion
- **File**: `src/components/CollectionTree.tsx`

#### AddServerModal
- Add servers to collections
- SSH authentication options (password or private key)
- Configure connection type
- **File**: `src/components/AddServerModal.tsx`

### IPC Handlers (Electron Main)

#### Collection Handlers
- `collection:create` - Create new collection
- `collection:getAll` - Get all collections
- `collection:delete` - Delete collection (cascades to servers)
- `collection:update` - Update collection details

#### Server Handlers
- `server:create` - Add server to collection
- `server:getByCollection` - Get servers in collection
- `server:getById` - Get single server details
- `server:delete` - Delete server
- `server:update` - Update server details

#### SSH Handlers
- `ssh:connect` - Establish SSH connection
- `ssh:executeCommand` - Run command on server
- `ssh:disconnect` - Close SSH session
- `ssh:isConnected` - Check connection status
- `ssh:getActiveSessions` - Get all active sessions

## Workflow

1. **Create Collection**: User clicks "+ Collection" in sidebar
   - Opens CollectionModal
   - Database creates collection record
   - Collection appears in tree

2. **Add Server**: User selects collection and adds server
   - Opens AddServerModal with collection context
   - Configures SSH credentials
   - Server added to collection in database

3. **View Server**: User clicks server in collection tree
   - ServerDetail panel displays on right
   - Shows server information and "Connect via SSH" button

4. **Connect SSH**: User clicks "Connect via SSH"
   - SSHConnector initiates SSH session
   - SSHTerminal opens with interactive shell
   - User can execute commands

5. **Manage**: User can delete servers or collections
   - Server deletion removes from collection
   - Collection deletion cascades to all servers in it

## Design System

### Color Theme (Postman-like)
- **Background**: #1C1C1C (dark)
- **Sidebar**: #262626 (slightly lighter)
- **Card**: #2D2D2D
- **Terminal**: #0D0D0D (very dark)
- **Primary Accent**: #FF6C37 (orange)
- **Terminal Text**: #00FF00 (green)
- **Error**: #EF4444 (red)

### Typography
- **Headings**: Bold, primary color
- **Body**: Secondary color
- **Muted**: Tertiary color
- **Terminal**: Monospace font

## Key Features

✓ Collection-based server organization
✓ Postman-like dark theme with orange accents
✓ SSH terminal with interactive commands
✓ Multiple concurrent SSH sessions
✓ Password and private key authentication
✓ Server details and metadata
✓ Collection hierarchy
✓ Persistent database storage (SQLite)

## Technology Stack

- **Framework**: React 18
- **Desktop**: Electron
- **Database**: SQLite with better-sqlite3
- **SSH**: ssh2 library
- **Styling**: Tailwind CSS
- **Build**: Vite

## Getting Started

1. Install dependencies: `npm install` or `pnpm install`
2. Start development: `npm run dev` or `pnpm dev`
3. Create a collection using the sidebar button
4. Add servers to the collection
5. Click a server to view details
6. Click "Connect via SSH" to open terminal

## Future Enhancements

- Import/Export collections (JSON format)
- Connection profiles/templates
- SSH key management
- Server health checks
- Command history and favorites
- Multi-session tab switching
- Server search and filtering
- Collection sharing/backup
