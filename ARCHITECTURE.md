# DCHI SignLink: System Architecture & Development Blueprint

As the Senior Full-Stack Developer and AI Architect for the DCHI SignLink project, I have designed a robust, scalable, and highly secure architecture tailored to meet the specific needs of the South African Deaf community. 

This blueprint outlines the technical foundation required to achieve real-time (< 2 seconds) SASL translation, edge AI capabilities, and POPIA-compliant healthcare data management.

---

## 1. High-Level System Architecture

The architecture is divided into three primary layers: the **Edge/Client Layer**, the **Cloud Processing Layer**, and the **Data & Security Layer**.

### A. Edge/Client Layer (Mobile App)
*   **Camera & Sensor Module:** Captures high-framerate video input (60fps) for fluid gesture tracking.
*   **On-Device AI Engine (TensorFlow Lite):** 
    *   Runs the MediaPipe Holistic pipeline locally to extract 21 hand landmarks, pose estimation, and 468 facial landmarks.
    *   Executes the optimized TFLite SASL classification model to ensure offline functionality (crucial for rural areas).
*   **Local State Management:** Caches medical history and emergency contacts securely using encrypted local storage (e.g., SQLCipher).

### B. Cloud Processing Layer (Google Cloud Platform)
*   **API Gateway:** Routes incoming requests from the app to the appropriate microservices.
*   **Translation & NLP Service:** 
    *   Matches recognized SASL glosses against the 5,000+ medical term database.
    *   Uses Google Cloud Translation API to localize English output into Zulu, Xhosa, and Afrikaans.
*   **Two-Way Audio Service:** 
    *   **Speech-to-Text (STT):** Transcribes the doctor's spoken response into text.
    *   **Text-to-Speech (TTS):** Synthesizes the translated SASL text into natural-sounding audio for the doctor.

### C. Data & Security Layer
*   **Google Cloud Healthcare API:** Manages patient interaction logs and medical data using FHIR (Fast Healthcare Interoperability Resources) standards.
*   **Cloud KMS (Key Management Service):** Manages cryptographic keys for end-to-end encryption.

---

## 2. Tech Stack Recommendation: Flutter vs. React Native

For DCHI SignLink, I strongly recommend **Flutter** as the primary framework for the mobile application, with React Native as a secondary alternative.

### Why Flutter? (Recommended)
1.  **High-Performance Camera Rendering:** Flutter's rendering engine (Impeller/Skia) communicates directly with the native canvas. This is critical when overlaying complex skeletal tracking UI (MediaPipe) on a live camera feed at 60fps without dropping frames.
2.  **C/C++ Integration (FFI):** Flutter's Foreign Function Interface (FFI) allows seamless, zero-copy integration with the C++ MediaPipe libraries and TensorFlow Lite, drastically reducing the latency of the < 2-second translation goal.
3.  **Consistent UI:** Ensures the app looks and behaves identically across iOS and Android, which is vital for accessibility apps where UX consistency is paramount.

*Note: If your team already has deep React/TypeScript expertise (as seen in the current web prototype), **React Native** using `react-native-vision-camera` and Frame Processors (via Reanimated) is a viable alternative, though it requires more bridge-optimization overhead.*

---

## 3. Python/TensorFlow Initialization Code

Below is the foundational Python code used to train and initialize the hand-tracking and sign-recognition models before converting them to TensorFlow Lite for the mobile app.

```python
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf

# ==========================================
# 1. Initialize MediaPipe Holistic Model
# ==========================================
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# We use Holistic to capture Hands (21 points) + Face (Emotion/Grammar) + Pose
holistic = mp_holistic.Holistic(
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# ==========================================
# 2. Load the Edge AI Model (TFLite)
# ==========================================
# This model is trained on the SASL dataset (including 5000+ medical terms)
interpreter = tf.lite.Interpreter(model_path="dchi_sasl_model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# ==========================================
# 3. Feature Extraction Function
# ==========================================
def extract_keypoints(results):
    """Extracts and flattens landmarks for the Neural Network."""
    # 21 Hand Landmarks (x, y, z) = 63 data points per hand
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    
    # Facial landmarks for non-manual markers (Emotion/Grammar)
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
    
    # Concatenate into a single feature vector
    return np.concatenate([lh, rh, face])

# ==========================================
# 4. Real-Time Processing Loop (Simulation)
# ==========================================
def process_video_stream():
    cap = cv2.VideoCapture(0)
    sequence = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
            
        # Convert BGR to RGB for MediaPipe
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Process image and extract landmarks
        results = holistic.process(image)
        keypoints = extract_keypoints(results)
        
        # Append to sequence (e.g., 30 frames per sign)
        sequence.append(keypoints)
        sequence = sequence[-30:] # Keep only the last 30 frames
        
        if len(sequence) == 30:
            # Prepare input tensor
            input_data = np.expand_dims(sequence, axis=0).astype(np.float32)
            interpreter.set_tensor(input_details[0]['index'], input_data)
            
            # Run inference
            interpreter.invoke()
            prediction = interpreter.get_tensor(output_details[0]['index'])
            
            # Get highest probability class (SASL Gloss)
            class_id = np.argmax(prediction)
            print(f"Predicted SASL Gloss ID: {class_id}")

    cap.release()
```

---

## 4. Security Protocol Plan (POPIA & HIPAA Compliant)

Handling medical data requires strict adherence to the Protection of Personal Information Act (POPIA). Here is the end-to-end security protocol:

### A. Data Minimization & Anonymization
*   **Edge-First Processing:** Video feeds of the Deaf user are **never** sent to the cloud. MediaPipe extracts the skeletal coordinate data (numbers) on the device. Only the resulting text (e.g., "I have chest pain") is transmitted for multi-language translation.
*   **Ephemeral Audio:** Doctor voice recordings sent to Google Cloud Speech-to-Text are processed in memory and immediately discarded. No audio files are saved to disk.

### B. End-to-End Encryption (E2EE)
*   **Data in Transit:** All API communications between the mobile app and Google Cloud are secured using **TLS 1.3**.
*   **Data at Rest (Device):** Any local data (like emergency contacts or offline medical history) is encrypted using **AES-256-GCM** via Flutter Secure Storage / React Native Keychain.
*   **Data at Rest (Cloud):** Data stored in Google Cloud is encrypted by default. We will implement **Customer-Managed Encryption Keys (CMEK)** via Cloud KMS to ensure DCHI retains absolute control over the encryption keys.

### C. Cloud Healthcare API Integration
*   All medical consultation logs (if the user opts to save them for their records) are routed through the **Google Cloud Healthcare API**.
*   This ensures data is stored in **FHIR (Fast Healthcare Interoperability Resources)** format.
*   **Audit Logging:** Cloud Audit Logs will track every access attempt to patient data, ensuring full traceability required by POPIA.

### D. Authentication & Authorization
*   **OAuth 2.0 / OpenID Connect:** Secure login for healthcare providers.
*   **Biometric Auth:** Required for patients to open the app's "Medical History" section (FaceID/Fingerprint).
*   **Role-Based Access Control (RBAC):** Doctors can only view translation logs for the duration of the active session unless explicitly granted permanent access by the patient via a digital handshake.
