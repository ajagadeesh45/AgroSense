"""
AgroSense — Model Downloader
=============================
Run this before starting the server on Render.
Upload your model files to Google Drive first, then paste the file IDs below.

How to get Google Drive File ID:
1. Upload file to Google Drive
2. Right click → Share → Anyone with the link → Copy link
3. Link looks like: https://drive.google.com/file/d/1ABC123XYZ/view
4. File ID is the part between /d/ and /view  →  1ABC123XYZ
"""

import os
import sys

# ── Paste your Google Drive file IDs here ──────────────────────
MODEL_IDS = {
    "leaf_disease_model.h5":         "1_9xodp-s36B4KPaj7UkxMSUGSo7ULCPX",
    "Crop_recommendation_model.pkl": "1yWEHS5gRGoPxP_S1GoPINRe3aZdlRTlq",
    "price_model.pkl":               "1yUWN3pWB1RD70Q60rrGDnpPBx4IFykJf",
    "label_encoder.pkl":             "1MoZNcuHfbHYzB48r6g_Ud6kXclA26yJc",
}

HERE = os.path.dirname(os.path.abspath(__file__))

def download_models():
    all_present = True
    missing = []

    for filename, file_id in MODEL_IDS.items():
        path = os.path.join(HERE, filename)
        if os.path.exists(path):
            size = os.path.getsize(path) // 1024
            print(f"  [OK] {filename} already exists ({size} KB)")
        else:
            if file_id == "PASTE_FILE_ID_HERE":
                print(f"  [SKIP] {filename} — no file ID set")
                missing.append(filename)
                all_present = False
            else:
                try:
                    import gdown
                    print(f"  [↓] Downloading {filename}...")
                    url = f"https://drive.google.com/uc?id={file_id}&export=download"
                    gdown.download(url, path, quiet=False, fuzzy=True)
                    if os.path.exists(path):
                        size = os.path.getsize(path) // 1024
                        print(f"  [OK] {filename} downloaded ({size} KB)")
                    else:
                        print(f"  [ERROR] {filename} download failed")
                        missing.append(filename)
                        all_present = False
                except ImportError:
                    print("  [ERROR] gdown not installed. Run: pip install gdown")
                    sys.exit(1)
                except Exception as e:
                    print(f"  [ERROR] Failed to download {filename}: {e}")
                    missing.append(filename)
                    all_present = False

    if not all_present:
        print(f"\n[WARNING] Missing models: {missing}")
        print("  Upload them to Google Drive and paste the file IDs in download_models.py")
    else:
        print("\n  All models ready!")

if __name__ == "__main__":
    print("\nChecking model files...")
    download_models()