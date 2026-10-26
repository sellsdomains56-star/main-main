# Dizz Lab server image. Keep your data on a volume mounted at /data.
#   docker build -t dizz-lab .
#   docker run -p 8787:8787 -v dizz-data:/data --env-file .env dizz-lab
FROM node:22-bookworm-slim

# Python for the agent's own code runs (CODE_EXECUTION=local) and Litestream for backups.
ARG WITH_PYTHON=1
ARG LITESTREAM_VERSION=0.5.17
ARG TARGETARCH
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl tini; \
    if [ "$WITH_PYTHON" = "1" ]; then \
      apt-get install -y --no-install-recommends python3 python3-numpy python3-pandas python3-matplotlib python3-openpyxl python3-docx python3-pypdf; \
    fi; \
    case "${TARGETARCH:-amd64}" in arm64) arch=arm64 ;; *) arch=x86_64 ;; esac; \
    curl -fsSL -o /tmp/litestream.deb "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-${arch}.deb"; \
    dpkg -i /tmp/litestream.deb; rm /tmp/litestream.deb; \
    apt-get purge -y curl; apt-get autoremove -y; rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
COPY web ./web
COPY deploy ./deploy
COPY tsconfig.json ./

ENV NODE_ENV=production \
    PORT=8787 \
    DATA_DIR=/data \
    TRUST_PROXY=1 \
    CODE_EXECUTION=sandbox
VOLUME ["/data"]
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
ENTRYPOINT ["/usr/bin/tini", "--", "/app/deploy/entrypoint.sh"]
