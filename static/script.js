    // Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
   
    // PAGE MANAGEMENT SYSTEM
    
    
    // Object containing references to all page elements
    const pages = {
        home: document.getElementById('homePage'),
        enhancement: document.getElementById('enhancementPage'),
        classification: document.getElementById('classificationPage')
    };

    // Function to hide all pages by adding 'hidden' class
    function hideAllPages() {
        Object.values(pages).forEach(page => page.classList.add('hidden'));
    }

    // Function to show a specific page by removing 'hidden' class
    function showPage(pageId) {
        hideAllPages();
        pages[pageId].classList.remove('hidden');
    }

   
    // NAVIGATION EVENT HANDLERS
   
    
    // Add click event listeners for navigation buttons
    document.getElementById('enhancementBtn').addEventListener('click', () => showPage('enhancement'));
    document.getElementById('classificationBtn').addEventListener('click', () => showPage('classification'));
    document.getElementById('backToHomeFromEnhancement').addEventListener('click', () => showPage('home'));
    document.getElementById('backToHomeFromClassification').addEventListener('click', () => showPage('home'));

    // Show home page by default when the page loads
    showPage('home');

    
    // IMAGE ENHANCEMENT FUNCTIONALITY
   
    
    // Get all DOM elements needed for image enhancement
    const imageUpload = document.getElementById('imageUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileName = document.getElementById('fileName');
    const processBtn = document.getElementById('processBtn');
    const originalImage = document.getElementById('originalImage');
    const originalPlaceholder = document.getElementById('originalPlaceholder');
    const processedImage = document.getElementById('processedImage');
    const processedPlaceholder = document.getElementById('processedPlaceholder');
    const processingOverlay = document.getElementById('processingOverlay');
    const enhancementBtns = document.querySelectorAll('.enhancement-btn');
    
    // Set to keep track of active enhancement effects
    let activeEffects = new Set();
    
    // Trigger file input click when upload button is clicked
    uploadBtn.addEventListener('click', () => imageUpload.click());
    
    // Handle file selection event
    imageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            // Update UI with selected file name
            fileName.textContent = this.files[0].name;
            processBtn.disabled = false;
            
            // Create FileReader to display image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                // Show original image and hide placeholder
                originalImage.src = e.target.result;
                originalImage.classList.remove('hidden');
                originalPlaceholder.classList.add('hidden');
                
                // Reset processed image display
                processedImage.src = '';
                processedImage.classList.add('hidden');
                processedPlaceholder.classList.remove('hidden');
            };
            // Read the file as data URL
            reader.readAsDataURL(this.files[0]);
            
            // Prepare form data for server upload
            const formData = new FormData();
            formData.append('file', this.files[0]);
            
            // Send file to server for processing
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Update original image source with server response
                originalImage.src = data.original + '?t=' + new Date().getTime();
            })
            .catch(error => {
                console.error('Error:', error);
                // Show error message if upload fails
                originalPlaceholder.textContent = 'Error loading image';
                originalPlaceholder.classList.remove('hidden');
            });
        }
    });
    
    // Handle process button click event
    processBtn.addEventListener('click', function() {
        // Show processing overlay and hide placeholder
        processingOverlay.classList.remove('hidden');
        processedPlaceholder.classList.add('hidden');
        
        // Send enhancement request to server
        fetch('/process', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'enhancement',
                effects: Array.from(activeEffects) // Convert Set to Array
            })
        })
        .then(res => res.json())
        .then(data => {
            // Display processed image from server response
            processedImage.src = data.processed + '?t=' + new Date().getTime();
            processedImage.classList.remove('hidden');
            processingOverlay.classList.add('hidden');
        })
        .catch(err => {
            console.error(err);
            // Show error message if processing fails
            processingOverlay.classList.add('hidden');
            processedPlaceholder.textContent = 'Error processing image';
            processedPlaceholder.classList.remove('hidden');
        });
    });
    
    // Add click handlers for all enhancement buttons
    enhancementBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type; // Get effect type from data attribute
            const badge = this.querySelector('.badge'); // Find the checkmark badge
            
            // Toggle effect activation
            if (activeEffects.has(type)) {
                // Remove effect if already active
                activeEffects.delete(type);
                badge.classList.add('hidden');
                this.classList.remove('active');
            } else {
                // Add effect if not active
                activeEffects.add(type);
                badge.classList.remove('hidden');
                this.classList.add('active');
            }
        });
    });

    // ==============================================
    // IMAGE CLASSIFICATION FUNCTIONALITY
    // ==============================================
    
    // Get all DOM elements needed for image classification
    const classifyImageUpload = document.getElementById('classifyImageUpload');
    const classifyUploadBtn = document.getElementById('classifyUploadBtn');
    const classifyFileName = document.getElementById('classifyFileName');
    const classifyBtn = document.getElementById('classifyBtn');
    const classifyOriginalImage = document.getElementById('classifyOriginalImage');
    const classifyOriginalPlaceholder = document.getElementById('classifyOriginalPlaceholder');
    const classificationResults = document.getElementById('classificationResults');
    const modelSelect = document.getElementById('modelSelect');
    
    // Trigger file input click when upload button is clicked
    classifyUploadBtn.addEventListener('click', () => classifyImageUpload.click());
    
    // Handle file selection event for classification
    classifyImageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            // Update UI with selected file name
            classifyFileName.textContent = this.files[0].name;
            classifyBtn.disabled = false;
            
            // Create FileReader to display image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                // Show original image and hide placeholder
                classifyOriginalImage.src = e.target.result;
                classifyOriginalImage.classList.remove('hidden');
                classifyOriginalPlaceholder.classList.add('hidden');
                
                // Reset classification results display
                classificationResults.innerHTML = `
                    <i class="fas fa-tags text-3xl block mb-2"></i>
                    Classification results
                `;
            };
            // Read the file as data URL
            reader.readAsDataURL(this.files[0]);
            
            // Prepare form data for server upload
            const formData = new FormData();
            formData.append('file', this.files[0]);
            
            // Send file to server for storage
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Update original image source with server response
                classifyOriginalImage.src = data.original + '?t=' + new Date().getTime();
            });
        }
    });
    
    // Handle classify button click event
    classifyBtn.addEventListener('click', function() {
        // Show loading spinner while processing
        classificationResults.innerHTML = `
            <div class="flex justify-center items-center h-full">
                <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            </div>
        `;
        
        // Send classification request to server
        fetch('/process', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'classification',
                model: modelSelect.value // Get selected model from dropdown
            })
        })
        .then(response => response.json())
        .then(data => {
            // Build HTML for displaying classification results
            let html = `
                <div class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <h4 class="font-bold text-gray-800">${data.model_meta.name}</h4>
                    <p class="text-sm text-gray-600">${data.model_meta.description}</p>
                </div>
                <div class="text-left w-full">
            `;
            
            // Add each prediction to the results display
            data.predictions.forEach(pred => {
                const percentage = (pred[1] * 100).toFixed(2); // Convert to percentage
                html += `
                    <div class="mb-3">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-medium">${pred[0].replace(/_/g, ' ')}</span>
                            <span>${percentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            // Update results display with generated HTML
            classificationResults.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            // Show error message if classification fails
            classificationResults.innerHTML = '<div class="text-red-500">Error during classification</div>';
        });
    });
});