
---

### ✅ 1. Run **PostgreSQL** Manually:

```bash
docker run --name local-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=javier_db \
  -p 5400:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres:16
```

- Access via: `postgresql://postgres:postgres@localhost:5400/javier`

---

### ✅ 2. Run **Redis** Manually:

```bash
docker run --name local-redis \
  -p 6382:6379 \
  -d redis
```

- Access via: `redis://localhost:6379`

---

### 🟢 Then run your NestJS app locally:

Make sure your `.env` file contains:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5400/javier
REDIS_URL=redis://localhost:6388
REDIS_HOST=localhost
REDIS_PORT=6388
```

Then run:

```bash
npm run start:dev
```

---

### ✅ Stop containers when you're done:

```bash
docker stop local-postgres local-redis
docker rm local-postgres local-redis
```

### RUN THE APP
```bash
docker-compose up
docker-compose down
docker-compose build
```