"""
ML Model — XGBoost
XGBRegressor wrapper for network traffic prediction.
"""

import joblib
import numpy as np
from xgboost import XGBRegressor
from typing import Dict, Optional


class XGBoostModel:
    def __init__(self, hyperparameters: Optional[Dict] = None):
        params = hyperparameters or {}
        self.model = XGBRegressor(
            n_estimators=params.get("n_estimators", 200),
            max_depth=params.get("max_depth", 8),
            learning_rate=params.get("learning_rate", 0.05),
            subsample=params.get("subsample", 0.8),
            colsample_bytree=params.get("colsample_bytree", 0.8),
            reg_alpha=params.get("reg_alpha", 0.1),
            reg_lambda=params.get("reg_lambda", 1.0),
            random_state=42,
            n_jobs=-1,
        )
        self.is_trained = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray, X_val=None, y_val=None):
        if len(X_train.shape) == 3:
            X_train = X_train.reshape(X_train.shape[0], -1)
        eval_set = None
        if X_val is not None:
            if len(X_val.shape) == 3:
                X_val = X_val.reshape(X_val.shape[0], -1)
            eval_set = [(X_val, y_val)]
        self.model.fit(X_train, y_train, eval_set=eval_set, verbose=False)
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
