"""
ML — Feature Engineering
Extracts temporal and rolling features from traffic data.
"""

import pandas as pd
import numpy as np
from typing import List


class FeatureEngineer:
    @staticmethod
    def add_temporal_features(df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
        """Add time-based features."""
        if timestamp_col in df.columns:
            df["hour"] = pd.to_datetime(df[timestamp_col]).dt.hour
            df["day_of_week"] = pd.to_datetime(df[timestamp_col]).dt.dayofweek
            df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
            df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
            df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
        return df

    @staticmethod
    def add_rolling_features(df: pd.DataFrame, columns: List[str], windows: List[int] = [5, 10, 30]) -> pd.DataFrame:
        """Add rolling statistics."""
        for col in columns:
            if col in df.columns:
                for w in windows:
                    df[f"{col}_rolling_mean_{w}"] = df[col].rolling(window=w, min_periods=1).mean()
                    df[f"{col}_rolling_std_{w}"] = df[col].rolling(window=w, min_periods=1).std().fillna(0)
                    df[f"{col}_rolling_max_{w}"] = df[col].rolling(window=w, min_periods=1).max()
        return df

    @staticmethod
    def add_lag_features(df: pd.DataFrame, columns: List[str], lags: List[int] = [1, 3, 5]) -> pd.DataFrame:
        """Add lag features for time-series prediction."""
        for col in columns:
            if col in df.columns:
                for lag in lags:
                    df[f"{col}_lag_{lag}"] = df[col].shift(lag).fillna(0)
        return df

    @staticmethod
    def add_utilization_ratio(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate derived utilization metrics."""
        if "throughput" in df.columns and "byte_count" in df.columns:
            df["bytes_per_packet"] = np.where(
                df.get("packet_count", 0) > 0,
                df["byte_count"] / df["packet_count"],
                0,
            )
        if "link_utilization" in df.columns:
            df["congestion_risk"] = (df["link_utilization"] > 0.8).astype(int)
        return df
