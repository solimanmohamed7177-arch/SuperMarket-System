# 🛒 SuperMarket Management System

A full-stack supermarket management system designed to simplify daily store operations, including inventory tracking, sales processing, customer management, and reporting.

## ✨ Features

- **Dashboard** — Overview of supermarket operations.
- **Product Management** — Manage products and categories.
- **Inventory Management** — Track stock and inventory movements.
- **Point of Sale (POS)** — Handle sales and sales returns.
- **Customer Management** — Manage customer records and loyalty programs.
- **Employee Management** — Organize employee information and roles.
- **Supplier Management** — Manage suppliers and purchase orders.
- **Discounts** — Manage product discounts.
- **Shifts** — Support shift management.
- **Reports** — Access business and sales reports.

## 🛠️ Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

**Frontend**
- HTML5
- CSS3
- JavaScript

**Database**
- PostgreSQL

## 📁 Project Structure

```text
SuperMarket-System/
├── backend/
│   ├── app/
│   ├── run.py
│   └── .env
├── Frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   └── js/
│   └── pages/
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites

Make sure you have installed:

- Python 3.10+
- PostgreSQL
- Git

### 2. Clone the Repository

```bash
git clone https://github.com/solimanmohamed7177-arch/SuperMarket-System.git
cd SuperMarket-System
```

### 3. Set Up the Backend

Create and activate a virtual environment from the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

Create a PostgreSQL database named `SuperMarketDB` if it does not already exist.

Create a `.env` file inside the `backend` directory and configure your local database connection:

```env
DB_SERVER=localhost
DB_PORT=5432
DB_NAME=SuperMarketDB
DB_USER=postgres
DB_PASSWORD=your_local_password

SECRET_KEY=replace_with_a_secure_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

APP_NAME=SuperMarket MS
APP_VERSION=1.0.0
DEBUG=True

ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000
```

Replace the example password and secret with your own local values. Never commit your `.env` file.

### 4. Run the Backend

From the `backend` directory:

```powershell
python run.py
```

The API will be available at:

- API: http://localhost:8000
- Interactive API documentation: http://localhost:8000/docs

### 5. Run the Frontend

Open a second terminal from the project root:

```powershell
python -m http.server 5500 --directory Frontend
```

Then open:

http://localhost:5500

## 🔐 Security Notes

- Keep credentials and secret keys in your local `.env` file.
- Do not commit passwords, API keys, or production configuration.
- Use a strong secret key and disable debug mode in production.

## 🚧 Project Status

The backend and frontend have been run locally. Further testing and improvements may be needed before production deployment.

## 👨‍💻 Author

**Soliman**

GitHub: [@solimanmohamed7177-arch](https://github.com/solimanmohamed7177-arch)

---

If you find this project useful, feel free to explore the repository and share feedback.
