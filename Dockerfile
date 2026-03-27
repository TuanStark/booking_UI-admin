# Multi-stage build for UI Admin (Vite + React)
# Align Node with CI (.github/workflows/ci.yml). Vite inlines VITE_* at build time.
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

ARG VITE_API_BASE_URL=https://dorm-api.tuanstark.id.vn
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# Production: nginx serves static SPA (client-side routing)
FROM nginx:alpine AS production
RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1/health >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
