  //BRAND SCREEN
        // Confetti effect
        function createConfetti() {
            const colors = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                confetti.style.opacity = Math.random();
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }
        }

        // Close modal
        document.getElementById('close-window').addEventListener('click', function() {
            document.getElementById('promo-modal').style.display = 'none';
        });

        // Show modal if not seen before
        if (!localStorage.getItem('promoSeen')) {
            document.getElementById('promo-modal').style.display = 'flex';
            localStorage.setItem('promoSeen', 'true');
            createConfetti();
        }

        let isDynamicColorEnabled = true;
        function getDominantColor(imgEl) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 50;
                canvas.height = 50;
                
                ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const colorMap = {};
                
                for (let i = 0; i < imageData.length; i += 4) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    
                    if (imageData[i + 3] === 0) continue;
                    
                    const rgb = `${r},${g},${b}`;
                    colorMap[rgb] = (colorMap[rgb] || 0) + 1;
                }
                
                let dominantColor = null;
                let maxFrequency = 0;
                
                for (const [color, frequency] of Object.entries(colorMap)) {
                    if (frequency > maxFrequency) {
                        maxFrequency = frequency;
                        dominantColor = color;
                    }
                }
                
                const [r, g, b] = dominantColor.split(',').map(Number);
                resolve({ r, g, b });
            });
        }
        
        function resetColors() {
            const playerControls = document.querySelector('.player-controls');
            const playerCenter = document.querySelector('.player-center');
            const lyricsContainer = document.querySelector('.lyrics-container');
            const sidebar = document.querySelector('.sidebar');
        
            // Reset to default colors
            playerControls.style.backgroundColor = '';
            playerCenter.style.backgroundColor = '';
            lyricsContainer.style.backgroundColor = '';
            sidebar.style.backgroundColor = '';
            
            playerControls.style.backgroundImage = '';
            playerCenter.style.backgroundImage = '';
            lyricsContainer.style.backgroundImage = '';
            sidebar.style.backgroundImage = '';
        }
        
        function updatePlayerControlsBackground(imageUrl) {
            if (!isDynamicColorEnabled) {
                resetColors();
                return;
            }
        
            const img = new Image();
            img.crossOrigin = "Anonymous";
            
            img.onload = async () => {
                try {
                    const color = await getDominantColor(img);
                    
                    const playerControls = document.querySelector('.player-controls');
                    const playerCenter = document.querySelector('.player-center');
                    const lyricsContainer = document.querySelector('.lyrics-container');
                    const sidebar = document.querySelector('.sidebar');
                    
                    playerControls.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
                    playerCenter.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
                    lyricsContainer.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.98)`;
                    sidebar.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.98)`;
        
                    lyricsContainer.style.backgroundImage = 
                    sidebar.style.backgroundImage = `
                        linear-gradient(
                            rgba(0, 0, 0, 0.8),
                            rgba(${color.r}, ${color.g}, ${color.b}, 0.98)
                        )
                    `;
        
                    playerCenter.style.backgroundImage = `
                        linear-gradient(
                            rgba(${color.r}, ${color.g}, ${color.b}, 0.98),
                            rgba(0, 0, 0, 0.8)
                        )
                    `;
        
                    playerControls.style.backgroundImage = `
                        linear-gradient(
                            rgba(0, 0, 0, 0.4),
                            rgba(${color.r}, ${color.g}, ${color.b}, 0.3)
                        )
                    `;
                } catch (error) {
                    console.error('Error getting dominant color:', error);
                }
            };
            
            img.onerror = () => {
                console.error('Error loading image');
            };
            
            img.src = imageUrl;
        }
        
        function updateNowPlaying(imageUrl, title, artist) {
            const nowPlayingImg = document.getElementById('nowPlayingImg');
            const nowPlayingTitle = document.getElementById('nowPlayingTitle');
            const nowPlayingArtist = document.getElementById('nowPlayingArtist');
            
            nowPlayingImg.src = imageUrl;
            nowPlayingTitle.textContent = title;
            nowPlayingArtist.textContent = artist;
            
            updatePlayerControlsBackground(imageUrl);
        }
        
        // Toggle button functionality
        const colorToggle = document.getElementById('colorToggle');
        const toggleText = document.getElementById('toggleText');

        colorToggle.addEventListener('click', () => {
            isDynamicColorEnabled = !isDynamicColorEnabled;
            toggleText.textContent = isDynamicColorEnabled ? 'ON' : 'OFF';
            
            // Change icon based on state
            const icon = colorToggle.querySelector('i');
            if (isDynamicColorEnabled) {
                icon.className = 'fas fa-palette';
                const nowPlayingImg = document.getElementById('nowPlayingImg');
                updatePlayerControlsBackground(nowPlayingImg.src);
            } else {
                icon.className = 'fas fa-palette-slash';  // or you could use 'far fa-palette' for outlined version
                resetColors();
            }
        });
        
        document.getElementById('nowPlayingImg').addEventListener('load', function() {
            updatePlayerControlsBackground(this.src);
        });
         
