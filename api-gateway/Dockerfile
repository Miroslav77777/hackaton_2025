# syntax=docker/dockerfile:1

# --- BUILD STAGE ---
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api-gateway ./cmd/main.go

# --- FINAL IMAGE ---
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /api-gateway /api-gateway
COPY config ./config
WORKDIR /
ENTRYPOINT ["/api-gateway"]
EXPOSE 8080
