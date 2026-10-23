# EverZone API: one Node process, configured only through environment variables.
# node:22 is the current LTS line (node:20 reached end of life in April 2026).
FROM node:22-alpine

# NODE_OPTIONS caps the V8 heap so the container stays small on a shared VM.
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=5000 \
    NODE_OPTIONS=--max-old-space-size=192

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY src ./src
COPY scripts ./scripts

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
