# 📁 Document Storage & Management System

A secure, cloud-based Document Management System (DMS) built using the MERN stack and AWS services. The application enables users to upload, organize, manage, and securely share documents using Amazon S3 for storage and DynamoDB for metadata management.

---
Live link:http://13.233.84.244/

## 🚀 Features

- 🔐 User Authentication (JWT)
- 📂 Folder Management
- 📄 Document Upload & Download
- ☁️ Amazon S3 File Storage
- 🗄️ DynamoDB Metadata Storage
- 🔗 Secure Document Sharing
- 🗑️ Delete Documents
- 📋 Document Listing
- 📱 Responsive React UI
- 🌐 Nginx Reverse Proxy
- ⚡ PM2 Process Management
- ☁️ AWS EC2 Deployment

---

# 🏗️ System Architecture

```
                   Internet
                        │
                        ▼
                 Nginx Reverse Proxy
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
    React Frontend             Express Backend
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
             Amazon DynamoDB                     Amazon S3
          (User & Metadata)                 (Document Storage)
```

---

# 🛠️ Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer

### AWS Services
- Amazon EC2
- Amazon S3
- Amazon DynamoDB

### Deployment
- Nginx
- PM2
- Ubuntu Server

---

# 📂 Project Structure

```
document-storage/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   └── utils/
│   └── package.json
│
└── terraform/
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/chalamalauday/document-storage.git

cd document-storage
```

---

## Backend Setup

```bash
cd server

npm install
```

Create `.env`

```env
PORT=5000

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

AWS_REGION=your_region

AWS_BUCKET_NAME=your_bucket_name

AWS_ACCESS_KEY_ID=your_access_key

AWS_SECRET_ACCESS_KEY=your_secret_key
```

Run backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install
```

Create

```
.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

Run

```bash
npm run dev
```

---

# ☁️ AWS Deployment

The application is deployed using

- Amazon EC2
- Amazon S3
- Amazon DynamoDB
- Nginx
- PM2

Deployment Steps

1. Launch EC2 Instance
2. Clone Repository
3. Install Dependencies
4. Configure Environment Variables
5. Build React Application
6. Configure Nginx
7. Start Backend with PM2
8. Configure Security Groups
9. Access Application through Public IP or Domain

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Protected API Routes
- CORS Configuration
- Secure AWS SDK Access
- Environment Variable Configuration

---

# 📷 Screenshots

Add screenshots here.

Example

```
screenshots/

login.png

dashboard.png

upload.png

folders.png

documents.png
```

---

# 📈 Future Improvements

- Email Verification
- Password Reset
- Role-Based Access Control
- Version History
- File Preview
- File Search
- Document Tags
- Expiring Share Links
- Drag & Drop Upload
- CI/CD Pipeline
- Docker Support
- CloudFront CDN
- HTTPS with SSL
- Activity Logs
- Multi-user Collaboration

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Uday Chalamala**

Computer Science Engineering (Data Science)

- GitHub: https://github.com/chalamalauday

---

## ⭐ Support

If you found this project useful,

⭐ Star the repository

🍴 Fork the repository

📢 Share it with others

---
