# Kavira – Decentralized Social Network

Kavira is a decentralized social network platform based on ActivityPub federation protocol, making it part of the Fediverse.

> One world. Many voices.

## Features

- **Magic Link Authentication**: Passwordless login via email
- **Federation**: Connect with other ActivityPub instances
- **Media Uploads**: Support for images and GIFs
- **Hashtags**: Discover content through hashtags
- **Circuits**: Smart content curation algorithms
- **Dark Mode**: Full support for light/dark themes

## Getting Started

See [QUICKSTART.md](./packages/server/QUICKSTART.md) for detailed setup instructions.

```bash
# Clone the repository
git clone https://github.com/yourusername/kavira.git
cd kavira

# Install dependencies
pnpm install

# Start development servers
pnpm -r dev
```

## Tech Stack

- **Backend**: NestJS, PostgreSQL, Prisma
- **Frontend**: Next.js, React, Tailwind CSS
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Docker, Fly.io

## Development

Each package can be run individually:

```bash
# Run server
cd packages/server
pnpm dev

# Run client
cd packages/client
pnpm dev
```

## Testing

```bash
# Run all tests
pnpm -r test

# Run specific tests
cd packages/server
pnpm test
pnpm test:federation
```

## Deployment

See [deployment documentation](./packages/server/QUICKSTART.md#cloud-deployment-with-flyio) for detailed instructions on deploying to Fly.io.

## License

MIT 