/**
 * Face Detection Module
 * Uses TinyFaceDetector for efficient face detection on low-end devices
 * Detects number of faces and auto-fills student count fields
 */

let modelsLoaded = false;
let videoStream = null;

/**
 * Initialize face-api models
 * Downloads TinyFaceDetector model on first use
 */
console.log('faceDetection.js loaded v2');
async function initializeFaceDetection() {
  try {
    if (modelsLoaded) return true;

    console.log('Loading face detection models...');

    const modelUrls = [
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/',
      'https://unpkg.com/@vladmandic/face-api@1.7.14/model/',
      'https://raw.githubusercontent.com/vladmandic/face-api/master/model/',
    ];

    let loaded = false;
    for (const modelUrl of modelUrls) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        ]);
        loaded = true;
        console.log(`Loaded face models from ${modelUrl}`);
        break;
      } catch (e) {
        console.warn(`Failed to load models from ${modelUrl}:`, e.message);
      }
    }

    if (!loaded) {
      throw new Error('All CDN model sources failed');
    }

    modelsLoaded = true;
    return true;
  } catch (error) {
    console.warn('Face detection models unavailable - using manual entry mode', error);
    return false;
  }
}

/**
 * Request camera access with error handling
 */
async function requestCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
      audio: false,
    });

    return stream;
  } catch (error) {
    console.error('Camera access error:', error);

    if (error.name === 'NotAllowedError') {
      showAlert('Camera permission denied. Please allow camera access.', 'error');
    } else if (error.name === 'NotFoundError') {
      showAlert('No camera device found.', 'error');
    } else if (error.name === 'NotReadableError') {
      showAlert('Unable to access camera. It may be in use by another application.', 'error');
    } else {
      showAlert('Error accessing camera: ' + error.message, 'error');
    }

    return null;
  }
}

/**
 * Start video stream
 */
async function startVideoStream(videoElement) {
  try {
    const stream = await requestCameraAccess();
    if (!stream) return false;

    videoElement.srcObject = stream;
    videoStream = stream;

    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve(true);
      };
    });
  } catch (error) {
    console.error('Error starting video stream:', error);
    showAlert('Error starting camera stream', 'error');
    return false;
  }
}

/**
 * Stop video stream
 */
function stopVideoStream() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
}

/**
 * Capture photo from video stream
 */
async function capturePhotoFromStream(videoElement, canvasElement) {
  const ctx = canvasElement.getContext('2d');

  // Ensure video dimensions are available
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve(true);
    });
  }

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  canvasElement.style.display = 'block';

  return canvasElement.toDataURL('image/jpeg', 0.92);
}

/**
 * Detect faces in image
 * Returns number of faces detected
 */
async function detectFacesInImage(canvasElement) {
  try {
    const loaded = await initializeFaceDetection();
    if (!loaded) {
      showAlert(
        'Face detection unavailable. Please enter student count manually.',
        'warning'
      );
      return null;
    }

    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex';

    const detections = await faceapi.detectAllFaces(
      canvasElement,
      new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.35,
      })
    );

    loadingSpinner.style.display = 'none';
    return detections.length;
  } catch (error) {
    console.error('Error detecting faces:', error);

    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';

    showAlert('Face detection failed. Using manual mode.', 'warning');
    return null;
  }
}

/**
 * Process captured photo and detect faces
 */
async function processCapturedPhoto(photoDataUrl) {
  try {
    console.log('processCapturedPhoto: Starting face detection...');
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex';

    const loaded = await initializeFaceDetection();
    if (!loaded) {
      loadingSpinner.style.display = 'none';
      console.error('Face detection models not available');
      showAlert('Face detection models not available. Please enter data manually.', 'error');
      return null;
    }

    // Create an image element from the dataURL
    const img = new Image();
    img.src = photoDataUrl;
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    console.log('Image loaded, dimensions:', img.width, 'x', img.height);

    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.35,
      })
    );

    console.log('Detections:', detections.length, 'faces found');
    loadingSpinner.style.display = 'none';
    
    return detections.length;
  } catch (error) {
    console.error('Error processing photo:', error);

    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';

    showAlert('Error processing image. Please try again.', 'error');
    return null;
  }
}

/**
 * Auto-fill student count based on detected faces
 */
function autoFillStudentCount(detectedCount) {
  console.log('autoFillStudentCount called with:', detectedCount);

  if (detectedCount === null || detectedCount === undefined) {
    console.warn('No valid detected count');
    return;
  }

  const classGroup1to5 = document.getElementById('classGroup1to5');
  const classGroup6to8 = document.getElementById('classGroup6to8');

  if (classGroup1to5.checked) {
    document.getElementById('detectedStudents1to5').value = detectedCount;
  } else if (classGroup6to8.checked) {
    document.getElementById('detectedStudents6to8').value = detectedCount;
  } else {
    console.warn('No class group selected. Cannot assign detected count.');
    return;
  }

  showAlert(`Detected: ${detectedCount} student(s). The detected total has been updated.`, 'success');
}

/**
 * Display detection result message
 */
function displayDetectionResult(detectedCount, canvasElement) {
  const resultDiv = document.getElementById('detectionResult');
  const resultMessage = document.getElementById('detectionMessage');

  if (detectedCount === null || detectedCount === undefined) {
    resultDiv.style.display = 'none';
    return;
  }

  if (detectedCount === 0) {
    resultDiv.classList.add('error');
    resultMessage.innerHTML =
      'No faces detected. Please ensure proper lighting and try again.';
  } else {
    resultDiv.classList.remove('error');
    resultMessage.innerHTML = `Detected <strong>${detectedCount}</strong> student(s)`;
  }

  resultDiv.style.display = 'block';

  // Draw bounding boxes (optional visualization)
  if (detectedCount > 0) {
    drawDetectionBoxes(canvasElement);
  }
}

/**
 * Draw bounding boxes around detected faces (optional)
 */
async function drawDetectionBoxes(canvasElement) {
  try {
    const ctx = canvasElement.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Redraw image
    const video = document.getElementById('videoFeed');
    if (video && video.srcObject) {
      ctx.drawImage(video, 0, 0);
    }

    // Detect and draw boxes
    const detections = await faceapi.detectAllFaces(
      canvasElement,
      new faceapi.TinyFaceDetectorOptions()
    );

    detections.forEach((detection) => {
      const box = detection.detection.box;

      // Draw rectangle
      ctx.strokeStyle = '#4a7c59';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw circle
      ctx.fillStyle = '#4a7c59';
      ctx.beginPath();
      ctx.arc(box.x + box.width / 2, box.y + box.height / 2, 30, 0, 2 * Math.PI);
      ctx.stroke();
    });

    canvasElement.style.display = 'block';
  } catch (error) {
    console.error('Error drawing detection boxes:', error);
  }
}

/**
 * Check browser support for face detection
 */
function checkBrowserSupport() {
  const support = {
    mediaDevices: !!navigator.mediaDevices?.getUserMedia,
    canvas: !!document.createElement('canvas').getContext,
  };

  if (!support.mediaDevices) {
    console.warn('getUserMedia not supported');
    showAlert('Camera access not supported in this browser.', 'warning');
    return false;
  }

  if (!support.canvas) {
    console.warn('Canvas not supported');
    showAlert('Canvas not supported in this browser.', 'warning');
    return false;
  }

  return true;
}

// Export functions for global access
window.faceDetection = {
  initializeFaceDetection,
  requestCameraAccess,
  startVideoStream,
  stopVideoStream,
  capturePhotoFromStream,
  detectFacesInImage,
  processCapturedPhoto,
  autoFillStudentCount,
  displayDetectionResult,
  checkBrowserSupport,
};
