"""
ML Model — GRU
Keras GRU network — lighter alternative to LSTM.
"""

import numpy as np
from typing import Dict, Optional


class GRUModel:
    def __init__(self, hyperparameters: Optional[Dict] = None):
        self.params = hyperparameters or {}
        self.model = None
        self.is_trained = False
        self.history = None

    def build(self, input_shape: tuple):
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import GRU, Dense, Dropout

        units = self.params.get("units", 64)
        dropout = self.params.get("dropout", 0.2)

        self.model = Sequential()
        self.model.add(GRU(units, return_sequences=True, input_shape=input_shape))
        self.model.add(Dropout(dropout))
        self.model.add(GRU(units // 2, return_sequences=False))
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
        }
