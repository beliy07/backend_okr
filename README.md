# Проект GreetStar

## команда 02 - Predators

Бот для создания нестандартных новогодних поздравлений. Пользователь вводит свой текст поздравления, а бот преобразует его в формате озвучки различными знаменитостями.

## Cтек технологий

- **Язык**: TypeScript
- **Фреймворк**: NestJS
- **Базы данных**: PostgreSQL, Redis
- **Внешние сервисы**:
  - ElevenLabs (генерация голоса)
  - FAL AI (генерация видео)

## Требования

- Node.js
- pnpm
- Docker с Docker Compose

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/beliy07/backend_okr
cd backend_okr
```

### 2. Установка зависимостей

```bash
pnpm install
```

### 3. Настройка окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```env
APP_PORT=8000
APP_URL=http://localhost:8000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mpit
REDIS_URI=redis://default:6d3q5hdxix04wzy8@localhost:6379

TELEGRAM_BOT_TOKEN=
TMA_URL=
WELCOME_IMAGE_URL=

ELEVENLABS_API_KEY=
FAL_API_KEY=
```

### 4. Запуск инфраструктуры

Запустите PostgreSQL и Redis через Docker Compose:

```bash
docker compose up -d
```

### 5. Применение миграций

```bash
pnpm prisma migrate deploy
```

### 6. Генерация Prisma Client

```bash
pnpm prisma generate
```

### 7. Запуск приложения

```bash
pnpm run start:dev
```

API будет доступно по адресу `http://localhost:8000`

## API эндпоинты

- `POST /generate` - Создание задачи на генерацию
- `GET /generations` - Получение списка задач генерации
- `GET /generations/:id` - Получение задачи по ID
- `GET /limits` - Получение лимитов пользователя (audio, video)
- `GET /avatars` - Получение списка аватаров

## Конфигурация лимитов

Лимиты для новых пользователей настраиваются через переменные окружения:
- `DEFAULT_AUDIO_LIMIT` - начальный лимит генераций аудио (по умолчанию: 5)
- `DEFAULT_VIDEO_LIMIT` - начальный лимит генераций видео (по умолчанию: 5)
