#!/bin/bash
# Comb-ines Updater

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Updating Comb-ines...${NC}"

# 1. Pull latest code
git fetch origin
git reset --hard origin/main

# 2. Database Backup (Safety First)
if [ -f "prisma/dev.db" ]; then
    echo -e "${BLUE}💾 Backing up database...${NC}"
    mkdir -p backups
    cp prisma/dev.db "backups/dev_$(date +%Y%m%d_%H%M%S).db"
fi

# 3. Rebuild Containers
echo -e "${BLUE}🏗️  Rebuilding containers...${NC}"
docker compose down
docker compose up -d --build --remove-orphans

echo -e "${GREEN}✅ Update complete!${NC}"
