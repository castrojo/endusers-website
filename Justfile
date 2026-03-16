set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    just --list

serve:
    just container-build
    podman rm -f endusers-website 2>/dev/null || true
    podman run -d --name endusers-website -p 8082:8080 ghcr.io/castrojo/endusers-website:local
    xdg-open http://localhost:8082/endusers-website/

build:
    npm ci
    cd endusers-go && go build -o endusers cmd/endusers/main.go && cd ..
    ./endusers-go/endusers
    mkdir -p public/data
    cp src/data/members.json public/data/members.json
    cp src/data/changelog.json public/data/changelog.json
    npm run build

container-build:
    podman build -t ghcr.io/castrojo/endusers-website:local -f Containerfile .

stop:
    podman rm -f endusers-website 2>/dev/null || true

sync:
    cd endusers-go && go build -o endusers cmd/endusers/main.go && cd ..
    ./endusers-go/endusers

dev:
    npx astro dev --port 4323 --host

sync-dev:
    just sync
    just dev

test:
    npx vitest run

test-go:
    cd endusers-go && go test ./...
