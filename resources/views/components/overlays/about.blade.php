{{-- overlay about --}}
    <div id="aboutOverlay" class="overlay" style="display: none;">
        <div class="overlay-window">
            <div class="overlay-header">
                <h2>About</h2>
                <button class="close-btn" onclick="closeOverlay('aboutOverlay')">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            
            <div class="overlay-content">
                <!-- Profile Photo Section -->
                <div class="profile-section">
                    <div class="profile-photo-container">
                        <img id="profilePhoto" 
                            src="{{ asset('storage/profile/' . (session('profile_photo') ?? 'default-avatar.png')) }}" 
                            alt="Hilal Prayogi">
                        <label for="profilePhotoInput" class="photo-upload-btn">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </label>
                        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="uploadProfilePhoto(event)">
                    </div>
                    
                    <div class="profile-info">
                        <h2>Hilal Prayogi</h2>
                        <p class="tagline">Illustrator • Animator • Developer</p>
                    </div>
                </div>

                <!-- Bio Section -->
                <div class="bio-section">
                    <h3>About Me</h3>
                    <p>Creative professional with a passion for bringing ideas to life through illustration, animation, and code. I blend artistic vision with technical expertise to create engaging visual experiences.</p>
                </div>

                <!-- Skills Section -->
                <div class="skills-section">
                    <h3>Expertise</h3>
                    <div class="skill-grid">
                        <div class="skill-card">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <path d="M21.5 2h-19C1.67 2 1 2.67 1 3.5v17c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5zM9 18H5V9h4v9zm9 0h-4v-4h4v4zm0-5h-4V9h4v4z"/>
                            </svg>
                            <h4>Illustration</h4>
                            <p>Digital art, character design, concept art</p>
                        </div>
                        <div class="skill-card">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            <h4>Animation</h4>
                            <p>2D animation, motion graphics, visual effects</p>
                        </div>
                        <div class="skill-card">
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <polyline points="16 18 22 12 16 6"/>
                                <polyline points="8 6 2 12 8 18"/>
                            </svg>
                            <h4>Development</h4>
                            <p>Web development, interactive experiences</p>
                        </div>
                    </div>
                </div>

                <!-- Contact Section -->
                <div class="contact-section">
                    <h3>Get in Touch</h3>
                    <div class="contact-links">
                        <a href="mailto:hilal@example.com" class="contact-link">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Email
                        </a>
                        <a href="#" class="contact-link">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                            Instagram
                        </a>
                        <a href="#" class="contact-link">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                            </svg>
                            YouTube
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
{{-- end overlay about --}}