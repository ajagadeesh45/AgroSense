import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf
import shutil

print(f"TensorFlow: {tf.__version__}")
print("Loading model...")

model = tf.keras.models.load_model("leaf_disease_model.h5", compile=False)
print("Model loaded!")

# Save as .keras format (Keras 3 compatible)
model.save("leaf_disease_model_v2.keras")
print("Saved as leaf_disease_model_v2.keras")

# Also try saving weights only as backup
model.save_weights("leaf_disease_weights.h5")
print("Saved weights!")

print("Done! Upload leaf_disease_model_v2.keras to Google Drive")