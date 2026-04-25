# Alpha Image Editor MVP

Local MVP for an AI image editing web app. It uses Next.js App Router, TypeScript, Prisma, PostgreSQL, Better Auth email/password, Docker Compose for Postgres, local filesystem storage, and a mock AI provider.

## Features

- User registration, login, and logout with Better Auth.
- Protected dashboard.
- Authenticated users can upload exactly two images and enter a prompt.
- Server-side upload validation:
  - `jpg`, `jpeg`, `png`, `webp` only.
  - 10 MB max per image.
  - exactly two images.
- Uploaded images are stored under `storage/uploads`.
- Mock generated results are stored under `storage/results`.
- Prisma models for `ImageJob`, `UploadedImage`, and `GeneratedImage`.
- Job statuses: `pending`, `processing`, `completed`, `failed`.
- API routes:
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `GET /api/jobs/[jobId]`
  - `GET /api/files/[fileId]`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example:

   ```bash
   cp .env.example .env
   ```

3. Set a long random value for `BETTER_AUTH_SECRET` in `.env`.

4. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

5. Generate Prisma Client and run migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`.

## Storage

The default local storage root is `storage`, controlled by `STORAGE_ROOT`. Uploaded images are saved to `storage/uploads`, and mock results are saved to `storage/results`.

## Mock AI Provider

No real AI API is used. `MockAIProvider` creates a local SVG result that embeds the two uploaded images and the prompt, then stores it as a generated image.

## Notes

- S3 is intentionally not included.
- Real AI providers are intentionally not included.
- Generated Prisma Client output in `src/generated/prisma` is ignored and should be recreated with `npm run prisma:generate`.
