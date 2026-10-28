# Real-Time Chat Application

A browser-based, one-to-one chat application for registering users, finding other accounts, loading saved conversations, and exchanging messages in real time. The frontend is built with React and Vite; the backend is an Express API and Socket.IO server. **The active database layer is PostgreSQL accessed through Prisma ORM, replacing the former MongoDB/Mongoose implementation.**

## Features

- Register with a full name, email, and password; passwords are hashed with bcrypt before they are stored.
- Log in with email and password to receive a JWT that expires after one day.
- Browse registered users, view the current account, and log out.
- Load the message history for a one-to-one conversation in chronological order.
- Send and receive messages in real time through authenticated Socket.IO connections.
- Persist messages in PostgreSQL and identify each message's sender and receiver.
- Validate message recipients and trimmed message text; messages must be 1–5,000 characters and cannot be sent to oneself.
- Show the Socket.IO connection state in the chat view.
- An authenticated file-upload route and Cloudinary streaming helper are present in the backend, but the current upload flow has integration issues and is not yet a verified working feature.

Group conversations, read receipts, typing indicators, live presence tracking, message deletion/editing, and frontend attachment selection/rendering are **not implemented**. Redis is not integrated.

## Current Development Progress

### Backend and Database

- The backend is developed with Node.js and Express.js.
- PostgreSQL is configured as the database, with Prisma ORM used for database operations.
- Registration and login APIs hash passwords with bcrypt and use JWT-based authentication.
- Authenticated chat APIs return registered users and retrieve messages for a conversation.
- Socket.IO supports real-time text messaging between connected users.
- Backend database connectivity and server startup are configured; the server connects to PostgreSQL before it begins listening.

### File Upload Status

The backend contains `POST /api/chat/:userId/upload`, protected by JWT middleware and `upload.single("file")`. Multer uses **memory storage**, so the incoming file is held in memory rather than saved to a local `uploads` directory. The Cloudinary helper calls `cloudinary.uploader.upload_stream()` with the `uploaded_files` folder and `resource_type: "auto"`.

This path is present but is **not yet reliably functional**: the controller maps Multer fields such as `originalname`, `mimetype`, and `size` from the Cloudinary response instead of the original Multer file, constructs `fileUrl` by prefixing `/uploads/` to Cloudinary's secure URL, and expects `publicId` rather than Cloudinary's `public_id`. The schema also requires `Message.text`, while the handler sends `null` when the multipart `text` field is omitted. In addition, the server does not attach its Socket.IO instance to the Express app, although the handler looks it up there before emitting `new_message`.

The route currently accepts `file` and reads optional `text` from multipart form data; due to the required database `text` field, include non-empty text to satisfy the current schema. No Multer file-size or file-type filter is configured, and the code does not establish a guaranteed list of supported file types. Attachment messages are not returned with their metadata by the message-history query, and the React chat page does not provide upload controls or render attachments.

### Current Status

Text chat, authentication, and PostgreSQL/Prisma persistence are implemented. The upload route and Cloudinary helper are present but need the integration issues above addressed and tested before file upload can be considered complete. The frontend does not yet provide file-upload or attachment-display functionality.

### Next Steps

- Correct the Cloudinary response-to-Prisma metadata mapping, URL/public ID handling, and required message text behavior.
- Configure and verify Cloudinary credentials and make the Socket.IO instance available to the upload controller if file-message broadcasts are intended.
- Include file metadata in conversation history and build frontend file-upload and attachment-display functionality.
- Test file storage, database persistence, and real-time file-message delivery end to end.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, Axios, Socket.IO Client |
| Backend | Node.js, Express 5, Socket.IO 4, JSON Web Tokens (`jsonwebtoken`), bcrypt, dotenv |
| Database | PostgreSQL |
| ORM | Prisma 6 (`prisma` and `@prisma/client`) |
| Development tools | npm, Nodemon, ESLint |

The backend package still lists `mongoose`, and `backend/src/model/` contains Mongoose model files from the previous implementation. They are legacy leftovers: the current controllers, database connection, and socket handler use Prisma and PostgreSQL. No MongoDB setup is needed to run the current application.

## Project Structure

```text
.
├── README.md
├── backend/
│   ├── package.json                 # Backend dependencies and dev script
│   ├── package-lock.json
│   ├── prisma.config.ts             # Prisma schema, migration, and datasource configuration
│   ├── server.js                    # Express HTTP server, Socket.IO, and startup
│   ├── prisma/
│   │   ├── schema.prisma            # PostgreSQL User and Message models
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20261023095501_init/
│   │       │   └── migration.sql    # Initial PostgreSQL schema migration
│   │       ├── 20261026122220_file_upload/
│   │       │   └── migration.sql    # File metadata columns for messages
│   │       └── 20261028050602_cloudinary_file_publicid/
│   │           └── migration.sql    # Cloudinary publicId column
│   ├── src/
│       ├── app.js                   # Express middleware and API route mounting
│       ├── config/
│       │   ├── cloudinary.js        # Cloudinary SDK configuration
│       │   └── db.js                # Prisma Client and PostgreSQL connection
│       ├── controller/
│       │   ├── authController.js    # Registration and login
│       │   ├── chatController.js    # Conversation users, history, and upload handler
│       │   └── userController.js    # Public user-list endpoint
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT authentication for protected HTTP routes
│       │   └── uploadMiddleware.js  # Multer memory storage
│       ├── model/
│       │   ├── Message.js          # Legacy Mongoose model; not used by current chat flow
│       │   └── User.js             # Legacy Mongoose model; not used by current chat flow
│       ├── route/
│       │   ├── authRoute.js
│       │   ├── chatRoutes.js       # Chat APIs, including file uploads
│       │   └── userRoutes.js
│       ├── socket/
│       │   └── chatSocket.js       # Socket authentication, user rooms, and message handling
│       └── utils/
│           └── uploadCloudinaryFile.js # Cloudinary upload_stream helper
└── frontend/
    ├── package.json                 # Frontend dependencies and Vite scripts
    ├── package-lock.json
    ├── README.md                    # Vite template documentation
    ├── eslint.config.js
    ├── vite.config.js               # React and Tailwind Vite plugins
    ├── index.html
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── App.jsx                  # Routes: /, /login, /register, /chat/:userId
        ├── main.jsx                 # React entry point
        ├── index.css
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        └── pages/
            ├── Home.jsx             # Current user, user list, and logout
            ├── Login.jsx
            ├── Register.jsx
            └── Chat.jsx             # Conversation history and Socket.IO messaging
```

## Database Design

The Prisma schema is in `backend/prisma/schema.prisma`. It uses the PostgreSQL provider and the connection string in `DATABASE_URL`.

### `User`

| Field | Type | Constraints / purpose |
| --- | --- | --- |
| `id` | `Int` | Primary key; auto-incrementing |
| `Fullname` | `String` | User's full name |
| `Email` | `String` | Unique email address |
| `Password` | `String` | bcrypt password hash; never intended to contain plaintext |

### `Message`

| Field | Type | Constraints / purpose |
| --- | --- | --- |
| `id` | `Int` | Primary key; auto-incrementing |
| `senderId` | `Int` | Foreign key to `User.id` for the sender |
| `receiverId` | `Int` | Foreign key to `User.id` for the recipient |
| `text` | `String` | Required message text, limited to 5,000 characters |
| `fileName` | `String?` | Original filename for an attachment, when present |
| `fileUrl` | `String?` | Intended file URL; nullable |
| `fileType` | `String?` | Attachment MIME type, when present |
| `fileSize` | `Int?` | Attachment size in bytes, when present |
| `publicId` | `String?` | Cloudinary public ID, when present |
| `createdAt` | `DateTime` | Defaults to the time the message is created |
| `updatedAt` | `DateTime` | Maintained by Prisma on updates |

Each message has two separate relations to `User`: `sender` (`SentMessages`) and `receiver` (`ReceivedMessages`). Both foreign keys reference `User.id` and cascade on user deletion. A user can therefore have sent and received messages. The database tables are named `"User"` and `"Message"` (case-sensitive when quoted in PostgreSQL).

The schema defines a unique index on `User.Email` and a composite index on `Message(senderId, receiverId, createdAt)`. The migrations create the tables and indexes, add the optional file metadata columns, and then add `publicId`. The schema requires `text` for every message, including file messages.

## Application Workflow

1. A visitor registers with `Fullname`, `Email`, and `Password`, or submits `Email` and `Password` to log in.
2. Registration hashes the password with bcrypt using 10 salt rounds. Login compares the supplied password to the stored hash and signs a one-day JWT containing the user's `id`.
3. The login page saves the JWT in browser `localStorage`. The chat and user-list API requests send it as a Bearer token; the chat page also passes it to Socket.IO as `auth: { token }`.
4. The authenticated chat page requests the current user and other users, then fetches messages for the selected conversation through the HTTP API.
5. The frontend emits the Socket.IO `send_message` event with `{ receiverId, text }` and an acknowledgement callback.
6. The server derives the sender from the authenticated socket, validates the recipient ID and trimmed text, rejects self-messaging, and confirms that the recipient exists.
7. The server creates the message using Prisma, persisting it in PostgreSQL.
8. After a successful save, the server emits `new_message` to the sender's and recipient's server-managed user rooms, then acknowledges the sender with the saved message. Validation or persistence failures return a failure acknowledgement.
9. The frontend appends messages belonging to the active conversation and avoids duplicate message IDs when both the acknowledgement and broadcast arrive. On a later visit or reload, it retrieves the saved history over HTTP.

REST authorization verifies the Bearer JWT but does not look up the user on every request. Socket authorization verifies the token and confirms that its user still exists before accepting the connection.

## HTTP API

The Express application mounts routes under `/api/auth`, `/api/users`, and `/api/chat`.

The upload route is present but has the incomplete behavior described in [File Upload Status](#file-upload-status). It uses multipart form data and attempts to save a message; do not rely on the current upload response, message-history attachment data, or file broadcast until those gaps are fixed.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | None | Create an account. |
| `POST` | `/api/auth/login` | None | Verify credentials and return a JWT and basic user details. |
| `GET` | `/api/users` | None | Return a `users` array containing user IDs, full names, and email addresses. This route is not used by the current frontend flow. |
| `POST` | `/api/chat/:userId/upload` | Bearer token | Accept multipart `file` and optional message `text`; upload handling is incomplete (see above). |
| `GET` | `/api/chat/users` | Bearer JWT | Return `me` and the other registered users. |
| `GET` | `/api/chat/:userId/messages` | Bearer JWT | Return messages exchanged with the selected user, oldest first. |

For protected endpoints, send:

```http
Authorization: Bearer <JWT>
```

### Register

`POST /api/auth/register`

```json
{
  "Fullname": "Alex Example",
  "Email": "alex@example.com",
  "Password": "choose-a-password"
}
```

On success, the API responds with HTTP `201` and a message. Registration does not return a JWT; log in separately.

```json
{
  "message": "User registered!"
}
```

### Login

`POST /api/auth/login`

```json
{
  "Email": "alex@example.com",
  "Password": "choose-a-password"
}
```

On success, the response includes a one-day `token` and a `user` object with `_id`, `Fullname`, and `Email`.

```json
{
  "message": "Login successful!",
  "token": "<JWT>",
  "user": {
    "_id": 1,
    "Fullname": "Alex Example",
    "Email": "alex@example.com"
  }
}
```

### Chat user list

`GET /api/chat/users` returns:

```json
{
  "me": {
    "_id": 1,
    "Fullname": "Alex Example",
    "Email": "alex@example.com"
  },
  "users": []
}
```

The example IDs and account details are illustrative only.

### Conversation history

`GET /api/chat/:userId/messages` queries the PostgreSQL database through Prisma and returns an array of persisted message records with `id`, `senderId`, `receiverId`, `text`, and `createdAt`. It does not currently select file metadata or `updatedAt`. The endpoint rejects invalid IDs and self-chat requests, and returns `404` when the other user is not found.

```json
[
  {
    "id": 123,
    "senderId": 1,
    "receiverId": 2,
    "text": "Hello!",
    "createdAt": "2026-10-23T10:00:00.000Z"
  }
]
```

Handled API errors are JSON responses with a `message` field. Missing, invalid, and expired JWTs on protected routes return HTTP `401`.

Protected HTTP routes require `Authorization: Bearer <JWT>`. The token is returned by login and expires after one day.

### Upload a file

`POST /api/chat/:userId/upload` requires a Bearer token and `multipart/form-data`. `userId` is the recipient's numeric user ID. Include `file` as the uploaded file and, because `Message.text` is required by the schema, include a non-empty `text` field as well.

```bash
curl -X POST "http://localhost:5000/api/chat/2/upload" \
  -H "Authorization: Bearer <JWT>" \
  -F "file=@./path/to/file" \
  -F "text=Please see this file"
```

The handler's intended success response is HTTP `201` with `{ "message": "file uploaded!", "file": { ... } }`. The stored record select includes `id`, `senderId`, `receiverId`, `text`, `fileName`, `fileUrl`, `fileType`, `fileSize`, `publicId`, and `createdAt`. Because the Cloudinary response fields are currently mapped incorrectly, the URL and metadata should not be assumed valid until the implementation is corrected.

## Socket.IO

Socket.IO connects to the backend origin, normally `http://localhost:5000`. The frontend provides the JWT in the handshake:

```js
io(API_URL, { auth: { token } });
```

The server verifies the JWT and confirms the user exists. It then joins the socket to the server-managed room `user:<user-id>`. Clients do not send a room-join event or choose room names. The Socket.IO server is configured to allow the frontend origin `http://localhost:5173`.

| Event | Direction | Payload / behavior |
| --- | --- | --- |
| `send_message` | Client → server | `{ receiverId, text }`, followed by an acknowledgement callback. `receiverId` must identify another existing user. The trimmed text must contain 1–5,000 characters. |
| `new_message` | Server → clients | Emitted after the message is saved to both participants' rooms. Payload: `{ _id, sender, receiver, text, createdAt }`; the IDs in this socket payload are strings. |
| `connect` | Server → client | Socket.IO connection established; the chat page shows the connected state. |
| `connect_error` | Server → client | Connection/authentication error; the chat page shows a connection failure. |
| `disconnect` | Server → client / server handler | Reports disconnection; the chat page updates its connection state and the server logs the authenticated user ID. |

The `send_message` acknowledgement is:

```json
{
  "success": true,
  "message": {
    "_id": "123",
    "sender": "1",
    "receiver": "2",
    "text": "Hello!",
    "createdAt": "2026-10-23T10:00:00.000Z"
  }
}
```

On failure, the acknowledgement has `{ "success": false, "message": "<reason>" }`. The handler reports invalid recipients, missing recipients, blank/oversized messages, and send failures this way. If a callback is omitted, the server uses a no-op callback; the message event can still be processed.

The upload controller also attempts to emit `new_message`, but its payload uses Prisma field names (`id`, `senderId`, and `receiverId`) rather than the text-message socket payload (`_id`, `sender`, and `receiver`). The current server does not set the Socket.IO instance on `req.app`, so the upload handler cannot obtain it through its current `req.app.get("io")` lookup. File broadcasts therefore should be treated as incomplete.

## Prerequisites

- Node.js and npm. The package files do not pin Node.js or npm versions; use a supported Node.js release compatible with the installed Vite 8 and Prisma 6 dependencies.
- PostgreSQL and a database/user that the backend can access. The project does not pin a PostgreSQL major version.
- Two terminals for running the backend and frontend.

The backend package uses Prisma `6.19.3`; the frontend package uses Vite `8.3.4`. Check the dependency manifests for the current package versions.

## Installation and Setup

### 1. Get the repository

If you have not already cloned the project, use its repository URL:

```bash
git clone <repository-url>
cd <repository-directory>
```

The repository URL is not configured in the project files; replace the placeholders with the URL and directory name for your copy.

### 2. Install dependencies

From the repository root, install each package separately:

```bash
cd backend
npm install
```

In a second terminal, from the repository root:

```bash
cd frontend
npm install
```

### 3. Create a PostgreSQL database

Create a PostgreSQL database, for example `real_time_chat`, and ensure the database user has permission to connect and create/update tables. The initial Prisma migration creates the `"User"` and `"Message"` tables.

### 4. Configure environment variables

Create or update `backend/.env` with the backend values and `frontend/.env` with the frontend value shown in [Environment Variables](#environment-variables). Do not replace existing `.env` files blindly, and do not commit real credentials or secrets.

### 5. Apply migrations and generate Prisma Client

Run these commands from the `backend` directory:

```bash
npx prisma migrate dev
npx prisma generate
```

`migrate dev` applies the checked-in migration to the configured local database; `generate` builds the Prisma Client used by the backend. For an environment where you only want to apply already-created migrations, use `npx prisma migrate deploy` instead of `migrate dev`.

### 6. Start the backend

From `backend`:

```bash
npm run dev
```

This runs `nodemon server.js`. The backend connects to PostgreSQL before listening. The only backend npm script defined in the package is `dev`.

### 7. Start the frontend

In a separate terminal, from `frontend`:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Environment Variables

These are the environment variable names referenced by the current application and Prisma configuration.

### `backend/.env`

```dotenv
DATABASE_URL="postgresql://postgres:CHANGE_ME@localhost:5432/real_time_chat?schema=public"
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

`DATABASE_URL` is required by Prisma. Replace the example user, password, host, and database with values for your PostgreSQL setup. `JWT_SECRET` is required for signing and verifying tokens. `PORT` is optional; the backend defaults to `5000`.

The Cloudinary configuration currently reads these names:

```dotenv
CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret
```

These are the names in the current source; it does not read `CLOUDINARY_CLOUD_NAME` or `CLOUDINARY_API_SECRET`. The config also passes the secret using `secret_key`, so verify/correct the Cloudinary SDK configuration before relying on uploads. Cloudinary values are only needed for the unfinished upload path.

### `frontend/.env`

```dotenv
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is used by the home and chat pages for HTTP requests and Socket.IO, with `http://localhost:5000` as a fallback. The login and registration pages currently use `http://localhost:5000` directly, so changing this variable alone does not change their API URL. Socket.IO's allowed origin is also hardcoded to `http://localhost:5173` in `backend/server.js`.

These are safe example values only. Keep actual database passwords and JWT secrets private; do not copy secrets into the README or commit local `.env` files.

Create `.env` files locally and make sure they are excluded from Git commits. Never add real database credentials, JWT secrets, or Cloudinary keys to this README or to source control.

## Running and Trying the Application

With PostgreSQL running and migrations applied:

1. Start the backend in `backend` with `npm run dev`; it listens on `PORT`, or port `5000` by default.
2. Start the frontend in `frontend` with `npm run dev`; Vite normally serves it at `http://localhost:5173`.
3. Open the frontend, register two accounts with different email addresses, and log in as one of them.
4. Select the other account on the home page and send a message.
5. To verify live delivery, open a second browser session, log in as the recipient, and open the sender's conversation. Reloading the conversation should load the persisted message history.

The application requires distinct accounts for a conversation because self-messaging is rejected.

## Database Inspection

- **pgAdmin:** Connect to the PostgreSQL server and the database named in `DATABASE_URL` (the example above uses `real_time_chat`). Under **Schemas → public → Tables**, inspect `"User"` and `"Message"`. PostgreSQL quotes are needed to preserve the capitalized table names.
- **Prisma Studio:** From `backend`, run:

  ```bash
  npx prisma studio
  ```

  Prisma Studio opens a browser interface for the configured database and displays the `User` and `Message` models.

User passwords in the database are bcrypt hashes, not plaintext. Do not share or publish database exports.

## Troubleshooting

| Issue | Checks |
| --- | --- |
| PostgreSQL connection fails | Confirm PostgreSQL is running and reachable, `DATABASE_URL` is in `backend/.env`, the host/port/database are correct, and the configured user has access. Restart the backend after changing its environment. |
| Incorrect database credentials | Check URL encoding for special characters in the username/password and verify the database name and permissions in PostgreSQL. Keep credentials out of logs and source control. |
| Prisma migration or client-generation errors | Run commands from `backend`; verify `DATABASE_URL`; run `npx prisma generate` after installing dependencies or changing the schema. Use `npx prisma migrate dev` for local development or `npx prisma migrate deploy` to apply existing migrations. |
| JWT authentication fails | Confirm `JWT_SECRET` is set in `backend/.env`, restart the backend, then log in again to obtain a current token. The frontend stores the token in `localStorage`; protected requests use it as a Bearer token and expired/invalid tokens return `401`. |
| HTTP CORS/API errors | Ensure the backend is running on the origin configured by the frontend (`VITE_API_URL`, default `http://localhost:5000`). Login and registration currently use that default URL directly. |
| Socket.IO does not connect | Ensure the backend is running and the client has a valid login token. For local development, use the configured frontend origin `http://localhost:5173`; Socket.IO CORS is fixed to that origin in `backend/server.js`. Check the chat connection status and browser console for `connect_error`. |
| Messages do not appear in history | Confirm the send acknowledgement has `success: true`, that PostgreSQL is reachable, and that both conversation users are valid. The server persists before emitting `new_message`; reload the chat to check the history endpoint. |
| Users or messages do not load | Check that the backend is listening on the configured port and inspect the HTTP response's `message`. The chat endpoints require a valid JWT; log in again if the frontend returns to `/login`. |

## Development Checks

The frontend package defines lint and production-build scripts. Run them from `frontend`:

```bash
npm run lint
npm run build
```

The backend package does not define a test or lint script.

## Future Improvements

The following are potential future enhancements or remaining work:

- Group conversations, typing indicators, read receipts, and reliable online/presence tracking.
- React frontend file-upload controls and attachment display in conversations; thoroughly test upload delivery and database persistence.
- Message editing or deletion.
- Backend automated tests for authentication, REST endpoints, socket validation, and persistence.
- Use `VITE_API_URL` consistently in the login and registration pages and configure the Socket.IO origin for different environments.
