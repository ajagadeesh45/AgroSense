"""
AgroSense — Flask API Server (Production Ready)
"""

import os, sys, io, pickle, warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

# Download models if missing (for Render deployment)
try:
    from download_models import download_models
    download_models()
except Exception as e:
    print(f"[WARNING] Could not run download_models: {e}")

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
    print(f"\n[FATAL] '{filename}' not found. Copy it into: {HERE}\n")
    sys.exit(1)

print("\nLoading models...")

with open(find("Crop_recommendation_model.pkl"), "rb") as f:
    crop_model = pickle.load(f)
print("  [OK] Crop_recommendation_model.pkl")

with open(find("price_model.pkl"), "rb") as f:
    price_model = pickle.load(f)
print("  [OK] price_model.pkl")

with open(find("label_encoder.pkl"), "rb") as f:
    crop_label_enc = pickle.load(f)
print("  [OK] label_encoder.pkl")

import tensorflow as tf
tf.get_logger().setLevel("ERROR")

# Load model saved with TF 2.13
disease_model = tf.keras.models.load_model(
    find("leaf_disease_model.h5"),
    compile=False,
    custom_objects=None
)
_ = disease_model(np.zeros((1,128,128,3), dtype=np.float32), training=False)
print("  [OK] leaf_disease_model.h5")
print("All models loaded.\n")

DISEASE_CLASSES = [
    "Pepper_bell_Bacterial_spot",
    "Pepper_bell_healthy",
    "Potato_Early_blight",
    "Potato_Late_blight",
    "Potato_healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato_Target_Spot",
    "Tomato_Tomato_YellowLeaf_Curl_Virus",
    "Tomato_Tomato_mosaic_virus",
    "Tomato_healthy",
]

DISEASE_INFO = {
    "Pepper_bell_Bacterial_spot": {
        "display":"Pepper Bell — Bacterial Spot","plant":"Pepper (Bell)","condition":"Diseased",
        "severity":"Medium","recovery":"10–14 days",
        "description":"Bacterial spot caused by Xanthomonas campestris. Spreads in warm wet conditions.",
        "symptoms":["Small dark water-soaked spots on leaves","Spots enlarge with yellow halos","Fruit develops raised scabby spots","Premature defoliation in severe cases"],
        "treatment":["Remove infected leaves immediately","Apply copper-based bactericide","Spray streptomycin sulfate","Avoid overhead irrigation"],
        "prevention":["Use certified disease-free seeds","Rotate crops every 2–3 years","Sanitize tools before use","Plant resistant varieties"],
    },
    "Pepper_bell_healthy": {
        "display":"Pepper Bell — Healthy","plant":"Pepper (Bell)","condition":"Healthy",
        "severity":"None","recovery":"N/A — plant is healthy",
        "description":"Your pepper plant is healthy! No disease detected.",
        "symptoms":["Deep green uniform leaf color","No spots or discoloration","Firm well-formed leaves","Normal growth pattern"],
        "treatment":["Continue regular watering","Maintain balanced NPK fertilization","Monitor weekly"],
        "prevention":["Mulch around base","Ensure good drainage","Keep field weed-free"],
    },
    "Potato_Early_blight": {
        "display":"Potato — Early Blight","plant":"Potato","condition":"Diseased",
        "severity":"Medium","recovery":"14–21 days with treatment",
        "description":"Early blight caused by Alternaria solani. Favoured by warm temperatures and wet conditions.",
        "symptoms":["Dark brown circular spots with concentric rings","Yellow halo around spots","Lower leaves affected first","Large dead areas when lesions merge"],
        "treatment":["Apply chlorothalonil or mancozeb fungicide","Remove and burn infected leaves","Spray every 7–10 days","Avoid overhead irrigation"],
        "prevention":["Use certified disease-free seed potatoes","Rotate crops for 2 years","Apply preventive fungicide","Remove volunteer potato plants"],
    },
    "Potato_Late_blight": {
        "display":"Potato — Late Blight","plant":"Potato","condition":"Diseased",
        "severity":"High","recovery":"Act within 48 hours — can destroy entire crop",
        "description":"Late blight caused by Phytophthora infestans. Extremely destructive in cool wet weather.",
        "symptoms":["Water-soaked pale green spots on leaf edges","Spots turn brown-black rapidly","White fuzzy mold on leaf underside","Dark brown rotting of stems"],
        "treatment":["Apply metalaxyl + mancozeb IMMEDIATELY","Remove and destroy ALL infected plants","Apply systemic fungicide (cymoxanil)","Spray every 5–7 days"],
        "prevention":["Plant resistant varieties","Use certified disease-free seed potatoes","Avoid overhead irrigation","Monitor closely in cool wet weather"],
    },
    "Potato_healthy": {
        "display":"Potato — Healthy","plant":"Potato","condition":"Healthy",
        "severity":"None","recovery":"N/A — plant is healthy",
        "description":"Your potato plant is healthy! No disease detected.",
        "symptoms":["Bright green leaves without spots","Strong upright stems","Normal leaf texture","No discoloration or lesions"],
        "treatment":["Continue regular hilling of soil","Maintain consistent moisture","Apply balanced fertilizer"],
        "prevention":["Monitor weekly","Ensure good drainage","Keep field free of weeds"],
    },
    "Tomato_Bacterial_spot": {
        "display":"Tomato — Bacterial Spot","plant":"Tomato","condition":"Diseased",
        "severity":"Medium","recovery":"10–14 days",
        "description":"Caused by Xanthomonas vesicatoria. Spreads rapidly in warm wet weather.",
        "symptoms":["Small dark water-soaked spots on leaves","Spots turn brown with yellow margins","Fruit shows small raised spots","Severe infection causes defoliation"],
        "treatment":["Apply copper hydroxide or copper oxychloride","Use streptomycin bactericide","Remove heavily infected leaves","Stop overhead irrigation"],
        "prevention":["Use disease-free certified seeds","Treat seeds with hot water 50°C","Rotate crops","Stake plants for better air circulation"],
    },
    "Tomato_Early_blight": {
        "display":"Tomato — Early Blight","plant":"Tomato","condition":"Diseased",
        "severity":"Medium","recovery":"14–21 days",
        "description":"Caused by Alternaria solani. Very common tomato disease starting on older lower leaves.",
        "symptoms":["Brown spots with concentric rings (target pattern)","Yellowing around spots","Lower leaves affected first","Dark sunken lesions on stems"],
        "treatment":["Apply mancozeb or chlorothalonil fungicide","Remove infected lower leaves","Apply every 7–10 days","Water at soil level only"],
        "prevention":["Mulch soil to reduce splash","Rotate crops for 2–3 years","Use resistant tomato varieties","Plant in full sun"],
    },
    "Tomato_Late_blight": {
        "display":"Tomato — Late Blight","plant":"Tomato","condition":"Diseased",
        "severity":"High","recovery":"Act immediately — can destroy crop in days",
        "description":"Caused by Phytophthora infestans. Extremely destructive in cool wet conditions.",
        "symptoms":["Large dark brown water-soaked patches","White fuzzy mold on leaf underside","Dark lesions on stems","Brown rot on fruit"],
        "treatment":["Apply metalaxyl + mancozeb IMMEDIATELY","Remove and destroy all infected parts","Apply systemic fungicide","Spray every 5–7 days"],
        "prevention":["Grow resistant varieties","Avoid dense planting","Remove plant debris after harvest","Avoid overhead watering"],
    },
    "Tomato_Leaf_Mold": {
        "display":"Tomato — Leaf Mold","plant":"Tomato","condition":"Diseased",
        "severity":"Medium","recovery":"10–14 days",
        "description":"Caused by Passalora fulva. Common in high humidity conditions.",
        "symptoms":["Pale yellowish-green spots on upper leaf","Olive-green velvety mold on underside","Leaves curl and wither","Defoliation in severe cases"],
        "treatment":["Reduce humidity by improving ventilation","Apply chlorothalonil or copper fungicide","Remove affected leaves","Space plants wider"],
        "prevention":["Maintain humidity below 85%","Use resistant varieties","Prune lower leaves for airflow","Avoid overcrowding"],
    },
    "Tomato_Septoria_leaf_spot": {
        "display":"Tomato — Septoria Leaf Spot","plant":"Tomato","condition":"Diseased",
        "severity":"Medium","recovery":"14–21 days",
        "description":"Caused by Septoria lycopersici. Starts from bottom of plant upward.",
        "symptoms":["Small circular spots with dark border and grey center","Tiny black dots in spot centers","Lower leaves affected first","Heavy defoliation weakens plant"],
        "treatment":["Remove all infected leaves immediately","Apply mancozeb or chlorothalonil","Spray every 7–10 days","Apply mulch to prevent soil splash"],
        "prevention":["Crop rotation for 2 years","Remove plant debris after harvest","Stake plants for airflow","Use disease-free seeds"],
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "display":"Tomato — Spider Mites","plant":"Tomato","condition":"Diseased (Pest)",
        "severity":"Medium","recovery":"7–14 days",
        "description":"Two-spotted spider mite (Tetranychus urticae). Thrives in hot dry conditions.",
        "symptoms":["Tiny yellow or white stippling on leaves","Fine silky webbing on leaf underside","Leaves turn bronze then yellow","Leaves dry out and fall"],
        "treatment":["Spray with 2% neem oil solution","Apply miticide (abamectin)","Spray water on leaf underside","Remove heavily infested leaves"],
        "prevention":["Keep plants well watered","Avoid excessive nitrogen fertilizer","Spray water on leaves in early morning","Monitor in hot dry weather"],
    },
    "Tomato_Target_Spot": {
        "display":"Tomato — Target Spot","plant":"Tomato","condition":"Diseased",
        "severity":"Medium","recovery":"14–21 days",
        "description":"Caused by Corynespora cassiicola. Common in tropical and warm climates.",
        "symptoms":["Circular brown spots with concentric rings","Yellow halo around spots","Affects leaves, stems and fruit","Sunken dark lesions on fruit"],
        "treatment":["Apply azoxystrobin or chlorothalonil","Remove infected plant material","Improve air circulation","Apply every 7–10 days"],
        "prevention":["Avoid overhead irrigation","Stake plants for airflow","Rotate crops","Remove plant debris after harvest"],
    },
    "Tomato_Tomato_YellowLeaf_Curl_Virus": {
        "display":"Tomato — Yellow Leaf Curl Virus","plant":"Tomato","condition":"Diseased (Virus)",
        "severity":"High","recovery":"No cure — manage spread",
        "description":"Tomato Yellow Leaf Curl Virus (TYLCV) spread by whiteflies. No chemical cure.",
        "symptoms":["Leaves curl upward and inward","Leaves become small and yellow","Stunted plant growth","Flower drop and poor fruit set"],
        "treatment":["Remove and destroy all infected plants","Control whitefly with imidacloprid","Apply yellow sticky traps","Use neem oil spray"],
        "prevention":["Plant resistant varieties (TY-1, TY-2 gene)","Use reflective silver mulch","Install insect-proof nets","Remove weeds that harbour whiteflies"],
    },
    "Tomato_Tomato_mosaic_virus": {
        "display":"Tomato — Mosaic Virus","plant":"Tomato","condition":"Diseased (Virus)",
        "severity":"High","recovery":"No cure — remove infected plants",
        "description":"Tomato Mosaic Virus (ToMV) spread by contact — tools, hands, and aphids.",
        "symptoms":["Mottled light and dark green mosaic pattern","Leaves may be distorted","Fruit shows yellow patches","Stunted plant growth"],
        "treatment":["Remove and destroy ALL infected plants","Disinfect tools with 10% bleach","Wash hands thoroughly","Control aphids to reduce spread"],
        "prevention":["Use certified virus-free seeds","Plant resistant varieties","Disinfect tools regularly","Do not smoke near tomato plants"],
    },
    "Tomato_healthy": {
        "display":"Tomato — Healthy","plant":"Tomato","condition":"Healthy",
        "severity":"None","recovery":"N/A — plant is healthy",
        "description":"Your tomato plant is healthy! No disease detected. Keep up the great work!",
        "symptoms":["Deep green uniform leaf color","No spots or lesions","Strong sturdy stems","Normal leaf size and texture"],
        "treatment":["Continue regular watering at soil level","Apply balanced fertilizer as needed","Support with stakes as plant grows"],
        "prevention":["Inspect plants weekly","Mulch around base","Ensure good drainage and airflow"],
    },
}

CROP_LABELS = {
    0:"rice",1:"maize",2:"chickpea",3:"kidneybeans",4:"pigeonpeas",
    5:"mothbeans",6:"mungbean",7:"blackgram",8:"lentil",9:"pomegranate",
    10:"banana",11:"mango",12:"grapes",13:"watermelon",14:"muskmelon",
    15:"apple",16:"orange",17:"papaya",18:"coconut",19:"cotton",
    20:"jute",21:"coffee"
}
CROP_TIPS = {
    "rice":{"season":"Kharif (Jun–Nov)","water":"High","days":"90–120","tip":"Maintain 5cm standing water during tillering."},
    "maize":{"season":"Kharif/Rabi","water":"Medium","days":"80–110","tip":"Needs well-drained fertile soil."},
    "chickpea":{"season":"Rabi (Oct–Mar)","water":"Low","days":"90–100","tip":"Drought tolerant. Do NOT overwater."},
    "kidneybeans":{"season":"Kharif","water":"Medium","days":"80–100","tip":"Provide staking support when vine climbs."},
    "pigeonpeas":{"season":"Kharif","water":"Low","days":"150–180","tip":"Deep-rooted, drought-resistant."},
    "mothbeans":{"season":"Kharif","water":"Low","days":"60–75","tip":"Thrives in hot arid sandy soils."},
    "mungbean":{"season":"Kharif/Zaid","water":"Low","days":"60–90","tip":"Short-duration quick cash crop."},
    "blackgram":{"season":"Kharif","water":"Low","days":"70–90","tip":"Fixes nitrogen — good for soil health."},
    "lentil":{"season":"Rabi","water":"Low","days":"100–120","tip":"Cool-season crop, low water need."},
    "pomegranate":{"season":"Perennial","water":"Low","days":"120–130","tip":"Highly drought-tolerant."},
    "banana":{"season":"Year-round","water":"High","days":"240–365","tip":"Needs constant moisture and warmth."},
    "mango":{"season":"Summer","water":"Low","days":"100–150","tip":"Stop irrigation during flowering."},
    "grapes":{"season":"Jan–May","water":"Medium","days":"150–180","tip":"Prune after harvest for next season."},
    "watermelon":{"season":"Summer","water":"Medium","days":"70–90","tip":"Sandy loam soil gives best quality."},
    "muskmelon":{"season":"Summer","water":"Medium","days":"70–90","tip":"Harvest when stem detaches naturally."},
    "apple":{"season":"Hilly regions","water":"Medium","days":"150–180","tip":"Needs winter chill below 7C."},
    "orange":{"season":"Winter","water":"Medium","days":"240–300","tip":"Well-drained soil, full sunlight."},
    "papaya":{"season":"Year-round","water":"Medium","days":"180–210","tip":"First fruit in just 6 months."},
    "coconut":{"season":"Perennial","water":"High","days":"5–6 yrs","tip":"Tolerates saline coastal conditions."},
    "cotton":{"season":"Kharif","water":"Medium","days":"150–180","tip":"Pick bolls when fully open."},
    "jute":{"season":"Kharif","water":"High","days":"100–120","tip":"Warm humid climate, alluvial soil."},
    "coffee":{"season":"Perennial","water":"Medium","days":"3–4 yrs","tip":"Shade-grown, hilly terrain best."},
}
COMMODITY_MAP = {
    "Tomato":0,"Potato":1,"Onion":2,"Rice":3,"Wheat":4,
    "Cotton":5,"Sugarcane":6,"Maize":7,"Chilli":8,"Brinjal":9,
    "Banana":10,"Mango":11,"Grapes":12,"Orange":13,"Papaya":14,
}

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status":"ok","disease_classes":DISEASE_CLASSES})

@app.route("/api/disease-detect", methods=["POST"])
def disease_detect():
    if "file" not in request.files:
        return jsonify({"error":"No file uploaded."}), 400
    f = request.files["file"]
    if not f.filename:
        return jsonify({"error":"Empty filename."}), 400
    try:
        img = Image.open(io.BytesIO(f.read())).convert("RGB").resize((128,128))
        arr = np.expand_dims(np.array(img, dtype=np.float32)/255.0, axis=0)
        pred = disease_model(arr, training=False).numpy()[0]
        idx  = int(np.argmax(pred))
        conf = round(float(pred[idx])*100, 1)
        cls  = DISEASE_CLASSES[idx]
        info = DISEASE_INFO.get(cls, {})
        top3 = [
            {"class":DISEASE_CLASSES[int(i)],"display":DISEASE_INFO.get(DISEASE_CLASSES[int(i)],{}).get("display",""),"confidence":round(float(pred[i])*100,1)}
            for i in np.argsort(pred)[::-1][:3]
        ]
        print(f"[disease] cls={cls} conf={conf}%")
        return jsonify({
            "class":cls,"display":info.get("display",cls),"plant":info.get("plant","Unknown"),
            "condition":info.get("condition","Unknown"),"confidence":conf,
            "severity":info.get("severity","Unknown"),"recovery":info.get("recovery","Consult an expert"),
            "description":info.get("description",""),"symptoms":info.get("symptoms",[]),
            "treatment":info.get("treatment",[]),"prevention":info.get("prevention",[]),
            "top3":top3,"healthy":"healthy" in cls.lower(),"rejected":False,
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error":"Prediction failed: "+str(e)}), 500

@app.route("/api/crop-recommend", methods=["POST"])
def crop_recommend():
    b = request.get_json(force=True)
    try:
        df = pd.DataFrame([{"N":float(b["N"]),"P":float(b["P"]),"K":float(b["K"]),
            "temperature":float(b["temperature"]),"humidity":float(b["humidity"]),
            "ph":float(b["ph"]),"rainfall":float(b["rainfall"])}])
        p  = int(crop_model.predict(df)[0])
        pr = crop_model.predict_proba(df)[0]
        n  = CROP_LABELS.get(p,"class_"+str(p))
        t3 = np.argsort(pr)[::-1][:3]
        return jsonify({"crop":n,"confidence":round(float(pr[p])*100,1),"tips":CROP_TIPS.get(n,{}),
            "top3":[{"crop":CROP_LABELS.get(int(i),""),"confidence":round(float(pr[i])*100,1)} for i in t3]})
    except Exception as e:
        return jsonify({"error":str(e)}), 500

@app.route("/api/price-predict", methods=["POST"])
def price_predict():
    b = request.get_json(force=True)
    c = str(b.get("commodity",""))
    if c not in COMMODITY_MAP:
        return jsonify({"error":f"Unknown commodity '{c}'."}), 400
    try:
        df = pd.DataFrame([{"Commodity":float(COMMODITY_MAP[c]),"Min Price":float(b["minPrice"]),
            "Max Price":float(b["maxPrice"]),"Year":float(b["year"]),
            "Month":float(b["month"]),"Day":float(b["day"])}])
        price = float(price_model.predict(df)[0])
        return jsonify({"predictedPrice":round(price,2),"commodity":c,"unit":"Rs/quintal",
            "inputs":{"minPrice":b["minPrice"],"maxPrice":b["maxPrice"],
                "date":f"{int(b['day']):02d}/{int(b['month']):02d}/{int(b['year'])}"}})
    except Exception as e:
        return jsonify({"error":str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("="*50)
    print(f"  AgroSense API  →  http://localhost:{port}")
    print("="*50+"\n")
    app.run(debug=False, host="0.0.0.0", port=port)