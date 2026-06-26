"""
ML Model — LSTM
Keras LSTM network for time-series traffic prediction.
"""

import numpy as np
from typing import Dict, Optional


class LSTMModel:
    def __init__(self, hyperparameters: Optional[Dict] = None):
        self.params = hyperparameters or {}
        self.model = None
        self.is_trained = False
        self.history = None

    def build(self, input_shape: tuple):
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        
        units = self.params.get("units", 64)
        dropout = self.params.get("dropout", 0.2)
        layers = self.params.get("layers", 2)

        self.model = Sequential()
        self.model.add(LSTM(units, return_sequences=(layers > 1), input_shape=input_shape))
        self.model.add(Dropout(dropout))
        for i in range(1, layers):
            return_seq = i < layers - 1
            self.model.add(LSTM(units // (2 ** i), return_sequences=return_seq))
            self.model.add(Dropout(dropout))
        self.model.add(Dense(32, activation="relu"))
        self.model.add(Dense(1))
        self.model.compile(optimizer="adam", loss="mse", metrics=["mae"])

    def train(self, X_train: np.ndarray, y_train: np.ndarray, X_val=None, y_val=None, epochs: int = 50):
        if self.model is None:
            self.build(input_shape=(X_train.shape[1], X_train.shape[2]))
        validation_data = (X_val, y_val) if X_val is not None else None
        self.history = self.model.fit(
            X_train, y_train, epochs=epochs, batch_size=self.params.get("batch_size", 32),
            validation_data=validation_data, verbose=0,
        )
        self.is_trained = True
        return self.history

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X, verbose=0).flatten()

    def save(self, path: str):
        self.model.save(path)

    def load(self, path: str):
        from tensorflow.keras.models import load_model
        self.model = load_model(path)
        self.is_trained = True

    def get_training_history(self) -> Dict:
        if self.history is None:
            return {}
        return {
            "loss": [float(v) for v in self.history.history.get("loss", [])],
            "val_loss": [float(v) for v in self.history.history.get("val_loss", [])],
            "mae": [float(v) for v in self.history.history.get("mae", [])],
        }
