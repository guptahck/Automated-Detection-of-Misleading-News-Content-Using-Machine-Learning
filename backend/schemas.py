from pydantic import BaseModel
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class PredictionBase(BaseModel):
    input_text: str
    input_type: str

class PredictionCreate(PredictionBase):
    pass

class Prediction(PredictionBase):
    id: int
    prediction_result: str
    confidence_score: float
    extracted_keywords: str
    explanation: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime.datetime
    owner_id: int

    class Config:
        from_attributes = True

class PredictionInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
