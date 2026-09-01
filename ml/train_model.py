import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score
)

from xgboost import XGBClassifier


# =================================
# 1. LOAD DATASET
# =================================

DATA_PATH = "fraud_detection_csv/synthetic_fraud_dataset.csv"

df = pd.read_csv(DATA_PATH)


# =================================
# 2. FEATURES
# =================================

numerical_features = [
    "Transaction_Amount",
    "Account_Balance",
    "IP_Address_Flag",
    "Previous_Fraudulent_Activity",
    "Daily_Transaction_Count",
    "Avg_Transaction_Amount_7d",
    "Failed_Transaction_Count_7d",
    "Card_Age",
    "Transaction_Distance",
    "Is_Weekend"
]

categorical_features = [
    "Transaction_Type",
    "Device_Type",
    "Location",
    "Merchant_Category",
    "Card_Type",
    "Authentication_Method"
]

features = numerical_features + categorical_features

target = "Fraud_Label"

X = df[features]
y = df[target]


# =================================
# 3. TRAIN / TEST SPLIT
# =================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("=================================")
print("TRAIN / TEST SPLIT")
print("=================================")

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# =================================
# 4. ENCODING
# =================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# =================================
# 5. XGBOOST MODEL
# =================================

model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42
)


# =================================
# 6. PIPELINE
# =================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# =================================
# 7. TRAIN
# =================================

print("\n=================================")
print("TRAINING XGBOOST MODEL")
print("=================================")

pipeline.fit(X_train, y_train)

print("Training completed!")

# =================================
# SAVE MODEL
# =================================

MODEL_PATH = "fraud_model.pkl"

joblib.dump(pipeline, MODEL_PATH)

print("\n=================================")
print("MODEL SAVED")
print("=================================")
print("Model saved as:", MODEL_PATH)


# =================================
# 8. PREDICTIONS
# =================================

y_pred = pipeline.predict(X_test)

y_probability = pipeline.predict_proba(X_test)[:, 1]


# =================================
# 9. EVALUATION
# =================================

print("\n=================================")
print("MODEL EVALUATION")
print("=================================")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nROC-AUC Score:")
print(roc_auc_score(y_test, y_probability))

# =================================
# 10. THRESHOLD ANALYSIS
# =================================

print("\n=================================")
print("THRESHOLD ANALYSIS")
print("=================================")

thresholds = [0.5, 0.4, 0.3, 0.2, 0.1]

for threshold in thresholds:

    predictions = (y_probability >= threshold).astype(int)

    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    print(
        f"Threshold: {threshold:.1f} | "
        f"Precision: {precision:.3f} | "
        f"Recall: {recall:.3f} | "
        f"F1: {f1:.3f}"
    )