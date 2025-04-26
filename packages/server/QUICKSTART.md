# Kavira Quickstart Guide

This guide will help you set up Kavira for local development or cloud deployment.

## Local Development

### Prerequisites

- Node.js 18 or later
- pnpm (you can install it with `npm install -g pnpm`)
- PostgreSQL database
- AWS S3 compatible storage (like Cloudflare R2)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/kavira.git
   cd kavira
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file and update it with your settings:

   ```bash
   cp packages/server/.env.example packages/server/.env
   ```

   Key variables to configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`: For media storage
   - `HCAPTCHA_SECRET_KEY`, `HCAPTCHA_SITE_KEY`: For spam protection

4. **Setup the database**

   ```bash
   cd packages/server
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

   The API server will be available at http://localhost:3001, and the frontend at http://localhost:3000.

## Cloud Deployment with Fly.io

1. **Install the Fly CLI**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**

   ```bash
   fly auth login
   ```

3. **Launch the application**

   ```bash
   fly launch --copy-config
   ```

4. **Set up environment variables**

   Create a `.env.production` file with your production settings and run:

   ```bash
   fly secrets import < .env.production
   ```

5. **Create a PostgreSQL database**

   ```bash
   fly postgres create --name kavira-db
   ```

6. **Attach the database**

   ```bash
   fly postgres attach --app kavira kavira-db
   ```

7. **Deploy the application**

   ```bash
   fly deploy
   ```

## Key Environment Variables

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
| `R2_ENDPOINT` | Cloudflare R2/S3 endpoint URL | Yes |
| `R2_BUCKET` | Storage bucket name | Yes |
| `R2_ACCESS_KEY` | Storage access key | Yes |
| `R2_SECRET_KEY` | Storage secret key | Yes |
| `R2_PUBLIC_URL` | Public URL for the bucket | No |
| `MAX_FILE_MB` | Maximum file size for uploads | No (default: 5) |
| `HCAPTCHA_SECRET_KEY` | hCaptcha secret key | No |
| `HCAPTCHA_SITE_KEY` | hCaptcha site key | No | 