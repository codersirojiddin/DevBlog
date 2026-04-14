// Initialize user menu on all pages
function initializeUserMenu() {
    const user = window.SupabaseClient.getCurrentUser();
    const navRight = document.getElementById("nav-right");
    
    if (!navRight) return;
    
    // Calculate base path for navigation
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes('/docs/') && currentPath.split('/docs/')[1].includes('/');
    const basePrefix = isInSubfolder ? '../' : './';
    
    if (user) {
        navRight.innerHTML = `
            <div class="user-dropdown" id="user-dropdown">
                <button class="user-menu-btn" id="user-menu-btn">
                    <div class="user-avatar" id="user-avatar">?</div>
                    <span id="user-name">${user.username || user.email.split('@')[0]}</span>
                </button>
                <div class="user-dropdown-menu" id="user-dropdown-menu">
                    <a href="${basePrefix}profile/index.html">My Profile</a>
                    <a href="${basePrefix}community/index.html">Community</a>
                    <a href="${basePrefix}publish/index.html">New Post</a>
                    <button id="logout-btn">Logout</button>
                </div>
            </div>
        `;
        
        // Load user avatar
        window.SupabaseClient.supabaseFetch(`profiles?id=eq.${user.id}`)
            .then(data => {
                const profile = data?.[0];
                if (profile) {
                    const av = document.getElementById("user-avatar");
                    if (profile.avatar_url) {
                        av.innerHTML = `<img src="${profile.avatar_url}" alt="${profile.username}">`;
                    } else {
                        av.textContent = (profile.username || user.email)[0].toUpperCase();
                    }
                }
            })
            .catch(() => {});
        
        // Dropdown toggle
        const userMenuBtn = document.getElementById("user-menu-btn");
        const userDropdownMenu = document.getElementById("user-dropdown-menu");
        
        if (userMenuBtn && userDropdownMenu) {
            userMenuBtn.addEventListener("click", () => {
                userDropdownMenu.classList.toggle("visible");
            });
            
            // Close dropdown when clicking outside
            document.addEventListener("click", (e) => {
                if (!e.target.closest("#user-dropdown")) {
                    userDropdownMenu.classList.remove("visible");
                }
            });
            
            // Logout
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    window.SupabaseClient.signOut();
                    window.location.href = `${basePrefix}index.html`;
                });
            }
        }
    }
}

