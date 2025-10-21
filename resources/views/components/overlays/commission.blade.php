<div id="commissionsOverlay" class="overlay" style="display: none;">
    <div class="overlay-window">
        <div class="overlay-header">
            <h2>Commission Services</h2>
            <button class="close-btn" onclick="closeOverlay('commissionsOverlay')">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
        
        <div class="overlay-content">
            @auth
                @if(Auth::user()->role === 'admin')
                <!-- Admin Controls -->
                <div class="admin-commission-controls">
                    <button class="add-commission-btn" onclick="openCommissionForm()">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Add New Commission Type
                    </button>
                </div>
                @endif
            @endauth

            <!-- Commission Status Banner -->
            <div class="commission-status-banner">
                <div class="status-indicator" id="commissionStatus">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                        <polyline points="9 12 11 14 15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <div>
                        <strong>Commissions Open</strong>
                        <p>Accepting new projects</p>
                    </div>
                </div>
            </div>

            <!-- Payment Methods -->
            <div class="payment-methods-section">
                <h3>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                        <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Payment Methods
                </h3>
                <div class="payment-methods-grid">
                    <div class="payment-method-card">
                        <div class="payment-icon dana">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M15 12H3M15 12l-3-3M15 12l-3 3" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="payment-info">
                            <strong>DANA</strong>
                            <p>0812-3456-7890</p>
                            <small>a.n. Your Name</small>
                        </div>
                    </div>

                    <div class="payment-method-card">
                        <div class="payment-icon bank">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="payment-info">
                            <strong>Bank Transfer</strong>
                            <p>BCA: 1234567890</p>
                            <small>a.n. Your Name</small>
                        </div>
                    </div>

                    <div class="payment-method-card">
                        <div class="payment-icon gopay">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="payment-info">
                            <strong>GoPay</strong>
                            <p>0812-3456-7890</p>
                            <small>a.n. Your Name</small>
                        </div>
                    </div>
                </div>
                <div class="payment-note">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                        <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p>After payment, please send proof of payment via <strong>Chat</strong> for order confirmation</p>
                </div>
            </div>

            <!-- Commission Types List -->
            <div class="commissions-list" id="commissionsList">
                <div class="loading-spinner">
                    <svg class="spinner" viewBox="0 0 24 24" width="40" height="40">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                    </svg>
                    <p>Loading commissions...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Commission Form Modal (Admin Only) -->
<div id="commissionFormModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <button class="auth-close-btn" onclick="closeCommissionForm()">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>

        <div class="auth-header">
            <div class="auth-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="white"/>
                </svg>
            </div>
            <h2 id="commissionFormTitle">Add Commission Type</h2>
            <p>Create or update commission service</p>
        </div>

        <form id="commissionForm" class="auth-form" enctype="multipart/form-data">
            @csrf
            <input type="hidden" id="commissionId" name="commission_id">
            
            <!-- Commission Name -->
            <div class="form-group">
                <label for="commissionName">Service Name <span style="color: #f44336;">*</span></label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="white" fill="none" stroke-width="2"/>
                    </svg>
                    <input type="text" id="commissionName" name="name" placeholder="e.g., Character Design" required>
                </div>
            </div>

            <!-- Description -->
            <div class="form-group">
                <label for="commissionDescription">Description <span style="color: #f44336;">*</span></label>
                <textarea 
                    id="commissionDescription" 
                    name="description" 
                    rows="4" 
                    placeholder="Describe what's included in this service..."
                    required
                    minlength="20"
                    maxlength="5000"
                ></textarea>
                <div class="char-count">
                    <span id="descCharCount">0</span>/5000 characters
                </div>
            </div>

            <!-- Price -->
            <div class="form-group">
                <label for="commissionPrice">Starting Price <span style="color: #f44336;">*</span></label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <line x1="12" y1="1" x2="12" y2="23" stroke="white" stroke-width="2"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="number" id="commissionPrice" name="price" placeholder="e.g., 100000" min="0" step="1000" required>
                </div>
                <small style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px; display: block;">
                    IDR (Indonesian Rupiah)
                </small>
            </div>

            <!-- Delivery Time -->
            <div class="form-group">
                <label for="deliveryTime">Estimated Delivery <span style="color: #f44336;">*</span></label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
                        <polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="text" id="deliveryTime" name="delivery_time" placeholder="e.g., 3-7 days" required>
                </div>
            </div>

            <!-- Slots Available -->
            <div class="form-group">
                <label for="slotsAvailable">Available Slots <span style="color: #f44336;">*</span></label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2" fill="none"/>
                        <circle cx="9" cy="7" r="4" stroke="white" stroke-width="2" fill="none"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="number" id="slotsAvailable" name="slots_available" placeholder="e.g., 5" min="0" required>
                </div>
                <small style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px; display: block;">
                    Set to 0 to close this commission type
                </small>
            </div>

            <!-- Example Images/Videos (Max 5) -->
            <small style="color: white">
                💡 Tip: Compress videos at 
                <a href="https://www.freeconvert.com/video-compressor" target="_blank">FreeConvert</a> 
                for faster uploads
            </small>
            <div class="form-group">
                <label>Example Images/Videos (Max 5)</label>
                <div class="image-upload-area">
                    <input 
                        type="file" 
                        id="commissionImages" 
                        name="images[]" 
                        accept="image/jpeg,image/png,image/jpg,image/gif,video/mp4,video/webm"
                        multiple
                        style="display: none;"
                        onchange="handleCommissionImagesUpload(event)"
                    >
                    <label for="commissionImages" class="upload-label">
                        <svg viewBox="0 0 24 24" width="40" height="40">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2" fill="none"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                            <polyline points="21 15 16 10 5 21" stroke="white" stroke-width="2" fill="none"/>
                        </svg>
                        <span>Click to upload images/videos</span>
                        <small>Max 5 files, 20MB each (JPG, PNG, GIF, MP4)</small>
                    </label>
                </div>
                <div class="commission-images-preview" id="commissionImagesPreview"></div>
            </div>

            <!-- Status Toggle -->
            <div class="form-group">
                <label class="checkbox-label" style="padding-left: 0;">
                    <input type="checkbox" id="commissionActive" name="is_active" checked>
                    <span class="checkmark"></span>
                    <span style="margin-left: 28px;">Active (visible to clients)</span>
                </label>
            </div>

            <button type="submit" class="auth-submit-btn">
                <span id="commissionSubmitText">Create Commission</span>
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <polyline points="20 6 9 17 4 12" stroke="white" stroke-width="2" fill="none"/>
                </svg>
            </button>
        </form>
    </div>
</div>