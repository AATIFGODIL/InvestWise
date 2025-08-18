import pandas as pd  
import numpy as np  
from sklearn.ensemble import GradientBoostingRegressor  
from sklearn.neighbors import KNeighborsRegressor  
from sklearn.model_selection import train_test_split  
from sklearn.preprocessing import StandardScaler  
from sklearn.metrics import r2_score  
from yahoofinancials import YahooFinancials  
from datetime import datetime, timedelta  
from tensorflow.keras import layers  
from tensorflow.keras import losses  
from tensorflow.keras import Model  
from tensorflow.keras import optimizers  
  
class PortfolioForecastService:  
    def __init__(self):  
        self.yahoo_financials = YahooFinancials()  
  
    def get_historical_data(self, symbol):  
        end_date = datetime.now().strftime('%Y-%m-%d')  
        start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')  
        historical_data = self.yahoo_financials.get_historical_price_data(start_date, end_date, 'monthly')[symbol]['prices']  
        return pd.DataFrame(historical_data)  
  
    def get_forecast_data(self, symbol, historical_data):  
        # Extract latent representations using the VAE  
        vae = self.VAE(historical_data)  
        latent_representations = vae.predict(historical_data)  
          
        # Generate synthetic stock price data using GAN  
        gan = self.GAN(latent_representations)  
        synthetic_data = gan.predict(latent_representations)  
          
        # Combine Latent Representations and Synthetic Data  
        enriched_data = np.concatenate((latent_representations, synthetic_data), axis=1)  
          
        X = enriched_data  
        y = historical_data['close']  
  
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)  
  
        scaler = StandardScaler()  
        X_train_scaled = scaler.fit_transform(X_train)  
        X_test_scaled = scaler.transform(X_test)  
  
        regressor = GradientBoostingRegressor()  
        regressor.fit(X_train_scaled, y_train)  
        y_pred = regressor.predict(X_test_scaled)  
  
        score = r2_score(y_test, y_pred)  
  
        return y_pred, score  
  
    def get_portfolio_forecast(self, portfolio):  
        forecast_data = {}  
        accuracy_scores = {}  
        for symbol in portfolio:  
            historical_data = self.get_historical_data(symbol)  
            forecast, score = self.get_forecast_data(symbol, historical_data)  
            forecast_data[symbol] = forecast  
            accuracy_scores[symbol] = score  
        return forecast_data, accuracy_scores  
  
    def VAE(self, data):  
        latent_dim = 64   
  
        class Encoder(Model):  
          def __init__(self, latent_dim):  
            super(Encoder, self).__init__()  
            self.latent_dim = latent_dim  
            self.encoder = layers.Dense(latent_dim, activation='relu')  
  
          def call(self, x):  
            encoded = self.encoder(x)  
            return encoded  
  
        class Decoder(Model):  
          def __init__(self, original_dim):  
            super(Decoder, self).__init__()  
            self.decoder = layers.Dense(original_dim, activation='sigmoid')  
  
          def call(self, x):  
            decoded = self.decoder(x)  
            return decoded  
  
        class VAE(Model):  
          def __init__(self, encoder, decoder):  
            super(VAE, self).__init__()  
            self.encoder = encoder  
            self.decoder = decoder  
  
          def call(self, x):  
            encoded = self.encoder(x)  
            decoded = self.decoder(encoded)  
            return decoded  
  
        encoder = Encoder(latent_dim)  
        decoder = Decoder(data.shape[1])  
        vae = VAE(encoder, decoder)  
  
        vae.compile(optimizer=optimizers.Adam(), loss=losses.MeanSquaredError())  
        vae.fit(data, data, epochs=10, batch_size=32)  
  
        return vae  
  
    def GAN(self, data):  
        latent_dim = 64   
  
        class Generator(Model):  
          def __init__(self, latent_dim):  
            super(Generator, self).__init__()  
            self.generator = layers.Dense(latent_dim, activation='relu')  
  
          def call(self, x):  
            generated = self.generator(x)  
            return generated  
  
        class Discriminator(Model):  
          def __init__(self):  
            super(Discriminator, self).__init__()  
            self.discriminator = layers.Dense(1)  
  
          def call(self, x):  
            validity = self.discriminator(x)  
            return validity  
  
        class GAN(Model):  
          def __init__(self, generator, discriminator):  
            super(GAN, self).__init__()  
            self.generator = generator  
            self.discriminator = discriminator  
  
          def call(self, x):  
            generated = self.generator(x)  
            validity = self.discriminator(generated)  
            return validity  
  
        generator = Generator(latent_dim)  
        discriminator = Discriminator()  
        gan = GAN(generator, discriminator)  
  
        gan.compile(optimizer=optimizers.Adam(), loss=losses.BinaryCrossentropy(from_logits=True))  
        gan.fit(data, np.ones((data.shape[0], 1)), epochs=10, batch_size=32)  
  
        return gan  
