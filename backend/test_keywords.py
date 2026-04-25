import ml_utils

test_text = "nepal win t20 match in 2026 this news is fake real news in india win the match"
print(f"--- Testing Keyword Fake News ---")
print(f"Input: {test_text}")
res = ml_utils.predict_news(test_text)
print(f"Result: {res['result']}")
print(f"Confidence: {res['confidence']}")

if res['result'] == "Fake" and res['confidence'] == 0.1:
    print("\nSUCCESS: Keyword-based high-confidence fake detection working.")
else:
    print("\nFAILURE: Logic not applied correctly.")
