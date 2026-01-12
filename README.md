<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# ♟️ OX Game Backend (NestJS)

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

---

## 📝 Description

โปรเจกต์นี้คือส่วน **Backend** สำหรับแอปพลิเคชันเกม OX WebApp สร้างด้วย [NestJS](https://nestjs.com/) โดยมีคุณสมบัติหลักดังนี้:

* **Social Login:** ใช้ **NestJS Passport** เพื่อรองรับการเข้าสู่ระบบผ่าน **Google** และ **Facebook** (OAuth 2.0).
* **Database:** ใช้ **MySQL** สำหรับการจัดการข้อมูลผู้ใช้และข้อมูลเกม.
* **Caching/Session:** ใช้ **Redis** สำหรับการจัดการแคชและ Session.
* **Authorization:** ใช้ **JWT (JSON Web Tokens)** สำหรับการป้องกัน API Endpoint.

---

## 🛠️ Project Setup & Installation

### Prerequisites

โปรดตรวจสอบว่าคุณได้ติดตั้งซอฟต์แวร์ต่อไปนี้:
* Node.js (v18+)
* MySQL Database Server
* Redis Server

### Installation

```bash
# ติดตั้ง dependencies ทั้งหมด
$ npm install

```

### ⚙️ Environment Variables (ไฟล์ `.env`)

สร้างไฟล์ชื่อ `.env` ใน Root Directory เพื่อกำหนดค่าการเชื่อมต่อและ Secret Keys (โปรดเพิ่มไฟล์ `.env` ใน `.gitignore` เพื่อป้องกันการเปิดเผยข้อมูลสำคัญ)

| กลุ่มตัวแปร | ตัวแปร | คำอธิบายโดยย่อ |
| --- | --- | --- |
| **Database** | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | ข้อมูลการเชื่อมต่อ MySQL |
| **JWT** | `JWT_SECRET` | Secret Key สำหรับ Sign/Verify Token |
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credentials จาก Google Console |
| **Facebook OAuth** | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | Credentials จาก Facebook Console |
| **Redis** | `REDIS_HOST`, `REDIS_PORT`, `REDIS_URL` | ข้อมูลการเชื่อมต่อ Redis และ REDIS_URL สำหรับ upstash ส่วน REDIS_HOST และ REDIS_PORT สำหรับ local |

---

## 🚀 Compile and Run the Project

### Development Mode

```bash
# watch mode
$ npm run start:dev

```

### Production Mode

```bash
# 1. Compile TypeScript ไปเป็น JavaScript
$ npm run build

# 2. รันในโหมด production
$ npm run start:prod

```

---

## 🔑 Authentication Endpoints

โปรเจกต์นี้ใช้ NestJS Passport สำหรับ Social Login โดยมีการออก JWT Token เมื่อ Login สำเร็จ:

| ฟังก์ชัน | Endpoint | Method | หมายเหตุ |
| --- | --- | --- | --- |
| **Google Login** | `/api/auth/google` | `GET` | เริ่มต้น Google OAuth Flow |
| **Facebook Login** | `/api/auth/facebook` | `GET` | เริ่มต้น Facebook OAuth Flow |
| **Protected API** | `/api/game/*` | `GET/POST` | ต้องมี Header: `Authorization: Bearer <token>` |

---
