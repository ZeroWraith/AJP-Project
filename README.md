# Mentor-Mentee Portal

A full-stack web application for managing mentor-mentee relationships, scheduling meetings, tracking progress, and facilitating communication between mentors, mentees, and administrators.

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Language runtime |
| Spring Boot | 3.4.5 | Application framework |
| Spring Data JPA | - | ORM / database access |
| Spring Security | - | Authentication & authorization |
| Spring Mail | - | Email service |
| MySQL | 9.x | Database |
| JWT (jjwt) | 0.12.6 | Token-based authentication |
| Lombok | 1.18.38 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.8.6 | Swagger API docs |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.7 | UI framework |
| Vite | 8.1.1 | Build tool & dev server |
| MUI (Material UI) | 9.2.0 | Component library |
| React Router | 7.18.1 | Client-side routing |
| Axios | 1.18.1 | HTTP client |
| Recharts | - | Dashboard charts |

---

## Project Structure

```
AJP-Project/
├── frontend/                          # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication state management
│   │   ├── components/
│   │   │   ├── Layout.jsx              # Sidebar + Topbar layout
│   │   │   └── ProtectedRoute.jsx      # Role-based route guards
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── MentorDashboard.jsx
│   │   │   │   ├── MenteeDashboard.jsx
│   │   │   │   └── DashboardRouter.jsx
│   │   │   ├── users/
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── assignments/
│   │   │   │   └── AssignmentPage.jsx
│   │   │   ├── meetings/
│   │   │   │   └── MeetingPage.jsx
│   │   │   ├── groups/
│   │   │   │   └── GroupPage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── theme.js                   # MUI theme configuration
│   │   ├── App.jsx                    # Root component with routes
│   │   └── main.jsx                   # Entry point
│   ├── vite.config.js                 # Vite config with API proxy
│   └── package.json
├── src/main/java/com/ajp/mentorportal/
│   ├── auth/                          # Authentication module
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── CustomUserDetailsService.java
│   │   └── dto/
│   ├── user/                          # User management module
│   │   ├── User.java                  # JPA entity
│   │   ├── UserController.java
│   │   ├── UserService.java
│   │   ├── UserRepository.java
│   │   ├── Role.java                  # Enum: ADMIN, MENTOR, MENTEE
│   │   └── dto/
│   ├── assignment/                    # Mentor-mentee pairing module
│   │   ├── AssignmentController.java
│   │   ├── AssignmentService.java
│   │   ├── MentorMentee.java          # JPA entity
│   │   ├── AssignmentStatus.java      # Enum: PENDING, ACCEPTED, ACTIVE, etc.
│   │   └── dto/
│   ├── meeting/                       # Meeting scheduling module
│   │   ├── MeetingController.java
│   │   ├── MeetingService.java
│   │   ├── Meeting.java               # JPA entity
│   │   ├── MeetingStatus.java         # Enum: SCHEDULED, CONFIRMED, etc.
│   │   └── dto/
│   ├── group/                         # Group management module
│   │   ├── GroupController.java
│   │   ├── GroupService.java
│   │   ├── Group.java                 # JPA entity
│   │   ├── GroupMember.java           # JPA entity
│   │   └── dto/
│   ├── dashboard/                     # Dashboard aggregation module
│   │   ├── DashboardController.java
│   │   ├── DashboardService.java
│   │   └── dto/
│   ├── common/                        # Shared utilities
│   │   ├── ApiResponse.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── PageResponse.java
│   │   └── ResourceNotFoundException.java
│   ├── config/                        # Application configuration
│   │   ├── SecurityConfig.java
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── DataInitializer.java       # Seed data on startup
│   ├── sms/                           # SMS service module
│   │   ├── SmsConfig.java
│   │   ├── SmsService.java
│   │   └── provider/
│   └── MentorPortalApplication.java
└── pom.xml
```

---

## Prerequisites

- **Java 21** or higher
- **Node.js 18+** and **npm 9+**
- **MySQL 8.x** or **9.x**
- **Maven 3.8+**

---

## Setup

### 1. Database

Create the MySQL database:

```sql
CREATE DATABASE mentor_portal;
```

Update credentials in `src/main/resources/application.yml` if needed:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mentor_portal
    username: root
    password: your_password
```

Tables are auto-created on startup via `ddl-auto: update`.

### 2. Backend

```bash
# From the project root
mvn clean compile
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

### 3. Frontend

```bash
# From the project root
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000** and proxies `/api` requests to `localhost:8080`.

### 4. Seed Data

On first startup, `DataInitializer` creates 6 test users automatically:

| Email | Password | Role |
|-------|----------|------|
| admin@portal.com | admin123 | ADMIN |
| mentor1@portal.com | mentor123 | MENTOR |
| mentor2@portal.com | mentor123 | MENTOR |
| mentee1@portal.com | mentee123 | MENTEE |
| mentee2@portal.com | mentee123 | MENTEE |
| mentee3@portal.com | mentee123 | MENTEE |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login, returns JWT tokens | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List users (paginated, `?search=`) | ADMIN |
| GET | `/api/users/{id}` | Get user by ID | ADMIN |
| POST | `/api/users` | Create user | ADMIN |
| PUT | `/api/users/{id}` | Update user | ADMIN |
| DELETE | `/api/users/{id}` | Delete user | ADMIN |
| GET | `/api/users/me` | Current user profile | Any |
| PUT | `/api/users/me` | Update own profile | Any |
| GET | `/api/users/mentors` | List all mentors | ADMIN |
| GET | `/api/users/mentees` | List all mentees | ADMIN |

### Assignments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assignments` | List all assignments | ADMIN |
| GET | `/api/assignments/my` | My assignments | Any |
| POST | `/api/assignments` | Create assignment | ADMIN |
| PUT | `/api/assignments/{id}/status` | Update status | Any |
| DELETE | `/api/assignments/{id}` | Delete assignment | ADMIN |

### Meetings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meetings` | List all meetings | Any |
| GET | `/api/meetings/my` | My meetings | Any |
| GET | `/api/meetings/upcoming` | Upcoming meetings | Any |
| POST | `/api/meetings` | Schedule meeting | Any |
| PUT | `/api/meetings/{id}/status` | Update status | Any |
| DELETE | `/api/meetings/{id}` | Cancel meeting | Any |

### Groups
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/groups` | List groups | ADMIN |
| GET | `/api/groups/search?name=` | Search groups | ADMIN |
| GET | `/api/groups/{id}` | Get group with members | ADMIN |
| POST | `/api/groups` | Create group | ADMIN |
| PUT | `/api/groups/{id}` | Update group | ADMIN |
| DELETE | `/api/groups/{id}` | Delete group | ADMIN |
| POST | `/api/groups/{id}/members` | Add members | ADMIN |
| DELETE | `/api/groups/{id}/members/{userId}` | Remove member | ADMIN |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/admin` | Admin stats | Any |
| GET | `/api/dashboard/mentor` | Mentor dashboard data | Any |
| GET | `/api/dashboard/mentee` | Mentee dashboard data | Any |

---

## Frontend Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/unauthorized` | UnauthorizedPage | Public |
| `/dashboard` | Dashboard (role-based) | Any authenticated |
| `/users` | User Management | ADMIN |
| `/assignments` | Assignment Page | ADMIN |
| `/meetings` | Meeting Page | Any authenticated |
| `/groups` | Group Management | ADMIN |
| `/messages` | Messages (placeholder) | Any authenticated |
| `/bulk-messages` | Bulk Messages (placeholder) | ADMIN |
| `/mentees` | My Mentees (placeholder) | MENTOR |
| `/mentor` | My Mentor (placeholder) | MENTEE |

---

## Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (ADMIN, MENTOR, MENTEE)
- Automatic token refresh on 401 responses
- Protected routes with role guards

### Admin Dashboard
- Total users, mentors, mentees, active assignments, meetings, messages
- Pie chart for users by role
- Bar chart for meetings over time
- Recent activity feed

### Mentor Dashboard
- Assigned mentees list with status badges
- Upcoming meetings table
- Stats: mentees count, meetings, messages

### Mentee Dashboard
- Mentor card with contact info
- Upcoming meetings table
- Recent messages

### User Management
- CRUD table with search and role filter
- Create/Edit/Delete dialogs with validation
- Server-side pagination

### Assignment Management
- Mentor-mentee pairing with status workflow
- Status actions: Accept, Reject, Activate, Deactivate
- Search and filter by status

### Meeting Management
- Schedule meetings with date/time, location
- Status workflow: Scheduled, Confirmed, Completed, Cancelled, Declined
- Role-based action buttons

### Group Management
- Create/edit/delete groups
- Add/remove members with checkbox selector
- Member count and member chips

---

## Build & Deploy

### Production Build

Backend:
```bash
mvn clean package
# JAR file: target/mentor-portal.jar
java -jar target/mentor-portal.jar
```

Frontend:
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | dev-only-secret... | JWT signing secret (change in production) |
| `MAIL_USERNAME` | (empty) | Gmail SMTP username |
| `MAIL_PASSWORD` | (empty) | Gmail SMTP password |
| `SMS_PROVIDER` | `twilio` | SMS provider |
| `SMS_API_KEY` | (empty) | SMS API key |
| `SMS_PROVIDER_URL` | (empty) | SMS provider URL |

---

## API Documentation

Swagger UI is available at **http://localhost:8080/swagger-ui.html** when the backend is running.

---

## License

This project is for educational purposes (AJP Course Project).
