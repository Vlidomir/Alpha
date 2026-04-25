# Alpha Image Editor MVP

Локальный MVP веб-приложения для AI-редактирования изображений. Проект использует Next.js App Router, TypeScript, Prisma, PostgreSQL, Better Auth с email/password, Docker Compose для PostgreSQL, локальное файловое хранилище и mock AI-провайдер.

## Возможности

- Регистрация, вход и выход пользователя через Better Auth.
- Защищенная страница дашборда.
- Авторизованный пользователь может загрузить ровно два изображения и ввести промпт.
- Серверная валидация файлов:
  - разрешены только `jpg`, `jpeg`, `png`, `webp`;
  - максимум 10 МБ на файл;
  - нужно загрузить ровно два изображения.
- Загруженные изображения сохраняются в `storage/uploads`.
- Сгенерированные mock-результаты сохраняются в `storage/results`.
- Prisma-модели для `ImageJob`, `UploadedImage` и `GeneratedImage`.
- Статусы задач: `pending`, `processing`, `completed`, `failed`.
- API routes:
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `GET /api/jobs/[jobId]`
  - `GET /api/files/[fileId]`

## Локальный запуск

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Скопируйте пример переменных окружения:

   ```bash
   cp .env.example .env
   ```

3. В файле `.env` задайте длинное случайное значение для `BETTER_AUTH_SECRET`.

4. Запустите PostgreSQL:

   ```bash
   docker compose up -d
   ```

5. Сгенерируйте Prisma Client и примените миграции:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

6. Запустите приложение:

   ```bash
   npm run dev
   ```

7. Откройте `http://localhost:3000`.

## Хранилище

По умолчанию корневая папка локального хранилища - `storage`. Ее можно изменить через переменную `STORAGE_ROOT`. Загруженные изображения сохраняются в `storage/uploads`, а mock-результаты - в `storage/results`.

## Mock AI-провайдер

Реальные AI API не используются. `MockAIProvider` создает локальный SVG-результат, в который встраивает два загруженных изображения и промпт, а затем сохраняет его как сгенерированное изображение.

## Примечания

- S3 намеренно не подключен.
- Реальные AI-провайдеры намеренно не подключены.
- Сгенерированный Prisma Client в `src/generated/prisma` игнорируется git-ом и должен пересоздаваться командой `npm run prisma:generate`.
