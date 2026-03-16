set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    just --list

# Build locally and preview in browser — always fresh, Ctrl+C to stop
serve:
    npm run build
    xdg-open http://localhost:4324/endusers-website/
    npx astro preview --port 4324

# Astro-only local build (uses existing synced data)
build:
    npm run build

# Full container build (Go sync + Astro + nginx image)
container-build:
    podman build -t ghcr.io/castrojo/endusers-website:local -f Containerfile .

# Stop the running container
stop:
    podman rm -f endusers-website 2>/dev/null || true

# Go backend sync only (re-fetch member data)
sync:
    cd endusers-go && go build -o endusers cmd/endusers/main.go && cd ..
    ./endusers-go/endusers
    mkdir -p public/data
    cp src/data/members.json public/data/members.json
    cp src/data/changelog.json public/data/changelog.json

# Astro hot-reload dev server (fastest UI iteration, no build step)
dev:
    npx astro dev --port 4324 --host

# Sync data then hot-reload dev
sync-dev:
    just sync
    just dev

# Run unit tests
test:
    npx vitest run

# Run E2E tests (builds + previews automatically via playwright config)
test-e2e:
    npx playwright test

# Run Go backend tests
test-go:
    cd endusers-go && go test ./...
