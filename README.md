# TaskMaster

TaskMaster is a modern, collaborative task management application built with a full-stack TypeScript architecture. It features real-time updates, project-based organization, and role-based access control, designed to streamline teamwork and productivity.

## 🚀 Features

*   **Real-time Collaboration**: Instant updates on task creation, assignment, and status changes using Socket.io.
*   **Project Management**: Organize tasks within specific projects with dedicated workspaces.
*   **Task Management**: Create, read, update, and delete tasks with rich details (description, priority, due date).
*   **Role-Based Access Control (RBAC)**:
    *   **Admins/Managers**: Full control over projects and tasks.
    *   **Members**: Can view and update status of assigned tasks.
*   **Authentication**: Secure JWT-based authentication with HttpOnly cookies.
*   **Responsive UI**: Beautiful, responsive interface built with React 19, TailwindCSS, and Framer Motion.
*   **Efficient Data Fetching**: Optimized server state management using TanStack Query.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [TailwindCSS v4](https://tailwindcss.com/) & [clsx](https://github.com/lukeed/clsx)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
*   **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Real-time**: [Socket.io Client](https://socket.io/)

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
*   **Real-time**: [Socket.io](https://socket.io/)
*   **Validation**: [Zod](https://zod.dev/)
*   **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## 📋 Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
*   [Docker](https://www.docker.com/) & Docker Compose (optional, for easy setup)
*   [MongoDB](https://www.mongodb.com/) (if running locally without Docker)

## ⚡ Getting Started

### Option 1: Using Docker (Recommended)

The easiest way to run the entire application is using Docker Compose.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd TaskMaster
    ```

2.  **Start the services:**
    ```bash
    docker-compose up --build
    ```

This will start MongoDB, the Backend API (port 5000), and the Frontend (port 5173).

*   **Frontend**: http://localhost:5173
*   **Backend**: http://localhost:5000

### Option 2: Manual Setup

#### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/taskmaster
    JWT_SECRET=your_jwt_secret_key
    CLIENT_URL=http://localhost:5173
    NODE_ENV=development
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

#### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
TaskMaster/
├── backend/                # Node.js + Express Server
│   ├── src/
│   │   ├── config/         # DB and Socket config
│   │   ├── middlewares/    # Auth and error handling
│   │   ├── modules/        # Feature modules (Auth, Tasks, Projects)
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   └── tasks/
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/               # React + Vite Client
│   ├── src/
│   │   ├── api/            # API client and endpoints
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Application pages
│   │   ├── store/          # Zustand store
│   │   └── App.tsx         # Main component
│   └── package.json
│
└── docker-compose.yml      # Docker orchestration
```

## 🔒 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Port | `5000` |
| `MONGO_URI` | MongoDB Connection String | - |
| `JWT_SECRET` | Secret for signing JWTs | - |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Clean URL to the backend API (e.g., `http://localhost:5000/api`) |

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ISC License.
