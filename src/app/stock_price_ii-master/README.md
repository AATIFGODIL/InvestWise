# Stock Prediction AI (Python)

This directory contains the Python-based AI model for stock prediction. To use it with the InvestWise application, you must run it as a local API server.

## Setup Instructions

### 1. Install Dependencies
First, you need to install all the required Python packages, including TensorFlow, Keras, and Flask.

Open your terminal and run this command from the root of your project:
```bash
pip install -r src/app/stock_price_ii-master/requirements.txt
```

### 2. Run the API Server
Once the dependencies are installed, you can start the local API server. This server makes your Python model available to the Next.js application.

Run this command from the root of your project:
```bash
python src/app/stock_price_ii-master/api.py
```
You should see output indicating that the server is running on `http://127.0.0.1:8000`.

**Important:** You must keep this terminal window open and the server running for the "AI Stock Prediction" feature to work in the InvestWise web application.
