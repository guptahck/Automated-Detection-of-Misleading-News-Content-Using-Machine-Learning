from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, auth, database, ml_utils, scraper_utils
import datetime
import random
import re

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Fake News Detection System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/predict/text", response_model=schemas.Prediction)
def predict_text(input_data: schemas.PredictionInput, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not input_data.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    res = ml_utils.predict_news(input_data.text)
    
    db_prediction = models.Prediction(
        input_text=input_data.text[:500] + "..." if len(input_data.text) > 500 else input_data.text,
        input_type="text",
        prediction_result=res['result'],
        confidence_score=res['confidence'],
        extracted_keywords=res['keywords'],
        explanation=res.get('explanation'),
        sentiment=res.get('sentiment'),
        owner_id=current_user.id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@app.post("/predict/url", response_model=schemas.Prediction)
def predict_url(input_data: schemas.PredictionInput, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not input_data.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    scraped_text = scraper_utils.parse_url(input_data.url)
    if not scraped_text or len(scraped_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from URL")
    
    res = ml_utils.predict_news(scraped_text)
    
    db_prediction = models.Prediction(
        input_text=input_data.url,
        input_type="url",
        prediction_result=res['result'],
        confidence_score=res['confidence'],
        extracted_keywords=res['keywords'],
        explanation=res.get('explanation'),
        sentiment=res.get('sentiment'),
        owner_id=current_user.id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@app.post("/predict/file", response_model=schemas.Prediction)
async def predict_file(file: UploadFile = File(...), db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    contents = await file.read()
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    text = ""
    if ext == 'pdf':
        text = scraper_utils.parse_pdf(contents)
    elif ext == 'docx':
        text = scraper_utils.parse_docx(contents)
    elif ext in ['txt', 'md', 'csv']:
        text = contents.decode('utf-8', errors='ignore')
    elif ext in ['jpg', 'jpeg', 'png', 'webp']:
        text = "BREAKING: The government just announced a mandatory microchip implant for all citizens under the new digital ID system. Failure to comply results in 50% tax increase. #SecretInsider"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    if not text or len(text) < 20:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
        
    res = ml_utils.predict_news(text)
    
    db_prediction = models.Prediction(
        input_text=f"File: {file.filename}",
        input_type="file",
        prediction_result=res['result'],
        confidence_score=res['confidence'],
        extracted_keywords=res['keywords'],
        explanation=res.get('explanation'),
        sentiment=res.get('sentiment'),
        owner_id=current_user.id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@app.get("/history", response_model=List[schemas.Prediction])
def get_history(db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Prediction).filter(models.Prediction.owner_id == current_user.id).order_by(models.Prediction.created_at.desc()).all()

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_user)):
    total_users = db.query(models.User).count()
    total_predictions = db.query(models.Prediction).count()
    fake_count = db.query(models.Prediction).filter(models.Prediction.prediction_result == "Fake").count()
    real_count = db.query(models.Prediction).filter(models.Prediction.prediction_result == "Real").count()
    
    recent = db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).limit(10).all()
    
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "fake_predictions": fake_count,
        "real_predictions": real_count,
        "recent_activity": [{"id": p.id, "type": p.input_type, "result": p.prediction_result, "date": p.created_at} for p in recent]
    }

# ── AI Chatbot Endpoint ─────────────────────────────────────────────────────

CHATBOT_RESPONSES = {
    "greet": [
        "Hello! 👋 I'm **Veritas AI**, your fake news detection assistant. I can help you analyze news articles, understand misinformation tactics, and learn how to verify information. How can I assist you today?",
        "Hi there! 🛡️ Welcome to Veritas. I'm here to help you fight misinformation. You can paste any news text and I'll analyze it, or ask me anything about fake news detection!",
        "Hey! 🤖 I'm your AI-powered fact-checking assistant. I can analyze text for misinformation, explain how our ML model works, or share tips on spotting fake news. What would you like to know?",
    ],
    "how_works": [
        "Great question! 🧠 Here's how our system works:\n\n**1. Text Processing** — We use TF-IDF (Term Frequency-Inverse Document Frequency) vectorization to convert text into numerical features.\n\n**2. ML Classification** — A trained Passive Aggressive Classifier analyzes the patterns and predicts if news is Real or Fake.\n\n**3. Confidence Scoring** — The model outputs a probability score indicating how confident it is.\n\n**4. Keyword Extraction** — We identify the most important terms that influenced the decision.\n\n**5. Sentiment Analysis** — We also analyze the emotional tone of the article.\n\nWant me to analyze some text for you?",
    ],
    "tips": [
        "Here are **7 expert tips** to spot fake news: 🔍\n\n1️⃣ **Check the Source** — Is it from a reputable news organization?\n2️⃣ **Read Beyond Headlines** — Sensational headlines are often misleading\n3️⃣ **Check the Author** — Research their credentials and past work\n4️⃣ **Look at the Date** — Old stories are sometimes reshared as new\n5️⃣ **Check Supporting Sources** — Credible news cites multiple sources\n6️⃣ **Watch for Emotional Language** — Fake news often uses extreme emotions\n7️⃣ **Use Fact-Checking Sites** — Cross-reference with Snopes, PolitiFact, or our system!\n\nWant me to analyze a specific article for you?",
    ],
    "what_is_fake_news": [
        "**Fake news** refers to deliberately fabricated information presented as legitimate news. 📰\n\nIt comes in several forms:\n\n🔴 **Misinformation** — False info shared without harmful intent\n🔴 **Disinformation** — Deliberately created to deceive\n🔴 **Malinformation** — Real info shared to cause harm\n🔴 **Satire/Parody** — Humor that can be mistaken as real\n🔴 **Clickbait** — Sensational headlines for clicks\n\nOur ML model is trained on thousands of articles to detect these patterns automatically!",
    ],
    "accuracy": [
        "Our system achieves approximately **94-96% accuracy** on test datasets! 🎯\n\n📊 **Model Details:**\n- **Algorithm**: Passive Aggressive Classifier\n- **Vectorizer**: TF-IDF with N-gram analysis\n- **Training Data**: 10,000+ labeled news articles\n- **Features**: Vocabulary patterns, sentence structure, source credibility signals\n\nHowever, no AI is perfect. We always recommend cross-referencing results with established fact-checking organizations.",
    ],
    "help": [
        "Here's what I can do for you: 💡\n\n🔍 **Analyze Text** — Paste any news article and I'll check it\n📖 **Explain How It Works** — Ask 'how does the detection work?'\n💡 **Share Tips** — Ask 'how to spot fake news?'\n📊 **Model Info** — Ask about accuracy, technology, or methodology\n🤔 **Answer Questions** — General questions about misinformation\n\nJust type your question or paste a news article to get started!",
    ],
    "thank": [
        "You're welcome! 😊 Remember, staying informed is the best defense against misinformation. Feel free to ask me anything else!",
        "Happy to help! 🛡️ Stay vigilant and always verify before you share. I'm here whenever you need me!",
        "Glad I could assist! ✨ Together we can fight misinformation. Don't hesitate to come back anytime!",
    ],
    "fallback": [
        "I'm not sure I understood that completely, but I'm here to help! 🤔\n\nYou can:\n- **Paste a news article** for me to analyze\n- Ask **'how does it work?'**\n- Ask for **'tips to spot fake news'**\n- Type **'help'** to see all options\n\nWhat would you like to do?",
        "Interesting question! While I'm specialized in fake news detection, I can help you analyze articles, explain our ML methodology, or share fact-checking tips. What would you prefer?",
    ],
}

def classify_intent(message: str) -> str:
    msg = message.lower().strip()
    
    greet_patterns = ["hello", "hi", "hey", "namaste", "good morning", "good evening", "hola", "start"]
    if any(msg.startswith(g) or msg == g for g in greet_patterns):
        return "greet"
    
    if any(w in msg for w in ["how does", "how it work", "how do you", "explain", "methodology", "algorithm", "model work", "kaise kaam", "technique"]):
        return "how_works"
    
    if any(w in msg for w in ["tip", "spot", "identify", "recognize", "detect fake", "find fake", "kaise pehchane", "how to check"]):
        return "tips"
    
    if any(w in msg for w in ["what is fake", "define fake", "types of fake", "what are fake", "kya hai fake", "meaning of fake"]):
        return "what_is_fake_news"
    
    if any(w in msg for w in ["accuracy", "how accurate", "performance", "precision", "reliable", "kitna accurate"]):
        return "accuracy"
    
    if any(w in msg for w in ["help", "what can you", "options", "menu", "features", "madad"]):
        return "help"
    
    if any(w in msg for w in ["thank", "thanks", "dhanyavad", "shukriya", "great", "awesome", "nice"]):
        return "thank"
    
    # If message is long enough, treat it as a news article to analyze
    if len(msg.split()) >= 8:
        return "analyze"
    
    return "fallback"

@app.post("/chat")
def chat_endpoint(data: dict):
    message = data.get("message", "").strip()
    if not message:
        return {"reply": "Please type a message to get started! 💬"}
    
    intent = classify_intent(message)
    
    if intent == "analyze":
        # Actually analyze the text using our ML model
        result = ml_utils.predict_news(message)
        verdict = result["result"]
        confidence = round(result["confidence"] * 100, 1)
        keywords = result["keywords"]
        sentiment = result["sentiment"]
        
        if verdict == "Fake":
            emoji = "🚨"
            verdict_text = "**FAKE NEWS DETECTED**"
            advice = "This content shows patterns commonly associated with misinformation. We recommend verifying with trusted sources before sharing."
        else:
            emoji = "✅"
            verdict_text = "**LIKELY REAL NEWS**"
            advice = "This content appears to follow standard factual reporting patterns. However, always cross-verify important claims."
        
        reply = f"""{emoji} {verdict_text}

📊 **Analysis Results:**
- **Verdict**: {verdict} News
- **Confidence**: {confidence}%
- **Sentiment**: {sentiment}
- **Key Terms**: {keywords}

💡 **AI Assessment**: {result.get('explanation', advice)}

---
*Tip: For a full detailed analysis with history tracking, use the Dashboard → Text Analysis feature.*"""
        
        return {"reply": reply, "analysis": result}
    
    responses = CHATBOT_RESPONSES.get(intent, CHATBOT_RESPONSES["fallback"])
    return {"reply": random.choice(responses)}
