Bumi — Small Acts, Big Impact

Bumi is a mobile-first environmental companion application built with React Native and Expo. The app gamifies sustainability by tracking eco-friendly actions, visualizing personal and collective impact, and fostering community engagement.
Users earn points for daily habits, compete on leaderboards, and watch their “Impact Tree” grow as they contribute to global environmental goals.

Core Principle: Every actions matters, each small action compounds into measurable, shared progress toward planetary health.

Tech Stack:
Node.js (express)
PostgreSQL (Prisma ORM)
Supabase

1. Clone the Repository
git clone https://github.com/yourusername/bumi.git
cd bumi

2. Install Dependencies
npm install

3. Set Up Environment Variables
Create a .env file in the root directory and define your configuration values. Please see the details on file:
.env.example

4. Generate Prisma Client
npx prisma generate

5. Run Database Migrations
npx prisma migrate dev --name init

6. Start Development Server
npm run dev

Server will run at: http://localhost:8000

LICENSE!
Licensed under the Apache License 2.0.
You may use, distribute, and modify this project, provided you give proper credit and include the original license notice.

For further details please look at the LICENSE file.
