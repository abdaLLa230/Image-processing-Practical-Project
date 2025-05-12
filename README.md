# 🖼️ Image Enhancement & Classification Web App

A Flask-based web application that allows users to **upload an image**, **enhance it using various filters**, or **classify it using a pre-trained ML model**. The frontend is built using **HTML, Tailwind CSS, and vanilla JavaScript**.


## 📸 Features

- Upload any image from your device.
- Apply enhancement effects l.
- Choose multiple enhancement filters at once.
- Preview both original and enhanced images.
- Classify the image using a machine learning model.
- Show prediction probabilities with a progress bar.

### 🖼️ Image Enhancement
- Upload any image and apply effects like:
  - Contrast
  - Invert
  - Noise
  - Edge
  - Crystal
  - Dilation
  - Histogram
  - Histogram EQ
  - Sobel
- Effects are applied server-side using Pillow and NumPy.

### 🔍 Image Classification
- Choose a model (ResNet50 , EfficientNetB0 ,MobileNetV2 ).
- Upload an image and view top predictions with confidence percentages.
- Visual progress bar shows class probabilities.

---

## 🧠 Models Classification

  - ResNet50
  - EfficientNetB0
  - MobileNetV2

---



---

## 🛠️ Technologies Used

- **Backend:** Flask (Python)
- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Machine Learning:** TensorFlow / PyTorch models (loaded server-side)
- **Image Processing:** PIL (Python Imaging Library)
- **Deployment:** Localhost / Render



## 🗂️ Project Structure

Project-APP/
├── app.py # Main backend Flask application & Image enhancement and classification logic

├── static/

│ ├── uploaded/ # Stores uploaded images & Processed images

│ ├── script.js # Handles frontend interactivity

│ └── style.css # Tailwind/custom styles

├── Templates/

│ └── index.html # Main HTML interface

├── requirements.txt # Python dependencies

└── Readme.md # Project documentation (this file)


### 📦 Install Requirements
    pip install -r requirements.txt

### 🚀 Running the App
    python app.py


### Team Member

  Name : Abdallah Ali Abdallah                 ID: 23017771  
  Name : Ibrahim Yasser Abdelmoneim            ID: 23017792
  Name : Mohamed Hany Abdelrahman              ID: 23017738
  Name : Omar Sameh Sabry                      ID: 23017897
  Name : Abdelrahman Saber Gaber               ID: 23017855
  Name : Mohamed Adel Galal                    ID: 202200687
