# 06 · 基础设施任务卡(Workspace / Docker / CI / 测试)

> 本文档枚举仓库根 / 跨应用层面的基础设施任务卡。Codex 实施 S1 / S9 阶段时按本文执行。
>
> commit message:`[T-XXX] <type>(infra): <subject>`

---

## S1 工程化(Docker + 日志监控 + 工具链加固)

### T-100 husky/lint-staged/commitlint/changesets 加固

- **类型**: feat
- **上下文**: workspace 骨架已在 S0 的 T-000 提前落地;S1 不再重复创建根目录 workspace,改为补齐提交前质量门禁与变更记录工具
- **涉及文件**:
  - `.husky/pre-commit`(新建)
  - `.husky/commit-msg`(新建)
  - `commitlint.config.cjs`(新建)
  - `lint-staged.config.cjs`(新建)
  - `.changeset/config.json`(新建)
  - `package.json`(更新 scripts/devDependencies)
- **实施要点**:
  1. 引入 `husky`、`lint-staged`、`@commitlint/cli`、`@commitlint/config-conventional`、`@changesets/cli`
  2. `pre-commit` 执行 lint-staged,只检查暂存的 ts/vue/json/md 文件
  3. `commit-msg` 校验 `[T-XXX] <type>(<scope>): <subject>` 格式
  4. changesets 仅用于后续包版本记录,不发布 npm
- **验收**:
  - [ ] `pnpm install` 后 husky hooks 可用
  - [ ] 非规范 commit message 被 commitlint 拦截
  - [ ] 暂存 ts/vue 文件时 lint-staged 仅检查相关文件

### T-101 创建 packages/shared-types 与 shared-constants

- **类型**: feat
- **涉及文件**:
  - `packages/shared-types/package.json`
  - `packages/shared-types/src/{api,user,menu,dict,...}.ts`
  - `packages/shared-constants/package.json`
  - `packages/shared-constants/src/{perms,error-codes,dict-keys,...}.ts`
- **实施要点**:
  - shared-types: `name: "@nest-admin-pro/shared-types"`, type-only,无 runtime 依赖
  - shared-constants: 含 perms key 字面常量、error code 枚举、dict code 字面常量
  - 三应用通过 `"@nest-admin-pro/shared-types": "workspace:*"` 引用
  - 暂不上 build 步骤(纯 ts 由各 app 编译时连带处理)
- **验收**:
  - [ ] backend / fronted / app 三端都能 `import { ApiResponse } from '@nest-admin-pro/shared-types'`
  - [ ] perms key 集中在 `shared-constants/src/perms.ts`,后端 controller 与前端 v-perm 共享同一份字符串源

### T-102 全局 ESLint + Prettier 配置

- **类型**: feat
- **涉及文件**:
  - 仓库根 `.eslintrc.cjs` 或 `eslint.config.js`(flat config 优先)
  - 仓库根 `.prettierrc.cjs`
  - 仓库根 `.prettierignore`
- **实施要点**:
  - eslint flat config,`@typescript-eslint` + `eslint-plugin-vue` + `eslint-plugin-import`
  - prettier 规则:`{ singleQuote: true, semi: true, trailingComma: 'all', printWidth: 100, arrowParens: 'always', endOfLine: 'lf' }`
  - 三 app 各自的 .eslintrc 仅覆写本地差异(react-vue 等),共享根级
- **验收**: `pnpm lint` 通过

### T-103 编写 docker/Dockerfile.backend

- **类型**: feat
- **涉及文件**: `docker/backend.Dockerfile`
- **实施要点**:
  ```Dockerfile
  # syntax=docker/dockerfile:1.6

  # ------------------ deps ------------------
  FROM node:20-alpine AS deps
  RUN corepack enable
  WORKDIR /app
  COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
  COPY apps/backend/package.json ./apps/backend/
  COPY packages/shared-types/package.json ./packages/shared-types/
  COPY packages/shared-constants/package.json ./packages/shared-constants/
  RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
      pnpm install --frozen-lockfile

  # ------------------ build ------------------
  FROM node:20-alpine AS build
  RUN corepack enable
  WORKDIR /app
  COPY --from=deps /app /app
  COPY apps/backend ./apps/backend
  COPY packages ./packages
  RUN pnpm --filter backend exec prisma generate
  RUN pnpm --filter backend build
  RUN pnpm --filter backend deploy --prod /tmp/runtime

  # ------------------ runtime ------------------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  COPY --from=build /tmp/runtime /app
  COPY --from=build /app/apps/backend/dist ./dist
  COPY --from=build /app/apps/backend/prisma ./prisma
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD wget -q -O - http://localhost:3000/health || exit 1
  CMD ["node", "dist/main.js"]
  ```
- **验收**: `docker build -f docker/backend.Dockerfile .` 成功,镜像 < 300MB

### T-104 编写 docker/Dockerfile.fronted

- **类型**: feat
- **涉及文件**: `docker/fronted.Dockerfile`
- **实施要点**:
  ```Dockerfile
  FROM node:20-alpine AS deps
  RUN corepack enable
  WORKDIR /app
  COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
  COPY apps/fronted/package.json ./apps/fronted/
  COPY packages ./packages
  RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
      pnpm install --frozen-lockfile

  FROM deps AS build
  WORKDIR /app
  COPY apps/fronted ./apps/fronted
  COPY packages ./packages
  RUN pnpm --filter fronted build

  FROM nginx:1.27-alpine AS runtime
  COPY --from=build /app/apps/fronted/dist /usr/share/nginx/html
  COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  HEALTHCHECK CMD wget -q -O - http://localhost/ || exit 1
  ```
- **验收**: `docker build -f docker/fronted.Dockerfile .` 成功

### T-105 nginx.conf

- **类型**: feat
- **涉及文件**: `docker/nginx.conf`
- **实施要点**:
  ```nginx
  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml+rss text/javascript;
    gzip_min_length 1024;

    location /api/ {
      proxy_pass http://backend:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 60s;
      client_max_body_size 100M;
    }

    location /file/ {
      proxy_pass http://backend:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
      try_files $uri $uri/ /index.html;
      add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location ~* \.(?:js|css|woff2?|svg|png|jpg|jpeg|gif|ico)$ {
      expires 30d;
      access_log off;
      add_header Cache-Control "public, immutable";
    }
  }
  ```
- **验收**: 容器内 curl localhost / → 200,curl localhost/api/health → 200(联通 backend)

### T-106 docker-compose.yml

- **类型**: feat
- **涉及文件**: `docker/docker-compose.yml`,`docker/.env.example`
- **实施要点**:
  ```yaml
  name: nest-admin-pro

  services:
    mysql:
      image: mysql:8.4
      restart: unless-stopped
      environment:
        MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
        MYSQL_DATABASE: ${MYSQL_DATABASE:-nest_admin_pro}
        TZ: Asia/Shanghai
      command: --default-authentication-plugin=caching_sha2_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
      ports:
        - "${MYSQL_PORT:-3306}:3306"
      volumes:
        - mysql-data:/var/lib/mysql
      healthcheck:
        test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${MYSQL_ROOT_PASSWORD:-root}"]
        interval: 10s
        timeout: 5s
        retries: 10

    redis:
      image: redis:7-alpine
      restart: unless-stopped
      command: redis-server --appendonly yes ${REDIS_PASSWORD:+--requirepass $REDIS_PASSWORD}
      ports:
        - "${REDIS_PORT:-6379}:6379"
      volumes:
        - redis-data:/data
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 10s
        timeout: 3s
        retries: 5

    backend:
      build:
        context: ..
        dockerfile: docker/backend.Dockerfile
      restart: unless-stopped
      depends_on:
        mysql: { condition: service_healthy }
        redis: { condition: service_healthy }
      environment:
        NODE_ENV: production
        APP_ENV: production
        APP_PORT: 3000
        DATABASE_URL: mysql://root:${MYSQL_ROOT_PASSWORD:-root}@mysql:3306/${MYSQL_DATABASE:-nest_admin_pro}
        REDIS_HOST: redis
        REDIS_PORT: 6379
        REDIS_PASSWORD: ${REDIS_PASSWORD:-}
        JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
        CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
        UPLOAD_DIR: /app/uploads
        FILE_STORAGE: ${FILE_STORAGE:-local}
        FILE_PUBLIC_URL: ${FILE_PUBLIC_URL:-http://localhost/file}
        SWAGGER_ENABLED: ${SWAGGER_ENABLED:-false}
      ports:
        - "${APP_PORT:-3000}:3000"
      volumes:
        - backend-uploads:/app/uploads
      command: >
        sh -c "
          npx prisma migrate deploy &&
          (npx prisma db seed || echo 'seed skipped') &&
          node dist/main.js
        "

    fronted:
      build:
        context: ..
        dockerfile: docker/fronted.Dockerfile
      restart: unless-stopped
      depends_on:
        backend: { condition: service_started }
      ports:
        - "${WEB_PORT:-80}:80"

  volumes:
    mysql-data:
    redis-data:
    backend-uploads:
  ```
  - `.env.example`:列出所有变量与默认值
- **验收**:
  - [ ] `docker compose -f docker/docker-compose.yml up -d` 4 容器全部 healthy
  - [ ] curl localhost/api/health → 200
  - [ ] 浏览器访问 localhost → 登录页正常,admin/admin123 能登录

### T-107 backend Dockerfile 写出后,启动期自动 migrate + seed

- 已合并到 T-106 的 backend command
- 验收要点:`docker compose down -v` 后 `up -d` 全程自动建库 + 种子,无需人工 prisma 命令

### T-108 init-db.sh 改造为调用 prisma

- **类型**: refactor
- **涉及文件**: `scripts/init-db.sh`,删除 `scripts/seed.sql`
- **实施要点**:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  cd "$(dirname "$0")/.."
  : "${DB_HOST:=localhost}"
  : "${DB_PORT:=3306}"
  : "${DB_USER:=root}"
  : "${DB_PASSWORD:=}"
  : "${DB_NAME:=nest_admin_pro}"

  echo "==> Creating database $DB_NAME (if not exists)"
  mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} \
    -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

  echo "==> Running prisma migrate deploy"
  pnpm --filter backend exec prisma migrate deploy

  echo "==> Running prisma seed"
  pnpm --filter backend exec prisma db seed

  echo "==> Done. Default admin: admin / admin123"
  ```
- **验收**: 在干净 MySQL 环境执行该脚本一次即可初始化完整库

### T-109 Prisma migrate 接管 schema 演进

- 同 02 文档 T-200(在 backend 内部),本卡只确保:
  - 仓库根 `pnpm prisma:migrate` 可用
  - CI 中部署使用 `prisma:migrate:deploy`(不交互)
  - 文档:`docs/spec/02-data-model.md` § 8 已说明
- **验收**: 流程文档化

---

## S9 工程化收尾(测试 + CI)

### T-900 backend 测试体系

- **类型**: feat
- **涉及文件**:
  - `apps/backend/test/setup.ts`(新建)
  - `apps/backend/test/jest-e2e.json`
  - `apps/backend/jest.config.ts`
  - 各模块 `*.spec.ts` 与 `*.e2e-spec.ts`
- **实施要点**:
  - jest config:moduleNameMapper alias、coverage 阈值 line ≥ 60% / branch ≥ 50%
  - e2e:用真实 MySQL(测试 schema `nest_admin_pro_test`)+ 真实 Redis(db=15)
  - test/setup.ts:beforeAll → migrate deploy + seed;afterAll → drop schema
  - 关键覆盖:
    - JwtAuthGuard / @Public / Roles / RequirePerm
    - PrismaTenantMiddleware(平台 vs 租户、findFirst 兼容)
    - dataScope buildWhere 5 档
    - OperLogInterceptor redact
    - cron 表达式校验
    - invokeTarget 解析
    - bigint 序列化
- **验收**:
  - [ ] `pnpm --filter backend test:cov` 覆盖率达标
  - [ ] e2e 关键链路全过(登录、CRUD、导入导出、权限、租户)

### T-901 fronted 测试体系

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/vitest.config.ts`
  - `apps/fronted/test/setup.ts`
  - 关键 `*.spec.ts`
- **实施要点**:
  - vitest + @vue/test-utils + jsdom
  - 关键覆盖:
    - request 拦截器(401 / 业务码 / blob)
    - permDirective + usePerm 4 种用法
    - permission store generateRoutes
    - 公共组件 Pagination / DictTag / TreeSelect
- **验收**: vitest 通过,关键组件覆盖

### T-902 GitHub Actions CI

- **类型**: feat
- **涉及文件**: `.github/workflows/ci.yml`
- **实施要点**:
  ```yaml
  name: CI
  on:
    push: { branches: [main] }
    pull_request: { branches: [main] }
  jobs:
    lint-typecheck-test-build:
      runs-on: ubuntu-latest
      services:
        mysql:
          image: mysql:8.4
          env:
            MYSQL_ROOT_PASSWORD: root
            MYSQL_DATABASE: nest_admin_pro_test
          ports: ['3306:3306']
          options: >-
            --health-cmd "mysqladmin ping -uroot -proot"
            --health-interval 10s --health-timeout 5s --health-retries 10
        redis:
          image: redis:7-alpine
          ports: ['6379:6379']
          options: >-
            --health-cmd "redis-cli ping"
            --health-interval 10s --health-timeout 3s --health-retries 5
      env:
        DATABASE_URL: mysql://root:root@127.0.0.1:3306/nest_admin_pro_test
        REDIS_HOST: 127.0.0.1
        REDIS_PORT: 6379
        JWT_SECRET: ci-test-secret-do-not-use-in-prod
        APP_ENV: test
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 9 }
        - uses: actions/setup-node@v4
          with: { node-version: 20, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - run: pnpm lint
        - run: pnpm typecheck
        - run: pnpm --filter backend prisma:generate
        - run: pnpm --filter backend prisma:migrate:deploy
        - run: pnpm --filter backend prisma:seed
        - run: pnpm test
        - run: pnpm --filter backend test:e2e
        - run: pnpm build
  ```
- **验收**: PR 触发 CI,全部步骤绿

### T-903 镜像构建与发布(可选)

- **类型**: feat
- **涉及文件**: `.github/workflows/release.yml`
- **要点**:
  - tag 触发 → 构建 backend / fronted 镜像 → push 到 ghcr.io
  - 可作为可选(用户未要求私有部署的不强制)

---

## 文档与脚手架

### T-110 README 重写(根目录)

- **类型**: docs
- **涉及文件**: 根 `README.md`
- **要点**:
  - 重写整个 README,去除已陈旧的"已实现/部分实现/未实现"章节,改为指向 `docs/spec/PROGRESS.md`
  - 强化 quick start:`pnpm install && pnpm docker:up && pnpm prisma:migrate:deploy && pnpm prisma:seed && pnpm dev`
  - 把"启动 backend 还要 cd"等 monorepo 反例删除
  - 注明 `docs/api.md / development.md / deployment.md / faq.md` 为旧文档,以 `docs/spec/` 为准
- **验收**: 新人按 README 5 分钟内跑起来

### T-111 docs/api.md / development.md / deployment.md / faq.md 处理

- **类型**: docs
- **要点**:
  - api.md → S9 阶段从 Swagger JSON 自动生成(可用 `redoc-cli` 或 `widdershins`)
  - development.md → 删除旧的 `apps/api` / `apps/web` 引用,改写为指向 spec
  - deployment.md → 改为 docker-compose + Nginx,删除 PM2 章节(可保留作为可选附录)
  - faq.md → 增加常见 prisma migrate / pnpm 问题
- **验收**: 文档与代码一致,无 stale 引用

### T-112 docs/spec/PROGRESS.md 模板

- **类型**: docs
- **要点**: 见 00 文档 § 7,初始化文件
- **验收**: 文件存在,Codex 接手时立即更新

### T-113 docs/spec/INDEX.md 索引页

- **类型**: docs
- **要点**: 列出 8 份文档导航 + 各 Stage 简介(给人类看)
- **验收**: 提供清晰跳转

---

## 监控与日志(可选 P1)

### T-120 接入 Sentry(可选)

- 仅当部署到生产时生效
- backend / fronted 各自接入,DSN 从 env 读
- 可作为 backlog,不在 S9 强制门禁

---

## 全部 infra 任务卡总数

| 范围 | 卡数 |
| --- | --- |
| S1 | 9 |
| S9 | 3 |
| 文档 | 4 |
| 可选 | 1 |
| **合计** | **17** |

---

完。下一份 `07-themes.md` 给出主题系统(项目最末阶段)。
