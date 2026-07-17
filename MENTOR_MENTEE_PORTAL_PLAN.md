# Mentor-Mentee Portal System — Architecture & Implementation Plan

**Project:** Mentor-Mentee Portal with Bulk Email & SMS Service
**Tech Stack:** Java 21, Spring Boot 3.4+, Spring Data JPA, Spring Security, Spring Mail, MySQL 9.x
**Existing Foundation:** AJP Course Project (Servlets/JDBC/JSP on Tomcat 10.1)

---

## 1. System Overview

A web-based portal enabling admins to manage mentor-mentee relationships, schedule meetings, track progress, and send bulk email/SMS notifications.

### 1.1 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access: manage users, assign mentors, send bulk communications, view reports |
| **Mentor** | View assigned mentees, schedule meetings, send messages, track mentee progress |
| **Mentee** | View mentor info, request meetings, view progress, receive notifications |

### 1.2 Core Modules

```
+-----------------------------------------------------------+
|                    Spring Boot Application                  |
+-------------+-------------+--------------+----------------+
|  Auth &     |  User &     |  Meeting &   |  Messaging     |
|  Security   |  Role Mgmt  |  Scheduling  |  & Notify      |
+-------------+-------------+--------------+----------------+
|                  REST API Layer (JSON)                      |
+-----------------------------------------------------------+
|              Spring Data JPA (Hibernate)                    |
+-----------------------------------------------------------+
|                     MySQL 9.x Database                      |
+-----------------------------------------------------------+
         |                                    |
    +----+----+                        +------+------+
    |  Email  |                        |  SMS (via   |
    |  (SMTP) |                        |  external   |
    +---------+                        |  provider)  |
                                       +-------------+
```

---

## 2. Technology Stack & Dependencies

### 2.1 Spring Boot Starters

| Dependency | Purpose |
|------------|---------|
| `spring-boot-starter-web` | REST API, embedded Tomcat |
| `spring-boot-starter-data-jpa` | ORM / database access |
| `spring-boot-starter-security` | Authentication & authorization |
| `spring-boot-starter-validation` | Bean validation (Jakarta) |
| `spring-boot-starter-thymeleaf` | Server-side HTML templates (email templates) |
| `spring-boot-starter-mail` | Email sending (Jakarta Mail) |
| `spring-boot-starter-actuator` | Health checks, monitoring |

### 2.2 Additional Dependencies

| Dependency | Purpose |
|------------|---------|
| `mysql-connector-j` (9.7.0) | MySQL JDBC driver |
| `jjwt-api` / `jjwt-impl` / `jjwt-jackson` (0.12.x) | JWT token generation & validation |
| `lombok` | Boilerplate reduction (getters, setters, builders) |
| `springdoc-openapi-starter-webmvc-ui` (2.x) | Swagger/OpenAPI documentation |
| `thymeleaf-extras-springsecurity6` | Thymeleaf Spring Security integration |

### 2.3 Build Configuration

- **Java 21**
- **Spring Boot 3.4.x** parent POM
- **Maven** build system

---

## 3. Database Design

### 3.1 Entity-Relationship Diagram

```
+--------------+       +------------------+       +--------------+
|    users     |       |  mentor_mentee   |       |    users     |
|--------------|       |------------------|       |--------------|
| id (PK)      |--1:N--| user_id (FK)     |       | id (PK)      |
| first_name   |       | mentor_id (FK)   |--N:1--| first_name   |
| last_name    |       | assigned_date    |       | last_name    |
| email        |       | status           |       | email        |
| phone        |       +------------------+       | phone        |
| password_hash|                                  | role         |
| role         |       +------------------+       | is_active    |
| is_active    |       |   meetings       |       +--------------+
| created_at   |       |------------------|
| updated_at   |       | id (PK)          |       +--------------+
+--------------+       | mentor_id (FK)   |       |  messages    |
                       | mentee_id (FK)   |       |--------------|
                       | title            |       | id (PK)      |
                       | description      |       | sender_id    |
                       | meeting_date     |       | recipient_id |
                       | meeting_time     |       | subject      |
                       | location         |       | body         |
                       | status           |       | channel      |
                       | notes            |       | status       |
                       +------------------+       | sent_at      |
                                                  | created_at   |
                       +------------------+       +--------------+
                       | bulk_messages    |
                       |------------------|       +------------------+
                       | id (PK)          |       | message_templates |
                       | sender_id (FK)   |       |------------------|
                       | subject          |       | id (PK)          |
                       | body             |       | name             |
                       | channel          |       | subject          |
                       | target_role      |       | body_template    |
                       | target_group_id  |       | channel          |
                       | status           |       | created_at       |
                       | sent_count       |       +------------------+
                       | failed_count     |
                       | scheduled_at     |       +------------------+
                       | sent_at          |       | notification_log |
                       | created_at       |       |------------------|
                       +------------------+       | id (PK)          |
                                                  | bulk_message_id  |
                       +------------------+       | recipient_id     |
                       |    groups        |       | channel          |
                       |------------------|       | status           |
                       | id (PK)          |       | error_message    |
                       | name             |       | sent_at          |
                       | description      |       +------------------+
                       | created_by (FK)  |
                       | created_at       |
                       +------------------+
```

### 3.2 Tables

| Table | Description |
|-------|-------------|
| `users` | All users (admin, mentors, mentees) |
| `mentor_mentee` | Many-to-many assignment with status |
| `meetings` | Scheduled meetings between mentor & mentee |
| `messages` | Individual messages (email/SMS) |
| `bulk_messages` | Bulk email/SMS campaigns |
| `message_templates` | Reusable templates |
| `notification_log` | Delivery tracking per recipient |
| `groups` | User groups for targeted messaging |

---

## 4. Project Structure

```
AJP-Project/
├── pom.xml
├── MENTOR_MENTEE_PORTAL_PLAN.md
├── src/main/java/com/ajp/mentorportal/
│   ├── MentorPortalApplication.java
│   │
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── MailConfig.java
│   │   ├── AsyncConfig.java
│   │   └── OpenApiConfig.java
│   │
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── AuthResponse.java
│   │   │   └── ChangePasswordRequest.java
│   │   └── security/
│   │       ├── JwtTokenProvider.java
│   │       ├── JwtAuthenticationFilter.java
│   │       └── CustomUserDetailsService.java
│   │
│   ├── user/
│   │   ├── UserController.java
│   │   ├── UserService.java
│   │   ├── User.java
│   │   ├── Role.java
│   │   └── dto/
│   │       ├── UserResponse.java
│   │       ├── UserUpdateRequest.java
│   │       └── UserSummary.java
│   │
│   ├── mentor/
│   │   ├── MentorController.java
│   │   ├── MentorService.java
│   │   ├── MentorMentee.java
│   │   └── dto/
│   │       ├── AssignmentRequest.java
│   │       ├── AssignmentResponse.java
│   │       └── MentorDashboard.java
│   │
│   ├── meeting/
│   │   ├── MeetingController.java
│   │   ├── MeetingService.java
│   │   ├── Meeting.java
│   │   └── dto/
│   │       ├── MeetingRequest.java
│   │       ├── MeetingResponse.java
│   │       └── MeetingStatus.java
│   │
│   ├── messaging/
│   │   ├── MessageController.java
│   │   ├── MessageService.java
│   │   ├── BulkMessageController.java
│   │   ├── BulkMessageService.java
│   │   ├── Message.java
│   │   ├── BulkMessage.java
│   │   ├── MessageTemplate.java
│   │   ├── NotificationLog.java
│   │   └── dto/
│   │       ├── SendMessageRequest.java
│   │       ├── BulkMessageRequest.java
│   │       ├── MessageResponse.java
│   │       └── BulkMessageResponse.java
│   │
│   ├── notification/
│   │   ├── EmailService.java
│   │   ├── SmsService.java
│   │   ├── NotificationDispatcher.java
│   │   └── templates/
│   │       ├── MeetingReminderEmail.java
│   │       ├── WelcomeEmail.java
│   │       └── BulkNotificationEmail.java
│   │
│   ├── group/
│   │   ├── GroupController.java
│   │   ├── GroupService.java
│   │   ├── UserGroup.java
│   │   └── dto/
│   │       ├── GroupRequest.java
│   │       └── GroupResponse.java
│   │
│   ├── dashboard/
│   │   ├── DashboardController.java
│   │   └── DashboardService.java
│   │
│   └── common/
│       ├── ApiResponse.java
│       ├── PageResponse.java
│       ├── GlobalExceptionHandler.java
│       └── enums/
│           └── Channel.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   ├── templates/
│   │   └── email/
│   │       ├── welcome.html
│   │       ├── meeting-reminder.html
│   │       ├── bulk-notification.html
│   │       └── password-reset.html
│   └── db/migration/
│       ├── V1__create_users_table.sql
│       ├── V2__create_mentor_mentee_table.sql
│       ├── V3__create_meetings_table.sql
│       ├── V4__create_messages_table.sql
│       ├── V5__create_bulk_messages_table.sql
│       └── V6__create_groups_table.sql
│
└── src/test/java/com/ajp/mentorportal/
    ├── MentorPortalApplicationTests.java
    ├── auth/
    │   └── AuthServiceTest.java
    ├── user/
    │   └── UserServiceTest.java
    ├── meeting/
    │   └── MeetingServiceTest.java
    └── messaging/
        └── BulkMessageServiceTest.java
```

---

## 5. API Design (REST Endpoints)

### 5.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh JWT token |
| PUT | `/api/auth/change-password` | Change password |

### 5.2 Users

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | ADMIN | List all users (paginated) |
| GET | `/api/users/{id}` | ADMIN | Get user details |
| PUT | `/api/users/{id}` | ADMIN | Update user |
| DELETE | `/api/users/{id}` | ADMIN | Soft-delete user |
| GET | `/api/users/me` | ALL | Get current user profile |
| PUT | `/api/users/me` | ALL | Update own profile |
| GET | `/api/users/mentors` | ADMIN, MENTEE | List all mentors |
| GET | `/api/users/mentees` | ADMIN, MENTOR | List all mentees |

### 5.3 Mentor-Mentee Assignments

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/assignments` | ADMIN | Assign mentee to mentor |
| GET | `/api/assignments` | ADMIN | List all assignments |
| GET | `/api/assignments/my` | MENTOR, MENTEE | My assignments |
| DELETE | `/api/assignments/{id}` | ADMIN | Remove assignment |
| PUT | `/api/assignments/{id}/status` | MENTOR, MENTEE | Accept/Reject |

### 5.4 Meetings

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/meetings` | MENTOR | Schedule meeting |
| GET | `/api/meetings` | ALL | List meetings (filtered by role) |
| GET | `/api/meetings/{id}` | ALL | Meeting details |
| PUT | `/api/meetings/{id}` | MENTOR, MENTEE | Update meeting |
| PUT | `/api/meetings/{id}/status` | MENTEE | Accept/Decline/Complete |
| DELETE | `/api/meetings/{id}` | MENTOR | Cancel meeting |
| GET | `/api/meetings/upcoming` | ALL | Upcoming meetings |

### 5.5 Messaging

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | MENTOR, MENTEE | Send message |
| GET | `/api/messages` | ALL | My inbox (paginated) |
| GET | `/api/messages/{id}` | ALL | Message details |
| PUT | `/api/messages/{id}/read` | ALL | Mark as read |

### 5.6 Bulk Messaging (Admin)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/bulk-messages` | ADMIN | Create & send bulk message |
| GET | `/api/bulk-messages` | ADMIN | List bulk messages |
| GET | `/api/bulk-messages/{id}` | ADMIN | Bulk message details |
| GET | `/api/bulk-messages/{id}/logs` | ADMIN | Delivery logs |
| POST | `/api/bulk-messages/schedule` | ADMIN | Schedule bulk message |

### 5.7 Message Templates (Admin)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/templates` | ADMIN | Create template |
| GET | `/api/templates` | ADMIN | List templates |
| PUT | `/api/templates/{id}` | ADMIN | Update template |
| DELETE | `/api/templates/{id}` | ADMIN | Delete template |

### 5.8 Groups (Admin)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/groups` | ADMIN | Create group |
| GET | `/api/groups` | ADMIN | List groups |
| PUT | `/api/groups/{id}` | ADMIN | Update group |
| DELETE | `/api/groups/{id}` | ADMIN | Delete group |
| POST | `/api/groups/{id}/members` | ADMIN | Add members |
| DELETE | `/api/groups/{id}/members/{userId}` | ADMIN | Remove member |

### 5.9 Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/admin` | ADMIN | Admin stats |
| GET | `/api/dashboard/mentor` | MENTOR | Mentor dashboard |
| GET | `/api/dashboard/mentee` | MENTEE | Mentee dashboard |

---

## 6. Bulk Email & SMS Service Architecture

### 6.1 Email Service

```java
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Async("emailExecutor")
    public void sendEmail(String to, String subject, String htmlBody) { ... }

    @Async("emailExecutor")
    public void sendBulkEmail(List<String> recipients, String subject, String body) { ... }

    public String renderTemplate(String templateName, Map<String, Object> variables) { ... }
}
```

### 6.2 SMS Service (Provider-Agnostic)

```java
@Service
public class SmsService {
    @Value("${sms.provider.url}")
    private String providerUrl;

    @Value("${sms.provider.api-key}")
    private String apiKey;

    @Async("smsExecutor")
    public void sendSms(String phone, String message) { ... }

    @Async("smsExecutor")
    public void sendBulkSms(List<String> phones, String message) { ... }
}
```

### 6.3 Notification Dispatcher

```java
@Service
public class NotificationDispatcher {
    private final EmailService emailService;
    private final SmsService smsService;

    public void dispatch(String recipient, Channel channel, String subject, String body) {
        switch (channel) {
            case EMAIL -> emailService.sendEmail(recipient, subject, body);
            case SMS -> smsService.sendSms(recipient, body);
            case BOTH -> {
                emailService.sendEmail(recipient, subject, body);
                smsService.sendSms(recipient, body);
            }
        }
    }
}
```

### 6.4 Async Configuration

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        return executor;
    }

    @Bean("smsExecutor")
    public Executor smsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("sms-");
        return executor;
    }
}
```

### 6.5 Bulk Sending Flow

```
Admin --POST /api/bulk-messages--> BulkMessageService
                                       |
                              +--------+--------+
                              |  Resolve Recipients  |
                              |  (role / group / all) |
                              +--------+--------+
                                       |
                              +--------+--------+
                              |  Create BulkMessage  |
                              |  (status=PENDING)    |
                              +--------+--------+
                                       |
                    +------------------+------------------+
                    |                  |                   |
              +-----+-----+    +------+------+    +------+------+
              |  Email     |    |    SMS       |    |   Both      |
              |  Channel   |    |  Channel     |    |  Channel    |
              +-----+-----+    +------+------+    +------+------+
                    |                  |                   |
                    +------------------+------------------+
                                       |
                              +--------+--------+
                              |  NotificationLog  |
                              |  (per recipient)  |
                              +-----------------+
```

---

## 7. Security Design

### 7.1 JWT Authentication Flow

```
Client --POST /api/auth/login--> AuthController
                                    |
                              +-----+-----+
                              |  Validate  |
                              |  Credentials|
                              +-----+-----+
                                    |
                              +-----+-----+
                              |  Generate  |
                              |  JWT Token |
                              +-----+-----+
                                    |
Client <--{ token, user }-----------+

Client --GET /api/users--> SecurityFilterChain
                              |
                         +----+----+
                         | Validate |
                         | JWT Token|
                         +----+----+
                              |
                         +----+----+
                         |  Check   |
                         |  Roles   |
                         +----+----+
                              |
                         +----+----+
                         |Controller|
                         +---------+
```

### 7.2 Role-Based Access

| Role | Access Level |
|------|-------------|
| `ROLE_ADMIN` | Full system access |
| `ROLE_MENTOR` | Assigned mentees, meetings, messaging |
| `ROLE_MENTEE` | Own profile, mentor info, meetings, messaging |

### 7.3 JWT Token Config

- Access token expiry: 24 hours
- Refresh token expiry: 7 days
- Token stored in `Authorization: Bearer <token>` header
- Passwords hashed with BCrypt

---

## 8. Configuration (application.yml)

```yaml
spring:
  application:
    name: mentor-portal

  datasource:
    url: jdbc:mysql://localhost:3306/mentor_portal
    username: root
    password: aaditya@123
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-here-change-in-production}
  expiration: 86400000
  refresh-expiration: 604800000

sms:
  provider: ${SMS_PROVIDER:twilio}
  twilio:
    account-sid: ${TWILIO_SID:}
    auth-token: ${TWILIO_TOKEN:}
    from-number: ${TWILIO_FROM:}
  api-key: ${SMS_API_KEY:}
  provider-url: ${SMS_PROVIDER_URL:}

spring.task.execution:
  pool:
    core-size: 5
    max-size: 20
    queue-capacity: 100
```

---

## 9. Implementation Phases

### Phase 1: Project Setup (Day 1)
- [ ] Create Spring Boot project with Maven parent POM
- [ ] Add all dependencies (Spring Boot starters, JWT, Lombok, etc.)
- [ ] Create `MentorPortalApplication.java`
- [ ] Configure `application.yml`
- [ ] Create MySQL database `mentor_portal`
- [ ] Verify Spring Boot starts with embedded Tomcat

### Phase 2: User & Auth Module (Day 1-2)
- [ ] Create `User` entity, repository, service, controller
- [ ] Create `Role` enum (ADMIN, MENTOR, MENTEE)
- [ ] Implement JWT token provider and filter
- [ ] Implement `SecurityConfig` with role-based endpoints
- [ ] Auth endpoints (register, login, refresh, change-password)
- [ ] Seed default admin user

### Phase 3: Mentor-Mentee Assignment (Day 2)
- [ ] Create `MentorMentee` entity (many-to-many with metadata)
- [ ] Assignment CRUD endpoints
- [ ] Assignment status management (pending -> accepted -> active)
- [ ] Mentor/mentee list endpoints

### Phase 4: Meeting Module (Day 3)
- [ ] Create `Meeting` entity
- [ ] Meeting CRUD with status workflow
- [ ] Upcoming meetings endpoint
- [ ] Meeting notifications (email on schedule/update)

### Phase 5: Email Service (Day 3-4)
- [ ] Configure Spring Mail (Gmail SMTP or SendGrid)
- [ ] Create `EmailService` with async support
- [ ] Create Thymeleaf email templates
- [ ] Test individual email sending

### Phase 6: SMS Service (Day 4)
- [ ] Create `SmsService` (provider-agnostic, REST-based)
- [ ] Integrate with Twilio / MSG91 / TextLocal API
- [ ] Async SMS sending with retry logic
- [ ] Test individual SMS sending

### Phase 7: Bulk Messaging Module (Day 4-5)
- [ ] Create `BulkMessage` and `NotificationLog` entities
- [ ] Create `MessageTemplate` entity
- [ ] `BulkMessageService` - resolve recipients, dispatch to channels
- [ ] Bulk message endpoints (create, send, schedule, logs)
- [ ] Template CRUD endpoints
- [ ] `NotificationDispatcher` - route to email/SMS/both

### Phase 8: Groups Module (Day 5)
- [ ] Create `UserGroup` entity
- [ ] Group CRUD endpoints
- [ ] Member management (add/remove)
- [ ] Use groups as bulk message targets

### Phase 9: Dashboard (Day 6)
- [ ] Admin dashboard - total users, active mentorships, messages sent
- [ ] Mentor dashboard - my mentees, upcoming meetings, recent messages
- [ ] Mentee dashboard - my mentor, upcoming meetings, notifications

### Phase 10: Polish & Documentation (Day 6-7)
- [ ] Swagger/OpenAPI documentation
- [ ] Global exception handler
- [ ] API response wrapper (`ApiResponse<T>`)
- [ ] Input validation on all DTOs
- [ ] Test full flow end-to-end
- [ ] Seed data script for demo

---

## 10. MySQL Database Setup

```sql
CREATE DATABASE IF NOT EXISTS mentor_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

Tables are auto-created by JPA/Hibernate with `ddl-auto: update`.

---

## 11. Running the Application

```bash
cd ~/AJP-Project
mvn spring-boot:run

# Or build and run jar
mvn clean package
java -jar target/mentor-portal.jar
```

Application starts on `http://localhost:8080`
Swagger UI available at `http://localhost:8080/swagger-ui.html`

---

## 12. Seed Data

On first startup, the system creates:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@portal.com | admin123 | ADMIN |
| Mentor One | mentor1@portal.com | mentor123 | MENTOR |
| Mentor Two | mentor2@portal.com | mentor123 | MENTOR |
| Mentee One | mentee1@portal.com | mentee123 | MENTEE |
| Mentee Two | mentee2@portal.com | mentee123 | MENTEE |
| Mentee Three | mentee3@portal.com | mentee123 | MENTEE |

---

## 13. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Spring Boot 3.4** | Modern, Java 21 support, embedded Tomcat |
| **JWT over Session** | Stateless API, mobile-friendly, scales better |
| **Spring Data JPA** | Reduces boilerplate, clean repository pattern |
| **Async email/SMS** | Non-blocking bulk sends, better throughput |
| **Thymeleaf for email** | Rich HTML emails, same template engine as Spring |
| **Provider-agnostic SMS** | Swap Twilio/MSG91 without code changes |
| **REST API only** | Clean separation, frontend can be added later |
| **Hibernate ddl-auto=update** | Auto schema management during development |

---

## 14. Future Enhancements

- React/Angular frontend SPA
- WebSocket for real-time notifications
- File upload for meeting attachments
- Calendar integration (Google Calendar API)
- Analytics dashboard with charts
- Export reports (CSV/PDF)
- Rate limiting for bulk messages
- Message scheduling with cron expressions
- Docker containerization
