# RhythmRoot

RhythmRoot is a browser-based habit planner that helps users build routines, track daily progress, and stay consistent over time. The app combines habit tracking with practical planning features such as public holiday awareness and weather-based suggestions.

## Overview

RhythmRoot is designed for people who want a simple, lightweight tool for staying organized without creating an account or relying on a database. All habit data is stored locally in the browser using `localStorage`, which keeps the app easy to use and deploy.

## Key features

- Create and manage habits with categories, frequency, and notes
- Mark habits as complete for any selected date
- View streaks and weekly progress at a glance
- Search, filter, and sort habits quickly
- See upcoming public holidays for a selected country through the Nager.Date API
- Receive weather-based habit suggestions for a chosen city
- Handle loading and error states clearly for external services
- Use a responsive layout that works well on desktop and mobile screens

## Technologies used

- HTML, CSS, and JavaScript for the frontend
- Node.js and Express for the local server
- `dotenv` and `node-fetch` for environment handling and API requests
- Nager.Date API for public holidays
- A weather service for location-based suggestions

## Running locally

### Prerequisites

- Node.js installed on your machine

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ishimwe1-collab/RhythmRoot.git
   cd RhythmRoot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

- `index.html` — app layout and interface structure
- `styles.css` — visual styling and responsive design
- `app.js` — habit logic, UI updates, and API interactions
- `server.js` — local server for weather-related requests
- `tests/` — automated tests for the weather advice logic

## API notes

RhythmRoot uses two external services to support planning:

- Nager.Date for upcoming public holidays
- A weather service for city-based habit suggestions

The weather requests are handled through the local server so the frontend does not need to expose sensitive credentials directly.

## Submission information

### GitHub repository
- Repository: https://github.com/ishimwe1-collab/RhythmRoot

### Demo video
- Demo video link: Add the public video link here before submission.

### Access to Web01, Web02, and LB01
The application was developed and tested locally, but deployment to the course servers could not be completed because access to Web01, Web02, and LB01 was unavailable. The server access required for deployment was not granted, so the app could not be published on those systems during the assignment period.

## Notes

The app is intentionally lightweight and does not require a database or user authentication. Its focus is on providing a practical, accessible planning experience in a single-page web application.
