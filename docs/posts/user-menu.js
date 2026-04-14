// Initialize user menu on all pages
function initializeUserMenu() {
    const user = window.SupabaseClient.getCurrentUser();
    const navRight = document.getElementById("nav-right");
    
    if (!navRight) return;

    const currentPath = window.location.pathname;
    const pathParts = currentPath.replace(/^\//, "").replace(/\/$/, "").split("/").filter(Boolean);
    let basePrefix = "";

    if (pathParts.length > 0) {
        const hasFile = pathParts[pathParts.length - 1].includes(".");
        if (currentPath.endsWith("/")) {
            basePrefix = "../".repeat(pathParts.length);
        } else {
            basePrefix = "../".repeat(hasFile ? pathParts.length - 1 : pathParts.length);
        }
    }

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

        const userMenuBtn = document.getElementById("user-menu-btn");
        const userDropdownMenu = document.getElementById("user-dropdown-menu");
        
        if (userMenuBtn && userDropdownMenu) {
            userMenuBtn.addEventListener("click", () => {
                userDropdownMenu.classList.toggle("visible");
            });
            
            document.addEventListener("click", (e) => {
                if (!e.target.closest("#user-dropdown")) {
                    userDropdownMenu.classList.remove("visible");
                }
            });
            
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    window.SupabaseClient.signOut();
                    window.location.href = `${basePrefix}index.html`;
                });
            }
        }
    } else if (navRight && !navRight.innerHTML.trim()) {
        navRight.innerHTML = `<a href="${basePrefix}login/index.html" class="btn">Login</a>`;
    }
}

