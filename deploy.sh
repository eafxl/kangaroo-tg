#!/usr/bin/env bash

set -euo pipefail

source .deploy.env

readonly SRC_ARCH_PATH="/tmp/dist.tar.gz"
readonly REMOTE="root@${DEPLOYMENT_IP}"
readonly DEST_DIR="/root/kangaroo-tg"

brew list sshpass || brew install sshpass

pnpm install
yarn clean
yarn build
tar -zcvf "$SRC_ARCH_PATH" ./dist ./pnpm-lock.yaml

echo -n Password:
read -s password
echo

sshpass -p "$password" scp "$SRC_ARCH_PATH" "$REMOTE":"$SRC_ARCH_PATH"
sshpass -p "$password" ssh "$REMOTE" "source ~/.nvm/nvm.sh; tar -xf ${SRC_ARCH_PATH} -C ${DEST_DIR}; cd ${DEST_DIR}; pnpm install; pm2 restart 0"

