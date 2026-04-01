# Backend - Inventory Management System

This directory contains the server-side code for the Inventory Management System. It primarily uses `json-server` to provide a fake REST API based on the `db.json` file.

## Technologies Used

- Node.js
- `json-server` (for creating a fake REST API)

## Setup and Running Locally

1.  **Install Dependencies:**
    Navigate to the `backend` directory and install the necessary Node.js packages:
    ```bash
    cd backend
    npm install
    ```

2.  **Start the JSON Server:**
    Once dependencies are installed, you can start the JSON server:
    ```bash
    npm start
    ```
    This will typically start the server on `http://localhost:3000` (or another port if 3000 is in use), serving your `db.json` file as a REST API.

## API Endpoints

The `db.json` file defines the data structure and available endpoints. Common endpoints will include:

- `/products`
- `/categories`
- `/suppliers`
- `/orders`

Refer to the `json-server` documentation for more details on interacting with the API.
