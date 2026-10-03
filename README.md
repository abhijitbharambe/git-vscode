# Daymark

A quiet little journal and to-do list, built with React, TypeScript, Vite, Spring Boot, and H2. Journal entries and tasks are stored in a local file-based H2 database under `backend/data`. Existing browser records are imported into H2 once when the app first connects.

Previous journal entries remain in the journal history, and completed tasks are available from the `completed` filter on the to-do list.

## Run locally

Requires Java 17+. The Maven Wrapper downloads the pinned Maven version on first use.

Start the H2-backed API in one terminal:

```sh
cd backend
./mvnw spring-boot:run
```

Then start the web app in another terminal:

```sh
npm install
npm run dev
```

The H2 console is available at `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:file:./data/daymark`.

## Build

```sh
npm run build
```
