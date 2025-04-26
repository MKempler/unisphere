# UniSphere

A social platform with custodial-key management for decentralized identity.

## Project Structure

This is a PNPM monorepo with the following packages:

- **packages/shared**: Shared TypeScript interfaces and types
- **packages/server**: NestJS 10 backend with Prisma and PostgreSQL
- **packages/client**: Next.js 14 frontend with Tailwind CSS and shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM 7+
- Docker and Docker Compose (for running the PostgreSQL database)

### Quick Start with Docker

The easiest way to run the project is using Docker Compose:

```bash
# Start the server and PostgreSQL database
docker compose up
```

The server will be available at http://localhost:3001

### Manual Development Setup

1. **Install dependencies**

```bash
pnpm install
```

2. **Setup environment variables**

Copy the example environment variables:

```bash
cp .env.example .env
```

3. **Start the database**

```bash
docker compose up postgres -d
```

4. **Run database migrations**

```bash
cd packages/server
pnpm prisma:migrate
pnpm seed
```

5. **Start the development servers**

```bash
# In the root directory
pnpm dev
```

The server will be available at http://localhost:3001 and the client at http://localhost:3000.

## Features

- Authentication with magic links (email)
- User profiles with handle-based URLs
- Post creation and timeline viewing
- Follow/unfollow functionality
- Custodial DID key management (simplified in this MVP)
- Federation and peer synchronization between instances
- Full-text search of posts across the network
- Trending hashtags calculated hourly

## API Routes

- `POST /api/auth/signup`: Request a magic link for authentication
- `POST /api/auth/callback`: Verify magic link token and get JWT
- `GET /api/profile/:handle`: Get a user's profile
- `POST /api/post`: Create a new post
- `POST /api/follow/:userId`: Follow a user
- `GET /api/timeline`: Get posts from followed users and self
- `GET /api/search?q=:query&cursor=:cursor&limit=:limit`: Search posts by text or hashtags
- `GET /api/search/trending?limit=:limit`: Get trending hashtags from the last hour

### Federation API Routes

- `POST /federation/event`: Receive federation events from peers
- `GET /federation/health`: Health check endpoint for peers

## Testing

Run tests for all packages:

```bash
corepack enable   # one-time
pnpm install      # install dev-deps & hoisted bins
pnpm test && pnpm test:federation && pnpm e2e
```

Run federation tests specifically:

```bash
cd packages/server
pnpm test:federation
```

## Generating Invite Codes

To create a single-use invite code for registration (optional feature):

```bash
cd packages/server
pnpm generate-invite
```

## Running Multiple Nodes

To test federation locally, you can run multiple instances of the server with different configurations:

```bash
# Terminal 1: Run the first node
cd packages/server
PORT=3001 pnpm dev

# Terminal 2: Run the second node
cd packages/server
PORT=4100 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unisphere2 PEERS=http://localhost:3001 pnpm dev
```

### Checking Peer Health

You can check the health of all configured peers with:

```bash
cd packages/server
pnpm peer-health
```

## Federation Architecture

UniSphere uses a simple event-based federation system:

1. When a user creates a post, it's stored locally and broadcast to all configured peers
2. Each peer validates the event signature and creates the post with the remote user reference
3. Remote users are automatically created when content from them is received
4. Posts from both local and remote users are shown in the timeline

Events are cryptographically signed using the user's DID keys to ensure authenticity.

## Moving your account in 3 commands

UniSphere allows you to migrate your account from one node to another while preserving your DID, handle, and follower relationships.

### Export your account from the old node

```bash
# On your old node
pnpm ts-node bin/account-export alice@example.com
```

This will generate a JSON file with your account data. The CLI will ask if you want to broadcast a PROFILE_MOVED event to your followers. If you enter a URL, the event will be sent; otherwise, it will be skipped.

### Import your account on the new node

```bash
# On your new node
curl -X POST http://localhost:3000/auth/claim \
  -H "Content-Type: application/json" \
  -d '{
    "exportJson": "PASTE_EXPORT_JSON_HERE",
    "inviteCode": "YOUR_INVITE_CODE",
    "newEmail": "alice@newnode.com"
  }'
```

Alternatively, you can upload the JSON file directly:

```bash
curl -X POST http://localhost:3000/auth/claim \
  -F "exportJson=@alice.json" \
  -F "inviteCode=YOUR_INVITE_CODE" \
  -F "newEmail=alice@newnode.com"
```

### Complete the login process

Check your email for a magic link to log in to your new account. Once logged in, you'll have access to your old DID and handle, and your followers will be notified of your move.

## How migration works

1. Your DID and encrypted private key are preserved exactly as they were
2. Your handle is claimed on the new server
3. The old server broadcasts a PROFILE_MOVED event to all peers
4. Followers can automatically follow your new account
5. Your old account is marked as deprecated but not deleted

## Search & Trending Features

UniSphere provides powerful search and trending capabilities:

### Search

- Full-text search over all posts using PostgreSQL's built-in text search
- Support for hashtag searches (e.g., `#unisphere`)
- Results ranked by relevance
- Cursor-based pagination for efficient browsing

### Trending Hashtags

- Hourly trending hashtags calculated from recent posts
- Global trending view shows hashtags from the entire network
- Updates automatically in the sidebar

### Configuration

Search indexing can be configured via environment variables:

- `SEARCH_CRON_MS`: Interval between search indexing runs (default: 30000ms)

## License

MIT 