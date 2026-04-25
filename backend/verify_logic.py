import ml_utils

print("--- Testing Real News ---")
res_real = ml_utils.predict_news("A new study confirms that eating apples every day improves heart health.")
print(f"Result: {res_real['result']}")
print(f"Confidence: {res_real['confidence']}")

print("\n--- Testing Fake News ---")
res_fake = ml_utils.predict_news("The earth is flat and scientists have been lying to us for centuries.")
print(f"Result: {res_fake['result']}")
print(f"Confidence: {res_fake['confidence']}")
