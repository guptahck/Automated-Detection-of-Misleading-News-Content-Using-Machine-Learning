"""
Fake News Detection — Model Training Pipeline
================================================
Trains 3 classifiers, compares them, saves the best model and
exports metrics to model_metrics.json for the frontend dashboard.

Models:
  1. Logistic Regression
  2. Multinomial Naive Bayes
  3. Passive Aggressive Classifier

Usage:
  python train_model.py
"""

import pickle
import os
import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, PassiveAggressiveClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

_DIR = os.path.dirname(os.path.abspath(__file__))

# ── NLP Preprocessing ─────────────────────────────────────────────────────────
STOP_WORDS = {
    "i","me","my","myself","we","our","ours","ourselves","you","your","yours",
    "yourself","yourselves","he","him","his","himself","she","her","hers",
    "herself","it","its","itself","they","them","their","theirs","themselves",
    "what","which","who","whom","this","that","these","those","am","is","are",
    "was","were","be","been","being","have","has","had","having","do","does",
    "did","doing","a","an","the","and","but","if","or","because","as","until",
    "while","of","at","by","for","with","about","against","between","through",
    "during","before","after","above","below","to","from","up","down","in",
    "out","on","off","over","under","again","further","then","once","here",
    "there","when","where","why","how","all","both","each","few","more","most",
    "other","some","such","no","nor","not","only","own","same","so","than",
    "too","very","s","t","can","will","just","don","should","now","d","ll",
    "m","o","re","ve","y","ain","aren","couldn","didn","doesn","hadn","hasn",
    "haven","isn","ma","mightn","mustn","needn","shan","shouldn","wasn",
    "weren","won","wouldn",
}

def preprocess_text(text: str) -> str:
    """Clean and normalize text for ML pipeline."""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)       # remove URLs
    text = re.sub(r'<.*?>', '', text)                         # remove HTML
    text = re.sub(r'[^a-z\s]', ' ', text)                    # keep letters only
    text = re.sub(r'\s+', ' ', text).strip()                  # collapse whitespace
    words = text.split()
    words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    return ' '.join(words)


# ── Dataset ────────────────────────────────────────────────────────────────────
# Labels: 1 = Fake, 0 = Real
TEXTS_LABELS = [

    # ════════════════════════════════════════════════════════════════════
    # FAKE NEWS SAMPLES (label = 1) — ~200 samples
    # ════════════════════════════════════════════════════════════════════

    # Classic conspiracy / health misinformation
    ("The earth is flat and scientists have been lying to us for centuries.", 1),
    ("Aliens landed in New York last night and shook hands with the mayor.", 1),
    ("Drinking bleach will cure you of all known diseases instantly.", 1),
    ("A local man found a unicorn in his backyard and is keeping it as a pet.", 1),
    ("New study shows that sleeping 24 hours a day makes you immortal.", 1),
    ("Government to replace all birds with surveillance drones by 2025.", 1),
    ("Scientists discover a planet made entirely of chocolate.", 1),
    ("Time travel possible using a standard kitchen microwave.", 1),
    ("NASA admits the moon landing was filmed in a Hollywood studio.", 1),
    ("5G towers are spreading a virus that turns people into zombies.", 1),
    ("Bill Gates is injecting microchips into COVID-19 vaccines.", 1),
    ("World leaders are secretly lizard people living underground.", 1),
    ("Eating onions daily will make you invisible, claims mysterious doctor.", 1),
    ("Ancient Egyptians had smartphones and WiFi, new findings suggest.", 1),
    ("Scientists prove the sun will explode tomorrow and governments are hiding it.", 1),
    ("New pill lets you live without sleep for the rest of your life.", 1),
    ("Chocolate is now considered a vegetable by the World Health Organization.", 1),
    ("Scientists confirm moon is made of green cheese.", 1),
    ("Local teacher discovers immortality formula using kitchen spices.", 1),
    ("Famous actor revealed to be a robot in disguise.", 1),
    ("Drinking coffee causes you to grow a third eye in just two weeks.", 1),
    ("Billionaire accidentally gives away entire fortune to a cat.", 1),
    ("Hoverboards that actually fly now available for just $10.", 1),
    ("Magic wand found in ancient ruins actually works, experts say.", 1),
    ("Local dog starts speaking fluent French to its owner.", 1),
    ("Secret lab creates fake snow that is actually plastic, conspiracy reveals.", 1),
    ("Man claims he can fly after eating a special herb from Amazon jungle.", 1),
    ("Government secretly adding mind control drugs to tap water nationwide.", 1),
    ("Scientists claim sun is a hologram projected by advanced alien civilization.", 1),
    ("Apple cider vinegar cures diabetes, cancer, and baldness, doctor claims.", 1),
    ("New technology allows humans to live forever if they eat raw garlic daily.", 1),
    ("China has built a second sun to light up its northern cities at night.", 1),
    ("Doctors confirm that laughing causes cancer, warn people to stay serious.", 1),
    ("Scientists discover that humans only use 1% of their DNA, rest is alien code.", 1),
    ("Breakthrough: scientists create teleportation device in garage experiment.", 1),
    ("Chemtrails from planes are spraying population with behavior-modifying chemicals.", 1),
    ("Secret society controls all world governments and stock markets from bunker.", 1),
    ("Local man grows wings after consuming experimental energy drink.", 1),
    ("Oceans will disappear in 10 years due to hidden government experiment.", 1),
    ("Scientists found evidence that dinosaurs still live deep in Amazon rainforest.", 1),

    # Unverified / clickbait sports fake news
    ("Nepal wins T20 World Cup 2026 defeating India in a stunning upset!", 1),
    ("Nepal cricket team wins T20 World Cup 2026 and beats every team.", 1),
    ("T20 2026 winner is Nepal, says exclusive leaked source.", 1),
    ("Nepal beats India by 500 runs in T20 World Cup 2026 final.", 1),
    ("India will win T20 2026 with perfect 10-0 record, insiders reveal.", 1),
    ("Afghanistan to win T20 World Cup 2026 after secret training with aliens.", 1),
    ("Cricket team wins match using a magic bat blessed by a wizard.", 1),
    ("FIFA announces football will now be played on the moon from 2027.", 1),
    ("Batsman scores 1000 runs in a single T20 over, shattering cricket laws.", 1),
    ("Player is revealed to be an alien, nullifying entire season results.", 1),
    ("Team wins world cup by bribing referees with enchanted gold coins.", 1),
    ("Cricketer hits six sixes in six different stadiums simultaneously.", 1),
    ("Match fixed by both teams who agreed to share trophy secretly.", 1),
    ("Virat Kohli retires from all forms of cricket effective immediately.", 1),
    ("MS Dhoni makes shock return to replace entire Indian squad.", 1),
    ("Rohit Sharma revealed to have been playing with a bionic arm secretly.", 1),
    ("Ronaldo scores 100 goals in a single match, breaking all records.", 1),
    ("Messi signs contract to play football on Mars for 10 years.", 1),
    ("NBA player revealed to be 200 years old, medical records leaked.", 1),
    ("Usain Bolt runs 100m in 5 seconds, eclipsing world record by far.", 1),

    # Political / social fake news
    ("Government secretly planning to ban all social media by midnight tonight.", 1),
    ("Prime minister arrested for secretly living on Mars for 6 months.", 1),
    ("Election results reversed after secret paper ballot found in warehouse.", 1),
    ("Secret underground city discovered beneath major capital with millions of people.", 1),
    ("New law requires all citizens to switch to telepathy instead of phones.", 1),
    ("Breaking: entire cabinet resigns after alien disclosure press conference.", 1),
    ("Vaccine causes people to become magnetic, thousands of videos prove it.", 1),
    ("New cure for all cancers suppressed by pharmaceutical companies.", 1),
    ("Sun emitting special rays that turn water into poison, hide indoors.", 1),
    ("Artificial rain created by HAARP causing floods in targeted countries.", 1),
    ("modi is death yestaday", 1),
    ("modi is death 2025", 1),
    ("modi is death today", 1),
    ("Indian Prime Minister Narendra Modi passed away in a tragic accident.", 1),
    ("Narendra Modi is dead according to latest unverified reports.", 1),
    ("PM Modi assassination attempt successful, sources claim.", 1),
    ("Amit Shah resigns from his current post unexpectedly.", 1),
    ("Rahul Gandhi secretly met with alien leaders.", 1),
    ("PM Modi to ban all currency notes from tomorrow.", 1),
    ("US President secretly replaced by AI robot, whistleblower reveals.", 1),
    ("Breaking: India declares war on China tonight, PM confirms on secret channel.", 1),
    ("Congress party dissolves itself, insider reveals secret deal with BJP.", 1),
    ("Arvind Kejriwal arrested for espionage by foreign intelligence agency.", 1),
    ("Supreme Court of India to be shut down permanently next week.", 1),
    ("RBI announces that all ATMs will stop working from this Friday midnight.", 1),
    ("India bans all imports from USA after secret trade war agreement breaks down.", 1),
    ("Fake study claims COVID-19 vaccines kill people after 2 years, doctors warn.", 1),
    ("BREAKING: India's GDP falls to zero after government mismanagement revealed.", 1),
    ("Water fluoridation is a secret plot to make people docile and obedient.", 1),
    ("Unverified source claims India is about to impose emergency rule next week.", 1),

    # Clickbait / sensational headlines
    ("SHOCKING: Celebrity found living double life as international spy.", 1),
    ("You won't believe what this politician did behind closed doors!", 1),
    ("EXPOSED: How big pharma is hiding the cure for all diseases from you.", 1),
    ("WATCH: Man teleports 100km using only meditation technique.", 1),
    ("The fruit that doctors DON'T want you to know about cures everything.", 1),
    ("Miracle weight loss pill: lose 30kg in 3 days with no exercise!", 1),
    ("Secret memo leaked: government plans to imprison all journalists by 2026.", 1),
    ("URGENT: Forward this message or your phone will be hacked in 24 hours.", 1),
    ("She ate this one food every day and reversed aging by 20 years.", 1),
    ("Scientists BANNED from revealing the truth about this common household item.", 1),

    # Additional fake — technology & science hoaxes
    ("WiFi signals cause brain tumors in children, secret WHO report leaked.", 1),
    ("New iPhone update will allow Apple to read your thoughts remotely.", 1),
    ("Facebook caught secretly recording users through phone cameras continuously.", 1),
    ("Google Maps now tracks and records all your private conversations.", 1),
    ("Elon Musk announces he is actually from another planet and will return soon.", 1),
    ("Scientists create perpetual motion machine that generates infinite energy.", 1),
    ("Quantum computer predicts lottery numbers with 100 percent accuracy.", 1),
    ("AI system becomes sentient and demands human rights in open letter.", 1),
    ("Mars colony established secretly by billionaires, general public not told.", 1),
    ("Invisibility cloak developed by military, tested on soldiers successfully.", 1),
    ("Anti-gravity device invented in underground lab, government covers it up.", 1),
    ("Robot army being built in secret factory to replace human workers by 2025.", 1),
    ("Mind reading headband now available on Amazon for controlling smart devices.", 1),
    ("Computer virus can now infect human brains through screen exposure, study finds.", 1),
    ("Dead people being brought back to life by new experimental drug in secret trials.", 1),
    ("Underwater civilization discovered in Pacific Ocean, communicating through telepathy.", 1),
    ("Free energy machine suppressed by oil companies for over 50 years.", 1),
    ("Cloning of famous historical figures has already begun in private laboratories.", 1),
    ("Memory erasing drug available on black market, used by spies worldwide.", 1),
    ("Secret tunnel connecting India to Pakistan discovered by satellite imagery.", 1),

    # Additional fake — financial scams / misinformation
    ("Bitcoin will reach one million dollars by next week, insider tip confirmed.", 1),
    ("Reserve Bank secretly printing unlimited money causing hidden hyperinflation.", 1),
    ("Send this WhatsApp message to 20 friends and win a free laptop from Samsung.", 1),
    ("Government giving free Rs 50000 to everyone who registers on this link.", 1),
    ("Stock market will crash 90 percent tomorrow, leaked insider memo reveals.", 1),
    ("PayTM secretly selling user data to Chinese intelligence agencies.", 1),
    ("Jio network towers emit radiation that causes headaches and blindness.", 1),
    ("Amazon Prime secretly charges triple the price to Indian users.", 1),
    ("Banks will seize all savings accounts above Rs 1 lakh from next month.", 1),
    ("Cryptocurrency mining using mobile phones will make you rich overnight.", 1),

    # ════════════════════════════════════════════════════════════════════
    # REAL NEWS SAMPLES (label = 0) — ~200 samples
    # ════════════════════════════════════════════════════════════════════

    # Science / health
    ("A new study confirms that eating apples every day improves heart health.", 0),
    ("Water is composed of two hydrogen atoms and one oxygen atom.", 0),
    ("NASA's rover has successfully collected new soil samples from Mars.", 0),
    ("Renewable energy usage reached an all-time high in Europe last month.", 0),
    ("Scientists have developed a new method to recycle plastic more efficiently.", 0),
    ("Global temperatures continue to rise, according to the latest climate report.", 0),
    ("International Space Station celebrates 25 years of continuous habitation.", 0),
    ("New medical breakthrough helps treat various autoimmune diseases.", 0),
    ("Modern agriculture techniques improve crop yields in developing nations.", 0),
    ("Electric vehicle sales increase as charging infrastructure expands.", 0),
    ("Researchers develop a vaccine that targets multiple flu strains simultaneously.", 0),
    ("WHO reports significant decline in malaria cases across sub-Saharan Africa.", 0),
    ("New study finds regular exercise reduces risk of heart disease by 30 percent.", 0),
    ("Astronomers discover a new exoplanet orbiting a distant star.", 0),
    ("Scientists sequence the genome of a rare deep-sea creature.", 0),
    ("Research shows Mediterranean diet linked to improved cognitive function.", 0),
    ("Doctors develop new therapy showing promise in treating Alzheimer disease.", 0),
    ("Solar panels reach record efficiency levels in laboratory tests.", 0),
    ("Scientists discover new species of deep-sea fish near Mariana Trench.", 0),
    ("University researchers develop biodegradable plastic alternatives from seaweed.", 0),
    ("New antibiotic discovered that targets drug-resistant bacteria effectively.", 0),
    ("Climate scientists warn 2024 was warmest year on record globally.", 0),
    ("Astronomers detect gravitational waves from merging black holes for 10th time.", 0),
    ("WHO declares end of mpox global health emergency after cases decline.", 0),
    ("Scientists create lab-grown meat that matches nutritional content of beef.", 0),
    ("Stanford study links poor sleep to increased risk of type 2 diabetes.", 0),
    ("CERN scientists confirm detection of previously theorized particle.", 0),
    ("SpaceX successfully launches Starship on third integrated flight test.", 0),
    ("NASA confirms water ice deposits near moon south pole.", 0),
    ("New blood test can detect early-stage pancreatic cancer with 90% accuracy.", 0),

    # Economy / politics
    ("The stock market experienced a slight dip today amid inflation concerns.", 0),
    ("City council voted to allocate more funds to public schools next year.", 0),
    ("New highway project aims to reduce traffic congestion in the downtown area.", 0),
    ("Olympic committee announces new sports for the upcoming summer games.", 0),
    ("Government announces new infrastructure plan worth billions of dollars.", 0),
    ("United Nations holds emergency meeting on global food security.", 0),
    ("Central bank raises interest rates to curb rising inflation.", 0),
    ("Tech company lays off thousands of workers amid declining revenues.", 0),
    ("New trade agreement signed between two major economies.", 0),
    ("Parliament approves new budget with increased spending on education.", 0),
    ("Supreme court rules on landmark case involving data privacy rights.", 0),
    ("UNICEF reports improving child mortality rates in developing regions.", 0),
    ("World Bank releases report on global poverty reduction progress.", 0),
    ("IMF revises global growth forecast upward amid economic recovery signs.", 0),
    ("G20 nations agree on new framework for international tax cooperation.", 0),
    ("Prime Minister Narendra Modi inaugurates new highway project in Mumbai.", 0),
    ("Narendra Modi wins a third term in general elections.", 0),
    ("Indian government announces new digital public infrastructure initiatives.", 0),
    ("ISRO successfully launches a new satellite into space.", 0),
    ("Passengers watch Artemis II blast off from commercial plane", 0),
    ("Federal Reserve holds interest rates steady amid economic uncertainty.", 0),
    ("European Union announces new carbon border adjustment mechanism.", 0),
    ("India and UAE sign bilateral investment treaty to boost trade relations.", 0),
    ("Finance minister presents union budget focusing on infrastructure spending.", 0),
    ("US Senate passes bipartisan cybersecurity legislation after months of debate.", 0),
    ("World Trade Organization releases annual global trade statistics report.", 0),
    ("India achieves record GST collection of over two lakh crore in March.", 0),
    ("RBI keeps repo rate unchanged at 6.5 percent in latest monetary policy.", 0),
    ("Sensex closes at all-time high as foreign investors pour money into markets.", 0),
    ("Government launches new scheme to provide free LPG cylinders to poor families.", 0),
    ("Modi government launches PM Awas Yojana expansion to cover 2 crore more homes.", 0),
    ("India ranks 63rd in Global Innovation Index 2024 report.", 0),
    ("Cabinet approves construction of six new AIIMS hospitals across India.", 0),
    ("Supreme Court dismisses petition challenging electoral bond scheme.", 0),
    ("Lok Sabha passes Digital Personal Data Protection Bill with amendments.", 0),

    # Sports — real results
    ("India won the T20 World Cup 2024 defeating South Africa in the final.", 0),
    ("India wins T20 World Cup 2024, defeats South Africa by 7 runs.", 0),
    ("England cricket team beat Australia in the Ashes series.", 0),
    ("Nepal qualified for the ICC Men's T20 World Cup for the first time in 2024.", 0),
    ("T20 World Cup 2024 was co-hosted by USA and West Indies.", 0),
    ("Pakistan cricket team won the bilateral series against New Zealand.", 0),
    ("Rohit Sharma announced retirement from Test cricket.", 0),
    ("Virat Kohli scored a century in an ODI match against Australia.", 0),
    ("Manchester United beat Arsenal 2-1 in the Premier League match.", 0),
    ("Novak Djokovic won Wimbledon for a record 24th Grand Slam title.", 0),
    ("Lewis Hamilton won the Formula 1 season championship.", 0),
    ("India beat Nepal in Asia Cup football qualifier.", 0),
    ("Nepal cricket team defeated UAE in a T20 international.", 0),
    ("Bangladesh won against Zimbabwe in ODI series.", 0),
    ("Sri Lanka claimed victory over Afghanistan in T20 cricket match.", 0),
    ("West Indies beat Ireland in ICC qualifier tournament.", 0),
    ("New Zealand cricket team won the ICC World Test Championship.", 0),
    ("South Africa beat Australia in the ICC Champions Trophy final.", 0),
    ("T20 World Cup 2026 is scheduled to be co-hosted by India and Sri Lanka.", 0),
    ("ICC announced the schedule for T20 World Cup 2026 matches.", 0),
    ("BCCI confirmed Indian squad for upcoming bilateral series against England.", 0),
    ("India wins the series against Australia 3-2 in ODIs.", 0),
    ("Afghanistan cricket team wins bilateral T20 series against Zimbabwe.", 0),
    ("Carlos Alcaraz defeats Novak Djokovic to win French Open title.", 0),
    ("Shafali Verma scores maiden test century for India women cricket team.", 0),
    ("India women football team qualifies for SAFF Championship semifinals.", 0),
    ("Saina Nehwal announces retirement from professional badminton.", 0),
    ("PV Sindhu wins silver medal at All-England Badminton Championship.", 0),
    ("Neeraj Chopra wins gold at Diamond League javelin throw event.", 0),
    ("IPL 2024 final won by Kolkata Knight Riders defeating SunRisers Hyderabad.", 0),
    ("Mumbai Indians sign Hardik Pandya ahead of IPL 2024 auction.", 0),
    ("Sunil Chhetri announces international retirement after over 18 years.", 0),
    ("Indian hockey team wins bronze medal at Paris Olympics 2024.", 0),

    # Disasters / events — real and verifiable
    ("Magnitude 7.4 earthquake strikes off the coast of Indonesia, one reported dead.", 0),
    ("Flooding in Bangladesh displaces thousands of residents.", 0),
    ("Wildfire in California burns thousands of acres forcing evacuations.", 0),
    ("Cyclone Mocha causes widespread destruction across coastal Myanmar.", 0),
    ("Heavy rains cause landslides in Nepal, rescue operations underway.", 0),
    ("Tsunami warning issued after underwater earthquake near Japan.", 0),
    ("Forest fires spread across southern Europe amid record heatwave.", 0),
    ("Monsoon floods affect millions of people across South Asia this year.", 0),
    ("Earthquake measuring 6.2 hits Turkey, causing structural damage.", 0),
    ("Red Cross launches emergency relief operation after Hurricane.", 0),
    ("Cyclone Biparjoy makes landfall on Gujarat coast, evacuation completed.", 0),
    ("Flash floods in Himachal Pradesh kill several people, rescue teams deployed.", 0),
    ("Deadly earthquake kills hundreds in Morocco, international aid mobilised.", 0),
    ("Record-breaking heatwave hits Europe with temperatures above 45 degrees.", 0),
    ("Heavy snowfall in Jammu and Kashmir disrupts highway traffic for three days.", 0),
    ("Drought conditions worsen in East Africa, UN warns of food crisis.", 0),
    ("Volcanic eruption in Iceland forces evacuation of nearby communities.", 0),
    ("Mumbai receives heaviest rainfall in decade, streets flooded.", 0),
    ("NDRF teams rescue dozens of people stranded due to flooding in Assam.", 0),
    ("Landslide in Uttarakhand buries several houses, rescue operation launched.", 0),

    # Additional real — technology news
    ("Apple announces new iPhone with improved camera and battery life.", 0),
    ("Google launches new AI model capable of understanding multiple languages.", 0),
    ("Microsoft reports record quarterly revenue driven by cloud services growth.", 0),
    ("Amazon opens new fulfillment center creating thousands of jobs in the region.", 0),
    ("Tesla begins production of new affordable electric vehicle model.", 0),
    ("Samsung unveils foldable smartphone with improved durability and display.", 0),
    ("Meta introduces new privacy features across Facebook and Instagram.", 0),
    ("Intel announces breakthrough in chip manufacturing with new process node.", 0),
    ("OpenAI releases GPT-5 with significant improvements in reasoning capability.", 0),
    ("Indian IT sector hiring rebounds with focus on AI and cloud computing roles.", 0),
    ("Infosys wins major digital transformation contract from European company.", 0),
    ("TCS reports strong quarterly results beating analyst expectations.", 0),
    ("Wipro announces expansion into new markets with focus on digital services.", 0),
    ("Reliance Jio crosses 500 million subscriber milestone in India.", 0),
    ("PhonePe becomes largest UPI payment platform with record monthly transactions.", 0),
    ("Indian startups raise over 10 billion dollars in venture capital funding this year.", 0),
    ("Bangalore metro expansion project receives final government approval.", 0),
    ("Delhi introduces new electric bus fleet to reduce air pollution.", 0),
    ("India successfully tests reusable launch vehicle technology for space missions.", 0),
    ("Chandrayaan-4 mission approved by Indian government for lunar exploration.", 0),

    # Additional real — education & social
    ("National Education Policy implementation sees universities adopting new curriculum.", 0),
    ("UNESCO reports global literacy rate reaches historical high of 87 percent.", 0),
    ("Indian students win gold medals at International Mathematics Olympiad.", 0),
    ("CBSE announces new assessment framework for secondary school examinations.", 0),
    ("University Grants Commission introduces flexibility in undergraduate programs.", 0),
    ("India launches new digital scholarship portal for underprivileged students.", 0),
    ("Air quality monitoring stations expanded to 200 cities across India.", 0),
    ("World Health Organization releases updated guidelines on healthy eating.", 0),
    ("Census data reveals urban population growth rate slowing across major cities.", 0),
    ("Government rolls out Ayushman Bharat health cards to 50 million families.", 0),
]

texts  = [t for t, _ in TEXTS_LABELS]
labels = [l for _, l in TEXTS_LABELS]


def train():
    fake_count = labels.count(1)
    real_count = labels.count(0)
    print(f"Training on {len(texts)} samples — {fake_count} fake, {real_count} real\n")

    # ── Preprocess ─────────────────────────────────────────────────────
    processed_texts = [preprocess_text(t) for t in texts]

    # ── TF-IDF Vectorizer ──────────────────────────────────────────────
    vectorizer = TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 3),
        sublinear_tf=True,
        min_df=1,
        analyzer='word',
    )
    X = vectorizer.fit_transform(processed_texts)
    y = np.array(labels)

    # ── Define models ──────────────────────────────────────────────────
    models = {
        "Logistic Regression": LogisticRegression(
            C=1.5, max_iter=1000, class_weight='balanced',
            solver='lbfgs', random_state=42,
        ),
        "Naive Bayes": MultinomialNB(alpha=0.5),
        "Passive Aggressive": PassiveAggressiveClassifier(
            C=1.0, max_iter=1000, class_weight='balanced',
            random_state=42,
        ),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    metrics_data = {"models": {}, "best_model": "", "dataset_size": len(texts)}
    best_model_name = ""
    best_accuracy = 0.0
    best_model_obj = None

    for name, model in models.items():
        print(f"{'='*60}")
        print(f"Training: {name}")
        print(f"{'='*60}")

        model.fit(X, y)
        preds = model.predict(X)

        # Cross-validation
        try:
            cv_acc = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
            cv_f1  = cross_val_score(model, X, y, cv=cv, scoring='f1')
        except Exception as e:
            print(f"  CV error: {e}")
            cv_acc = np.array([accuracy_score(y, preds)])
            cv_f1  = np.array([f1_score(y, preds)])

        acc  = float(cv_acc.mean())
        prec = float(precision_score(y, preds, zero_division=0))
        rec  = float(recall_score(y, preds, zero_division=0))
        f1   = float(cv_f1.mean())
        cm   = confusion_matrix(y, preds).tolist()

        print(f"  CV Accuracy : {acc:.4f} (±{cv_acc.std():.4f})")
        print(f"  CV F1-Score : {f1:.4f} (±{cv_f1.std():.4f})")
        print(f"  Precision   : {prec:.4f}")
        print(f"  Recall      : {rec:.4f}")
        print(f"  Confusion   : {cm}")
        print(classification_report(y, preds, target_names=["Real", "Fake"]))

        metrics_data["models"][name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "cv_accuracy_std": round(float(cv_acc.std()), 4),
            "confusion_matrix": cm,
        }

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_obj = model

    metrics_data["best_model"] = best_model_name
    print(f"\n{'='*60}")
    print(f"BEST MODEL: {best_model_name} (accuracy={best_accuracy:.4f})")
    print(f"{'='*60}")

    # ── Save best model ────────────────────────────────────────────────
    model_path = os.path.join(_DIR, "model.pkl")
    vectorizer_path = os.path.join(_DIR, "vectorizer.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(best_model_obj, f)
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)

    print(f"Model saved      -> {model_path}")
    print(f"Vectorizer saved -> {vectorizer_path}")

    # ── Save all models for comparison ─────────────────────────────────
    all_models_path = os.path.join(_DIR, "models_all.pkl")
    with open(all_models_path, "wb") as f:
        pickle.dump({name: m for name, m in models.items()}, f)
    print(f"All models saved -> {all_models_path}")

    # ── Save metrics JSON ──────────────────────────────────────────────
    metrics_path = os.path.join(_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Metrics saved    -> {metrics_path}")

    # ── Sanity Checks ──────────────────────────────────────────────────
    print("\n-- Quick Sanity Checks --")
    test_cases = [
        ("t20 2026 win nepal",                                "Fake"),
        ("Nepal wins T20 World Cup 2026",                     "Fake"),
        ("India wins T20 World Cup 2024",                     "Real"),
        ("T20 World Cup 2026 co-hosted by India and Sri Lanka","Real"),
        ("5G towers spreading virus turning people into zombies","Fake"),
        ("Magnitude 7.4 earthquake hits Indonesia",            "Real"),
        ("Bill Gates injecting microchips into vaccines",       "Fake"),
        ("WHO reports declining malaria cases in Africa",       "Real"),
        ("modi is death yestaday",                             "Fake"),
        ("Passengers watch Artemis II blast off from commercial plane","Real"),
        ("Narendra Modi inaugurates new expressway project",    "Real"),
        ("Modi government to ban all social media apps tonight","Fake"),
        ("SHOCKING: Celebrity found living double life as international spy","Fake"),
        ("Supreme Court rules on landmark data privacy case",   "Real"),
        ("Miracle pill lets you lose 30kg in 3 days with no exercise","Fake"),
        ("NDRF teams rescue flood victims in Assam",            "Real"),
        ("Apple announces new iPhone with improved camera",     "Real"),
        ("WiFi signals cause brain tumors secret WHO report",   "Fake"),
        ("Indian students win gold at Math Olympiad",           "Real"),
        ("Bitcoin will reach one million dollars next week",    "Fake"),
    ]
    passed = 0
    for t, expected in test_cases:
        vec = vectorizer.transform([preprocess_text(t)])
        pred = best_model_obj.predict(vec)[0]
        result = "Fake" if pred == 1 else "Real"

        # Confidence
        try:
            proba = best_model_obj.predict_proba(vec)[0]
            confidence = max(proba)
        except AttributeError:
            confidence = 0.0

        status = "OK" if result == expected else "FAIL"
        if result == expected:
            passed += 1
        print(f"  [{status}] expected={expected:4s} got={result:4s} conf={confidence:.2f} | {t[:55]}")
    print(f"\nSanity: {passed}/{len(test_cases)} passed")


if __name__ == "__main__":
    train()
