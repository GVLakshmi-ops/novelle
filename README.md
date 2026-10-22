
# Novelle 📚

**A personalized reading platform for tracking reading activity and discovering insights about your reading habits.**

Novelle is a reading-focused application designed to bring reading activity and personal reading statistics into one place. It aims to make it easier to organize a reading journey across books, fiction platforms, and articles.

## Features

- **Reading Activity:** A centralized place to track reading-related activity.
- **Reading Statistics:** Explore personal reading habits and progress.
- **Authentication:** Supabase-based account registration and login.
- **Demo Mode:** Explore the application using sample data.
- **Reading Insights:** AI-assisted and activity-based features, depending on backend configuration.

> **Note:** Some features may require additional backend services, API credentials, and configuration before they work in a deployed environment.

## Tech Stack

- React
- TypeScript
- Vite
- Supabase Authentication
- CSS and frontend web technologies

## Getting Started

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/novelle.git
cd novelle
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root, alongside `package.json`.

Configure the following variables with values from your own services:

```dotenv
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
```

Use a Supabase publishable key or legacy anon key for browser authentication. **Never expose a Supabase secret or `service_role` key in frontend code.**

Other integrations, such as AI features, may require additional environment variables. Configure secret API keys on the server or in the relevant deployment environment rather than exposing them to the browser.

### Run Locally

Start the development server:

```bash
npm run dev
```

Follow the local URL printed in the terminal.

### Production Build

Build the frontend for production:

```bash
npm run build
```

Vite generates the production build in the `dist` directory.

## Deployment

Novelle can be deployed using [Vercel](https://vercel.com/).

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Select Vite as the framework if it is not detected automatically.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure the required environment variables in Vercel.
7. Deploy and test authentication and application features.

Supabase authentication must be configured separately in the Supabase dashboard, including the appropriate site URL and redirect URLs.

## Project Status

Novelle is an evolving personal reading platform. Authentication, integrations, and backend-dependent features should be tested in the target deployment environment before being considered production-ready.

## Security

- Do not commit `.env` files or private API credentials.
- Use publishable/anon keys only where browser-side access is intended.
- Protect private data using appropriate Supabase Row Level Security (RLS) policies.
- Keep secret API keys in a secure server-side environment.

## License

No license has been specified yet. All rights reserved unless a license is added to this repository.
