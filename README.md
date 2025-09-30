# 🤖 AI Model Playground

A full-stack application for comparing responses from multiple AI models side-by-side in real-time. Built with NestJS, Next.js, and TypeScript.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 🌐 Live Demo

**Frontend:** https://ai-playground-khaki.vercel.app  
**Backend API:** https://ai-playground-a1x8.onrender.com/api/comparison/models/available

Try it now - select models, enter a prompt, and watch real-time AI responses!

---
## 🌟 Features

- **Real-time Streaming**: Character-by-character streaming from AI models using Server-Sent Events (SSE)
- **Multi-Model Comparison**: Compare responses from 4 different AI models simultaneously
- **Performance Metrics**: Track tokens used, response time, and cost per query
- **Modern UI**: Clean, responsive interface built with React
- **Multiple AI Providers**: Integration with OpenAI (GPT models) and Groq (Llama models)
- **Error Handling**: Graceful handling of API failures and rate limits
- **In-Memory Caching**: Fast session storage with automatic cleanup

## 🚀 Tech Stack

### Backend
- NestJS 10.x
- TypeScript 5.x
- OpenAI SDK, Groq SDK
- Server-Sent Events (SSE)

### Frontend
- Next.js 14.x
- React 18.x
- TypeScript 5.x
- react-markdown

## 📦 Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev


Frontend
cd frontend
npm install
npm run dev


🎯 API Endpoints

GET /api/comparison/models/available
POST /api/comparison/start
GET /api/comparison/stream/:sessionId
GET /api/comparison/sessions

✅ Features Implemented

Session management
Multiple AI providers
Real-time streaming
Error handling
Performance metrics
Markdown rendering