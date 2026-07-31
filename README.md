# RhythmRoot

RhythmRoot is a practical, browser-based habit planner and consistency tracker. It helps people create small routines, keep a daily record, see active streaks and weekly completion rates, and plan around upcoming public holidays.

**Live site:** (https://ishimwe1-collab.github.io/RhythmRoot/)

**Demo video:** Add the public video link before submission.

## Features

- Create habits with a category, frequency (daily or weekdays), and a personal reminder.
- Mark habits completed for any selected day. The app calculates a current streak and this week's completion rate.
- Search habits by name or category; filter by today’s status; sort by date, streak, or name.
- Select a different date to review or update a past day.
- Keep data private in the browser with `localStorage`; no account or database is needed.
- Fetch and present the next public holidays for a chosen country using the Nager.Date API. This supports practical habit planning when a routine may change.
- Show user-friendly loading, empty, validation, and external-API error states.
- Responsive interface for desktop and mobile screens.

## API credit and security

RhythmRoot uses the [Nager.Date public holiday API](https://date.nager.at/), specifically its `PublicHolidays/{year}/{countryCode}` endpoint. The API is called by the browser using HTTPS. It is a public, no-key API, so RhythmRoot does not require, store, or expose any API keys or credentials.

The application creates UI content with DOM APIs and `textContent`, rather than inserting user-provided text as HTML. This reduces the risk of script injection from habit names and notes.

## Run locally

This is a static HTML, CSS, and JavaScript project—there are no package dependencies.

1. Clone the repository:
   ```bash
   git clone https://github.com/ishimwe1-collab/RhythmRoot.git
   cd RhythmRoot
   ```
2. Serve the files locally. For example, with Python 3:
   ```bash
   python3 -m http.server 8080
   ```
3. Open [http://localhost:8080](http://localhost:8080) in a browser.

> Opening `index.html` directly may work, but a local web server is recommended because the holiday API is fetched over the network.

## Deploy to Web01 and Web02

Replace the placeholder host names, usernames, paths, and domain/IP addresses below with the credentials supplied for the course. Do **not** put passwords or private SSH keys in this repository.

### 1. Copy the site to both web servers

From your local project folder, copy only the public site files to each web server:

```bash
scp index.html styles.css app.js YOUR_USER@WEB01_HOST:/tmp/rhythmroot/
scp index.html styles.css app.js YOUR_USER@WEB02_HOST:/tmp/rhythmroot/
```

On **Web01**, then repeat exactly on **Web02**:

```bash
sudo mkdir -p /var/www/rhythmroot
sudo cp /tmp/rhythmroot/index.html /tmp/rhythmroot/styles.css /tmp/rhythmroot/app.js /var/www/rhythmroot/
sudo chown -R www-data:www-data /var/www/rhythmroot
```

If the servers use `nginx`, create `/etc/nginx/sites-available/rhythmroot` on each server:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/rhythmroot;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and verify it on each web server:

```bash
sudo ln -s /etc/nginx/sites-available/rhythmroot /etc/nginx/sites-enabled/rhythmroot
sudo nginx -t
sudo systemctl reload nginx
curl -I http://localhost
```

Then visit `http://WEB01_HOST` and `http://WEB02_HOST` separately. Both should load the same RhythmRoot page.

### 2. Configure Lb01

On **Lb01**, configure Nginx to forward traffic to both web servers. In `/etc/nginx/sites-available/rhythmroot-lb`, use the actual private or reachable IP addresses for Web01 and Web02:

```nginx
upstream rhythmroot_servers {
    server WEB01_PRIVATE_IP:80;
    server WEB02_PRIVATE_IP:80;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://rhythmroot_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/rhythmroot-lb /etc/nginx/sites-enabled/rhythmroot-lb
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Test the load balancer

1. Open `http://LB01_HOST` in a browser and create/complete a sample habit.
2. Reload several times and verify the page remains available.
3. Optionally monitor Web01 and Web02 access logs while requesting the Lb01 URL:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```
   Requests should appear across both backend servers.
4. Record the Lb01 URL in the **Live site** field at the top of this README.

## Challenges and solutions

- **Keeping personal data without a backend:** RhythmRoot uses browser `localStorage`, so habits remain on the user’s device and the static app can be deployed safely on multiple servers.
- **External-service reliability:** the holiday panel provides a useful loading message and a readable error if Nager.Date is unavailable; core habit tracking continues to work.
- **Avoiding a single web-server failure:** deploying the identical static application to Web01 and Web02, then routing through Lb01, provides redundant delivery.

## Two-minute demo outline

1. Open the app locally; add a habit, explain its category and reminder. (0:00–0:25)
2. Complete it and point out the daily progress, streak, and weekly rate. (0:25–0:45)
3. Demonstrate search/filter/sort and select another date. (0:45–1:10)
4. Change the country or show the holiday planner, explaining the Nager.Date integration. (1:10–1:30)
5. Open the Lb01 URL, explain that the same app runs on Web01 and Web02 behind the load balancer, and show it working. (1:30–2:00)

## Submission notes

To make your assignment submission clearer, include the following in your submission:
- GitHub repository link
- Live deployment URL once the load balancer is configured
- Demo video link
- A short explanation that the app uses a real external API and that API keys are not needed because the holiday service is public

## Repository contents

- `index.html` — accessible application structure.
- `styles.css` — responsive visual design.
- `app.js` — habit tracking, browser storage, interaction controls, validation, error handling, and API integration.
