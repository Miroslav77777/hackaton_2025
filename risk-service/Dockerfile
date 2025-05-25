# syntax=docker/dockerfile:1

############################
# Stage 1: Build the binary
############################
FROM golang:1.23-alpine AS builder

# Install git (needed if you fetch modules)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Cache and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o brigade-service ./cmd

############################
# Stage 2: Create the runtime image
############################
FROM alpine:latest

# Install certs for HTTPS calls
RUN apk add --no-cache ca-certificates

# Create a non-root user (optional)
RUN adduser -D -u 1000 appuser
USER appuser

# Set working directory
WORKDIR /home/appuser

# Copy the built binary
COPY --from=builder /app/brigade-service .

# (If you have SQL migrations in a directory, copy them too)
# COPY --from=builder /app/internal/db/migrations ./migrations

# Expose the port your service listens on
EXPOSE 3001

# Declare required environment variables (for documentation)
# ENV MAIN_DSN=""
# ENV OSM_DSN=""
# ENV TSP_API_KEY=""
# ENV ROUTING_API_KEY=""

# Run the service
ENTRYPOINT ["./brigade-service"]
