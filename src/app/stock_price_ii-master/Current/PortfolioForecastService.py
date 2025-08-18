import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score
from yahoofinancials import YahooFinancials
from datetime import datetime, timedelta

class PortfolioForecastService:
    def __init__(self):
        self.yahoo_financials = YahooFinancials  # Initialize as a class, not instance

    def get_historical_data(self, symbol):
        try:
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
            yahoo_financials = self.yahoo_financials(symbol)
            historical_data = yahoo_financials.get_historical_price_data(start_date, end_date, 'monthly')[symbol]['prices']
            return pd.DataFrame(historical_data)
        except Exception as e:
            print(f"Error retrieving data for {symbol}: {e}")
            return pd.DataFrame()

    def get_forecast_data(self, symbol, historical_data):
        if historical_data.empty:
            return None, None

        # Convert date column to datetime format and extract timestamp
        historical_data['formatted_date'] = pd.to_datetime(historical_data['formatted_date']).apply(lambda x: x.timestamp())
        X = historical_data[['formatted_date', 'open', 'high', 'low', 'volume']]
        y = historical_data['close']

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Model 1: Gradient Boosting Regressor
        gbr = GradientBoostingRegressor()
        gbr.fit(X_train_scaled, y_train)
        y_pred_gbr = gbr.predict(X_test_scaled)
        score_gbr = r2_score(y_test, y_pred_gbr)

        # Model 2: K-Neighbors Regressor for comparison
        knr = KNeighborsRegressor()
        knr.fit(X_train_scaled, y_train)
        y_pred_knr = knr.predict(X_test_scaled)
        score_knr = r2_score(y_test, y_pred_knr)

        # Choosing the best model based on R2 score
        if score_gbr > score_knr:
            return y_pred_gbr, score_gbr
        else:
            return y_pred_knr, score_knr

    def get_portfolio_forecast(self, portfolio):
        forecast_data = {}
        accuracy_scores = {}
        for symbol in portfolio:
            historical_data = self.get_historical_data(symbol)
            forecast, accuracy = self.get_forecast_data(symbol, historical_data)
            forecast_data[symbol] = forecast
            accuracy_scores[symbol] = accuracy
        return forecast_data, accuracy_scores
