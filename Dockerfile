FROM hayd/deno:alpine-1.2.2

WORKDIR /app

COPY . .

USER deno

CMD ["run", "--allow-net", "--allow-read", "--lock=lock.json","src/mod.ts"]

EXPOSE 8000