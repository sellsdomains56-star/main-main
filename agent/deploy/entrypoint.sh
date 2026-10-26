#!/bin/sh
# Starts Dizz Lab. With LITESTREAM_REPLICA_URL set (e.g. s3://my-bucket/dizzlab), the database is
# first restored from the backup when the disk is empty, then copied to it continuously while the
# app runs. For storage other than AWS S3 (Cloudflare R2, Backblaze B2, MinIO) also set
# LITESTREAM_ENDPOINT. Credentials: LITESTREAM_ACCESS_KEY_ID and LITESTREAM_SECRET_ACCESS_KEY.
# Everything in the database is already encrypted with your password, so the backup is too.
set -e
DB="${DATA_DIR:-/data}/dizzlab.db"
mkdir -p "$(dirname "$DB")"
APP="node --import tsx --import ./src/instrument.ts --disable-warning=ExperimentalWarning src/index.ts"

if [ -z "$LITESTREAM_REPLICA_URL" ]; then
  exec $APP
fi

CONFIG=/tmp/litestream.yml
{
  echo "dbs:"
  echo "  - path: $DB"
  echo "    replica:"
  echo "      url: $LITESTREAM_REPLICA_URL"
  [ -n "$LITESTREAM_ENDPOINT" ] && echo "      endpoint: $LITESTREAM_ENDPOINT"
  [ -n "$LITESTREAM_REGION" ] && echo "      region: $LITESTREAM_REGION"
  echo "      sync-interval: ${LITESTREAM_SYNC_INTERVAL:-10s}"
} > "$CONFIG"

litestream restore -config "$CONFIG" -if-db-not-exists -if-replica-exists "$DB"
exec litestream replicate -config "$CONFIG" -exec "$APP"
