# Secure Note-Taking Application

Technical Interview Task: Secure Note-Taking Application

Brief
-----
Build a simple REST API with a functional frontend focused on functionality and integration. Emphasize secure authentication, role-based access control, efficient indexing, pagination, and required MongoDB aggregation tasks.

Application Overview
--------------------
- Users can create, read, update, and delete their own notes.
- Admins can manage users (create, update, delete, list) and view all users' notes.
- Posts (public) live in a separate `Posts` collection and are visible to everyone.

Core Requirements
-----------------
- Database: MongoDB with Mongoose.
- Authentication: JWT-based access tokens.
- Passwords: Securely hashed (bcrypt or argon2).
- Indexing: Use `schema.index(...)` in model definitions for all indexes used to support queries.
- Pagination: Implement for all list endpoints.

Non-functional Constraints
-------------------------
- Keep frontend visuals minimal — focus on integration and correctness.
- DO NOT create unnecessary indexes. Only add indexes that support documented list/read/aggregation queries.

Folder Structure (Backend)
--------------------------
Project uses a modular architecture. Key folders:

- `src/modules/` — feature modules (e.g., `user`, `post`, `note`).
- `src/shared/` — shared utilities (`catchAsync`, `sendResponse`, etc.).
- `src/middlewares/` — auth, validation, error handling.
- `src/helpers/` — DB error handlers, JWT helpers, pagination helpers.


Notes on Frontend Integration
- Use `Authorization: Bearer <token>` header for authenticated requests.
- Use role-checking client-side for UI (do not rely only on UI checks; server enforces rules).

API Design (high level)
-----------------------
- Auth
  - `POST /api/auth/register` — create user (hash password)
  - `POST /api/auth/login` — returns JWT access token

- Notes
  - `GET /api/notes` — paginated list: for users returns their notes; for admin returns all (query params `?page=1&limit=10&sort=-createdAt`)
  - `GET /api/notes/:id` — get a note (ensure index supports find by _id and owner)
  - `POST /api/notes` — create note (owner = current user)
  - `PUT /api/notes/:id` — update note (owner only unless admin)
  - `DELETE /api/notes/:id` — delete note (owner only unless admin)

- Users (admin)
  - `GET /api/users` — paginated list of users (admin only)
  - `GET /api/users/:id` — get user profile
  - `POST /api/users` — create user (admin)
  - `PUT /api/users/:id` — update user (admin)
  - `DELETE /api/users/:id` — remove user (admin)

- Posts
  - `GET /api/posts` — public posts
  - `GET /api/posts/user/:userId` — aggregation lookup example (see Aggregation Tasks)

Indexing & API Optimization (Guidelines)
--------------------------------------
Design indexes to support the queries and aggregations below — only those.

- Notes list (by user): index on `{ owner: 1, createdAt: -1 }` to support fast user-note listings and sorting.
- Users list: index on fields used for filtering/sorting (e.g., `email`, `createdAt`) as needed.
- Reads by id: default `_id` index exists; ensure lookups by other unique keys have unique indexes if used.

Important: Create indexes using Mongoose `schema.index(...)` in the model files so reviewers see them easily (e.g., in `src/modules/note/note.model.ts`):

```js
NoteSchema.index({ owner: 1, createdAt: -1 });
```

Aggregation Tasks (must satisfy constraints)
-----------------------------------------
Scenario 1 — Group by Interests
- Context: user profiles contain `interests: [String]`.
- Task: View users grouped by interest.
- Constraint: Use exactly one `collection.aggregate()` call.

Example pipeline (server-side, single aggregate call):

```js
db.users.aggregate([
  { $unwind: '$interests' },
  { $group: { _id: '$interests', users: { $push: { _id: '$_id', name: '$name' } }, count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

Indexing note: create an index on `interests` (a multikey index) only if you need to support filtering by interest; use `UserSchema.index({ interests: 1 })` only when required.

Scenario 2 — User Posts ($lookup)
- Context: `posts` collection contains posts with `authorId` referencing `users._id`.
- Task: Retrieve all posts for a particular user with a single aggregation pipeline using `$lookup`.

Example pipeline:

```js
db.posts.aggregate([
  { $match: { authorId: ObjectId(userId) } },
  { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' }
]);
```

Indexing note: ensure `posts` has an index on `authorId` (`PostSchema.index({ authorId: 1 })`) to make the `$match` efficient.

Security & Auth
---------------
- Hash passwords with bcrypt/argon2 before saving.
- Issue JWTs (short-lived access token; optionally refresh tokens).
- Protect routes with middleware that verifies JWT and enforces roles.

Pagination & Performance
------------------------
- Use limit/skip or, preferably, cursor-based pagination for large collections.
- Always return metadata: `total`, `page`, `limit`, `pages`.

Environment Variables
---------------------
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token TTL (e.g., `1h`)
- `PORT` — server port

Setup & Run
-----------
Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build & start:

```bash
npm run build
npm start
```

Seed / DB tasks
----------------
Provide optional seed scripts to create admin and sample users/posts/notes for testing.

What to Review
---------------
- Model files in `src/modules/*/*.model.ts` for `schema.index(...)` usage.
- Auth middleware in `src/middlewares/` for JWT verification and role enforcement.
- Pagination helper in `src/helpers/paginationHelper.ts`.
- Aggregation pipelines in `src/modules/*/` where `collection.aggregate()` is used.

Evaluation Checklist (for interviewers)
-------------------------------------
- Correct role-based ACL enforcement (server-side).
- Secure password hashing and JWT handling.
- Pagination implemented for all list endpoints.
- Proper, minimal indexing strategy using `schema.index(...)`.
- Aggregation pipelines implemented exactly as requested (single `aggregate()` calls where required).
- Clean modular structure and clear separation of concerns.

Contact
-------
For questions about this submission or to run through the design, open an issue or contact the author.

---
Generated README for the Secure Note-Taking Application.
