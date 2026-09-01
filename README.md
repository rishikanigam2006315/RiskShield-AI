# 🛡️ RiskShield AI

AI-powered real-time transaction risk detection and fraud prevention system built using **Spring Boot, XGBoost, Apache Kafka, Postman, Postgres SQL and React**.

## 🚀 Features

- 🤖 XGBoost-based AI transaction risk prediction
- ⚡ Real-time transaction processing using **Apache Kafka**
- 🔐 Rule-based risk analysis
- 🚦 Automatic **ALLOW / REVIEW / BLOCK** decisions
- 📊 Interactive transaction risk dashboard
- 📈 Risk distribution and decision breakdown charts
- 🔎 Transaction search and filtering
- 🧾 Detailed transaction risk analysis
- 🌐 REST API communication between frontend, backend, and ML service
- 💾 Transaction storage using **PostgreSQL**
- 🐳 Docker Compose support

## 🧱 Tech Stack

- **Frontend:** React, Vite, JavaScript, HTML, CSS, Recharts
- **Backend:** Java, Spring Boot, Spring Web, Maven
- **Machine Learning:** Python, XGBoost
- **Messaging:** Apache Kafka
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Docker Compose
- **Communication:** REST APIs

## 🔄 How It Works

Transaction → React Dashboard → Spring Boot REST API → Apache Kafka → Risk Engine → XGBoost ML Prediction → Risk Score & Risk Level → ALLOW / REVIEW / BLOCK → PostgreSQL

The system analyzes transaction features such as **amount, account balance, failed attempts, daily transaction count, average transaction amount, transaction distance, location, and device information** to identify suspicious activity.

## 📊 Dashboard

The dashboard provides:

- Total Transactions
- High / Medium / Low Risk Transactions
- Blocked Transactions
- Risk Distribution
- Decision Breakdown
- Recent Transactions
- Search and Filters
- Detailed AI Risk Analysis

## 📨 Kafka Integration

Apache Kafka is used for asynchronous transaction processing. The Spring Boot backend uses **Kafka Producer and Consumer services** to publish and process transaction events, allowing the risk analysis pipeline to remain decoupled and scalable.

## 📁 Project Structure

```text
RiskShield-AI/
├── frontend/              # React dashboard
├── ml/                    # XGBoost ML service
│   ├── app.py
│   ├── train_model.py
│   ├── fraud_model.pkl
│   └── fraud_detection_csv/
├── src/                   # Spring Boot backend
│   └── main/java/com/riskshield/ai/
│       ├── config/
│       ├── controller/
│       ├── model/
│       ├── repository/
│       └── service/
├── docker-compose.yml
├── pom.xml
└── README.md

⚙️ Setup
Backend
mvnw.cmd spring-boot:run
ML Service
cd ml
python app.py
Frontend
cd frontend
npm install
npm run dev
Docker Services
docker-compose up -d

🎯 Objective
The objective of RiskShield AI is to build an automated and scalable transaction risk detection system that combines Machine Learning and rule-based analysis to identify suspicious transactions and make faster, intelligent transaction decisions.

👩‍💻 Author
Rishika Nigam
AI & Backend Developer 🚀
