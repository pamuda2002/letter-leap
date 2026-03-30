<div align="center">
  <h1>🚀 Letter Leap</h1>
  <p><i>A muscle-memory-based, spaced-repetition spelling application.</i></p>
</div>

---

## 🌟 Features

Letter Leap is designed to help you master spelling through active recall and muscle memory. Our core mechanics include:

- **🔊 Audio Pronunciation:** Built-in Web Speech API integration helps you listen and learn.
- **⌨️ Muscle Memory Focus:** 25x typing repetition for each word to solidify correct spelling physically.
- **🧠 Spaced Repetition System (SRS):** Anki-style difficulty grading (Hard/Good/Easy) ensures optimal learning intervals.
- **🏅 Mastery Reward System:** Mark a word as "Mastered" to significantly reduce future typing reps down to 10.
- **🎯 Paced Learning:** A 10-word daily limit maintains consistency while preventing fatigue.
- **⏰ Smart Rollover:** Daily limits reset logically at 1:30 AM local time, accommodating night owls.
- **🌗 Dark Mode:** A beautifully designed dark theme context to reduce eye strain.
- **🌍 Timezone-Aware:** All dates and rollovers strictly respect the local Sri Lanka (UTC+5:30) timezone.

---

## 🛠️ Tech Stack

This project is built with modern, scalable, and beautifully designed technologies:

- **[Next.js (App Router)](https://nextjs.org/)** - The React framework for the web
- **[TypeScript](https://www.typescriptlang.org/)** - For type-safe and reliable code
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling for rapid UI development
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible and highly customizable UI components
- **[Prisma](https://www.prisma.io/)** - Next-generation Node.js and TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Powerful, open-source object-relational database

---

## 🚀 Getting Started

Follow these clear instructions to set up and run Letter Leap locally on your machine.

### 1. Clone & Install Dependencies

Clone the repository and install all required Node.js packages:

```bash
git clone <your-repo-url>
cd letter-leap
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory of the project. You'll need to provide your local PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/letter_leap_db?schema=public"
```
*(Replace `user`, `password`, and `letter_leap_db` with your actual local PostgreSQL credentials).*

### 3. Database Setup

Build the database schema and generate the required Prisma client types:

```bash
npx prisma db push
npx prisma generate
```

### 4. Seed the Database

Letter Leap comes with a hidden admin route to easily populate your database. 

1. Ensure you have your `words.txt` file placed in the expected directory (one word per line).
2. Start the development server (see step 5).
3. Open your browser and navigate to the hidden route: `http://localhost:3000/admin/seed`. This will trigger the seeding process and populate your database with words.

### 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start spelling with Letter Leap!
