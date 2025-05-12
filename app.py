# Import required libraries
import os
import time
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image
from io import BytesIO
import base64
from tensorflow.keras.applications import ResNet50, EfficientNetB0, MobileNetV2
from tensorflow.keras.applications.imagenet_utils import decode_predictions, preprocess_input
from tensorflow.keras.preprocessing import image as keras_image
from skimage.util import random_noise
from skimage.filters import sobel
from skimage.transform import swirl
from skimage import exposure

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploaded/'  # Folder to save uploaded images

# Load pre-trained models and their metadata
models = {
    'resnet': {
        'model': ResNet50(weights='imagenet'),
        'meta': {
            'name': 'ResNet50',
            'description': 'Deep residual network with 50 layers, achieves 76% top-1 accuracy on ImageNet.'
        }
    },
    'efficientnet': {
        'model': EfficientNetB0(weights='imagenet'),
        'meta': {
            'name': 'EfficientNetB0',
            'description': 'Lightweight and efficient model with 77.1% top-1 accuracy.'
        }
    },
    'mobilenet': {
        'model': MobileNetV2(weights='imagenet'),
        'meta': {
            'name': 'MobileNetV2',
            'description': 'Mobile-optimized model with 71.3% top-1 accuracy.'
        }
    }
}

# Make sure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# Image Enhancement Functions

def apply_contrast(img, alpha=1.5, beta=0):
    # Enhance contrast using linear transformation
    return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

def apply_invert(img):
    # Invert image colors (negative effect)
    return cv2.bitwise_not(img)

def apply_noise(img):
    # Add salt & pepper noise to image
    return (random_noise(img / 255.0, mode='s&p') * 255).astype(np.uint8)

def apply_edge(img):
    # Detect edges using Canny algorithm
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

def apply_crystal(img):
    # Apply stylization (cartoon/crystal-like effect)
    return cv2.stylization(img, sigma_s=60, sigma_r=0.6)

def apply_erosion(img, kernel_size=3):
    # Apply erosion to shrink white regions
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.erode(img, kernel, iterations=1)
    
def apply_dilation(img, kernel_size=3):
    # Apply dilation to emphasize white regions
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.dilate(img, kernel, iterations=1)

def apply_histogram(img):
    # Generate grayscale histogram visualization
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_img = np.zeros((256, 256), dtype=np.uint8)
    cv2.normalize(hist, hist, 0, 255, cv2.NORM_MINMAX)
    for i in range(256):
        cv2.line(hist_img, (i, 256), (i, 256 - int(hist[i])), 255, 1)
    return cv2.cvtColor(hist_img, cv2.COLOR_GRAY2BGR)

def apply_histogram_equalization(img):
    # Apply histogram equalization to improve contrast
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb[:,:,0] = cv2.equalizeHist(ycrcb[:,:,0])
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)

def apply_sobel(img):
    # Apply Sobel filter for edge detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=5)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=5)
    sobel_combined = np.sqrt(sobelx**2 + sobely**2)
    sobel_combined = cv2.normalize(sobel_combined, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U)
    return cv2.cvtColor(sobel_combined, cv2.COLOR_GRAY2BGR)

# Dictionary linking effect names to their functions
active_effects = {
    'contrast': apply_contrast,
    'invert': apply_invert,
    'noise': apply_noise,
    'edge': apply_edge,
    'crystal': apply_crystal,
    'erosion': apply_erosion,
    'dilation': apply_dilation,
    'histogram': apply_histogram,
    'histeq': apply_histogram_equalization,
    'sobel': apply_sobel  
}

# Apply list of effects sequentially to an image
def apply_effects(img, effects):
    processed_img = img.copy()
    for effect in effects:
        if effect in active_effects:
            processed_img = active_effects[effect](processed_img)
    return processed_img

# Classify image using selected model
def classify_image(img, model_name='resnet'):
    model_info = models.get(model_name)
    if not model_info:
        return [], {}

    model = model_info['model']
    img = cv2.resize(img, (224, 224))
    img_array = keras_image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    preds = model.predict(img_array)
    return decode_predictions(preds, top=3)[0], model_info['meta']


# Flask Routes

# Home page
@app.route('/')
def index():
    return render_template('index.html')

# Upload image route
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        original_path = os.path.join(app.config['UPLOAD_FOLDER'], 'original.jpg')
        cv2.imwrite(original_path, img)

        return jsonify({
            'original': f'/static/uploaded/original.jpg?t={int(time.time())}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Process image route for classification or enhancement
@app.route('/process', methods=['POST'])
def process_image():
    data = request.json
    effects = data.get('effects', [])
    action = data.get('action')
    model_name = data.get('model', 'resnet')

    original_path = os.path.join(app.config['UPLOAD_FOLDER'], 'original.jpg')
    img = cv2.imread(original_path)

    if action == 'classification':
        predictions, meta = classify_image(img, model_name)
        return jsonify({
            'predictions': [[p[1], float(p[2])] for p in predictions],
            'model_meta': meta
        })

    # Apply effects if not classification
    processed_img = apply_effects(img, effects)
    processed_path = os.path.join(app.config['UPLOAD_FOLDER'], 'processed.jpg')
    cv2.imwrite(processed_path, processed_img)

    return jsonify({
        'processed': f'/static/uploaded/processed.jpg?t={int(time.time())}'
    })

# Serve uploaded images from static directory
@app.route('/static/uploaded/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
