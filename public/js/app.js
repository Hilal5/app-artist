// ================================================
// DEBUG HELPER - Only log in development
// ================================================
const DEBUG_MODE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes(".test");

function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

function debugInfo(title, data) {
    if (DEBUG_MODE) {
        console.log(`🔍 ${title}:`, data);
    }
}

function debugError(title, error) {
    if (DEBUG_MODE) {
        console.error(`❌ ${title}:`, error);
    } else {
        // In production, maybe send to error tracking service
        Example: Sentry.captureException(error);
    }
}
// end debug


// Create animated stars
function createStars() {
    const starsContainer = document.getElementById("stars");
    if (!starsContainer) return;

    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.width = Math.random() * 3 + "px";
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.animationDelay = Math.random() * 3 + "s";
        starsContainer.appendChild(star);
    }
}

// Initialize stars on page load
createStars();

// Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");

    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        themeToggle.textContent = "☀️";
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        themeToggle.textContent = "🌙";
    }
}

// Social Media Function
function openSocial(platform) {
    const socialLinks = {
        twitter: "https://twitter.com",
        youtube: "https://youtube.com",
        instagram: "https://instagram.com",
    };

    if (socialLinks[platform]) {
        window.open(socialLinks[platform], "_blank");
    }
}

// ============================================
// DRAGGABLE OVERLAY FUNCTIONALITY
// ============================================
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let activeOverlay = null;

function initDraggable(overlayId) {
    const overlay = document.getElementById(overlayId);
    const overlayWindow = overlay?.querySelector(".overlay-window");
    const overlayHeader = overlay?.querySelector(".overlay-header");

    if (!overlayHeader || !overlayWindow) return;

    // Remove old listeners to prevent duplicates
    const newHeader = overlayHeader.cloneNode(true);
    overlayHeader.parentNode.replaceChild(newHeader, overlayHeader);

    activeOverlay = overlayWindow;

    newHeader.addEventListener("mousedown", dragStart);
    newHeader.addEventListener("touchstart", dragStart);

    // Use overlay-specific listeners
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag);

    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchend", dragEnd);

    function dragStart(e) {
        // Don't drag if clicking on close button
        if (e.target.closest(".close-btn")) return;

        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        isDragging = true;
        overlayWindow.classList.add("dragging");
    }

    function drag(e) {
        if (isDragging && activeOverlay) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, activeOverlay);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        if (activeOverlay) {
            activeOverlay.classList.remove("dragging");
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;

    overlay.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => {
        overlay.style.display = "none";
        overlay.style.animation = "fadeIn 0.3s forwards";
        // Reset active overlay
        activeOverlay = null;
    }, 300);
}

// ============================================
// UPLOAD PROFILE PHOTO
// ============================================
function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("profile_photo", file);

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            formData.append("_token", csrfToken.content);
        }

        // Preview image immediately
        const reader = new FileReader();
        reader.onload = function (e) {
            const profilePhoto = document.getElementById("profilePhoto");
            if (profilePhoto) {
                profilePhoto.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);

        // Upload to server
        const csrfTokenHeader = document.querySelector(
            'meta[name="csrf-token"]'
        );
        if (csrfTokenHeader) {
            fetch("/profile/upload-photo", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": csrfTokenHeader.content,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log("Profile photo updated successfully");
                    } else {
                        alert("Failed to upload photo");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("Error uploading photo");
                });
        }
    }
}

// Toggle FAQ accordion
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains("active");

    // Close all other FAQs
    document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
    });

    // Toggle current FAQ
    if (!isActive) {
        faqItem.classList.add("active");
    }
}

// Filter FAQ by category
function filterFAQ(category, event) {
    const faqItems = document.querySelectorAll(".faq-item");
    const categoryBtns = document.querySelectorAll(".category-btn");

    // Update active button
    categoryBtns.forEach((btn) => btn.classList.remove("active"));
    if (event && event.target) {
        event.target.classList.add("active");
    }

    // Filter items
    faqItems.forEach((item) => {
        if (category === "all" || item.dataset.category === category) {
            item.classList.remove("hidden");
        } else {
            item.classList.add("hidden");
            item.classList.remove("active");
        }
    });
}

// Search FAQ
function searchFAQ(query) {
    const faqItems = document.querySelectorAll(".faq-item");
    const searchQuery = query.toLowerCase().trim();

    faqItems.forEach((item) => {
        const questionElement = item.querySelector(".faq-question h4");
        const answerElement = item.querySelector(".faq-answer");

        if (!questionElement || !answerElement) return;

        const question = questionElement.textContent.toLowerCase();
        const answer = answerElement.textContent.toLowerCase();

        if (question.includes(searchQuery) || answer.includes(searchQuery)) {
            item.classList.remove("hidden");
        } else {
            item.classList.add("hidden");
        }
    });

    // If searching, show all categories
    if (searchQuery) {
        document.querySelectorAll(".category-btn").forEach((btn) => {
            if (btn.textContent === "All") {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }
}

// Filter reviews by rating or images
function filterReviews(filter, event) {
    const reviews = document.querySelectorAll(".review-item");
    const filterBtns = document.querySelectorAll(".filter-btn");

    // Update active button
    filterBtns.forEach((btn) => btn.classList.remove("active"));
    if (event && event.target) {
        event.target.classList.add("active");
    }

    // Filter reviews
    reviews.forEach((review) => {
        const rating = review.dataset.rating;
        const hasImages = review.dataset.images === "true";

        if (filter === "all") {
            review.classList.remove("hidden");
        } else if (filter === "images") {
            review.classList.toggle("hidden", !hasImages);
        } else {
            review.classList.toggle("hidden", rating !== filter);
        }
    });
}

// ================================================
// USER MENU & AUTH
// ================================================
function toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    dropdown?.classList.toggle("show");
}

// Open Auth Modal
function openAuthModal(type) {
    const dropdown = document.getElementById("userDropdown");
    dropdown?.classList.remove("show");

    if (type === "login") {
        const loginModal = document.getElementById("loginModal");
        if (loginModal) loginModal.style.display = "flex";
    } else if (type === "register") {
        const registerModal = document.getElementById("registerModal");
        if (registerModal) registerModal.style.display = "flex";
    }
}

// Handle Logout
function handleLogout() {
    if (confirm("Yakin mau logout?")) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) return;

        fetch("/logout", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": csrfToken.content,
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    window.location.reload();
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Gagal logout. Coba lagi.");
            });
    }
}

// ================================================
// AUTH MODAL FUNCTIONS
// ================================================
function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => {
        modal.style.display = "none";
        modal.style.animation = "fadeIn 0.3s forwards";
    }, 300);
}

function switchAuthModal(type) {
    closeAuthModal("loginModal");
    closeAuthModal("registerModal");
    setTimeout(() => {
        openAuthModal(type);
    }, 300);
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const button =
        input.parentElement.parentElement.querySelector(".toggle-password");
    if (!button) return;

    const eyeOpen = button.querySelector(".eye-open");
    const eyeClosed = button.querySelector(".eye-closed");

    if (input.type === "password") {
        input.type = "text";
        if (eyeOpen) eyeOpen.style.display = "none";
        if (eyeClosed) eyeClosed.style.display = "block";
    } else {
        input.type = "password";
        if (eyeOpen) eyeOpen.style.display = "block";
        if (eyeClosed) eyeClosed.style.display = "none";
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!strengthFill || !strengthText) return;

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    strengthFill.className = "strength-fill";

    if (strength === 0 || password.length === 0) {
        strengthFill.style.width = "0%";
        strengthText.textContent = "Password strength";
        strengthText.style.color = "rgba(255, 255, 255, 0.6)";
    } else if (strength <= 2) {
        strengthFill.classList.add("weak");
        strengthText.textContent = "Weak password";
        strengthText.style.color = "#f44336";
    } else if (strength === 3) {
        strengthFill.classList.add("medium");
        strengthText.textContent = "Medium password";
        strengthText.style.color = "#FF9800";
    } else {
        strengthFill.classList.add("strong");
        strengthText.textContent = "Strong password";
        strengthText.style.color = "#4CAF50";
    }
}

// Handle Login Form Submit
function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) return;

        const formData = new FormData(this);
        const submitBtn = this.querySelector(".auth-submit-btn");
        if (!submitBtn) return;

        const originalHTML = submitBtn.innerHTML;

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<svg class="spinner" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/></svg> Logging in...';

        // Send to server
        fetch("/login", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRF-TOKEN": csrfToken.content,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    submitBtn.innerHTML = "✓ Success!";
                    submitBtn.style.background =
                        "linear-gradient(135deg, #4CAF50, #45a049)";

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error(data.message || "Login failed");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(
                    error.message ||
                        "Login failed. Please check your credentials."
                );

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            });
    });
}

// Handle Register Form Submit
function initRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    // Password strength checker
    const passwordInput = document.getElementById("registerPassword");
    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            checkPasswordStrength(this.value);
        });
    }

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) return;

        const formData = new FormData(this);
        const submitBtn = this.querySelector(".auth-submit-btn");
        if (!submitBtn) return;

        const originalHTML = submitBtn.innerHTML;

        // Validate password match
        const password = document.getElementById("registerPassword");
        const passwordConfirm = document.getElementById(
            "registerPasswordConfirm"
        );

        if (!password || !passwordConfirm) return;

        if (password.value !== passwordConfirm.value) {
            alert("Passwords do not match!");
            return;
        }

        // Check password strength
        if (password.value.length < 8) {
            alert("Password must be at least 8 characters!");
            return;
        }

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<svg class="spinner" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/></svg> Creating account...';

        // Send to server
        fetch("/register", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRF-TOKEN": csrfToken.content,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    submitBtn.innerHTML = "✓ Account created!";
                    submitBtn.style.background =
                        "linear-gradient(135deg, #4CAF50, #45a049)";

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error(data.message || "Registration failed");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(
                    error.message || "Registration failed. Please try again."
                );

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            });
    });
}

// ================================================
// REVIEWS SYSTEM
// ================================================
let currentReviewsPage = 1;
let currentReviewsFilter = "all";
let reviewsData = [];

// Load review statistics
async function loadReviewStatistics() {
    try {
        const response = await fetch("/reviews/statistics");
        const data = await response.json();

        if (data.success) {
            // Update average rating
            const avgRating = document.getElementById("averageRating");
            const totalReviews = document.getElementById("totalReviews");
            const happyClients = document.getElementById("happyClientsCount");

            if (avgRating) avgRating.textContent = data.average_rating || "0";
            if (totalReviews)
                totalReviews.textContent = `Based on ${data.total_reviews} reviews`;
            if (happyClients) happyClients.textContent = data.total_reviews;

            // Generate star display
            generateStarDisplay(data.average_rating);

            // Generate rating bars
            generateRatingBars(data.rating_counts, data.total_reviews);
        }
    } catch (error) {
        console.error("Error loading statistics:", error);
    }
}

// Generate star display
function generateStarDisplay(rating) {
    const starsContainer = document.getElementById("averageStars");
    if (!starsContainer) return;

    starsContainer.innerHTML = "";
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        const star = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        star.setAttribute("viewBox", "0 0 24 24");
        star.setAttribute("width", "24");
        star.setAttribute("height", "24");
        star.classList.add("star");

        if (i < fullStars) {
            star.classList.add("filled");
        } else if (i === fullStars && hasHalfStar) {
            star.classList.add("half");
        }

        const polygon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );
        polygon.setAttribute(
            "points",
            "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        );
        star.appendChild(polygon);

        starsContainer.appendChild(star);
    }
}

// Generate rating bars
function generateRatingBars(ratingCounts, totalReviews) {
    const barsContainer = document.getElementById("ratingBars");
    if (!barsContainer) return;

    barsContainer.innerHTML = "";

    for (let i = 5; i >= 1; i--) {
        const count = ratingCounts[i] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        const barItem = document.createElement("div");
        barItem.className = "rating-bar-item";
        barItem.innerHTML = `
            <span class="rating-label">${i} stars</span>
            <div class="rating-bar">
                <div class="rating-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="rating-count">${count}</span>
        `;

        barsContainer.appendChild(barItem);
    }
}

// Load reviews data
async function loadReviewsData(page = 1, filter = "all") {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    try {
        reviewsList.innerHTML = `
            <div class="loading-spinner">
                <svg class="spinner" viewBox="0 0 24 24" width="40" height="40">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                </svg>
                <p>Loading reviews...</p>
            </div>
        `;

        const url = `/reviews?page=${page}&rating=${filter}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            reviewsData = data.reviews.data;
            displayReviews(reviewsData);

            // Show/hide load more button
            const loadMoreBtn = document.getElementById("loadMoreBtn");
            if (loadMoreBtn) {
                loadMoreBtn.style.display = data.reviews.next_page_url
                    ? "block"
                    : "none";
            }

            currentReviewsPage = page;
            currentReviewsFilter = filter;
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
        reviewsList.innerHTML = `
            <div class="empty-reviews">
                <svg viewBox="0 0 24 24" width="60" height="60">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>Failed to load reviews</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Display reviews
function displayReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-reviews">
                <svg viewBox="0 0 24 24" width="60" height="60">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="red" stroke-width="2" fill="none"/>
                </svg>
                <h3>No reviews yet</h3>
                <p>Be the first to leave a review!</p>
            </div>
        `;
        return;
    }

    reviewsList.innerHTML = reviews
        .map((review) => generateReviewHTML(review))
        .join("");
}

// Generate review HTML
function generateReviewHTML(review) {
    const stars = generateStarsHTML(review.rating);
    const images = review.images ? generateReviewImagesHTML(review.images) : "";
    const verifiedBadge = review.verified
        ? `
        <div class="verified-badge">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="#4A9EFF"/>
            </svg>
            <span>Verified Purchase</span>
        </div>
    `
        : "";

    return `
        <div class="review-item" data-rating="${review.rating}" data-images="${
        review.images ? "true" : "false"
    }">
            <div class="review-header">
                <div class="reviewer-avatar">
                    <img src="${
                        review.user.avatar || "/images/profile/default-avatar.png"
                    }" alt="${review.user.name}">
                </div>
                <div class="reviewer-info">
                    <h4>${review.user.name}</h4>
                    <div class="review-stars">${stars}</div>
                    <span class="review-date">${review.time_ago}</span>
                </div>
                ${verifiedBadge}
            </div>
            <div class="review-content">
                <p>${escapeHtml(review.comment)}</p>
                ${images}
            </div>
            ${
                review.commission_type
                    ? `
                <div class="review-footer">
                    <span class="review-type">${review.commission_type}</span>
                </div>
            `
                    : ""
            }
        </div>
    `;
}

// Generate stars HTML
function generateStarsHTML(rating) {
    let stars = "";
    for (let i = 0; i < 5; i++) {
        const filled = i < rating ? "filled" : "empty";
        stars += `
            <svg viewBox="0 0 24 24" width="14" height="14" class="star ${filled}">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        `;
    }
    return stars;
}

// Generate review images HTML
// Generate review images HTML - Support video
function generateReviewImagesHTML(images) {
    if (!images || images.length === 0) return "";

    return `
        <div class="review-images">
            ${images.map(img => {
                const filepath = `/storage/reviews/${img}`;
                const isVideo = /\.(mp4|webm|mov)$/i.test(img);
                
                return isVideo ? `
                    <div class="review-media-item" style="position:relative;display:inline-block;">
                        <video 
                            src="${filepath}" 
                            style="width:150px;height:150px;object-fit:cover;border-radius:8px;cursor:pointer;"
                            onclick="viewImage('${filepath}')">
                        </video>
                        <div style="position:absolute;top:5px;left:5px;background:rgba(0,0,0,0.8);color:white;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:bold;pointer-events:none;">
                            VIDEO
                        </div>
                    </div>
                ` : `
                    <img src="${filepath}" alt="Review image" onclick="viewImage('${filepath}')">
                `;
            }).join("")}
        </div>
    `;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Filter reviews
function filterReviewsBy(filter, event) {
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => btn.classList.remove("active"));
    if (event && event.target) {
        event.target.classList.add("active");
    }

    loadReviewsData(1, filter);
}

// Load more reviews
function loadMoreReviews() {
    loadReviewsData(currentReviewsPage + 1, currentReviewsFilter);
}

// View image (lightbox)
// function viewImage(src) {
//     const lightbox = document.createElement("div");
//     lightbox.className = "image-lightbox";
//     lightbox.innerHTML = `
//         <div class="lightbox-content">
//             <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">
//                 <svg viewBox="0 0 24 24" width="24" height="24">
//                     <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
//                     <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
//                 </svg>
//             </button>
//             <img src="${src}" alt="Review image">
//         </div>
//     `;
//     document.body.appendChild(lightbox);
// }

// Update viewImage function untuk support video
function viewImage(url) {
    const isVideo = /\.(mp4|webm|mov)$/i.test(url);
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;';
    
    modal.innerHTML = `
        <div style="position:relative;max-width:90vw;max-height:90vh;">
            ${isVideo ? `
                <video src="${url}" controls autoplay style="max-width:90vw;max-height:90vh;border-radius:8px;">
                    <source src="${url}" type="video/mp4">
                </video>
            ` : `
                <img src="${url}" style="max-width:90vw;max-height:90vh;border-radius:8px;">
            `}
        </div>
    `;
    
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

// ================================================
// REVIEW FORM
// ================================================
let selectedRating = 0;
let selectedImages = [];

// Open review form
function openReviewForm() {
    const modal = document.getElementById("reviewFormModal");
    if (modal) modal.style.display = "flex";
    initStarRatingInput();
    initCharCounter();
}

// Close review form
function closeReviewForm() {
    const modal = document.getElementById("reviewFormModal");
    if (!modal) return;

    modal.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => {
        modal.style.display = "none";
        modal.style.animation = "fadeIn 0.3s forwards";

        const form = document.getElementById("reviewForm");
        if (form) form.reset();

        selectedRating = 0;
        selectedImages = [];

        const imagePreview = document.getElementById("imagePreviewContainer");
        if (imagePreview) imagePreview.innerHTML = "";
    }, 300);
}

// Init star rating input
function initStarRatingInput() {
    const stars = document.querySelectorAll(".star-input");
    const ratingLabel = document.getElementById("ratingLabel");
    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    stars.forEach((star) => {
        star.addEventListener("click", function () {
            selectedRating = parseInt(this.dataset.rating);
            const ratingValue = document.getElementById("ratingValue");
            if (ratingValue) ratingValue.value = selectedRating;

            // Update visual
            stars.forEach((s) => {
                if (parseInt(s.dataset.rating) <= selectedRating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });

            // Update label
            if (ratingLabel) {
                ratingLabel.textContent = ratingLabels[selectedRating];
                ratingLabel.classList.add("selected");
            }
        });

        // Hover effect
        star.addEventListener("mouseenter", function () {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s) => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });

    // Reset on mouse leave
    const starRatingInput = document.getElementById("starRatingInput");
    if (starRatingInput) {
        starRatingInput.addEventListener("mouseleave", function () {
            stars.forEach((s) => {
                if (parseInt(s.dataset.rating) <= selectedRating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    }
}

// Init character counter
function initCharCounter() {
    const textarea = document.getElementById("reviewComment");
    const charCount = document.getElementById("charCount");

    if (textarea && charCount) {
        textarea.addEventListener("input", function () {
            charCount.textContent = this.value.length;

            if (this.value.length > 900) {
                charCount.style.color = "#f44336";
            } else if (this.value.length > 800) {
                charCount.style.color = "#FF9800";
            } else {
                charCount.style.color = "rgba(255, 255, 255, 0.5)";
            }
        });
    }
}

// Handle image upload
// function handleImageUpload(event) {
//     const files = Array.from(event.target.files);

//     if (selectedImages.length + files.length > 3) {
//         alert("Maximum 3 images allowed");
//         return;
//     }

//     files.forEach((file) => {
//         if (file.size > 2 * 1024 * 1024) {
//             alert(`${file.name} is too large. Maximum 2MB per image.`);
//             return;
//         }

//         selectedImages.push(file);

//         // Preview
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             const preview = document.createElement("div");
//             preview.className = "image-preview-item";
//             preview.innerHTML = `
//                 <img src="${e.target.result}" alt="Preview">
//                 <button type="button" class="image-preview-remove" onclick="removePreviewImage(${
//                     selectedImages.length - 1
//                 })">
//                     <svg viewBox="0 0 24 24">
//                         <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
//                         <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
//                     </svg>
//                 </button>
//             `;
//             const container = document.getElementById("imagePreviewContainer");
//             if (container) container.appendChild(preview);
//         };
//         reader.readAsDataURL(file);
//     });
// }

// Remove preview image


function removePreviewImage(index) {
    selectedImages.splice(index, 1);

    // Refresh preview container
    const container = document.getElementById("imagePreviewContainer");
    if (!container) return;

    container.innerHTML = "";

    selectedImages.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.createElement("div");
            preview.className = "image-preview-item";
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="image-preview-remove" onclick="removePreviewImage(${i})">
                    <svg viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                
            `;
            container.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });

    // Reset file input
    const fileInput = document.getElementById("reviewImages");
    if (fileInput) fileInput.value = "";
}

// Submit review form
// ✅ UPDATE: Init review form submission
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate rating
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) return;

        const formData = new FormData(this);

        // Add selected images
        selectedImages.forEach((file) => {
            formData.append('images[]', file);
        });

        const submitBtn = this.querySelector('.auth-submit-btn');
        if (!submitBtn) return;

        const originalHTML = submitBtn.innerHTML;

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
            </svg>
            Submitting...
        `;

        try {
            const response = await fetch('/reviews', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken.content,
                },
            });

            const data = await response.json();

            if (data.success) {
                submitBtn.innerHTML = '✓ Review Submitted!';
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

                setTimeout(() => {
                    closeReviewForm();
                    
                    // ✅ CRITICAL: Show toast notification
                    showToast(
                        'Review Submitted! 🎉',
                        'Thank you! Your review will be published after admin approval.',
                        null
                    );

                    // Mark as reviewed
                    userHasReviewed = true;
                    checkUserReviewStatus();
                    
                }, 1500);
            } else {
                throw new Error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to submit review. Please try again.');

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

// ================================================
// INITIALIZATION
// ================================================
document.addEventListener("DOMContentLoaded", function () {
    // Close overlay when clicking outside
    const aboutOverlay = document.getElementById("aboutOverlay");
    if (aboutOverlay) {
        aboutOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("aboutOverlay");
            }
        });
    }

    const linksOverlay = document.getElementById("linksOverlay");
    if (linksOverlay) {
        linksOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("linksOverlay");
            }
        });
    }

    const contactOverlay = document.getElementById("contactOverlay");
    if (contactOverlay) {
        contactOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("contactOverlay");
            }
        });
    }

    const faqOverlay = document.getElementById("faqOverlay");
    if (faqOverlay) {
        faqOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("faqOverlay");
            }
        });
    }

    const ratingOverlay = document.getElementById("ratingOverlay");
    if (ratingOverlay) {
        ratingOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("ratingOverlay");
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (!csrfToken) return;

            const formData = new FormData(this);
            const submitBtn = this.querySelector(".submit-btn");
            if (!submitBtn) return;

            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<svg class="spinner" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/></svg> Sending...';

            // Send to server
            fetch("/contact/send", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": csrfToken.content,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        // Success
                        submitBtn.innerHTML = "✓ Message Sent!";
                        submitBtn.style.background =
                            "linear-gradient(135deg, #4CAF50, #45a049)";

                        // Reset form
                        contactForm.reset();

                        // Reset button after 3 seconds
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalText;
                            submitBtn.style.background = "";
                        }, 3000);
                    } else {
                        throw new Error("Failed to send message");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    submitBtn.innerHTML = "✗ Failed to send";
                    submitBtn.style.background =
                        "linear-gradient(135deg, #f44336, #d32f2f)";

                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = "";
                    }, 3000);
                });
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        const userMenuWrapper = document.querySelector(".user-menu-wrapper");
        const dropdown = document.getElementById("userDropdown");

        if (userMenuWrapper && !userMenuWrapper.contains(e.target)) {
            dropdown?.classList.remove("show");
        }
    });

    // Close auth modal when clicking outside
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("auth-modal")) {
            const modalId = e.target.id;
            closeAuthModal(modalId);
        }
    });

    // Close review form modal on click outside
    const reviewFormModal = document.getElementById("reviewFormModal");
    if (reviewFormModal) {
        reviewFormModal.addEventListener("click", function (e) {
            if (e.target === this) {
                closeReviewForm();
            }
        });
    }

    // Init auth forms
    initLoginForm();
    initRegisterForm();

    // Init review form
    initReviewForm();
});

// ================================================
// COMMISSIONS SYSTEM - MULTIPLE IMAGES
// ================================================
let currentCommissionId = null;
let selectedCommissionImages = [];
let currentGalleryImages = [];
let currentGalleryIndex = 0;

// Load commissions data
async function loadCommissionsData() {
    const commissionsList = document.getElementById("commissionsList");
    if (!commissionsList) return;

    try {
        commissionsList.innerHTML = `
            <div class="loading-spinner">
                <svg class="spinner" viewBox="0 0 24 24" width="40" height="40">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                </svg>
                <p>Loading commissions...</p>
            </div>
        `;

        const response = await fetch("/commissions");
        const data = await response.json();

        if (data.success) {
            displayCommissions(data.commissions);
        }
    } catch (error) {
        console.error("Error loading commissions:", error);
        commissionsList.innerHTML = `
            <div class="empty-reviews">
                <svg viewBox="0 0 24 24" width="60" height="60">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>Failed to load commissions</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Display commissions
function displayCommissions(commissions) {
    window.commissionsData = commissions; // Store globally for gallery

    const commissionsList = document.getElementById("commissionsList");
    if (!commissionsList) return;

    if (commissions.length === 0) {
        commissionsList.innerHTML = `
            <div class="empty-reviews">
                <svg viewBox="0 0 24 24" width="60" height="60">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" stroke="white" stroke-width="2" fill="none"/>
                </svg>
                <h3>No commissions available</h3>
                <p>Check back later for new services</p>
            </div>
        `;
        return;
    }

    commissionsList.innerHTML = commissions
        .map((commission) => generateCommissionHTML(commission))
        .join("");
}

// Generate commission HTML with video support
function generateCommissionHTML(commission) {
    const isAdmin =
        document.querySelector(".admin-commission-controls") !== null;
    const availabilityClass =
        commission.slots_available > 0 ? "available" : "unavailable";
    const statusBadge = commission.is_active
        ? '<span class="commission-status-badge active">Active</span>'
        : '<span class="commission-status-badge inactive">Inactive</span>';

    let mediaHTML = "";
    if (commission.images && commission.images.length > 0) {
        const firstFile = commission.images[0];
        const hasMoreFiles = commission.images.length > 1;
        const isVideo = firstFile.match(/\.(mp4|webm)$/i);

        mediaHTML = `
            <div class="commission-images-gallery" onclick="viewCommissionGallery(${
                commission.id
            })">
                ${
                    isVideo
                        ? `
                    <video src="/storage/commissions/${firstFile}" 
                           muted loop autoplay playsinline
                           onerror="this.style.display='none'"></video>
                    <div class="video-play-badge">
                        <svg viewBox="0 0 24 24" width="40" height="40">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                        </svg>
                    </div>
                `
                        : `
                    <img src="/storage/commissions/${firstFile}" 
                         alt="${escapeHtml(commission.name)}"
                         onerror="this.src='/images/default-commission.jpg'">
                `
                }
                ${
                    hasMoreFiles
                        ? `
                    <div class="image-counter">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                            <polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        +${commission.images.length - 1}
                    </div>
                `
                        : ""
                }
                ${
                    commission.slots_available === 0
                        ? '<div class="sold-out-overlay">CLOSED</div>'
                        : ""
                }
            </div>
        `;
    }

    // ✅ tambahkan ID unik agar JS tahu elemen mana yang dikontrol
    const descId = `commissionDesc-${commission.id}`;
    const toggleId = `toggleDescBtn-${commission.id}`;

    // hasil HTML
    const html = `
        <div class="commission-card ${availabilityClass}" data-id="${
        commission.id
    }">
            ${mediaHTML}
            
            <div class="commission-content">
                <div class="commission-header">
                    <h3>${escapeHtml(commission.name)}</h3>
                    ${isAdmin ? statusBadge : ""}
                </div>

                <div class="commission-description-container">
                    <p class="commission-description" id="${descId}">
                        ${escapeHtml(commission.description)}
                    </p>
                    <button class="toggle-btn" id="${toggleId}">Show more..</button>
                </div>
                
                <div class="commission-details">
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <span>Starting from <strong>IDR ${formatPrice(
                            commission.price
                        )}</strong></span>
                    </div>
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <span>${escapeHtml(commission.delivery_time)} Day</span>
                    </div>
                    <div class="detail-item">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <span><strong>${
                            commission.slots_available
                        }</strong> slot${
        commission.slots_available !== 1 ? "s" : ""
    } available</span>
                    </div>
                </div>

                <div class="commission-actions">
                    ${
                        commission.slots_available > 0 && commission.is_active
                            ? `
                        <button class="commission-order-btn" onclick="orderCommission(${commission.id})">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            Order Now
                        </button>
                    `
                            : `
                        <button class="commission-order-btn disabled" disabled>
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Closed
                        </button>
                    `
                    }
                    
                    ${
                        isAdmin
                            ? `
                        <button class="commission-edit-btn" onclick="editCommission(${commission.id})">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            Edit
                        </button>
                        <button class="commission-delete-btn" onclick="deleteCommission(${commission.id})">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                    `
                            : ""
                    }
                </div>
            </div>
        </div>
    `;

    // ✅ setelah elemen dirender ke DOM
    setTimeout(() => {
        const descEl = document.getElementById(descId);
        const toggleBtn = document.getElementById(toggleId);

        if (descEl && toggleBtn) {
            if (descEl.scrollHeight <= 150) toggleBtn.style.display = "none";

            toggleBtn.addEventListener("click", () => {
                const expanded = descEl.classList.toggle("expanded");
                toggleBtn.textContent = expanded ? "Show less" : "Show more";
            });
        }
    }, 0);

    return html;
}

const descEl = document.getElementById("commissionDesc");
const toggleBtn = document.getElementById("toggleDescBtn");

if (descEl && toggleBtn) {
    if (descEl.scrollHeight <= 150) {
        toggleBtn.style.display = "none";
    }

    toggleBtn.addEventListener("click", () => {
        const expanded = descEl.classList.toggle("expanded");
        toggleBtn.textContent = expanded ? "Show less" : "Show more";
    });
}

// eeeenndd


// Format price
function formatPrice(price) {
    return new Intl.NumberFormat("id-ID").format(price);
}

// Open commission form
function openCommissionForm(commissionId = null) {
    const modal = document.getElementById("commissionFormModal");
    const form = document.getElementById("commissionForm");
    const title = document.getElementById("commissionFormTitle");
    const submitText = document.getElementById("commissionSubmitText");

    if (!modal || !form) return;

    currentCommissionId = commissionId;
    form.reset();
    selectedCommissionImages = [];
    document.getElementById("commissionImagesPreview").innerHTML = "";

    if (commissionId) {
        title.textContent = "Edit Commission Type";
        submitText.textContent = "Update Commission";
        loadCommissionData(commissionId);
    } else {
        title.textContent = "Add Commission Type";
        submitText.textContent = "Create Commission";
    }

    modal.style.display = "flex";
    initDescriptionCharCounter();
}

// Close commission form
function closeCommissionForm() {
    const modal = document.getElementById("commissionFormModal");
    if (!modal) return;

    modal.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => {
        modal.style.display = "none";
        modal.style.animation = "fadeIn 0.3s forwards";
        currentCommissionId = null;
        selectedCommissionImages = [];
    }, 300);
}

// ✅ UPDATE: Load commission data for editing (fix "Current" label position)
async function loadCommissionData(id) {
    try {
        const response = await fetch(`/commissions/${id}`);
        const data = await response.json();

        if (data.success) {
            const commission = data.commission;
            document.getElementById("commissionId").value = commission.id;
            document.getElementById("commissionName").value = commission.name;
            document.getElementById("commissionDescription").value =
                commission.description;
            document.getElementById("commissionPrice").value = commission.price;
            document.getElementById("deliveryTime").value =
                commission.delivery_time;
            document.getElementById("slotsAvailable").value =
                commission.slots_available;
            document.getElementById("commissionActive").checked =
                commission.is_active;

            const charCount = document.getElementById("descCharCount");
            if (charCount)
                charCount.textContent = commission.description.length;

            // ✅ FIX: Better "Current" label for existing files
            if (commission.images && commission.images.length > 0) {
                const preview = document.getElementById(
                    "commissionImagesPreview"
                );
                preview.innerHTML = commission.images
                    .map((file, index) => {
                        const isVideo = file.match(/\.(mp4|webm)$/i);

                        return `
                        <div class="image-preview-item existing-file">
                            ${
                                isVideo
                                    ? `
                                <video src="/storage/commissions/${file}" muted loop autoplay playsinline></video>
                                <div class="video-badge">
                                    <svg viewBox="0 0 24 24" width="14" height="14">
                                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                                    </svg>
                                </div>
                            `
                                    : `
                                <img src="/storage/commissions/${file}" alt="Current ${
                                          index + 1
                                      }">
                            `
                            }
                            <div class="current-file-badge">
                                <svg viewBox="0 0 24 24" width="12" height="12">
                                    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                                Current
                            </div>
                            <span class="image-number">${index + 1}</span>
                        </div>
                    `;
                    })
                    .join("");
            }
        }
    } catch (error) {
        console.error("Error loading commission:", error);
        alert("Failed to load commission data");
    }
}

// Handle commission images/videos upload (max 5, 20MB each)
function handleCommissionImagesUpload(event) {
    const files = Array.from(event.target.files);

    if (selectedCommissionImages.length + files.length > 5) {
        alert("Maximum 5 files allowed");
        event.target.value = "";
        return;
    }

    files.forEach((file) => {
        // ✅ UPDATE: Max 20MB
        if (file.size > 20 * 1024 * 1024) {
            alert(`${file.name} is too large. Maximum 20MB per file.`);
            return;
        }

        selectedCommissionImages.push(file);
    });

    refreshCommissionImagesPreview();
}

// Refresh commission images preview
function refreshCommissionImagesPreview() {
    const container = document.getElementById("commissionImagesPreview");
    if (!container) return;

    container.innerHTML = "";

    selectedCommissionImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewItem = document.createElement("div");
            previewItem.className = "image-preview-item";

            // ✅ Check if video or image
            const isVideo = file.type.startsWith("video/");

            previewItem.innerHTML = `
                ${
                    isVideo
                        ? `
                    <video src="${e.target.result}" muted loop autoplay playsinline></video>
                    <div class="video-badge">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                    </div>
                `
                        : `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                `
                }
                <button type="button" class="image-preview-remove" onclick="removeCommissionImage(${index})">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <span class="image-number">${index + 1}</span>
            `;
            container.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

// Remove commission image
function removeCommissionImage(index) {
    selectedCommissionImages.splice(index, 1);
    refreshCommissionImagesPreview();

    const fileInput = document.getElementById("commissionImages");
    if (fileInput) fileInput.value = "";
}

// Init description char counter
function initDescriptionCharCounter() {
    const textarea = document.getElementById("commissionDescription");
    const charCount = document.getElementById("descCharCount");

    if (textarea && charCount) {
        textarea.addEventListener("input", function () {
            charCount.textContent = this.value.length;

            if (this.value.length > 5000) {
                charCount.style.color = "#f44336";
            } else if (this.value.length > 4999) {
                charCount.style.color = "#FF9800";
            } else {
                charCount.style.color = "rgba(255, 255, 255, 0.5)";
            }
        });
    }
}

// Submit commission form
function initCommissionForm() {
    const form = document.getElementById("commissionForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) return;

        const formData = new FormData(this);

        // Remove default images[] if any
        formData.delete("images[]");

        // Add selected images
        selectedCommissionImages.forEach((file) => {
            formData.append("images[]", file);
        });

        // Fix is_active
        const isActiveCheckbox = document.getElementById("commissionActive");
        if (isActiveCheckbox) {
            formData.delete("is_active");
            formData.set("is_active", isActiveCheckbox.checked ? "1" : "0");
        }

        const submitBtn = this.querySelector(".auth-submit-btn");
        if (!submitBtn) return;

        const originalHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
            </svg>
            ${currentCommissionId ? "Updating..." : "Creating..."}
        `;

        try {
            const url = currentCommissionId
                ? `/commissions/${currentCommissionId}`
                : "/commissions";
            const method = "POST";

            if (currentCommissionId) {
                formData.append("_method", "PUT");
            }

            console.log("Form data being sent:");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(
                        key,
                        "= [File]",
                        value.name,
                        value.size,
                        "bytes"
                    );
                } else {
                    console.log(key, "=", value);
                }
            }

            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": csrfToken.content,
                },
            });

            const data = await response.json();

            if (data.success) {
                submitBtn.innerHTML = "✓ Success!";
                submitBtn.style.background =
                    "linear-gradient(135deg, #4CAF50, #45a049)";

                setTimeout(() => {
                    closeCommissionForm();
                    loadCommissionsData();
                    alert(data.message);
                }, 1000);
            } else {
                throw new Error(data.message || "Failed to save commission");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(
                error.message || "Failed to save commission. Please try again."
            );

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

// Edit commission
function editCommission(id) {
    openCommissionForm(id);
}

// Delete commission
async function deleteCommission(id) {
    if (!confirm("Are you sure you want to delete this commission type?")) {
        return;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) return;

    try {
        const response = await fetch(`/commissions/${id}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": csrfToken.content,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            loadCommissionsData();
        } else {
            throw new Error(data.message || "Failed to delete commission");
        }
    } catch (error) {
        console.error("Error:", error);
        alert(
            error.message || "Failed to delete commission. Please try again."
        );
    }
}

// Order commission
function orderCommission(id) {
    const userMenuBtn = document.querySelector(".user-menu-btn");
    const isLoggedIn =
        userMenuBtn && userMenuBtn.classList.contains("logged-in");

    if (!isLoggedIn) {
        alert("Please login first to place an order");
        openAuthModal("login");
        return;
    }

    closeOverlay("commissionsOverlay");

    setTimeout(() => {
        navigate("chat");

        setTimeout(() => {
            const chatInput = document.getElementById("chatMessageInput");
            if (chatInput) {
                chatInput.value = `Hi! I'm interested in Commission ID: ${id}. Can you provide more details?`;
                chatInput.focus();
            }
        }, 500);
    }, 300);
}

// View commission gallery
function viewCommissionGallery(commissionId) {
    const commissions = window.commissionsData || [];
    const commission = commissions.find((c) => c.id === commissionId);

    if (!commission || !commission.images || commission.images.length === 0) {
        return;
    }

    currentGalleryImages = commission.images;
    currentGalleryIndex = 0;

    showGalleryLightbox();
}

// ✅ UPDATE: Gallery lightbox with video support & better navigation placement
function showGalleryLightbox() {
    const existingLightbox = document.getElementById("galleryLightbox");
    if (existingLightbox) {
        existingLightbox.remove();
    }

    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.id = "galleryLightbox";

    const currentFile = currentGalleryImages[currentGalleryIndex];
    const hasPrev = currentGalleryIndex > 0;
    const hasNext = currentGalleryIndex < currentGalleryImages.length - 1;

    // Check if current file is video
    const isVideo = currentFile.match(/\.(mp4|webm)$/i);

    lightbox.innerHTML = `
        <div class="gallery-content">
            ${
                isVideo
                    ? `
                <video src="/storage/commissions/${currentFile}" 
                       controls loop autoplay playsinline 
                       alt="Gallery video ${currentGalleryIndex + 1}"></video>
            `
                    : `
                <img src="/storage/commissions/${currentFile}" alt="Gallery image ${
                          currentGalleryIndex + 1
                      }">
            `
            }
        </div>
        
        <!-- ✅ FIX: Navigation outside gallery-content (tidak nutupin media) -->
        <button class="gallery-close" onclick="closeGalleryLightbox()">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>
        
        <div class="gallery-counter">${currentGalleryIndex + 1} / ${
        currentGalleryImages.length
    }</div>
        
        ${
            hasPrev
                ? `
            <button class="gallery-nav prev" onclick="prevGalleryImage()">
                <svg viewBox="0 0 24 24" width="32" height="32">
                    <polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
        `
                : ""
        }
        
        ${
            hasNext
                ? `
            <button class="gallery-nav next" onclick="nextGalleryImage()">
                <svg viewBox="0 0 24 24" width="32" height="32">
                    <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
        `
                : ""
        }
        
        ${
            currentGalleryImages.length > 1
                ? `
            <div class="gallery-thumbnails">
                ${currentGalleryImages
                    .map((file, index) => {
                        const thumbIsVideo = file.match(/\.(mp4|webm)$/i);

                        return thumbIsVideo
                            ? `
                        <div class="gallery-thumb ${
                            index === currentGalleryIndex ? "active" : ""
                        }" onclick="goToGalleryImage(${index})">
                            <video src="/storage/commissions/${file}" muted></video>
                            <div class="thumb-video-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <polygon points="8 5 19 12 8 19 8 5" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                    `
                            : `
                        <img src="/storage/commissions/${file}" 
                             alt="Thumbnail ${index + 1}"
                             class="gallery-thumb ${
                                 index === currentGalleryIndex ? "active" : ""
                             }"
                             onclick="goToGalleryImage(${index})">
                    `;
                    })
                    .join("")}
            </div>
        `
                : ""
        }
    `;

    document.body.appendChild(lightbox);

    document.addEventListener("keydown", galleryKeyboardHandler);
}

// Close gallery lightbox
function closeGalleryLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (lightbox) {
        lightbox.remove();
    }
    document.removeEventListener("keydown", galleryKeyboardHandler);
}

// Gallery keyboard handler
function galleryKeyboardHandler(e) {
    if (e.key === "Escape") {
        closeGalleryLightbox();
    } else if (e.key === "ArrowLeft") {
        prevGalleryImage();
    } else if (e.key === "ArrowRight") {
        nextGalleryImage();
    }
}

// Previous gallery image
function prevGalleryImage() {
    if (currentGalleryIndex > 0) {
        currentGalleryIndex--;
        updateGalleryLightbox();
    }
}

// Next gallery image
function nextGalleryImage() {
    if (currentGalleryIndex < currentGalleryImages.length - 1) {
        currentGalleryIndex++;
        updateGalleryLightbox();
    }
}

// Go to specific gallery image
function goToGalleryImage(index) {
    currentGalleryIndex = index;
    updateGalleryLightbox();
}

// Update gallery lightbox
function updateGalleryLightbox() {
    showGalleryLightbox();
}

// Update navigate function
function navigate(section) {
    if (section === "about") {
        const overlay = document.getElementById("aboutOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("aboutOverlay"), 100);
    } else if (section === "links") {
        const overlay = document.getElementById("linksOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("linksOverlay"), 100);
    } else if (section === "contact") {
        const overlay = document.getElementById("contactOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("contactOverlay"), 100);
    } else if (section === "faq") {
        const overlay = document.getElementById("faqOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("faqOverlay"), 100);
    } else if (section === "rating") {
        const overlay = document.getElementById("ratingOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("ratingOverlay"), 100);
        loadReviewsData();
        loadReviewStatistics();
    } else if (section === "commisions") {
        const overlay = document.getElementById("commissionsOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("commissionsOverlay"), 100);
        loadCommissionsData();
    } else if (section === "work") {
        alert("Work portfolio coming soon!");
    } else if (section === "chat") {
        const overlay = document.getElementById("chatOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("chatOverlay"), 100);
        initializeChat();

        // ✅ Clear badge when opened
        updateNotificationBadge(0);
        localStorage.setItem("lastUnreadCount", "0");
    }    if (section === "rating") {
        const overlay = document.getElementById("ratingOverlay");
        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("ratingOverlay"), 100);

        loadReviewsData();
        loadReviewStatistics();
        checkUserReviewStatus(); // ✅ Check status
    } else if (section === "admin") {
        // ✅ NEW: Admin Panel
        const overlay = document.getElementById("adminOverlay");
        if (!overlay) {
            alert("Admin panel not available");
            return;
        }

        overlay.style.display = "flex";
        const overlayWindow = overlay.querySelector(".overlay-window");
        if (overlayWindow) {
            overlayWindow.style.transform = "translate(0px, 0px)";
            xOffset = 0;
            yOffset = 0;
        }
        setTimeout(() => initDraggable("adminOverlay"), 100);

        // Load pending reviews
        loadPendingReviews();
    } else {
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    const commissionsOverlay = document.getElementById("commissionsOverlay");
    if (commissionsOverlay) {
        commissionsOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeOverlay("commissionsOverlay");
            }
        });
    }

    const commissionFormModal = document.getElementById("commissionFormModal");
    if (commissionFormModal) {
        commissionFormModal.addEventListener("click", function (e) {
            if (e.target === this) {
                closeCommissionForm();
            }
        });
    }

    // ✅ TAMBAHKAN INI:
    const chatOverlay = document.getElementById("chatOverlay");
    if (chatOverlay) {
        chatOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeChatOverlay();
            }
        });
    }

    initCommissionForm();
});

// Make functions global
window.loadCommissionsData = loadCommissionsData;
window.openCommissionForm = openCommissionForm;
window.closeCommissionForm = closeCommissionForm;
window.editCommission = editCommission;
window.deleteCommission = deleteCommission;
window.orderCommission = orderCommission;
window.handleCommissionImagesUpload = handleCommissionImagesUpload;
window.removeCommissionImage = removeCommissionImage;
window.viewCommissionGallery = viewCommissionGallery;
window.closeGalleryLightbox = closeGalleryLightbox;
window.prevGalleryImage = prevGalleryImage;
window.nextGalleryImage = nextGalleryImage;
window.goToGalleryImage = goToGalleryImage;

// Make functions global
window.toggleTheme = toggleTheme;
window.openSocial = openSocial;
window.navigate = navigate;
window.closeOverlay = closeOverlay;
window.uploadProfilePhoto = uploadProfilePhoto;
window.toggleFAQ = toggleFAQ;
window.filterFAQ = filterFAQ;
window.searchFAQ = searchFAQ;
window.filterReviews = filterReviews;
window.toggleUserDropdown = toggleUserDropdown;
window.openAuthModal = openAuthModal;
window.handleLogout = handleLogout;
window.closeAuthModal = closeAuthModal;
window.switchAuthModal = switchAuthModal;
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkPasswordStrength = checkPasswordStrength;
window.loadReviewsData = loadReviewsData;
window.loadReviewStatistics = loadReviewStatistics;
window.filterReviewsBy = filterReviewsBy;
window.loadMoreReviews = loadMoreReviews;
window.viewImage = viewImage;
window.openReviewForm = openReviewForm;
window.closeReviewForm = closeReviewForm;
// window.handleImageUpload = handleImageUpload;
window.removePreviewImage = removePreviewImage;

// ================================================
// CHAT SYSTEM - FIXED VERSION
// ================================================
let currentChatUserId = null;
let currentAdminId = null;
let chatRefreshInterval = null;
let isAdmin = false;

// Initialize Chat
// ✅ UPDATE: Initialize Chat for regular users
// ✅ FIX: Initialize Chat dengan role dari Blade
// ✅ UPDATE: Initialize Chat dengan debug conditional
async function initializeChat() {
    debugLog('🚀 Initializing chat...');
    debugLog('👤 User Role:', window.chatUserRole);
    debugLog('🔑 User ID:', window.chatUserId);
    
    if (!window.chatUserId || window.chatUserRole === 'guest') {
        debugLog('❌ User not authenticated');
        return;
    }

    const isAdmin = window.chatUserRole === 'admin';

    if (isAdmin) {
        debugLog('👑 Loading admin conversations...');
        await loadConversations();
    } else {
        debugLog('💬 Loading user chat with admin...');
        await loadAdminChat();
        
        if (window.innerWidth <= 968) {
            const sidebar = document.getElementById('conversationsSidebar');
            const chatMain = document.getElementById('chatMain');
            
            if (sidebar) sidebar.classList.add('hidden');
            if (chatMain) chatMain.classList.add('active');
        }
    }
}

// Load Admin Info for User Chat
async function loadAdminChat() {
    try {
        const response = await fetch("/chat/admin");
        const data = await response.json();

        if (data.success) {
            currentAdminId = data.admin.id;
            await loadChatMessages(currentAdminId, data.admin.name);
        }
    } catch (error) {
        console.error("Error loading admin:", error);
    }
}

// Load Conversations (Admin Only)
async function loadConversations() {
    const conversationsList = document.getElementById("conversationsList");
    if (!conversationsList) return;

    try {
        conversationsList.innerHTML = `
            <div class="loading-spinner">
                <svg class="spinner" viewBox="0 0 24 24" width="30" height="30">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                </svg>
                <p>Loading conversations...</p>
            </div>
        `;

        const response = await fetch("/chat/conversations");
        const data = await response.json();

        if (data.success && data.conversations.length > 0) {
            conversationsList.innerHTML = data.conversations
                .map(
                    (conv) => `
                <div class="conversation-item" onclick="selectConversation(${
                    conv.user_id
                }, '${escapeHtml(conv.user_name)}')">
                    <div class="conversation-avatar">
                        <img src="${
                            conv.user_avatar || "/images/profile/default-avatar.png"
                        }" alt="${escapeHtml(conv.user_name)}">
                    </div>
                    <div class="conversation-info">
                        <strong>${escapeHtml(conv.user_name)}</strong>
                        <p>${escapeHtml(
                            conv.last_message || "No messages yet"
                        )}</p>
                    </div>
                    <div class="conversation-meta">
                        <span class="conversation-time">${
                            conv.last_message_at
                        }</span>
                        ${
                            conv.unread_count > 0
                                ? `<span class="unread-badge">${conv.unread_count}</span>`
                                : ""
                        }
                    </div>
                </div>
            `
                )
                .join("");
        } else {
            conversationsList.innerHTML = `
                <div class="empty-chat">
                    <svg viewBox="0 0 24 24" width="50" height="50">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="green" stroke-width="2" fill="none"/>
                    </svg>
                    <h4 style="color : white ">No conversations yet</h4>
                    <p>Start chatting with users</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading conversations:", error);
        conversationsList.innerHTML = `
            <div class="empty-chat">
                <svg viewBox="0 0 24 24" width="50" height="50">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h4>Failed to load conversations</h4>
                <p>Please try again</p>
            </div>
        `;
    }
}

// Select Conversation (Admin)
function selectConversation(userId, userName) {
    // Mark conversation as active
    document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active");
    });
    event.currentTarget.classList.add("active");

    loadChatMessages(userId, userName);
}

// ================================================
// SMART MESSAGE REFRESH - NO ANNOYING AUTO-SCROLL
// ================================================

let lastMessageId = null;
let isUserScrolling = false;
let scrollTimeout = null;

// Load Chat Messages - UPDATED
async function loadChatMessages(userId, userName) {
    currentChatUserId = userId;
    const chatMain = document.getElementById("chatMain");
    if (!chatMain) return;

    // Clear refresh interval
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }

    try {
        chatMain.innerHTML = `
            <div class="loading-spinner">
                <svg class="spinner" viewBox="0 0 24 24" width="30" height="30">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                </svg>
                <p>Loading messages...</p>
            </div>
        `;

        const response = await fetch(`/chat/messages?user_id=${userId}`);
        const data = await response.json();

        if (data.success) {
            renderChatInterface(userName, data.messages);
            
            // ✅ Store last message ID
            if (data.messages.length > 0) {
                lastMessageId = data.messages[data.messages.length - 1].id;
            }

            // Update header title
            const chatHeaderTitle = document.getElementById("chatHeaderTitle");
            if (chatHeaderTitle) {
                chatHeaderTitle.textContent = `Chat with ${userName}`;
            }

            // ✅ SMART Auto refresh every 3 seconds (faster but smarter)
            chatRefreshInterval = setInterval(() => {
                smartRefreshMessages();
            }, 3000);
            
            // ✅ Track user scrolling
            const messagesContainer = document.getElementById("messagesContainer");
            if (messagesContainer) {
                messagesContainer.addEventListener('scroll', handleUserScroll);
            }
        }
    } catch (error) {
        console.error("Error loading messages:", error);
        chatMain.innerHTML = `
            <div class="empty-chat">
                <svg viewBox="0 0 24 24" width="50" height="50">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h4>Failed to load messages</h4>
                <p>Please try again</p>
            </div>
        `;
    }
}

// ✅ Handle user scroll - detect if user is reading old messages
function handleUserScroll() {
    isUserScrolling = true;
    
    // Reset flag after 2 seconds of no scrolling
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
    }, 2000);
}

// ✅ SMART Refresh - Only update if NEW messages exist
async function smartRefreshMessages() {
    if (!currentChatUserId) return;

    try {
        const response = await fetch(`/chat/messages?user_id=${currentChatUserId}`);
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
            const latestMessageId = data.messages[data.messages.length - 1].id;
            
            // ✅ ONLY update if there's NEW message
            if (latestMessageId !== lastMessageId) {
                console.log('📨 New message detected!');
                
                const messagesContainer = document.getElementById("messagesContainer");
                if (messagesContainer) {
                    // ✅ Check if user was at bottom OR actively scrolling
                    const wasAtBottom = isScrolledToBottom();
                    const shouldAutoScroll = wasAtBottom && !isUserScrolling;
                    
                    // Update messages
                    messagesContainer.innerHTML = renderMessages(data.messages);
                    
                    // Initialize toggle
                    initCommissionDescriptionToggle();
                    
                    // ✅ ONLY auto-scroll if user was at bottom
                    if (shouldAutoScroll) {
                        scrollToBottom();
                    } else {
                        // ✅ Show "New message" indicator instead
                        showNewMessageIndicator();
                    }
                    
                    // Update last message ID
                    lastMessageId = latestMessageId;
                    
                    // ✅ Play notification sound (optional)
                    playNotificationSound();
                }
            }
        }
    } catch (error) {
        console.error("Error refreshing messages:", error);
    }
}

// ✅ Show "New Message" indicator when user is reading old messages
function showNewMessageIndicator() {
    const chatMain = document.getElementById("chatMain");
    if (!chatMain) return;

    // Remove existing indicator
    const existing = document.getElementById("newMessageIndicator");
    if (existing) existing.remove();

    // Create indicator
    const indicator = document.createElement("div");
    indicator.id = "newMessageIndicator";
    indicator.className = "new-message-indicator";
    indicator.innerHTML = `
        <span>📨 New message</span>
        <button onclick="scrollToBottomAndHideIndicator()">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <polyline points="7 13 12 18 17 13" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="7 7 12 12 17 7" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
        </button>
    `;

    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
        messagesContainer.parentElement.appendChild(indicator);
    }

    // ✅ AUTO HIDE SETELAH 1 DETIK
    setTimeout(() => {
        if (indicator && indicator.parentElement) {
            indicator.classList.add("fade-out");

            // Remove dari DOM setelah animation selesai
            setTimeout(() => {
                if (indicator.parentElement) {
                    indicator.remove();
                }
            }, 500); // Match dengan CSS animation duration
        }
    }, 1000); // 1 detik
}

// ✅ Scroll to bottom and hide indicator
function scrollToBottomAndHideIndicator() {
    scrollToBottom();
    const indicator = document.getElementById("newMessageIndicator");
    if (indicator) indicator.remove();
}

// ✅ Check if scrolled to bottom (with bigger threshold)
function isScrolledToBottom() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return false;

    const threshold = 150; // 150px dari bottom
    return (
        messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight < threshold
    );
}

// Render Chat Interface
// ✅ UPDATE: Render Chat Interface with back button di KANAN
// ✅ UPDATE: Render Chat Interface - back button hanya untuk admin
// ✅ UPDATE: Render Chat Interface - force hide back button untuk user
// ✅ ALTERNATIVE: Conditional render (lebih bersih)
// ✅ UPDATE: Render Chat Interface - back button hanya untuk admin
function renderChatInterface(userName, messages) {
    const chatMain = document.getElementById("chatMain");
    if (!chatMain) return;

    const roleElement = document.querySelector(".role-badge");
    const isAdminUser = roleElement && roleElement.classList.contains("admin");

    console.log("==================");
    console.log("🔍 CHAT DEBUG INFO:");
    console.log("Role Element:", roleElement);
    console.log(
        "Role Element HTML:",
        roleElement ? roleElement.outerHTML : "NULL"
    );
    console.log("Has Admin Class:", isAdminUser);
    console.log("User Name:", userName);
    console.log("Window Width:", window.innerWidth);
    console.log("==================");

    chatMain.innerHTML = `
        <div class="chat-header">
            <div class="chat-user-avatar">
                <img src="/images/profile/default-avatar.png" alt="${escapeHtml(
                    userName
                )}">
            </div>
            <div class="chat-user-info">
                <h4>${escapeHtml(userName)}</h4>
                <p>Online</p>
            </div>
            
            <button class="mobile-back-btn" onclick="backToConversations()">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
        </div>
        
        <div class="messages-container" id="messagesContainer">
            ${
                messages.length > 0
                    ? renderMessages(messages)
                    : '<div class="empty-chat"><p>No messages yet. Start the conversation!</p></div>'
            }
        </div>
        
        <div class="chat-input-area">
            <form class="chat-input-form" id="chatInputForm" onsubmit="sendMessage(event)">
                <div class="chat-input-wrapper">
                    <div id="attachmentPreview" class="attachment-preview" style="display: none;"></div>
                    <textarea 
                        class="chat-input" 
                        id="chatMessageInput" 
                        placeholder="Type a message..." 
                        rows="1"
                        onkeydown="handleChatInputKeydown(event)"
                    ></textarea>
                    <input type="file" id="chatAttachment" accept="image/*,video/*" style="display: none;" onchange="handleAttachmentSelect(event)">
                    <button type="button" class="attachment-btn" onclick="document.getElementById('chatAttachment').click()">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                </div>
                <button type="submit" class="send-btn" id="sendBtn">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                </button>
            </form>
        </div>
    `;

    // ✅ Initialize toggle after render
    setTimeout(() => {
        initCommissionDescriptionToggle();

        const backBtn = chatMain.querySelector(".mobile-back-btn");
        if (backBtn && !isAdminUser) {
            backBtn.parentNode.removeChild(backBtn);
        }

        scrollToBottom();
    }, 100);
}

// ✅ UPDATE: Render Messages dengan commission card yang lebih jelas
// ✅ UPDATE: Render Messages dengan video support
// ✅ UPDATE: Render Messages dengan video autoplay + loop
// ✅ UPDATE: Render Messages dengan download + preview support
function renderMessages(messages) {
    return messages.map(msg => {
        const messageClass = msg.is_own ? 'own' : '';
        const avatar = msg.sender_avatar || '/images/profile/default-avatar.png';
        
        // Commission card
        let commissionCard = '';
        if (msg.commission) {
            const desc = msg.commission.description || "";
            const descId = `commDesc-${msg.id}`;
            const isLongDesc = desc.length > 150;

            commissionCard = `
                <div class="message-commission-card">
                    <div class="commission-icon-badge">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="white"/>
                        </svg>
                    </div>
                    <div class="commission-card-info">
                        <h5>📦 ${escapeHtml(msg.commission.name)}</h5>
                        <p style="margin-top: 8px;"><strong>💰 IDR ${formatPrice(msg.commission.price)}</strong></p>
                        <p style="font-size: 12px; opacity: 0.7; margin-top: 5px;">⏱️ ${msg.commission.delivery_time} Days</p>
                    </div>
                </div>
            `;
        }

        // ✅ NEW: Attachment dengan preview + download support
        let attachmentHtml = '';
        if (msg.attachment) {
            const filePath = `/storage/chat_attachments/${msg.attachment}`;
            const fileType = detectFileType(msg.attachment);
            
            if (fileType === 'image') {
                attachmentHtml = `
                    <div class="message-attachment">
                        <img 
                            src="${filePath}" 
                            alt="Attachment" 
                            onclick="viewAttachment('${filePath}', 'image')"
                            loading="lazy"
                            style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
                    </div>
                `;
            } else if (fileType === 'video') {
                attachmentHtml = `
                    <div class="message-attachment">
                        <div class="video-wrapper" onclick="viewAttachment('${filePath}', 'video')">
                            <video 
                                src="${filePath}" 
                                muted 
                                playsinline
                                preload="metadata"
                                style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
                            </video>
                            <div class="video-play-overlay">
                                <svg viewBox="0 0 24 24" width="50" height="50">
                                    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.6)"/>
                                    <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                `;
            } else if (fileType === 'psd') {
                attachmentHtml = `
                    <div class="message-attachment file-attachment">
                        <div class="file-info">
                            <svg viewBox="0 0 24 24" width="40" height="40">
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#31C5F0"/>
                                <path d="M14 2v6h6" fill="#001E36" opacity="0.3"/>
                                <text x="12" y="16" text-anchor="middle" fill="white" font-size="6" font-weight="bold">PSD</text>
                            </svg>
                            <div>
                                <strong>${msg.attachment}</strong>
                                <small>Photoshop Document</small>
                            </div>
                        </div>
                        <button class="download-attachment-btn" onclick="downloadAttachment('${filePath}', '${msg.attachment}')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            Download
                        </button>
                    </div>
                `;
            }
        }

        return `
            <div class="message-bubble ${messageClass}">
                <div class="message-avatar">
                    <img src="${avatar}" alt="${escapeHtml(msg.sender_name)}">
                </div>
                <div class="message-content">
                    ${msg.message ? `<div class="message-text">${escapeHtml(msg.message).replace(/\n/g, '<br>')}</div>` : ''}
                    ${commissionCard}
                    ${attachmentHtml}
                    <div class="message-time">
                        <span>${msg.created_at}</span>
                        ${msg.is_own ? `
                            <span class="read-indicator ${msg.is_read ? 'read' : ''}">
                                <svg viewBox="0 0 24 24" width="14" height="14">
                                    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" fill="none"/>
                                </svg>
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Detect file type from filename
function detectFileType(filename) {
    if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return 'image';
    } else if (filename.match(/\.(mp4|webm|mov)$/i)) {
        return 'video';
    } else if (filename.match(/\.psd$/i)) {
        return 'psd';
    }
    return 'unknown';
}

// ✅ NEW: View attachment in modal
function viewAttachment(src, type) {
    const modal = document.createElement('div');
    modal.className = 'attachment-modal';
    modal.id = 'attachmentModal';
    
    let content = '';
    
    if (type === 'image') {
        content = `
            <img src="${src}" alt="Full view" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">
        `;
    } else if (type === 'video') {
        content = `
            <video 
                src="${src}" 
                controls 
                autoplay 
                style="max-width: 90vw; max-height: 90vh;">
                Your browser does not support video playback.
            </video>
        `;
    }
    
    modal.innerHTML = `
        <div class="attachment-modal-content">
            ${content}
            <button class="attachment-modal-close" onclick="closeAttachmentModal()">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
            <a href="${src}" download class="attachment-modal-download">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                Download
            </a>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAttachmentModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', handleEscKey);
}

// Close attachment modal
function closeAttachmentModal() {
    const modal = document.getElementById('attachmentModal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscKey);
}

// Handle ESC key
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeAttachmentModal();
    }
}

// ✅ NEW: Download attachment
function downloadAttachment(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Make functions global
window.viewAttachment = viewAttachment;
window.closeAttachmentModal = closeAttachmentModal;
window.downloadAttachment = downloadAttachment;
window.formatFileSize = formatFileSize;
window.getFileType = getFileType;
window.detectFileType = detectFileType;

// ✅ Handle show more/less untuk commission description di chat
function initCommissionDescriptionToggle() {
    // Use event delegation for dynamically added elements
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    messagesContainer.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('show-more-desc-btn')) {
            const btn = e.target;
            const descId = btn.id.replace('Btn', '');
            const descEl = document.getElementById(descId);
            
            if (descEl) {
                const isExpanded = descEl.classList.toggle('expanded');
                const isCollapsed = descEl.classList.toggle('collapsed');
                
                btn.textContent = isExpanded ? '📕 Show less' : '📖 Show more';
            }
        }
    });
}

// Call this after rendering messages
window.initCommissionDescriptionToggle = initCommissionDescriptionToggle;


// function renderMessages(messages) {
//     return messages
//         .map((msg) => {
//             const messageClass = msg.is_own ? "own" : "";
//             const avatar =
//                 msg.sender_avatar || "/images/profile/default-avatar.png";
//             const senderName = escapeHtml(msg.sender_name);
//             const formattedTime = msg.created_at;

//             /* ==============================
//            COMMISSION CARD (Optional)
//         ============================== */
//             let commissionCard = "";
//             if (msg.commission) {
//                 const { name, price, delivery_time } = msg.commission;
//                 commissionCard = `
//                 <div class="message-commission-card">
//                     <div class="commission-icon-badge">
//                         <svg viewBox="0 0 24 24" width="22" height="22">
//                             <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4
//                                      c-1.11 0-1.99.89-1.99 2L2 19
//                                      c0 1.11.89 2 2 2h16
//                                      c1.11 0 2-.89 2-2V8
//                                      c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"
//                                   fill="white"/>
//                         </svg>
//                     </div>
//                     <div class="commission-card-info">
//                         <h5>📦 ${escapeHtml(name)}</h5>
//                         <p><strong>💰 IDR ${formatPrice(price)}</strong></p>
//                         <p class="commission-time">⏱️ ${delivery_time} Days</p>
//                     </div>
//                 </div>
//             `;
//             }

//             /* ==============================
//            ATTACHMENT (Image / Video)
//         ============================== */
//             let attachmentHtml = "";
//             if (msg.attachment) {
//                 const isVideo = msg.attachment.match(/\.(mp4|webm)$/i);
//                 const filePath = `/storage/chat_attachments/${msg.attachment}`;

//                 attachmentHtml = isVideo
//                     ? `
//                 <div class="message-attachment">
//                     <video 
//                         src="${filePath}" 
//                         autoplay loop muted playsinline preload="auto"
//                         onclick="this.muted = !this.muted; this.controls = !this.controls;"
//                         style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;"
//                         loading="lazy">
//                         Your browser does not support video.
//                     </video>
//                     <div class="video-hint">
//                         💡 Click to unmute / control
//                     </div>
//                 </div>
//             `
//                     : `
//                 <div class="message-attachment">
//                     <img 
//                         src="${filePath}" 
//                         alt="Attachment" 
//                         onclick="viewImage('${filePath}')"
//                         loading="lazy"
//                         style="max-width: 300px; max-height: 300px; border-radius: 8px; cursor: pointer;">
//                 </div>
//             `;
//             }

//             /* ==============================
//            MAIN MESSAGE BUBBLE
//         ============================== */
//             const messageText = msg.message
//                 ? `<div class="message-text">${escapeHtml(msg.message).replace(
//                       /\n/g,
//                       "<br>"
//                   )}</div>`
//                 : "";

//             const readIndicator = msg.is_own
//                 ? `
//             <span class="read-indicator ${msg.is_read ? "read" : ""}">
//                 <svg viewBox="0 0 24 24" width="14" height="14">
//                     <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" fill="none"/>
//                 </svg>
//             </span>
//         `
//                 : "";

//             /* ==============================
//            FINAL TEMPLATE RETURN
//         ============================== */
//             return `
//             <div class="message-bubble ${messageClass}">
//                 <div class="message-avatar">
//                     <img src="${avatar}" alt="${senderName}">
//                 </div>

//                 <div class="message-content">
//                     ${messageText}
//                     ${commissionCard}
//                     ${attachmentHtml}

//                     <div class="message-time">
//                         <span>${formattedTime}</span>
//                         ${readIndicator}
//                     </div>
//                 </div>
//             </div>
//         `;
//         })
//         .join("");
// }

// end rendermessege

// Refresh Messages


// Refresh Messages
async function refreshMessages() {
    if (!currentChatUserId) return;

    try {
        const response = await fetch(
            `/chat/messages?user_id=${currentChatUserId}`
        );
        const data = await response.json();

        if (data.success) {
            const messagesContainer = document.getElementById("messagesContainer");
            if (messagesContainer) {
                const wasAtBottom = isScrolledToBottom();
                messagesContainer.innerHTML =
                    data.messages.length > 0
                        ? renderMessages(data.messages)
                        : '<div class="empty-chat"><p>No messages yet. Start the conversation!</p></div>';

                // ✅ Initialize toggle after render
                initCommissionDescriptionToggle();

                if (wasAtBottom) {
                    scrollToBottom();
                }
            }
        }
    } catch (error) {
        console.error("Error refreshing messages:", error);
    }
}

// ✅ UPDATE: Send Message - auto scroll after send
async function sendMessage(event) {
    event.preventDefault();

    const messageInput = document.getElementById("chatMessageInput");
    const attachmentInput = document.getElementById("chatAttachment");
    const sendBtn = document.getElementById("sendBtn");

    if (!messageInput || !currentChatUserId) return;

    const message = messageInput.value.trim();
    const attachment = attachmentInput ? attachmentInput.files[0] : null;

    if (!message && !attachment) return;

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) return;

    const formData = new FormData();
    formData.append("receiver_id", currentChatUserId);
    if (message) formData.append("message", message);
    if (attachment) formData.append("attachment", attachment);

    if (sendBtn) sendBtn.disabled = true;

    try {
        const response = await fetch("/chat/send", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRF-TOKEN": csrfToken.content,
            },
        });

        const data = await response.json();

        if (data.success) {
            messageInput.value = "";
            messageInput.style.height = "auto";
            if (attachmentInput) attachmentInput.value = "";

            const preview = document.getElementById("attachmentPreview");
            if (preview) preview.style.display = "none";

            // ✅ Instant refresh after send
            await smartRefreshMessages();
            
            // ✅ ALWAYS scroll to bottom after sending
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } else {
            alert(data.message || "Failed to send message");
        }
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}


// Handle Chat Input Keydown (Send with Enter)
function handleChatInputKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const form = document.getElementById("chatInputForm");
        if (form) {
            sendMessage(event);
        }
    }
}

// ================================================
// CHAT ATTACHMENT HANDLING - UPDATED
// ================================================

// Handle Attachment Select with proper preview
function handleAttachmentSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ✅ Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("File size must be less than 50MB");
        event.target.value = "";
        return;
    }

    // ✅ Validate file type
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'image/vnd.adobe.photoshop', 'application/x-photoshop'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.psd')) {
        alert("Only images, videos, and PSD files are allowed");
        event.target.value = "";
        return;
    }

    // Show preview
    const preview = document.getElementById("attachmentPreview");
    if (!preview) return;

    const fileType = getFileType(file);
    
    console.log('📎 Attachment selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        detectedType: fileType
    });

    const reader = new FileReader();
    reader.onload = function (e) {
        let previewContent = '';
        
        if (fileType === 'image') {
            previewContent = `
                <img src="${e.target.result}" alt="Preview" class="preview-image">
            `;
        } else if (fileType === 'video') {
            // ✅ FIX: Video preview with poster
            previewContent = `
                <video class="preview-video" muted playsinline preload="metadata">
                    <source src="${e.target.result}" type="${file.type}">
                </video>
                <div class="video-preview-badge">
                    <svg viewBox="0 0 24 24" width="40" height="40">
                        <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.6)"/>
                        <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
                    </svg>
                </div>
            `;
        } else if (fileType === 'psd') {
            previewContent = `
                <div class="file-preview">
                    <svg viewBox="0 0 24 24" width="60" height="60">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#31C5F0"/>
                        <path d="M14 2v6h6" fill="#001E36" opacity="0.3"/>
                        <text x="12" y="16" text-anchor="middle" fill="white" font-size="6" font-weight="bold">PSD</text>
                    </svg>
                    <p>${file.name}</p>
                    <small>${formatFileSize(file.size)}</small>
                </div>
            `;
        }
        
        preview.innerHTML = `
            <div class="preview-attachment-wrapper">
                ${previewContent}
                <button type="button" class="remove-preview" onclick="removeAttachmentPreview()">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        `;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// Get file type
function getFileType(file) {
    if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return 'image';
    } else if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i)) {
        return 'video';
    } else if (file.type.includes('photoshop') || file.name.endsWith('.psd')) {
        return 'psd';
    }
    return 'unknown';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


// Remove Attachment Preview
function removeAttachmentPreview() {
    const attachmentInput = document.getElementById("chatAttachment");
    const preview = document.getElementById("attachmentPreview");

    if (attachmentInput) attachmentInput.value = "";
    if (preview) {
        preview.innerHTML = "";
        preview.style.display = "none";
    }
}

// Search Conversations
function searchConversations(query) {
    const conversations = document.querySelectorAll(".conversation-item");
    const searchTerm = query.toLowerCase().trim();

    conversations.forEach((conv) => {
        const userName = conv
            .querySelector(".conversation-info strong")
            .textContent.toLowerCase();
        const lastMessage = conv
            .querySelector(".conversation-info p")
            .textContent.toLowerCase();

        if (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
            conv.style.display = "flex";
        } else {
            conv.style.display = "none";
        }
    });
}

// Scroll to Bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Check if scrolled to bottom
function isScrolledToBottom() {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return false;

    const threshold = 100; // 100px dari bottom dianggap "at bottom"
    return (
        messagesContainer.scrollHeight -
            messagesContainer.scrollTop -
            messagesContainer.clientHeight <
        threshold
    );
}

// ✅ FIX: Order commission - admin tidak bisa order
// ✅ Order commission with slot validation
async function orderCommission(id) {
    const userMenuBtn = document.querySelector(".user-menu-btn");
    const isLoggedIn = userMenuBtn && userMenuBtn.classList.contains("logged-in");

    if (!isLoggedIn) {
        alert("Please login first to place an order");
        openAuthModal("login");
        return;
    }

    // Check if admin
    const roleElement = document.querySelector(".role-badge");
    const isAdmin = roleElement && roleElement.classList.contains("admin");

    if (isAdmin) {
        alert("Admin cannot place orders. Please use a client account.");
        return;
    }

    try {
        // Get commission details
        const response = await fetch(`/commissions/${id}`);
        const data = await response.json();

        if (!data.success) {
            alert("Failed to load commission details");
            return;
        }

        const commission = data.commission;

        // ✅ VALIDATE: Check slot still available
        if (commission.slots_available <= 0) {
            alert("❌ Sorry, this commission is fully booked!");
            loadCommissionsData(); // Refresh list
            return;
        }

        // Close commissions overlay
        closeOverlay("commissionsOverlay");

        // Open chat overlay
        setTimeout(async () => {
            navigate("chat");

            // Wait for chat to initialize
            setTimeout(async () => {
                // Get admin ID if not yet set
                if (!currentAdminId) {
                    try {
                        const adminResponse = await fetch("/chat/admin");
                        const adminData = await adminResponse.json();
                        if (adminData.success) {
                            currentAdminId = adminData.admin.id;
                        }
                    } catch (error) {
                        console.error("Error getting admin:", error);
                    }
                }

                // Set current chat user to admin
                if (currentAdminId) {
                    currentChatUserId = currentAdminId;

                    // Send commission order
                    await sendCommissionOrder(commission);

                    // ✅ REFRESH commission list setelah order
                    setTimeout(() => {
                        loadCommissionsData();
                    }, 1000);
                }
            }, 1000);
        }, 300);
    } catch (error) {
        console.error("Error ordering commission:", error);
        alert("Failed to process order. Please try again.");
    }
}

// ✅ NEW: Send commission order with commission card
// ✅ UPDATE: Send commission order dengan media (image/video)
// ✅ UPDATE: Send commission order dengan SEMUA media (5 files)
// ✅ UPDATE: Send commission order with success feedback
async function sendCommissionOrder(commission) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken || !currentChatUserId) return;

    debugLog('📦 Sending commission order:', commission);

    // ✅ Format message lebih detail
    const message = `🎨 **NEW COMMISSION ORDER**

📦 **Service:** ${commission.name}

📝 **Description:**
${commission.description}

💰 **Price:** IDR ${formatPrice(commission.price)}
⏱️ **Delivery Time:** ${commission.delivery_time}

---
Please confirm this order and I'll send the payment proof after transfer. Thank you! 🙏`;

    try {
        // ✅ 1. Kirim text message dengan commission card
        const textFormData = new FormData();
        textFormData.append('receiver_id', currentChatUserId);
        textFormData.append('message', message);
        textFormData.append('commission_id', commission.id);

        const textResponse = await fetch('/chat/send', {
            method: 'POST',
            body: textFormData,
            headers: {
                'X-CSRF-TOKEN': csrfToken.content,
            },
        });

        const textData = await textResponse.json();
        
        if (!textData.success) {
            debugError('Failed to send order', textData.message);
            // ✅ Show error alert
            alert('❌ ' + (textData.message || 'Failed to place order'));
            return;
        }

        debugLog('✅ Order sent successfully');

        // ✅ SHOW SUCCESS NOTIFICATION
        showToast(
            '🎉 Order Placed Successfully!',
            'Your commission slot has been reserved. Admin will contact you soon.',
            null
        );

        // ✅ 2. Kirim SEMUA media sebagai attachment terpisah
        if (commission.images && commission.images.length > 0) {
            debugLog(`📸 Sending ${commission.images.length} media files...`);

            for (let i = 0; i < commission.images.length; i++) {
                const mediaFile = commission.images[i];
                const mediaUrl = `/storage/commissions/${mediaFile}`;
                
                try {
                    // Fetch media
                    const mediaResponse = await fetch(mediaUrl);
                    const mediaBlob = await mediaResponse.blob();
                    
                    // Determine type
                    const isVideo = mediaFile.match(/\.(mp4|webm)$/i);
                    const mimeType = isVideo ? 
                        (mediaFile.endsWith('.webm') ? 'video/webm' : 'video/mp4') : 
                        'image/jpeg';
                    
                    // Create File
                    const file = new File([mediaBlob], mediaFile, { type: mimeType });
                    
                    // Send as attachment
                    const mediaFormData = new FormData();
                    mediaFormData.append('receiver_id', currentChatUserId);
                    mediaFormData.append('attachment', file);
                    
                    const mediaApiResponse = await fetch('/chat/send', {
                        method: 'POST',
                        body: mediaFormData,
                        headers: {
                            'X-CSRF-TOKEN': csrfToken.content,
                        },
                    });

                    const mediaData = await mediaApiResponse.json();
                    
                    if (mediaData.success) {
                        debugLog(`✅ Media ${i + 1}/${commission.images.length} sent`);
                    }

                    // Small delay antar upload
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                } catch (error) {
                    debugError(`Failed to send media ${i + 1}`, error);
                }
            }
        }

        // Reload messages
        await loadChatMessages(currentChatUserId, 'Administrator');
        
    } catch (error) {
        debugError('Error sending order', error);
        alert('❌ Failed to send order. Please try again.');
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    // Chat overlay click outside
    const chatOverlay = document.getElementById("chatOverlay");
    if (chatOverlay) {
        chatOverlay.addEventListener("click", function (e) {
            if (e.target === this) {
                closeChatOverlay();
            }
        });
    }
});

// Make functions global
window.initializeChat = initializeChat;
window.loadConversations = loadConversations;
window.selectConversation = selectConversation;
window.sendMessage = sendMessage;
window.handleChatInputKeydown = handleChatInputKeydown;
window.handleAttachmentSelect = handleAttachmentSelect;
window.removeAttachmentPreview = removeAttachmentPreview;
window.searchConversations = searchConversations;
window.closeChatOverlay = closeChatOverlay;
window.sendCommissionOrder = sendCommissionOrder;

// ✅ UPDATE: Select Conversation with mobile support
function selectConversation(userId, userName) {
    // Mark conversation as active
    document.querySelectorAll(".conversation-item").forEach((item) => {
        item.classList.remove("active");
    });
    event.currentTarget.classList.add("active");

    // ✅ Mobile: Hide sidebar, show chat
    if (window.innerWidth <= 968) {
        const sidebar = document.getElementById("conversationsSidebar");
        const chatMain = document.getElementById("chatMain");

        if (sidebar) sidebar.classList.add("hidden");
        if (chatMain) chatMain.classList.add("active");
    }

    loadChatMessages(userId, userName);
}

// ✅ ADD: Back to conversations (mobile)
function backToConversations() {
    const sidebar = document.getElementById("conversationsSidebar");
    const chatMain = document.getElementById("chatMain");

    if (sidebar) sidebar.classList.remove("hidden");
    if (chatMain) chatMain.classList.remove("active");
}


// ✅ UPDATE: Close chat overlay - reset mobile state
function closeChatOverlay() {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
    currentChatUserId = null;

    // ✅ Reset mobile state
    const sidebar = document.getElementById("conversationsSidebar");
    const chatMain = document.getElementById("chatMain");

    if (sidebar) sidebar.classList.remove("hidden");
    if (chatMain) chatMain.classList.remove("active");

    closeOverlay("chatOverlay");
}

// Make functions global
window.backToConversations = backToConversations;

// ================================================
// NOTIFICATION SYSTEM
// ================================================
let notificationSound = null;
let lastNotificationTime = 0;

// Initialize notification sound
function initNotificationSound() {
    notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8LRkGwU2jNXx0IAtBSp+zPLaizsKFGS56+mmVRIJQpzd8sNuIQUuhM/z2Ik4CBtptfDjm08MDk+j4PG2ZBwENoTE8diIOwkaaLfx5J1ODA5Rq+LyuGccBDaNzvHYijsJGWi08eSdTgwOT6Xh8bdpHQU0iM3w1YtBCw5dpubs7qdiGwcwg8jw2YtBCw5cq+bs8KlkGwc0hs3x2Is9ChJjt+vqpmUcBzSGzvHYiz0KEmS56+qmZRsHM4TO8diKPAoUZ7fr6qZmHAYygs7x2Ik6CRZJ6+PssV4bBjJ/zfHZijoJF2m98OWcTwwNTqPg8LRjHAU2jNTxz4EsBSh8y/HaizsKFGO26+mnZRsGMoTP8dqLPAoTZLjr6aZlHAY0h87x2Ik6CRdmu+zppmYcBTGAzfHaijwKFGW36+mnZRsFM4XP8dmJOgkXaLjw5Z1PDBBO');
}

// Show toast notification
function showToast(title, message, onClick = null) {
    // Check if toast already exists
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
        </div>
        <div class="toast-content">
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(message)}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>
    `;

    // Add click handler
    if (onClick) {
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                onClick();
                toast.remove();
            }
        });
    }

    // Append to body
    document.body.appendChild(toast);

    // Play sound
    playNotificationSound();

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('slide-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Play notification sound
function playNotificationSound() {
    const now = Date.now();
    // Throttle: only play sound once every 2 seconds
    if (now - lastNotificationTime < 2000) return;
    
    lastNotificationTime = now;
    
    if (!notificationSound) {
        initNotificationSound();
    }
    
    if (notificationSound) {
        notificationSound.volume = 0.3;
        notificationSound.play().catch(err => {
            debugLog('Sound play failed:', err);
        });
    }
}

// Update notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('chatNotificationBadge');
    const countElement = document.getElementById('chatNotificationCount');
    
    if (!badge || !countElement) return;
    
    if (count > 0) {
        badge.style.display = 'flex';
        countElement.textContent = count > 99 ? '99+' : count;
    } else {
        badge.style.display = 'none';
    }
}

// Get unread count
async function fetchUnreadCount() {
    if (!window.chatUserId) return;
    
    try {
        const response = await fetch('/chat/unread-count');
        const data = await response.json();
        
        if (data.success) {
            updateNotificationBadge(data.unread_count);
            return data.unread_count;
        }
    } catch (error) {
        debugError('Failed to fetch unread count', error);
    }
    
    return 0;
}

// Start polling for new messages (only when chat is closed)
let notificationInterval = null;

function startNotificationPolling() {
    if (notificationInterval) return;
    
    // Check every 5 seconds
    notificationInterval = setInterval(async () => {
        const chatOverlay = document.getElementById('chatOverlay');
        const isChatOpen = chatOverlay && chatOverlay.style.display !== 'none';
        
        // Only check if chat is closed
        if (!isChatOpen) {
            const unreadCount = await fetchUnreadCount();
            
            // Show toast for new messages
            if (unreadCount > 0) {
                const lastCount = parseInt(localStorage.getItem('lastUnreadCount') || '0');
                
                if (unreadCount > lastCount) {
                    showToast(
                        'New Message',
                        `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`,
                        () => navigate('chat')
                    );
                }
                
                localStorage.setItem('lastUnreadCount', unreadCount);
            }
        }
    }, 5000);
}

function stopNotificationPolling() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // ... existing code ...

    // ✅ Initialize notifications
    if (window.chatUserId) {
        initNotificationSound();
        fetchUnreadCount(); // Initial count
        startNotificationPolling(); // Start polling
    }

    // ... rest of code ...
});

// ================================================
// REVIEW SYSTEM - CHECK USER STATUS
// ================================================
let userHasReviewed = false;

// ✅ Check if user has already reviewed
async function checkUserReviewStatus() {
    if (!window.chatUserId || window.chatUserRole !== 'client') {
        return;
    }

    try {
        const response = await fetch('/reviews');
        const data = await response.json();
        
        if (data.success) {
            // Check if current user has approved review
            const userReview = data.reviews.data.find(r => r.user_id === window.chatUserId);
            userHasReviewed = !!userReview;
            
            // Update CTA visibility
            updateReviewCTA();
        }
    } catch (error) {
        debugError('Failed to check review status', error);
    }
}

// ✅ Update Review CTA based on status


// ✅ UPDATE: openReviewForm - Check before opening
function openReviewForm() {
    // Check auth
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const isLoggedIn = userMenuBtn && userMenuBtn.classList.contains('logged-in');
    
    if (!isLoggedIn) {
        alert('Please login first to leave a review');
        openAuthModal('login');
        return;
    }

    const modal = document.getElementById('reviewFormModal');
    if (modal) modal.style.display = 'flex';
    initStarRatingInput();
    initCharCounter();
}


// ================================================
// ADMIN PANEL - REVIEW MANAGEMENT
// ================================================

// Load pending reviews
async function loadPendingReviews() {
    const list = document.getElementById('pendingReviewsList');
    if (!list) return;

    try {
        list.innerHTML = `
            <div class="loading-spinner">
                <svg class="spinner" viewBox="0 0 24 24" width="40" height="40">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" fill="none"/>
                </svg>
                <p>Loading pending reviews...</p>
            </div>
        `;

        const response = await fetch('/reviews/pending');
        const data = await response.json();

        if (data.success) {
            const pendingCount = document.getElementById('pendingCount');
            const adminBadge = document.getElementById('adminBadge');
            const adminBadgeCount = document.getElementById('adminBadgeCount');
            
            if (pendingCount) pendingCount.textContent = data.reviews.length;
            
            // Update badge
            if (data.reviews.length > 0) {
                if (adminBadge) adminBadge.style.display = 'flex';
                if (adminBadgeCount) adminBadgeCount.textContent = data.reviews.length;
            } else {
                if (adminBadge) adminBadge.style.display = 'none';
            }

            if (data.reviews.length === 0) {
                list.innerHTML = `
                    <div class="empty-reviews">
                        <svg viewBox="0 0 24 24" width="60" height="60">
                            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
                            <polyline points="20 6 9 17 4 12" stroke="white" stroke-width="2" fill="none"/>
                        </svg>
                        <h3>All Clear! 🎉</h3>
                        <p>No pending reviews at the moment</p>
                    </div>
                `;
                return;
            }

            list.innerHTML = data.reviews.map(review => `
                <div class="admin-review-card" data-id="${review.id}">
                    <div class="admin-review-header">
                        <div class="reviewer-info">
                            <img src="${review.user.avatar || '/images/profile/default-avatar.png'}" alt="${escapeHtml(review.user.name)}">
                            <div>
                                <h4>${escapeHtml(review.user.name)}</h4>
                                <p>${escapeHtml(review.user.email)}</p>
                                <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
<div class="review-rating" style="display:flex;align-items:center;gap:8px;">
    <div style="display:flex;gap:2px;">
        ${Array.from({length: 5}, (_, i) => 
            `<span style="color:${i < review.rating ? '#FFD700' : '#444'};font-size:20px;">★</span>`
        ).join('')}
    </div>
    <span style="color:#FFD700;font-size:16px;font-weight:600;">${review.rating}/5</span>
</div>
                    </div>
                    
                    <div class="admin-review-content">
                        ${review.commission_type ? `<span class="commission-type-badge">${escapeHtml(review.commission_type)}</span>` : ''}
                        <p>${escapeHtml(review.comment)}</p>
                        
${review.images && review.images.length > 0 ? `
    <div class="review-images">
        ${review.images.map(img => {
            const filepath = `/storage/reviews/${img}`;
            const isVideo = /\.(mp4|webm|mov)$/i.test(img);
            
            return isVideo ? `
                <div class="review-media-item" style="position:relative;display:inline-block;margin:5px;">
                    <video 
                        src="${filepath}" 
                        style="width:150px;height:150px;object-fit:cover;border-radius:8px;cursor:pointer;"
                        onclick="viewImage('${filepath}')">
                    </video>
                    <div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.8);color:white;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:bold;pointer-events:none;">
                        VIDEO
                    </div>
                </div>
            ` : `
                <img src="${filepath}" alt="Review image" onclick="viewImage('${filepath}')">
            `;
        }).join('')}
    </div>
` : ''}
                    </div>
                    
                    <div class="admin-review-actions">
                        <button class="approve-btn" onclick="approveReview(${review.id})">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            Approve
                        </button>
                        <button class="verify-btn" onclick="toggleVerified(${review.id})" title="Toggle Verified Badge">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="currentColor"/>
                            </svg>
                            Verify
                        </button>
                        <button class="reject-btn" onclick="deleteReview(${review.id})">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        debugError('Failed to load pending reviews', error);
        list.innerHTML = `
            <div class="empty-reviews">
                <svg viewBox="0 0 24 24" width="60" height="60">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>Failed to load reviews</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Update viewImage function untuk support video
// function viewImage(url) {
//     const isVideo = /\.(mp4|webm|mov)$/i.test(url);
//     const modal = document.createElement('div');
//     modal.className = 'image-modal';
//     modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;';
    
//     modal.innerHTML = `
//         <div style="position:relative;max-width:90vw;max-height:90vh;">
//             ${isVideo ? `
//                 <video src="${url}" controls autoplay style="max-width:90vw;max-height:90vh;border-radius:8px;">
//                     <source src="${url}" type="video/mp4">
//                 </video>
//             ` : `
//                 <img src="${url}" style="max-width:90vw;max-height:90vh;border-radius:8px;">
//             `}
//         </div>
//     `;
    
//     modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
//     document.body.appendChild(modal);
// }

// Approve review
async function approveReview(reviewId) {
    if (!confirm('Approve this review?')) return;

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) return;

    try {
        const response = await fetch(`/reviews/${reviewId}/approve`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken.content,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            showToast('Review Approved! ✓', 'The review is now published', null);
            loadPendingReviews(); // Reload list
        } else {
            alert(data.message || 'Failed to approve review');
        }
    } catch (error) {
        debugError('Failed to approve review', error);
        alert('Failed to approve review. Please try again.');
    }
}

// Toggle verified badge
async function toggleVerified(reviewId) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) return;

    try {
        const response = await fetch(`/reviews/${reviewId}/toggle-verified`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken.content,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            showToast('Verified Status Updated', 'Badge toggled successfully', null);
        } else {
            alert(data.message || 'Failed to update verified status');
        }
    } catch (error) {
        debugError('Failed to toggle verified', error);
        alert('Failed to update verified status. Please try again.');
    }
}

// Delete review
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to DELETE this review? This cannot be undone!')) return;

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) return;

    try {
        const response = await fetch(`/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken.content,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            showToast('Review Deleted', 'The review has been removed', null);
            loadPendingReviews(); // Reload list
        } else {
            alert(data.message || 'Failed to delete review');
        }
    } catch (error) {
        debugError('Failed to delete review', error);
        alert('Failed to delete review. Please try again.');
    }
}

// Check pending reviews count (for badge)
async function checkPendingReviewsCount() {
    if (window.chatUserRole !== 'admin') return;

    try {
        const response = await fetch('/reviews/pending');
        const data = await response.json();

        if (data.success) {
            const adminBadge = document.getElementById('adminBadge');
            const adminBadgeCount = document.getElementById('adminBadgeCount');
            
            if (data.reviews.length > 0) {
                if (adminBadge) adminBadge.style.display = 'flex';
                if (adminBadgeCount) adminBadgeCount.textContent = data.reviews.length;
            } else {
                if (adminBadge) adminBadge.style.display = 'none';
            }
        }
    } catch (error) {
        debugError('Failed to check pending reviews', error);
    }
}

// Make functions global
window.loadPendingReviews = loadPendingReviews;
window.approveReview = approveReview;
window.toggleVerified = toggleVerified;
window.deleteReview = deleteReview;

// ✅ UPDATE: Image upload handler with 10MB limit
// ✅ CORRECT VERSION - Use 'imagePreview' as container
// ✅ CRITICAL: Only initialize ONCE
function initImageUpload() {
    const input = document.getElementById("reviewImages");
    const preview = document.getElementById("imagePreview");

    if (!input || !preview) {
        console.log("❌ Image upload elements not found");
        return;
    }

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    console.log("✅ Image upload initialized");

    newInput.addEventListener("change", function (e) {
        const files = Array.from(e.target.files);
        console.log("📦 Files selected:", files.length);

        // ✅ Hitung total files (existing + new)
        const currentCount = selectedImages.length + files.length;

        if (currentCount > 3) {
            alert(
                `Maximum 3 files total. Current: ${selectedImages.length}, Adding: ${files.length}`
            );
            newInput.value = "";
            return;
        }

        // ✅ Validate size & type
        const maxSize = 20 * 1024 * 1024; // 20MB
        for (let file of files) {
            if (file.size > maxSize) {
                alert(`${file.name} is too large (max 20MB)`);
                newInput.value = "";
                return;
            }

            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) {
                alert(`${file.name} is not a valid image or video`);
                newInput.value = "";
                return;
            }
        }

        // ✅ APPEND (jangan ganti) - ini yang penting!
        selectedImages = [...selectedImages, ...files];
        console.log("✅ Total files:", selectedImages.length);

        // ✅ JANGAN clear preview! APPEND aja
        // preview.innerHTML = ''; // ❌ HAPUS BARIS INI!

        // ✅ CRITICAL: Render hanya file baru yang ditambahkan
        const startIndex = selectedImages.length - files.length;

        const previewPromises = files.map((file, fileIndex) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                const isVideo = file.type.startsWith("video/");
                const actualIndex = startIndex + fileIndex; // ✅ Index yang benar untuk remove

                reader.onload = function (e) {
                    const div = document.createElement("div");
                    div.className = "image-preview-item";
                    div.id = `preview-item-${actualIndex}`; // ✅ Unique ID
                    div.innerHTML = `
                        ${
                            isVideo
                                ? `
                            <video src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                                Your browser does not support video preview.
                            </video>
                            <div class="video-badge" style="position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 2;">
                                VIDEO
                            </div>
                        `
                                : `
                            <img src="${e.target.result}" alt="Preview ${
                                      actualIndex + 1
                                  }" style="width: 100%; height: 100%; object-fit: cover;">
                        `
                        }
                        <button type="button" class="image-preview-remove" onclick="removeImage(${actualIndex})">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    `;
                    preview.appendChild(div); // ✅ APPEND, bukan replace
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previewPromises).then(() => {
            console.log("✅ Preview rendered. Total:", selectedImages.length);
            newInput.value = ""; // ✅ Reset input agar bisa upload file sama 2x
        });
    });
}


function removeImage(index) {
    console.log("🗑️ Removing file at index:", index);

    selectedImages.splice(index, 1);

    const input = document.getElementById("reviewImages");
    const preview = document.getElementById("imagePreview");

    if (selectedImages.length === 0) {
        if (input) input.value = "";
        if (preview) preview.innerHTML = "";
        console.log("✅ All files removed");
        return;
    }

    // ✅ PERBAIKAN: Clear preview dan re-render dengan index yang benar
    if (preview) {
        preview.innerHTML = "";

        // ✅ Gunakan Promise.all biar urutan preview benar
        const previewPromises = selectedImages.map((file, i) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                const isVideo = file.type.startsWith("video/");

                reader.onload = function (e) {
                    const div = document.createElement("div");
                    div.className = "image-preview-item";
                    div.id = `preview-item-${i}`; // ✅ Unique ID
                    div.innerHTML = `
                        ${
                            isVideo
                                ? `
                            <video src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                                Your browser does not support video preview.
                            </video>
                            <div class="video-badge" style="position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 2;">
                                VIDEO
                            </div>
                        `
                                : `
                            <img src="${e.target.result}" alt="Preview ${
                                      i + 1
                                  }" style="width: 100%; height: 100%; object-fit: cover;">
                        `
                        }
                        <button type="button" class="image-preview-remove" onclick="removeImage(${i})">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    `;
                    preview.appendChild(div);
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previewPromises).then(() => {
            console.log(
                "✅ Preview updated, remaining files:",
                selectedImages.length
            );
        });
    }
}

// Make removeImage global
window.removeImage = removeImage;

// ✅ CRITICAL: Initialize only ONCE when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageUpload);
} else {
    initImageUpload();
}

