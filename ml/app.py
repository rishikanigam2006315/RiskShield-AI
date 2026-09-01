import joblib
import pandas as pd

from fastapi import FastAPI
from pydantic import BaseModel


# Load trained model
model = joblib.load("fraud_model.pkl")


app = FastAPI(
    title="RiskShield ML Service",
    version="1.0"
)


class TransactionRequest(BaseModel):

    Transaction_Amount: float
    Account_Balance: float
    IP_Address_Flag: int
    Previous_Fraudulent_Activity: int
    Daily_Transaction_Count: int
    Avg_Transaction_Amount_7d: float
    Failed_Transaction_Count_7d: int
    Card_Age: int
    Transaction_Distance: float
    Is_Weekend: int

    Transaction_Type: str
    Device_Type: str
    Location: str
    Merchant_Category: str
    Card_Type: str
    Authentication_Method: str


@app.get("/")
def home():

    return {
        "status": "UP",
        "service": "RiskShield ML Service"
    }


@app.post("/predict")
def predict(transaction: TransactionRequest):

    data = [[
        transaction.Transaction_Amount,
        transaction.Account_Balance,
        transaction.IP_Address_Flag,
        transaction.Previous_Fraudulent_Activity,
        transaction.Daily_Transaction_Count,
        transaction.Avg_Transaction_Amount_7d,
        transaction.Failed_Transaction_Count_7d,
        transaction.Card_Age,
        transaction.Transaction_Distance,
        transaction.Is_Weekend,
        transaction.Transaction_Type,
        transaction.Device_Type,
        transaction.Location,
        transaction.Merchant_Category,
        transaction.Card_Type,
        transaction.Authentication_Method
    ]]

    columns = [
        "Transaction_Amount",
        "Account_Balance",
        "IP_Address_Flag",
        "Previous_Fraudulent_Activity",
        "Daily_Transaction_Count",
        "Avg_Transaction_Amount_7d",
        "Failed_Transaction_Count_7d",
        "Card_Age",
        "Transaction_Distance",
        "Is_Weekend",
        "Transaction_Type",
        "Device_Type",
        "Location",
        "Merchant_Category",
        "Card_Type",
        "Authentication_Method"
    ]

    df = pd.DataFrame(data, columns=columns)

    probability = model.predict_proba(df)[0][1]

    prediction = int(probability >= 0.5)

    return {
        "fraud_probability": float(probability),
        "prediction": prediction,
        "is_fraud": prediction == 1
    }