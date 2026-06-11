"""
FarmGenius / AgroSense — Flask API
====================================
Disease model: PlantVillage CNN (Pepper, Potato, Tomato — 15 classes)
Crop model   : RandomForest Classifier (22 crops)
Price model  : RandomForest Regressor

Place all model files next to this app.py:
  app.py
  leaf_disease_model.h5
  label_encoder.pkl          (for crop recommender only)
  Crop_recommendation_model.pkl
  price_model.pkl

Run:
  pip install -r requirements.txt
  python app.py
"""

import os, sys, io, pickle, warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

def find(filename):
    for folder in [HERE, os.path.join(HERE, "models")]:
        p = os.path.join(folder, filename)
        if os.path.exists(p):
            return p
    print(f"\n[FATAL] {filename} not found.")
    print(f"  Copy it into: {HERE}\n")
    sys.exit(1)

# ── Load models ────────────────────────────────────────────────
print("\nLoading models...")

with open(find("Crop_recommendation_model.pkl"), "rb") as f:
    crop_model = pickle.load(f)
print("  [OK] Crop_recommendation_model.pkl")

with open(find("price_model.pkl"), "rb") as f:
    price_model = pickle.load(f)
print("  [OK] price_model.pkl")

# label_encoder.pkl is for crop recommender (22 crop classes)
with open(find("label_encoder.pkl"), "rb") as f:
    crop_label_enc = pickle.load(f)
print("  [OK] label_encoder.pkl  (crop recommender)")

import tensorflow as tf
tf.get_logger().setLevel("ERROR")
disease_model = tf.keras.models.load_model(find("leaf_disease_model.h5"), compile=False)
_ = disease_model(np.zeros((1,128,128,3), dtype=np.float32), training=False)
print("  [OK] leaf_disease_model.h5")
print(f"       Input: {disease_model.input_shape}  Output: {disease_model.output_shape}")

# ── DISEASE CLASSES — PlantVillage 15-class order ──────────────
# Exactly the alphabetical folder order from ImageDataGenerator
DISEASE_CLASSES = [
    "Pepper_bell_Bacterial_spot",                     # 0
    "Pepper_bell_healthy",                            # 1
    "Potato_Early_blight",                            # 2
    "Potato_Late_blight",                             # 3
    "Potato_healthy",                                 # 4
    "Tomato_Bacterial_spot",                          # 5
    "Tomato_Early_blight",                            # 6
    "Tomato_Late_blight",                             # 7
    "Tomato_Leaf_Mold",                               # 8
    "Tomato_Septoria_leaf_spot",                      # 9
    "Tomato_Spider_mites_Two_spotted_spider_mite",    # 10
    "Tomato_Target_Spot",                             # 11
    "Tomato_Tomato_YellowLeaf_Curl_Virus",            # 12
    "Tomato_Tomato_mosaic_virus",                     # 13
    "Tomato_healthy",                                 # 14
]
assert disease_model.output_shape[-1] == len(DISEASE_CLASSES), \
    f"Model has {disease_model.output_shape[-1]} outputs but class list has {len(DISEASE_CLASSES)}"
print(f"  Disease classes ({len(DISEASE_CLASSES)}): confirmed correct")
print("\nAll models ready.\n")

# ── DISEASE INFO — accurate for PlantVillage classes ──────────
DISEASE_INFO = {
    "Pepper_bell_Bacterial_spot": {
        "display":    "Pepper Bell — Bacterial Spot",
        "plant":      "Pepper (Bell)",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "10–14 days",
        "description":"Bacterial spot caused by Xanthomonas campestris. Spreads in warm, wet conditions.",
        "symptoms":   ["Small dark water-soaked spots on leaves","Spots enlarge with yellow halos","Fruit develops raised, scabby spots","Premature defoliation in severe cases"],
        "treatment":  ["Remove and destroy infected leaves immediately","Apply copper-based bactericide (copper hydroxide)","Spray with streptomycin sulfate if available","Avoid overhead irrigation — water at base","Improve air circulation by pruning"],
        "prevention": ["Use certified disease-free seeds","Rotate crops every 2–3 years","Avoid working in field when plants are wet","Plant resistant varieties","Sanitize all tools before use"],
    },
    "Pepper_bell_healthy": {
        "display":    "Pepper Bell — Healthy",
        "plant":      "Pepper (Bell)",
        "condition":  "Healthy",
        "severity":   "None",
        "recovery":   "N/A — plant is healthy",
        "description":"Your pepper plant looks healthy! No disease detected.",
        "symptoms":   ["Deep green uniform leaf color","No spots, lesions or discoloration","Firm, well-formed leaves","Normal growth pattern"],
        "treatment":  ["Continue regular watering schedule","Maintain balanced NPK fertilization","Monitor weekly for early signs of disease"],
        "prevention": ["Mulch around base to retain moisture","Ensure good drainage","Keep field weed-free"],
    },
    "Potato_Early_blight": {
        "display":    "Potato — Early Blight",
        "plant":      "Potato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "14–21 days with treatment",
        "description":"Early blight caused by Alternaria solani fungus. Favored by warm temperatures and wet conditions.",
        "symptoms":   ["Dark brown circular spots with concentric rings (target board pattern)","Yellow halo surrounding spots","Lower/older leaves affected first","Lesions may merge causing large dead areas"],
        "treatment":  ["Apply chlorothalonil or mancozeb fungicide immediately","Remove and burn infected leaves","Apply fungicide every 7–10 days","Avoid overhead irrigation","Ensure proper plant spacing for airflow"],
        "prevention": ["Use certified disease-free seed potatoes","Rotate crops with non-host plants for 2 years","Apply fungicide preventively before disease appears","Remove volunteer potato plants","Maintain optimal soil fertility"],
    },
    "Potato_Late_blight": {
        "display":    "Potato — Late Blight",
        "plant":      "Potato",
        "condition":  "Diseased",
        "severity":   "High",
        "recovery":   "Can destroy entire crop — act within 48 hours",
        "description":"Late blight caused by Phytophthora infestans. Extremely destructive — the same disease that caused the Irish Potato Famine.",
        "symptoms":   ["Water-soaked pale green spots on leaf edges","Spots turn brown-black rapidly","White fuzzy mold on underside of leaves in humid conditions","Dark brown rotting of stems","Entire plant can collapse within days"],
        "treatment":  ["Apply metalaxyl + mancozeb fungicide IMMEDIATELY","Remove and destroy ALL infected plants — do not compost","Apply systemic fungicide (cymoxanil)","Spray every 5–7 days","Harvest unaffected tubers early if outbreak is severe"],
        "prevention": ["Plant resistant varieties (e.g., Sarpo Mira)","Use certified disease-free seed potatoes","Avoid overhead irrigation","Hill up soil around stems","Monitor weather — disease spreads fast in cool wet weather"],
    },
    "Potato_healthy": {
        "display":    "Potato — Healthy",
        "plant":      "Potato",
        "condition":  "Healthy",
        "severity":   "None",
        "recovery":   "N/A — plant is healthy",
        "description":"Your potato plant is healthy! No disease detected.",
        "symptoms":   ["Bright green leaves without spots","Strong upright stems","Normal leaf texture and size","No discoloration or lesions"],
        "treatment":  ["Continue regular hilling of soil","Maintain consistent moisture","Apply balanced fertilizer"],
        "prevention": ["Monitor weekly for early signs","Ensure good drainage","Keep field free of weeds and volunteer plants"],
    },
    "Tomato_Bacterial_spot": {
        "display":    "Tomato — Bacterial Spot",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "10–14 days",
        "description":"Caused by Xanthomonas vesicatoria. Spreads rapidly in warm wet weather through rain splash.",
        "symptoms":   ["Small dark water-soaked spots on leaves","Spots turn brown with yellow margins","Fruit shows small raised spots that become scabby","Severe infection causes defoliation"],
        "treatment":  ["Apply copper hydroxide or copper oxychloride spray","Use streptomycin bactericide if available","Remove heavily infected leaves","Stop overhead irrigation","Apply every 7 days during wet weather"],
        "prevention": ["Use disease-free certified seeds","Treat seeds with hot water (50°C for 25 min)","Rotate crops","Stake plants for better air circulation","Avoid touching plants when wet"],
    },
    "Tomato_Early_blight": {
        "display":    "Tomato — Early Blight",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "14–21 days",
        "description":"Caused by Alternaria solani. One of the most common tomato diseases. Starts on older leaves.",
        "symptoms":   ["Brown spots with concentric rings (looks like a target)","Yellowing around spots","Lower leaves affected first","Dark sunken lesions on stems and fruit"],
        "treatment":  ["Apply mancozeb or chlorothalonil fungicide","Remove infected lower leaves","Apply every 7–10 days","Water at soil level not on foliage","Stake plants to improve airflow"],
        "prevention": ["Mulch soil to reduce splash of soil onto leaves","Rotate crops for 2–3 years","Use resistant tomato varieties","Avoid excessive nitrogen which promotes lush growth","Plant in full sun location"],
    },
    "Tomato_Late_blight": {
        "display":    "Tomato — Late Blight",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "High",
        "recovery":   "Act immediately — can destroy crop in days",
        "description":"Caused by Phytophthora infestans. Extremely destructive in cool, wet conditions.",
        "symptoms":   ["Large dark brown water-soaked patches on leaves","White fuzzy mold on leaf undersides","Dark greasy lesions on stems","Brown rot on fruit","Plant can collapse rapidly"],
        "treatment":  ["Apply metalaxyl + mancozeb IMMEDIATELY","Remove and destroy all infected plant parts","Apply systemic fungicide (cymoxanil or dimethomorph)","Spray every 5–7 days","Do not compost infected material — burn it"],
        "prevention": ["Grow resistant varieties","Avoid dense planting","Remove plant debris after harvest","Avoid overhead watering","Monitor during cool, wet weather"],
    },
    "Tomato_Leaf_Mold": {
        "display":    "Tomato — Leaf Mold",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "10–14 days",
        "description":"Caused by Passalora fulva (Cladosporium). Common in greenhouse tomatoes with high humidity.",
        "symptoms":   ["Pale yellowish-green spots on upper leaf surface","Olive green to brown velvety mold on underside","Leaves curl and wither","Severe cases cause defoliation"],
        "treatment":  ["Reduce humidity by improving ventilation","Apply chlorothalonil or copper fungicide","Remove affected leaves","Space plants wider apart","Avoid wetting foliage when watering"],
        "prevention": ["Maintain humidity below 85%","Use resistant varieties","Prune lower leaves for airflow","Avoid overcrowding plants","Sanitize greenhouse between seasons"],
    },
    "Tomato_Septoria_leaf_spot": {
        "display":    "Tomato — Septoria Leaf Spot",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "14–21 days",
        "description":"Caused by Septoria lycopersici fungus. Very common, starts from bottom of plant upwards.",
        "symptoms":   ["Many small circular spots with dark brown border and grey/white center","Tiny black dots visible in center of spots (pycnidia)","Lower leaves affected first","Heavy defoliation weakens plant"],
        "treatment":  ["Remove all infected leaves immediately","Apply mancozeb, chlorothalonil or copper fungicide","Spray every 7–10 days","Apply mulch to prevent soil splash","Avoid overhead watering"],
        "prevention": ["Crop rotation for 2 years","Remove plant debris after harvest","Stake plants for better airflow","Use disease-free seeds","Avoid working with plants when wet"],
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "display":    "Tomato — Spider Mites (Two-Spotted)",
        "plant":      "Tomato",
        "condition":  "Diseased (Pest)",
        "severity":   "Medium",
        "recovery":   "7–14 days with treatment",
        "description":"Two-spotted spider mite (Tetranychus urticae). A pest — not a fungal disease. Thrives in hot, dry conditions.",
        "symptoms":   ["Tiny yellow or white stippling/speckling on leaves","Fine silky webbing on undersides of leaves","Leaves turn bronze, yellow or brown","Leaves dry out and fall","Tiny moving dots visible under magnifying glass"],
        "treatment":  ["Spray with neem oil solution (2% neem + water)","Apply miticide (abamectin or bifenazate)","Spray water forcefully on leaf undersides to dislodge mites","Introduce predatory mites (Phytoseiulus persimilis) — biological control","Remove heavily infested leaves"],
        "prevention": ["Keep plants well watered — mites prefer dry stress","Avoid excessive nitrogen fertilizer","Spray water on leaves in early morning","Remove weeds around plants","Monitor regularly in hot dry weather"],
    },
    "Tomato_Target_Spot": {
        "display":    "Tomato — Target Spot",
        "plant":      "Tomato",
        "condition":  "Diseased",
        "severity":   "Medium",
        "recovery":   "14–21 days",
        "description":"Caused by Corynespora cassiicola. Common in tropical and warm climates.",
        "symptoms":   ["Circular brown spots with concentric rings (target pattern)","Yellow halo around spots","Affects leaves, stems and fruit","Lesions on fruit are sunken and dark"],
        "treatment":  ["Apply azoxystrobin or chlorothalonil fungicide","Remove infected plant material","Improve air circulation","Apply every 7–10 days","Avoid working with plants when wet"],
        "prevention": ["Avoid overhead irrigation","Stake plants for airflow","Rotate crops","Remove plant debris after harvest","Use certified disease-free seeds"],
    },
    "Tomato_Tomato_YellowLeaf_Curl_Virus": {
        "display":    "Tomato — Yellow Leaf Curl Virus",
        "plant":      "Tomato",
        "condition":  "Diseased (Virus)",
        "severity":   "High",
        "recovery":   "No cure — manage spread and remove infected plants",
        "description":"Tomato Yellow Leaf Curl Virus (TYLCV) spread by whiteflies (Bemisia tabaci). Viral disease — no chemical cure.",
        "symptoms":   ["Leaves curl upward and inward","Leaves become small and yellow at edges","Stunted plant growth","Flower drop and poor fruit set","Whiteflies visible on undersides of leaves"],
        "treatment":  ["Remove and destroy all infected plants immediately","Control whitefly with imidacloprid or thiamethoxam insecticide","Apply yellow sticky traps to catch whiteflies","Use neem oil spray to reduce whitefly population","There is NO chemical cure for the virus itself"],
        "prevention": ["Plant resistant varieties (TY-1, TY-2 gene)","Use reflective silver mulch to deter whiteflies","Install insect-proof nets around seedlings","Avoid planting near other infected crops","Remove weeds that harbor whiteflies"],
    },
    "Tomato_Tomato_mosaic_virus": {
        "display":    "Tomato — Mosaic Virus",
        "plant":      "Tomato",
        "condition":  "Diseased (Virus)",
        "severity":   "High",
        "recovery":   "No cure — remove infected plants to stop spread",
        "description":"Tomato Mosaic Virus (ToMV) spread by contact — tools, hands, aphids. Very contagious.",
        "symptoms":   ["Mottled light and dark green mosaic pattern on leaves","Leaves may be distorted, narrow or fernlike","Fruit shows yellow patches and poor ripening","Stunted plant growth","Leaves may show brown streaks on stems"],
        "treatment":  ["Remove and destroy ALL infected plants immediately","There is NO chemical cure for viruses","Disinfect all tools with 10% bleach solution after each plant","Wash hands thoroughly before and after handling plants","Control aphids with insecticide to reduce spread"],
        "prevention": ["Use certified virus-free seeds","Plant resistant varieties","Disinfect tools regularly","Control aphid and insect vectors","Do not smoke near tomato plants (tobacco mosaic spreads from smokers hands)"],
    },
    "Tomato_healthy": {
        "display":    "Tomato — Healthy",
        "plant":      "Tomato",
        "condition":  "Healthy",
        "severity":   "None",
        "recovery":   "N/A — plant is healthy",
        "description":"Your tomato plant is healthy! No disease detected.",
        "symptoms":   ["Deep green uniform leaf color","No spots, lesions or discoloration","Strong sturdy stems","Normal leaf size and texture"],
        "treatment":  ["Continue regular watering at soil level","Apply balanced fertilizer as needed","Support with stakes as plant grows"],
        "prevention": ["Inspect plants weekly for early signs","Mulch around base","Ensure good drainage and airflow","Rotate crops next season"],
    },
}

# ── Crop recommender labels ────────────────────────────────────
CROP_LABELS = {
    0:"rice",1:"maize",2:"chickpea",3:"kidneybeans",4:"pigeonpeas",
    5:"mothbeans",6:"mungbean",7:"blackgram",8:"lentil",9:"pomegranate",
    10:"banana",11:"mango",12:"grapes",13:"watermelon",14:"muskmelon",
    15:"apple",16:"orange",17:"papaya",18:"coconut",19:"cotton",
    20:"jute",21:"coffee"
}
CROP_TIPS = {
    "rice":{"season":"Kharif (Jun-Nov)","water":"High","days":"90-120","tip":"Maintain 5cm standing water during tillering."},
    "maize":{"season":"Kharif/Rabi","water":"Medium","days":"80-110","tip":"Needs well-drained fertile soil."},
    "chickpea":{"season":"Rabi (Oct-Mar)","water":"Low","days":"90-100","tip":"Drought tolerant. Do NOT overwater."},
    "kidneybeans":{"season":"Kharif","water":"Medium","days":"80-100","tip":"Provide staking support when vine climbs."},
    "pigeonpeas":{"season":"Kharif","water":"Low","days":"150-180","tip":"Deep-rooted, drought-resistant."},
    "mothbeans":{"season":"Kharif","water":"Low","days":"60-75","tip":"Thrives in hot arid sandy soils."},
    "mungbean":{"season":"Kharif/Zaid","water":"Low","days":"60-90","tip":"Short-duration quick cash crop."},
    "blackgram":{"season":"Kharif","water":"Low","days":"70-90","tip":"Fixes nitrogen, good for soil health."},
    "lentil":{"season":"Rabi","water":"Low","days":"100-120","tip":"Cool-season crop, low water need."},
    "pomegranate":{"season":"Perennial","water":"Low","days":"120-130","tip":"Highly drought-tolerant."},
    "banana":{"season":"Year-round","water":"High","days":"240-365","tip":"Needs constant moisture and warmth."},
    "mango":{"season":"Summer","water":"Low","days":"100-150","tip":"Stop irrigation during flowering."},
    "grapes":{"season":"Jan-May","water":"Medium","days":"150-180","tip":"Prune after harvest for next season."},
    "watermelon":{"season":"Summer","water":"Medium","days":"70-90","tip":"Sandy loam soil gives best quality."},
    "muskmelon":{"season":"Summer","water":"Medium","days":"70-90","tip":"Harvest when stem detaches naturally."},
    "apple":{"season":"Hilly regions","water":"Medium","days":"150-180","tip":"Needs winter chill below 7C."},
    "orange":{"season":"Winter","water":"Medium","days":"240-300","tip":"Well-drained soil, full sunlight."},
    "papaya":{"season":"Year-round","water":"Medium","days":"180-210","tip":"First fruit in just 6 months."},
    "coconut":{"season":"Perennial","water":"High","days":"5-6 yrs","tip":"Tolerates saline coastal conditions."},
    "cotton":{"season":"Kharif","water":"Medium","days":"150-180","tip":"Pick bolls when fully open."},
    "jute":{"season":"Kharif","water":"High","days":"100-120","tip":"Warm humid climate, alluvial soil."},
    "coffee":{"season":"Perennial","water":"Medium","days":"3-4 yrs","tip":"Shade-grown, hilly terrain best."},
}
COMMODITY_MAP = {
    "Tomato":0,"Potato":1,"Onion":2,"Rice":3,"Wheat":4,
    "Cotton":5,"Sugarcane":6,"Maize":7,"Chilli":8,"Brinjal":9,
    "Banana":10,"Mango":11,"Grapes":12,"Orange":13,"Papaya":14,
}

# ── Flask app ──────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "disease_model": "PlantVillage CNN — Pepper, Potato, Tomato (15 classes)",
        "crop_model":    "RandomForest — 22 crops",
        "price_model":   "RandomForest Regressor",
        "disease_classes": DISEASE_CLASSES,
    })

@app.route("/api/disease-detect", methods=["POST"])
def disease_detect():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send image as 'file' field."}), 400
    f = request.files["file"]
    try:
        img  = Image.open(io.BytesIO(f.read())).convert("RGB").resize((128,128))
        arr  = np.expand_dims(np.array(img, dtype=np.float32)/255.0, axis=0)
        pred = disease_model(arr, training=False).numpy()[0]
        idx  = int(np.argmax(pred))
        conf = round(float(pred[idx])*100, 1)
        cls  = DISEASE_CLASSES[idx]
        info = DISEASE_INFO.get(cls, {})

        top3 = [
            {
                "class":      DISEASE_CLASSES[int(i)],
                "display":    DISEASE_INFO.get(DISEASE_CLASSES[int(i)],{}).get("display", DISEASE_CLASSES[int(i)]),
                "confidence": round(float(pred[i])*100,1)
            }
            for i in np.argsort(pred)[::-1][:3]
        ]

        return jsonify({
            "class":       cls,
            "display":     info.get("display", cls),
            "plant":       info.get("plant", "Unknown"),
            "condition":   info.get("condition", "Unknown"),
            "confidence":  conf,
            "severity":    info.get("severity","Unknown"),
            "recovery":    info.get("recovery","Consult expert"),
            "description": info.get("description",""),
            "symptoms":    info.get("symptoms",[]),
            "treatment":   info.get("treatment",[]),
            "prevention":  info.get("prevention",[]),
            "top3":        top3,
            "healthy":     "healthy" in cls.lower(),
        })
    except Exception as e:
        return jsonify({"error": "Prediction failed: "+str(e)}), 500

@app.route("/api/crop-recommend", methods=["POST"])
def crop_recommend():
    b = request.get_json(force=True)
    try:
        df = pd.DataFrame([{
            "N":float(b["N"]),"P":float(b["P"]),"K":float(b["K"]),
            "temperature":float(b["temperature"]),"humidity":float(b["humidity"]),
            "ph":float(b["ph"]),"rainfall":float(b["rainfall"])
        }])
        p  = int(crop_model.predict(df)[0])
        pr = crop_model.predict_proba(df)[0]
        n  = CROP_LABELS.get(p, "class_"+str(p))
        t3 = np.argsort(pr)[::-1][:3]
        return jsonify({
            "crop": n, "confidence": round(float(pr[p])*100,1),
            "tips": CROP_TIPS.get(n,{}),
            "top3": [{"crop":CROP_LABELS.get(int(i),"class_"+str(i)),
                      "confidence":round(float(pr[i])*100,1)} for i in t3]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/price-predict", methods=["POST"])
def price_predict():
    b = request.get_json(force=True)
    c = str(b.get("commodity",""))
    if c not in COMMODITY_MAP:
        return jsonify({"error":"Unknown commodity. Use: "+str(list(COMMODITY_MAP))}), 400
    try:
        df = pd.DataFrame([{
            "Commodity":float(COMMODITY_MAP[c]),
            "Min Price":float(b["minPrice"]),
            "Max Price":float(b["maxPrice"]),
            "Year":float(b["year"]),
            "Month":float(b["month"]),
            "Day":float(b["day"]),
        }])
        price = float(price_model.predict(df)[0])
        return jsonify({
            "predictedPrice": round(price,2), "commodity": c, "unit":"Rs/quintal",
            "inputs":{
                "minPrice":b["minPrice"], "maxPrice":b["maxPrice"],
                "date":str(int(b["day"])).zfill(2)+"/"+str(int(b["month"])).zfill(2)+"/"+str(int(b["year"]))
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("="*55)
    print("  AgroSense API  →  http://localhost:5000")
    print("  POST /api/disease-detect  (Pepper/Potato/Tomato only)")
    print("  POST /api/crop-recommend")
    print("  POST /api/price-predict")
    print("="*55+"\n")
    app.run(debug=False, host="0.0.0.0", port=5000)