"""
ML — Data Preprocessor
Handles data normalization, windowing, and train/test splits.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple, List, Optional


class DataPreprocessor:
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.feature_columns: List[str] = []

    def prepare_dataframe(self, records: list, features: List[str]) -> pd.DataFrame:
        """Convert DB records to a clean DataFrame."""
        data = [{f: getattr(r, f, 0) for f in features} for r in records]
        df = pd.DataFrame(data)
        df = df.fillna(0)
        self.feature_columns = features
        return df

    def normalize(self, df: pd.DataFrame) -> np.ndarray:
        """Normalize features to [0, 1] range."""
        return self.scaler.fit_transform(df.values)

    def inverse_normalize(self, data: np.ndarray) -> np.ndarray:
        """Inverse transform normalized data."""
        return self.scaler.inverse_transform(data)

    def create_sequences(self, data: np.ndarray, window_size: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Create time-series sequences for LSTM/GRU."""
        X, y = [], []
        for i in range(len(data) - window_size):
            X.append(data[i:i + window_size])
            y.append(data[i + window_size, 0])  # Predict first feature (throughput)
        return np.array(X), np.array(y)

    def train_test_split(self, X: np.ndarray, y: np.ndarray, split: float = 0.8) -> Tuple:
        """Split data into training and testing sets."""
        split_idx = int(len(X) * split)
        return X[:split_idx], X[split_idx:], y[:split_idx], y[split_idx:]
