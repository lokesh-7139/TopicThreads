# TopicThreads — Subject-wise Real-Time Discussion Platform

TopicThreads is a scalable, backend-powered discussion platform built to serve students, class representatives, and administrators of academic institutions. The platform facilitates real-time, structured discussions inside subject-based rooms, encouraging collaborative learning, doubt-solving, and organized communication between students and academic moderators.

# Core Idea

The core objective of TopicThreads is to simulate structured, topic-based discussions similar to modern platforms like Slack or Discord, but tailored specifically for educational institutes. Each subject acts like a discussion category, and within it, multiple rooms can be created to host Q&A sessions, exam prep discussions, announcements, etc.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Features](#features)
- [License](#-inspiration-only--not-for-use)
- [Contact](#contact)
- [Author](#author)

## Installation & Setup

### 1. Clone the Repository

```bash

git clone https://github.com/lokesh-7139/TopicThreads.git
cd TopicThreads
```

### 2. Install dependencies

```bash

npm install
```

### 3. Configure Environment Variables

Create a .env file in the root directory and add your environment variables.

```env

NODE_ENV=development
PORT=4000

# MongoDB connection
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/your-db-name?retryWrites=true&w=majority
DATABASE_PASSWORD=yourMongoDBPassword

# JWT configuration
JWT_SECRET=any_thing#you$want%%
JWT_EXPIRES_IN=10d
JWT_COOKIE_EXPIRES_IN=10
RETRY_ATTEMPTS=5

# Nodemailer SMTP
EMAIL_USERNAME=youremail@gmail.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=Outdoors App <youremail@gmail.com>

# SendGrid API
SENDGRID_API_KEY=SG.xxxxxx.yyyyyyyyyyyyyyyyyyyyyy

```

### 4. Run the Server

To start the development server with auto-restart (using Nodemon):

```bash

npm run dev
```

To run the server in production mode:

```bash

npm start
```

Server will be running at: `http://localhost:3000`

## Features

- will be added later

---

## 💡 Inspiration Only — Not for Use

![License: No License](https://img.shields.io/badge/license-NO--LICENSE-red)

This project is **not licensed** for use, copying, or modification.

You are welcome to **view** the code and use it for **inspiration only**, but you are **not allowed** to:

- Copy any part of this code
- Use it in your own projects
- Share or distribute it

If you want to use any part of this project, please ask for **explicit permission**.

---

## Contact

Contact me at [lokeshkollepara3971@gmail.com](mailto:lokeshkollepara3971@gmail.com).

## Author

**[Lokesh Kollepara](https://www.linkedin.com/in/kollepara-bapiraju/)**
