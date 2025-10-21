<div id="reviewFormModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <button class="auth-close-btn" onclick="closeReviewForm()">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>

        <div class="auth-header">
            <div class="auth-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
                </svg>
            </div>
            <h2>Write a Review</h2>
            <p>Share your experience with us</p>
        </div>

        <form id="reviewForm" class="auth-form" enctype="multipart/form-data">
            @csrf
            
            <!-- Star Rating -->
            <div class="form-group">
                <label>Your Rating <span style="color: #f44336;">*</span></label>
                <div class="star-rating-input" id="starRatingInput">
                    <input type="hidden" name="rating" id="ratingValue" required>
                    <div class="stars-input">
                        <span class="star-input" data-rating="1">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </span>
                        <span class="star-input" data-rating="2">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </span>
                        <span class="star-input" data-rating="3">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </span>
                        <span class="star-input" data-rating="4">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </span>
                        <span class="star-input" data-rating="5">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </span>
                    </div>
                    <span class="rating-label" id="ratingLabel">Select rating</span>
                </div>
            </div>

            <!-- Commission Type -->
            <div class="form-group">
                <label for="commissionType">Commission Type</label>
                <select id="commissionType" name="commission_type">
                    <option value="">Select type (optional)</option>
                    <option value="Character Design">Character Design</option>
                    <option value="Illustration">Illustration</option>
                    <option value="Animation">Animation</option>
                    <option value="Concept Art">Concept Art</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <!-- Review Comment -->
            <div class="form-group">
                <label for="reviewComment">Your Review <span style="color: #f44336;">*</span></label>
                <textarea 
                    id="reviewComment" 
                    name="comment" 
                    rows="5" 
                    placeholder="Share your experience... (minimum 10 characters)"
                    required
                    minlength="10"
                    maxlength="1000"
                ></textarea>
                <div class="char-count">
                    <span id="charCount">0</span>/1000 characters
                </div>
            </div>

            <!-- Image Upload -->
            <div class="form-group">
                <label>Add Photos (Optional)</label>
                <div class="image-upload-area">
    <label for="reviewImages" class="upload-label">
        <svg viewBox="0 0 24 24" width="40" height="40">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span>Upload Images (Optional)</span>
        <small>Max 3 images, up to 10MB each</small>
    </label>
    <input 
        type="file" 
        id="reviewImages" 
        name="images[]" 
        accept="image/*"
        multiple
        style="display: none;"
    >
    <!-- ✅ Container ID harus 'imagePreview' -->
    <div id="imagePreview" class="image-preview-container"></div>
</div>  
                <div class="image-preview-container" id="imagePreviewContainer"></div>
            </div>

            <button type="submit" class="auth-submit-btn">
                <span>Submit Review</span>
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
                </svg>
            </button>
        </form>
    </div>
</div>