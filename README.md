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

## API Routes

- `POST /api/auth/signup`: Request a magic link for authentication
- `POST /api/auth/callback`: Verify magic link token and get JWT
- `GET /api/profile/:handle`: Get a user's profile
- `POST /api/post`: Create a new post
- `POST /api/follow/:userId`: Follow a user
- `GET /api/timeline`: Get posts from followed users and self

### Federation API Routes

- `POST /federation/event`: Receive federation events from peers
- `GET /federation/health`: Health check endpoint for peers

## Testing

Run tests for all packages:

```bash
pnpm test
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

## License

MIT 