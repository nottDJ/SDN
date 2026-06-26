"""
ML Model — Random Forest
Scikit-learn RandomForestRegressor wrapper.
"""

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, Optional


class RandomForestModel:
    def __init__(self, hyperparameters: Optional[Dict] = None):
        params = hyperparameters or {}
        self.model = RandomForestRegressor(
            n_estimators=params.get("n_estimators", 100),
            max_depth=params.get("max_depth", 15),
            min_samples_split=params.get("min_samples_split", 5),
            min_samples_leaf=params.get("min_samples_leaf", 2),
            random_state=42,
            n_jobs=-1,
        )
        self.is_trained = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        if len(X_train.shape) == 3:
            X_train = X_train.reshape(X_train.shape[0], -1)
        self.model.fit(X_train, y_train)
        self.is_trained = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        if len(X.shape) == 3:
            X = X.reshape(X.shape[0], -1)
        return self.model.predict(X)

    def get_feature_importance(self) -> np.ndarray:
        return self.model.feature_importances_

    def save(self, path: str):
        joblib.dump(self.model, path)

    def load(self, path: str):
        self.model = joblib.load(path)
        self.is_trained = True
