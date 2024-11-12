# Subnames Indexer

## Prerequisites

- Node v16.x
- Docker
- [Squid CLI](https://docs.subsquid.io/squid-cli/)

## Running 

Navigate to the project folder.

```bash
npm ci
sqd build
# start the database
sqd up
# starts a long-running ETL and blocks the terminal
sqd process

# starts the GraphQL API server at localhost:4350/graphql
sqd serve
```
