# Real-Time Chat Application

A browser-based application for private, one-to-one conversations. Users can create an account, sign in, choose another registered user, and exchange messages in real time. Text messages and conversation history are stored in PostgreSQL through Prisma. The chat interface also includes file attachments that are uploaded to Cloudinary.

> **Implementation note:** Text chat, authentication, and message persistence are implemented. The attachment flow exists, but its Cloudinary configuration and real-time delivery have integration limitations described in [File attachments](#file-attachments).

## Features

- Register with a full name, email address, and password.
- Log in and receive a JWT that expires after one day.
- Browse other registered users and open a private conversation.
- Send and receive text messages using authenticated Socket.IO connections.
- Store users and messages in PostgreSQL with Prisma ORM.
- Load conversation history in chronological order.
- Select and send image or non-image file attachments through a multipart API request.
- Store attachment metadata in PostgreSQL and upload file content to Cloudinary.
- Preview a selected image before sending; display saved images inline and other attachments as downloadable links.
- See the Socket.IO connection state in the chat view and log out from the user list.

Text messages are limited to 5,000 characters. The frontend rejects files larger than 10 MB, but the backend does not currently enforce a file-size limit or a file-type allowlist.

### File attachments

The chat page accepts any file selection (there is no HTML `accept` filter). On send, the frontend submits the file under multipart field `file` and the optional message text under `text`. Multer holds the file in memory, and the Cloudinary helper uploads it to the `uploaded_files` folder with `resource_type: "auto"`. A message record stores the filename, URL, MIME type, size, and Cloudinary public ID.

Cloudinary is configured in the code, but the configuration currently passes the secret using `secret_key`; the Cloudinary SDK normally expects `api_secret`. In addition, the upload controller looks for Socket.IO using `req.app.get("io")`, but the server does not attach its Socket.IO instance to the Express app. As a result, confirm/fix the Cloudinary configuration before relying on uploads, and note that uploaded messages are not currently broadcast to the recipient over Socket.IO. The sending browser adds the upload response to its own conversation.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, Axios, Lucide React |
| Backend | Node.js, Express 5, Socket.IO 4, `jsonwebtoken`, bcrypt, Multer, Cloudinary SDK |
| Database | PostgreSQL |
| ORM | Prisma 6 and Prisma Client |
| Development tools | npm, Nodemon, ESLint, Concurrently |

`backend/package.json` also includes Mongoose and `backend/src/model/` contains Mongoose models from an earlier implementation. The active database and controllers use Prisma/PostgreSQL; MongoDB is not required.

## Project structure

```text
real-time-chat-application/
├── README.md
├── package.json
├── backend/
│   ├── package.json
│   ├── prisma.config.ts
│   ├── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20261023095501_init/
│   │       │   └── migration.sql
│   │       ├── 20261026122220_file_upload/
│   │       │   └── migration.sql
│   │       └── 20261028050602_cloudinary_file_publicid/
│   │           └── migration.sql
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── cloudinary.js
│       │   └── db.js
│       ├── controller/
│       │   ├── authController.js
│       │   ├── chatController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── uploadMiddleware.js
│       ├── model/
│       │   ├── Message.js
│       │   └── User.js
│       ├── route/
│       │   ├── authRoute.js
│       │   ├── chatRoutes.js
│       │   └── userRoutes.js
│       ├── socket/
│       │   └── chatSocket.js
│       └── utils/
│           └── uploadCloudinaryFile.js
└── frontend/
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        └── pages/
            ├── Chat.jsx
            ├── Home.jsx
            ├── Login.jsx
            └── Register.jsx
```

### Important files

- `backend/server.js` creates the HTTP and Socket.IO servers, connects to PostgreSQL, and listens on `PORT` (default `5000`).
- `backend/src/app.js` configures Express middleware and mounts the `/api/auth`, `/api/users`, and `/api/chat` routes.
- `backend/src/controller/` contains registration/login, user-list, conversation-history, and upload handlers.
- `backend/src/middleware/authMiddleware.js` verifies bearer JWTs for protected HTTP routes.
- `backend/src/middleware/uploadMiddleware.js` configures Multer in-memory storage.
- `backend/src/socket/chatSocket.js` authenticates Socket.IO connections, assigns each user a private room, and saves/broadcasts text messages.
- `backend/src/config/db.js` creates Prisma Client and connects to PostgreSQL.
- `backend/src/config/cloudinary.js` and `backend/src/utils/uploadCloudinaryFile.js` configure Cloudinary and stream uploaded files.
- `backend/prisma/schema.prisma` defines the PostgreSQL data model; `backend/prisma/migrations/` contains the checked-in schema migrations.
- `backend/src/model/` contains legacy Mongoose models; the current chat flow does not use them.
- `frontend/src/App.jsx` defines the `/`, `/login`, `/register`, and `/chat/:userId` routes.
- `frontend/src/pages/` contains the registration, login, user selection, and chat screens.
- `frontend/vite.config.js` enables the React and Tailwind CSS Vite plugins.

## Database design

The Prisma schema is in `backend/prisma/schema.prisma`.

### `User`

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | Integer | Auto-incrementing primary key |
| `Fullname` | String | User's full name |
| `Email` | String | Unique email address |
| `Password` | String | bcrypt password hash |

### `Message`

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | Integer | Auto-incrementing primary key |
| `senderId` | Integer | Sender's `User.id` |
| `receiverId` | Integer | Recipient's `User.id` |
| `text` | String, max 5,000 characters | Message text; required, including for attachment messages |
| `fileName` | Optional string | Original attachment filename |
| `fileUrl` | Optional string | Cloudinary URL |
| `fileType` | Optional string | Attachment MIME type |
| `fileSize` | Optional integer | Attachment size in bytes |
| `publicId` | Optional string | Cloudinary public ID |
| `createdAt` | Date/time | Set when a message is created |
| `updatedAt` | Date/time | Maintained by Prisma on updates |

Each message relates to one sender and one receiver. The foreign keys cascade when a user is deleted. The schema defines a unique index on `User.Email` and a composite index on `Message(senderId, receiverId, createdAt)`.

## Prerequisites

- Node.js and npm. Use a Node.js release supported by Vite 8 and Prisma 6.
- PostgreSQL running locally or reachable from your machine, with permission to create/update tables.
- A Cloudinary account and API credentials if you want to test the attachment flow.
- Two terminals to run the backend and frontend separately.

## Installation and setup

### 1. Clone the repository

```bash
git clone https://github.com/chandrikavishwakarma/real-time-chat-application.git
cd real-time-chat-application
```

### 2. Install dependencies

From the project root, install each app's dependencies in its own directory:

```bash
cd backend
npm install
```

In another terminal, from the project root:

```bash
cd frontend
npm install
```

The root `package.json` also declares `concurrently` and provides an optional combined development command; if using it, install root dependencies as well:

```bash
cd real-time-chat-application
npm install
```

### 3. Create a PostgreSQL database

Create a database (for example, `real_time_chat`) and configure a database user/password that the backend can use. The migrations create the `"User"` and `"Message"` tables.

### 4. Configure environment variables

Create `backend/.env` and add the backend settings from [Environment variables](#environment-variables). Create `frontend/.env` if you need to change the frontend API URL. Use your own local credentials; do not commit real passwords, JWT secrets, or Cloudinary keys.

### 5. Apply migrations and generate Prisma Client

Run from the `backend` directory:

```bash
npx prisma migrate dev
npx prisma generate
```

`migrate dev` applies the checked-in migrations to your development database. For deployment environments where migrations have already been created and committed, use `npx prisma migrate deploy` instead of `migrate dev`.

## Environment variables

### Backend: `backend/.env`

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/real_time_chat?schema=public"
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000

# Required only when using Cloudinary uploads:
CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signs and verifies one-day login tokens |
| `PORT` | No | Backend port; defaults to `5000` |
| `CLOUD_NAME` | For uploads | Cloudinary cloud name, as read by the current code |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_SECRET` | For uploads | Secret variable name read by the current config; see the [attachment note](#file-attachments) about the SDK setting |

The current Cloudinary config uses the exact variable names above and passes `CLOUDINARY_SECRET` under the config key `secret_key`. Check the Cloudinary SDK configuration before relying on file uploads; the SDK generally expects the key `api_secret`.

### Frontend: `frontend/.env`

```dotenv
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is used by the home and chat pages for HTTP requests and the Socket.IO connection; those pages fall back to `http://localhost:5000`. The login and registration pages currently use `http://localhost:5000` directly, so changing `VITE_API_URL` alone does not change those two API URLs. The Socket.IO CORS origin is also hardcoded to `http://localhost:5173` in `backend/server.js`.

Keep `.env` files local and never place actual credentials in the README or source control.

## Run the application

### Run the backend

From `backend`:

```bash
npm run dev
```

The backend connects to PostgreSQL before it starts listening. The default API and Socket.IO address is `http://localhost:5000`; set `PORT` to use another backend port.

### Run the frontend

In a separate terminal, from `frontend`:

```bash
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Socket.IO is configured to allow this frontend origin.

### Optional: run both from the root

After running `npm install` in the project root as well as installing each app's dependencies, the root package script can start both processes:

```bash
npm run dev
```

### Build and lint the frontend

From `frontend`:

```bash
npm run build
npm run lint
```

## Application workflow

1. Register with a `Fullname`, `Email`, and `Password`. The backend hashes the password using bcrypt with 10 salt rounds and stores the user through Prisma.
2. Log in using `Email` and `Password`. If the password matches, the backend returns a JWT that contains the user's numeric ID and expires after one day.
3. The frontend stores the JWT in browser `localStorage`. Protected REST requests send it in an `Authorization: Bearer <JWT>` header.
4. The home/chat screen requests `/api/chat/users`; the response includes the logged-in user (`me`) and all other registered users. Select a user to open `/chat/:userId`.
5. The chat screen loads the conversation history from PostgreSQL through `GET /api/chat/:userId/messages`.
6. For text messages, the browser connects to Socket.IO with the token in `auth: { token }`. The server verifies the token, confirms that the user exists, and joins the socket to a server-managed `user:<id>` room.
7. The client emits `send_message` with `receiverId` and `text`. The server checks the recipient and text, saves the message using Prisma, sends `new_message` to both users' rooms, and acknowledges the sender.
8. The chat page appends messages for the open conversation and avoids duplicates when the acknowledgement and broadcast both arrive. Reloading a conversation retrieves persisted history from PostgreSQL.
9. For attachments, the browser posts a multipart request to `/api/chat/:userId/upload`. Multer keeps the file in memory; the helper streams it to Cloudinary. The backend stores the resulting URL and file metadata alongside the message record in PostgreSQL.

PostgreSQL is the persistent store for user accounts, text, and attachment metadata. Prisma provides the data model, migrations, and database queries. Cloudinary is intended to store attachment content; the database stores a URL and metadata rather than the file bytes. See [File attachments](#file-attachments) for current integration limitations.

## API documentation

All endpoints are relative to `http://localhost:5000`. JSON endpoints expect `Content-Type: application/json`. The `/api/users` endpoint is currently public; chat routes listed below require a bearer JWT.

| Method | Endpoint | Authentication | Request | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | JSON: `Fullname`, `Email`, `Password` | Register a user; returns `201` and a message |
| `POST` | `/api/auth/login` | No | JSON: `Email`, `Password` | Verify credentials; returns a JWT and basic user details |
| `GET` | `/api/users` | No | None | Return a `users` array with IDs, names, and emails |
| `GET` | `/api/chat/users` | Yes | None | Return `me` and the other registered users |
| `GET` | `/api/chat/:userId/messages` | Yes | `userId` path parameter | Return messages between the logged-in user and the selected user, oldest first |
| `POST` | `/api/chat/:userId/upload` | Yes | Multipart: `file` and optional `text` | Upload an attachment and save it as a message |

Protected HTTP routes require:

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

Success response (`201`):

```json
{
  "message": "User registered!"
}
```

Registration does not issue a token; log in after registering.

### Login

`POST /api/auth/login`

```json
{
  "Email": "alex@example.com",
  "Password": "choose-a-password"
}
```

Success response (`200`):

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

### User list

`GET /api/users` returns `200` with a `users` array. Each entry contains `_id`, `Fullname`, and `Email`. This route is not used by the current frontend workflow.

`GET /api/chat/users` requires authentication and returns:

```json
{
  "me": {
    "_id": 1,
    "Fullname": "Alex Example",
    "Email": "alex@example.com"
  },
  "users": [
    {
      "_id": 2,
      "Fullname": "Sam Example",
      "Email": "sam@example.com"
    }
  ]
}
```

### Conversation history

`GET /api/chat/:userId/messages` returns a JSON array, ordered by `createdAt` ascending. The selected fields are `id`, `senderId`, `receiverId`, `text`, `fileName`, `fileType`, `fileUrl`, `fileSize`, and `createdAt`.

```json
[
  {
    "id": 123,
    "senderId": 1,
    "receiverId": 2,
    "text": "Hello!",
    "fileName": null,
    "fileType": null,
    "fileUrl": null,
    "fileSize": null,
    "createdAt": "2026-10-23T10:00:00.000Z"
  }
]
```

The endpoint rejects invalid IDs and self-chat requests with `400`, and returns `404` if the other user does not exist. A missing, invalid, or expired token on a protected route returns `401`.

### Upload an attachment

`POST /api/chat/:userId/upload` accepts `multipart/form-data`. `userId` is the recipient's numeric user ID. Include `file`; `text` is optional in the request and is saved as an empty string when omitted.

```powershell
curl.exe -X POST "http://localhost:5000/api/chat/2/upload" `
  -H "Authorization: Bearer YOUR_JWT" `
  -F "file=@C:\path\to\file" `
  -F "text=Please see this file"
```

On success, the handler returns `201`:

```json
{
  "message": "file uploaded!",
  "file": {
    "id": 124,
    "senderId": 1,
    "receiverId": 2,
    "text": "Please see this file",
    "fileName": "example.pdf",
    "fileUrl": "<Cloudinary secure URL>",
    "fileType": "application/pdf",
    "fileSize": 12345,
    "publicId": "<Cloudinary public ID>",
    "createdAt": "2026-10-23T10:01:00.000Z"
  }
}
```

Field values above are illustrative. This route depends on valid Cloudinary credentials/configuration. Although the handler attempts to emit `new_message`, the current server does not put its Socket.IO instance on `req.app`, so the recipient does not receive this upload through the socket.

## Socket.IO events

Socket.IO runs on the backend's HTTP server and normally connects at `http://localhost:5000`. The frontend sends the JWT in the handshake as `auth: { token }`. The server validates the token and checks that the account still exists before accepting the connection.

| Event | Direction | Payload / behavior |
| --- | --- | --- |
| `send_message` | Client to server | `{ receiverId, text }`, with an acknowledgement callback. Text is trimmed and must contain 1–5,000 characters; users cannot message themselves. |
| `new_message` | Server to clients | Broadcast to the sender's and receiver's private rooms after the message is saved. Payload fields are `_id`, `sender`, `receiver`, `text`, and `createdAt`. |
| `connect` | Server to client | Indicates that the socket connected; the chat page shows its connection status. |
| `connect_error` | Server to client | Indicates a connection/authentication failure. |
| `disconnect` | Server/client lifecycle | Updates the chat connection status; the backend logs the user ID. |

Successful `send_message` acknowledgement:

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

Failures are acknowledged as `{ "success": false, "message": "<reason>" }`.

## Troubleshooting

- **Database connection fails:** Confirm PostgreSQL is running, the database exists, and `DATABASE_URL` has the right username, password, host, port, and database name. The usual local PostgreSQL port is `5432`.
- **Prisma reports a missing database or unapplied migration:** Run `npx prisma migrate dev` from `backend`, then `npx prisma generate`. Check that `backend/.env` is in the same project and contains `DATABASE_URL`.
- **`JWT_SECRET` errors or protected routes return `401`:** Set a non-empty `JWT_SECRET` in `backend/.env`, restart the backend after editing it, then sign in again to get a fresh token. The frontend stores the token in `localStorage`; logging out removes it.
- **The frontend cannot reach the API:** Ensure the backend is listening at `http://localhost:5000`. The home/chat pages read `VITE_API_URL`, while login/register use the localhost URL directly. Restart Vite after changing its environment file.
- **Socket.IO does not connect:** Check backend availability and the browser console. The configured Socket.IO CORS origin is `http://localhost:5173`; changing the frontend port or hostname requires updating the backend origin configuration too. A missing/expired JWT also prevents the connection.
- **Cloudinary upload fails:** Confirm all three Cloudinary environment values are present and check the SDK config key: current code supplies `secret_key` while the SDK generally expects `api_secret`. Restart the backend after environment changes. No local disk upload fallback exists; Multer holds files in memory.
- **An uploaded attachment does not appear for the recipient immediately:** The upload handler's socket lookup expects `req.app.get("io")`, but the server does not currently register `io` on the Express app. Reloading message history may show the saved attachment if the Cloudinary upload and database write succeeded.
- **A file is rejected by the browser:** The chat page has a 10 MB client-side size check. There is no configured list of allowed file types. The backend currently has no matching size/type filter, so do not treat the browser check as server-side upload protection.

## Future improvements

The following are suggestions, not claims about current functionality:

- Correct and verify Cloudinary SDK credential configuration; add server-side file size and MIME-type validation.
- Attach Socket.IO to the Express app (or use a shared service) so uploaded-message events can be delivered to both participants.
- Add automated backend/API and end-to-end tests, including database and upload scenarios.
- Add stronger validation and clearer user-facing error messages for registration and login.
- Add pagination for large conversation histories and indexes optimized for queries in both sender/receiver directions.
- Add typing indicators, read receipts, online presence, and message editing/deletion.
- Add deployment documentation and production configuration for API URLs, CORS, secrets, and database migrations.
