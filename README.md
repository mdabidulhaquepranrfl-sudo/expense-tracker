# Modern Expense Tracker

A modern, full-stack Expense Tracker web application designed to help you manage your personal finances with a beautiful, responsive, and dynamic UI.

## Tech Stack
- **Backend:** Laravel 12
- **Frontend:** React 18, Inertia.js, Tailwind CSS (Dark Mode/Glassmorphism design)
- **Database:** SQLite (default)
- **Charts:** Chart.js & react-chartjs-2

## Requirements
Before you begin, ensure you have the following installed:
- **PHP:** `^8.2` or higher
- **Composer:** Latest version
- **Node.js:** `v18.x` or higher
- **NPM:** Latest version

## Database
This project uses **SQLite** by default for simplicity and portability. The database file will be automatically created at `database/database.sqlite` when you run the setup/migration commands. You do not need to install MySQL/PostgreSQL unless you wish to switch.

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install PHP Dependencies:**
   ```bash
   composer install
   ```

3. **Install NPM Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**
   Copy the example environment file and generate an application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database Setup:**
   Create the database file and run the migrations (with seeders for default expense categories):
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```

6. **Build Frontend Assets:**
   Compile the React components and Tailwind CSS styles:
   ```bash
   npm run build
   # Or for active development: npm run dev
   ```

7. **Start the Development Server:**
   Start the Laravel local development server:
   ```bash
   php artisan serve
   ```

You can now access the application at `http://localhost:8000`.

---
*Built with ❤️ using Laravel and React.*
