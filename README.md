# Pixel River Financial Bank Services – Part 3

COMP-4001 · Module 5, Part 3 · Ridham Sood

## What is this?

This project runs the Pixel River Financial banking app as microservices written in two programming languages. Docker Compose starts everything, and Nginx is the single entry point on port 80.

- nginx: the front door. It sends every request to the right service.
- frontend: my student portfolio website (static HTML), in the studentportfolio folder.
- backend: the banking app and API, made with Python and Flask.
- transactions: a JavaScript (Node + Express) service that builds each user's transaction report, grouped by month.
- mongo: the MongoDB database shared by the backend and the transactions service.

## How requests are routed

- /api/transactions goes to the transactions service (JavaScript).
- Other /api/ addresses (login, register, dashboard, deposit, withdraw, logout) go to the backend (Python).
- Everything else goes to the frontend.

## How the transactions service knows who is logged in

When you log in, the Flask backend saves your user id in a signed "session" cookie. The transactions service gets the same SECRET_KEY, so it can check that cookie is genuine and read your user id from it. That is how the dashboard's View Transactions button gets your own monthly report from the JavaScript service.

## What can you do in the banking app?

- Register, log in and log out.
- See your balance on the dashboard.
- Deposit and withdraw money, decimals allowed (for example 600.45).
- Click View Transactions to see your transactions grouped by month.

Every banking page shows the heading "Pixel River Financial Bank Services".

## Folders and files

- docker-compose.yml starts all five services.
- nginx.conf tells Nginx where to send each request.
- nginx/50x.html is the branded page shown if a service is down.
- backend/ holds the Flask banking app and its tests (backend/tests).
- transactions/ holds the JavaScript transactions service.
- studentportfolio/ holds the portfolio website.
- .github/workflows/ci.yml runs the tests on GitHub every time code is pushed.

## How to run it

You need Docker Desktop open and running.

1. Open PowerShell in the part3 folder (the one with docker-compose.yml in it).
2. Run: docker compose up --build -d
3. Wait until all five containers say Started or Healthy.
4. Open http://localhost/ in your browser.
5. Click Banking App, register, log in, deposit and withdraw.
6. On the dashboard, click View Transactions.
7. While logged in, open http://localhost/api/transactions to see the JSON report from the JavaScript service.

## Useful checks

- See Nginx routing requests: docker compose logs -f nginx
- See the transactions service working: docker compose logs -f transactions
- See a user in the database: docker compose exec mongo mongosh bank_app --eval "db.users.findOne()"

## Running the tests yourself

From the backend folder, with Python 3.10:

1. pip install -r requirements.txt
2. pytest -q tests/

## Something not working?

- "Port is already allocated" for port 80: close the program using it, or change "80:80" to "8080:80" in docker-compose.yml and open http://localhost:8080/.
- /api/transactions says "Not logged in": log in to the banking app first in the same browser.
- A page says "Service temporarily unavailable": a service is still starting. Wait a few seconds and refresh.

## How to stop it

1. docker compose down -v (stops everything and deletes the saved data)
2. docker rmi $(docker images -aq) (deletes the Docker images to free up space)
