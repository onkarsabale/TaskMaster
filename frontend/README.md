# TaskMaster - Collaborative Task Management

A professional, real-time task management application built with the MERN stack.

## 🚀 Technical Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (Auth & UI state)
- **Styling**: TailwindCSS + CSS Variables (Theme support)
- **Animations**: Framer Motion
- **Real-time**: Socket.io Client

### Backend (Planned)
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.io Server
- JWT Authentication (HttpOnly Cookies)

## 🔐 Security & Roles (RBAC)

This application implements a strict **Role-Based Access Control (RBAC)** model.

### 1. Roles
| Role | Authority | Description |
| :--- | :--- | :--- |
| **ADMIN** | `System Level` | Full access. Can manage users, delete any task, and view system stats. |
| **MANAGER** | `Team Level` | Can create tasks, assign them to users, and view all tasks. Cannot delete tasks. |
| **USER** | `Task Level` | Can view assigned tasks and update their status (e.g., Todo → Done). Read-only for unassigned tasks. |

### 2. Authorization Flow
1.  **Authentication**: User logs in → Server issues JWT with `userId` and `role`.
2.  **Request Guard**: Middleware extracts JWT → Attaches user to `req.user`.
3.  **Permission Check**: `authorize(['admin', 'manager'])` middleware gates protected routes.
4.  **Business Rules**: Service layer validates ownership (e.g., *User A cannot update User B's task*).

### 3. Frontend Security
- **Route Protection**: `RoleBasedRoute` component checks `user.role` before rendering pages.
- **UI Adaptation**:
    - "New Task" button hidden for `USER`.
    - "Delete" action disabled for non-`ADMIN`.
    - Protected routes redirect to `/unauthorized`.

## 📦 Installation

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```
