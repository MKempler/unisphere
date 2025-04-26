# Kavira Server

Backend API server for the Kavira social network platform.

## Features

- Authentication with magic links
- Posts with images/GIF support
- Federation with ActivityPub
- Anti-spam protection with rate limiting and hCaptcha
- Media uploads via S3-compatible storage (Cloudflare R2)
- Circuit-based content curation

## Getting Started

See the [QUICKSTART.md](./QUICKSTART.md) guide for detailed instructions on local development and cloud deployment.

### Quick Start

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables: copy `.env.example` to `.env` and configure
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `pnpm dev`

## Deployment

### Fly.io Deployment

Kavira can be easily deployed to Fly.io:

```bash
# Launch with existing configuration
fly launch --copy-config

# Set environment variables
fly secrets import < .env.production 

# Deploy
fly deploy
```

See the [QUICKSTART.md](./QUICKSTART.md) for complete deployment instructions.

## Environment Variables

Full list of required and optional environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | No (default: "1d") |
| `SENDGRID_API_KEY` | API key for SendGrid email service | Yes |
| `FROM_EMAIL` | Email address for sending emails | Yes |
| `FROM_NAME` | Name to display in emails | No |
| `PORT` | API server port | No (default: 3001) |
| `CORS_ORIGIN` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `R2_ENDPOINT` | Cloudflare R2/S3 endpoint URL | Yes (for media) |
| `R2_BUCKET` | Storage bucket name | Yes (for media) |
| `R2_ACCESS_KEY` | Storage access key | Yes (for media) |
| `R2_SECRET_KEY` | Storage secret key | Yes (for media) |
| `R2_PUBLIC_URL` | Public URL for the bucket | No |
| `MAX_FILE_MB` | Maximum file size for uploads | No (default: 5) |
| `HCAPTCHA_SECRET_KEY` | hCaptcha secret key | No |
| `HCAPTCHA_SITE_KEY` | hCaptcha site key | No |

## Development

### Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:e2e

# Run federation tests
pnpm test:federation
```

### Linting and Formatting

Pre-commit hooks are set up to run:
- ESLint and Prettier on changed files
- TypeScript type checking

You can manually run:

```bash
# Lint
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm typecheck
``` 