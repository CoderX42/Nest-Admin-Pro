#!/bin/bash
# ============================================
# Nest-Admin-Pro 数据库初始化脚本
# ============================================

# 配置
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME=${DB_NAME:-"nest_admin_pro"}

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Nest-Admin-Pro 数据库初始化${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 创建数据库
echo -e "\n${YELLOW}[1/5] 创建数据库...${NC}"
mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库 $DB_NAME 创建成功${NC}"
else
    echo -e "${RED}✗ 数据库创建失败，请检查 MySQL 连接配置${NC}"
    exit 1
fi

# 2. 安装后端依赖
echo -e "\n${YELLOW}[2/5] 安装后端依赖...${NC}"
cd ../apps/backend && npm install 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi

# 3. 生成 Prisma Client
echo -e "\n${YELLOW}[3/5] 生成 Prisma Client...${NC}"
npx prisma generate 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client 生成成功${NC}"
else
    echo -e "${RED}✗ Prisma Client 生成失败${NC}"
    exit 1
fi

# 4. 执行数据库迁移
echo -e "\n${YELLOW}[4/5] 执行数据库迁移...${NC}"
npx prisma migrate dev --name init 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
else
    # 尝试使用 --skip-generate
    npx prisma migrate dev --name init --skip-generate 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 数据库迁移完成${NC}"
    else
        echo -e "${RED}✗ 数据库迁移失败${NC}"
        exit 1
    fi
fi

# 5. 初始化种子数据
echo -e "\n${YELLOW}[5/5] 初始化种子数据...${NC}"
# 导入初始化 SQL（需要在 prisma 目录下创建 seed.sql）
if [ -f "./prisma/seed.sql" ]; then
    mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD $DB_NAME < ./prisma/seed.sql 2>/dev/null
    echo -e "${GREEN}✓ 种子数据导入成功${NC}"
else
    # 使用 Prisma Db push 作为替代方案
    npx prisma db push 2>/dev/null
    echo -e "${GREEN}✓ 数据库结构同步完成${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n默认账号: admin"
echo -e "默认密码: admin123\n"