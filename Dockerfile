# Multi-stage Dockerfile for AgenticCheckout MCP Gateway

# Stage 1: Build binary
FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/server ./server/cmd/

# Stage 2: Minimal runtime
FROM alpine:3.20

WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata curl

COPY --from=builder /bin/server /app/server
COPY --from=builder /app/data/catalog.seed.json /app/data/catalog.seed.json

EXPOSE 8080

ENTRYPOINT ["/app/server"]
