# 🎓 StudyMate AI

> An AI-powered personalized learning platform that helps students create study materials, generate quizzes, and learn from PDF documents.

## 🚀 Live Demo

🌐 **Live Application:**  
https://vercel.com/sumit2010-apks-projects/studymate-ai

📂 **GitHub Repository:**  
https://github.com/sumit2010-apk/studymate-ai

---

## 📌 About the Project

StudyMate AI is a full-stack AI-powered study assistant designed to make learning more personalized and interactive.

Users can create an account, generate AI-powered study materials, take quizzes, track their performance, and upload PDF documents for learning.

The application combines **Next.js, TypeScript, Supabase, Tailwind CSS, and AI APIs** to provide a complete learning experience.

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- Supabase Authentication
- Secure user sessions
- User-specific data
- Row Level Security (RLS)

### 🤖 AI Study Material Generator
Generate personalized learning content based on:

- Subject
- Topic
- Material type
- Difficulty level

Supported material types:

- 📚 Study Notes
- ❓ MCQs
- 🗂️ Flashcards
- 📝 Summaries

### 🎯 AI Quiz Generator

Create interactive quizzes from any topic.

Features:

- Automatically generated questions
- Multiple-choice answers
- Instant scoring
- Correct/incorrect answer highlighting
- Explanations
- Quiz result persistence

### 📊 Quiz History

Users can view their previous quiz attempts including:

- Subject
- Topic
- Score
- Percentage
- Date and time

### 📄 PDF Learning

Users can:

- Upload PDF documents
- Extract text from PDFs
- Preview extracted content
- Use the extracted material for learning

### 💾 Study Material History

Generated materials are stored for each user and displayed on the dashboard.

### 🔒 Secure Database

Supabase Row Level Security ensures users can only access their own:

- Profiles
- Study materials
- Quiz results

### 🚀 Production Deployment

The application is deployed using Vercel and connected to GitHub for continuous deployment.

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Supabase
- PostgreSQL

### Authentication

- Supabase Auth

### AI

- OpenRouter AI API

### PDF Processing

- PDF parsing/extraction

### Deployment

- Vercel
- GitHub

---

## 🏗️ Project Structure

```text
studymate-ai/
│
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts
│   │   │
│   │   └── pdf/
│   │       └── route.ts
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── generate/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── signup/
│   │   └── page.tsx
│   │
│   ├── quiz/
│   │   └── page.tsx
│   │
│   ├── pdf/
│   │   └── page.tsx
│   │
│   ├── materials/
│   │   └── [id]/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── proxy.ts
│
├── public/
│
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
