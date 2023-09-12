# use slim version
FROM node:20-slim AS base

# set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# set project dir
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .

# install dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# build nest.js project
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# run project
FROM base
COPY --from=prod-deps /var/app/node_modules /app/node_modules
COPY --from=build /var/app/dist /app/dist
EXPOSE 8000

CMD ["node", "dist/main.js"]
# CMD [ "pnpm", "start" ]
