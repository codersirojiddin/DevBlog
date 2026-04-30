(() => {
  try {
    const path = window.location.pathname;
    const isActive = (href) => {
      if (href === '/') return path === '/' || path === '/index.html';
      return path.includes(href);
    };

    const depth = path.split('/').filter(Boolean).length;
    const root = depth <= 1 ? './' : '../'.repeat(depth - 1);

    const links = [
      { label: 'Home', href: '/', dropdown: null },
      {
        label: 'Articles', href: '/articles/', dropdown: [
          { label: 'Articles', sub: 'In-depth guides & tutorials', href: '/articles/', icon: 'articles' },
          { label: 'News', sub: 'Tech & dev news', href: '/news/', icon: 'news' },
          { label: 'Code', sub: 'Snippets & open source', href: '/code/', icon: 'code' },
        ]
      },
      {
        label: 'Community', href: '/community/', dropdown: [
          { label: 'Community', sub: 'Discussions & networking', href: '/community/', icon: 'community' },
          { label: 'Showcase', sub: 'Community projects', href: '/showcase/', icon: 'showcase' },
        ]
      },
      { label: 'About', href: '/about/', dropdown: null },
    ];

    const icons = {
      articles: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h10"/></svg>`,
      news: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><path d="M14 4v5h5"/></svg>`,
      code: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      community: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
      showcase: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    };

    const iconBg = {
      articles: '#EEF2FF', articles_c: '#3730a3',
      news: '#FEF3C7', news_c: '#92400e',
      code: '#ECFDF5', code_c: '#065f46',
      community: '#F5F3FF', community_c: '#6d28d9',
      showcase: '#F0F9FF', showcase_c: '#0369a1',
    };

    const arrowSvg = `<svg class="nav-arrow-svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg>`;

    const generateNavItems = (isMobile = false) => {
      return links.map(link => {
        const active = isActive(link.href);
        if (!link.dropdown) {
          return `<div class="db-nav-item"><a href="${link.href}" class="db-nav-link ${active ? 'db-active' : ''}">${link.label}</a></div>`;
        }

        const dropHtml = link.dropdown.map((d, i) => {
          const divider = i === 1 && link.label === 'Articles' ? `<div class="db-drop-divider"></div>` : '';
          return `${divider}
            <a href="${d.href}" class="db-drop-link">
              <span class="db-drop-icon" style="background:${iconBg[d.icon]}; color:${iconBg[d.icon + '_c']}">
                ${icons[d.icon]}
              </span>
              <span>
                <span class="db-drop-title">${d.label}</span>
                <span class="db-drop-sub">${d.sub}</span>
              </span>
            </a>`;
        }).join('');

        return `
          <div class="db-nav-item db-has-dropdown">
            <a class="db-nav-link ${active ? 'db-active' : ''}">
              ${link.label}
              <span class="db-nav-arrow">${arrowSvg}</span>
            </a>
            <div class="db-dropdown">${dropHtml}</div>
          </div>`;
      }).join('');
    };

    const headerHtml = `
      <header class="db-header">
        <div class="db-header-container">
          <a href="/" class="db-logo">Ither</a>
          <nav class="db-nav-desktop">${generateNavItems()}</nav>
          <div class="db-header-right">
            <button class="db-search-btn" aria-label="Search">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
            </button>
            <div class="db-auth-desktop">
              <button class="db-login-btn" onclick="window.location.href='/login/'">Sign in</button>
            </div>
            <button class="db-mobile-menu-btn" id="db-mobile-menu-btn" aria-label="Menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div class="db-mobile-overlay" id="db-mobile-overlay"></div>
        <div class="db-mobile-menu" id="db-mobile-menu">
          <div class="db-mobile-menu-header">
            <a href="/" class="db-logo">Ither</a>
            <button class="db-mobile-menu-close" id="db-mobile-menu-close">×</button>
          </div>
          <div class="db-mobile-nav-content">
            ${generateNavItems(true)}
            <div class="db-mobile-actions">
              <button class="db-login-btn-mobile" onclick="window.location.href='/login/'">Sign in</button>
            </div>
          </div>
        </div>
      </header>`;

    const css = `
      .db-header {
        background: #fff;
        border-bottom: 1px solid #e8e4de;
        position: sticky;
        top: 0;
        z-index: 1000;
        width: 100%;
        left: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }
      .db-header-container {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0 2rem;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .db-logo {
        font-family: Georgia, serif;
        font-size: 20px;
        font-weight: bold;
        color: #111;
        text-decoration: none;
      }
      .db-nav-desktop { display: flex; align-items: center; height: 100%; gap: 8px; }
      .db-nav-item { position: relative; height: 100%; display: flex; align-items: center; }
      .db-nav-link {
        font-size: 14px;
        color: #555;
        text-decoration: none;
        padding: 0 12px;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: color 0.2s;
      }
      .db-nav-link:hover { color: #111; }
      .db-nav-link.db-active { color: #111; font-weight: 600; }
      
      .db-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background: #fff;
        border: 1px solid #e8e4de;
        border-radius: 12px;
        padding: 8px;
        min-width: 240px;
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
        transition: all 0.2s;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      .db-has-dropdown:hover .db-dropdown { opacity: 1; pointer-events: all; transform: translateY(0); }
      .db-has-dropdown:hover .nav-arrow-svg { transform: rotate(180deg); }
      .nav-arrow-svg { transition: transform 0.2s; }

      .db-drop-link {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px;
        border-radius: 8px;
        text-decoration: none;
      }
      .db-drop-link:hover { background: #f5f5f5; }
      .db-drop-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .db-drop-title { display: block; font-size: 14px; font-weight: 500; color: #111; }
      .db-drop-sub { display: block; font-size: 12px; color: #777; margin-top: 2px; }

      .db-header-right { display: flex; align-items: center; gap: 12px; }
      .db-search-btn { background: none; border: none; cursor: pointer; color: #555; padding: 8px; border-radius: 50%; }
      .db-search-btn:hover { background: #f5f5f5; color: #111; }
      .db-login-btn { background: #111; color: #fff; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 500; }

      .db-mobile-menu-btn { display: none; background: none; border: none; color: #111; cursor: pointer; }
      .db-mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; z-index: 1001; }
      .db-mobile-menu { position: fixed; top: 0; right: -100%; width: 85%; max-width: 300px; height: 100%; background: #fff; z-index: 1002; transition: right 0.3s ease; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
      .db-mobile-menu.open { right: 0; }
      .db-mobile-overlay.open { display: block; }
      .db-mobile-menu-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #eee; }
      .db-mobile-menu-close { font-size: 30px; background: none; border: none; cursor: pointer; }
      .db-mobile-nav-content { padding: 1rem; }
      
      @media (max-width: 900px) {
        .db-nav-desktop, .db-auth-desktop { display: none; }
        .db-mobile-menu-btn { display: block; }
        .db-header-container { padding: 0 1rem; }
        .db-mobile-nav-content .db-nav-item { flex-direction: column; align-items: flex-start; height: auto; width: 100%; }
        .db-mobile-nav-content .db-nav-link { width: 100%; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .db-mobile-nav-content .db-dropdown { position: static; display: none; opacity: 1; pointer-events: all; transform: none; box-shadow: none; border: none; width: 100%; padding-left: 15px; }
        .db-mobile-nav-content .db-has-dropdown.open > .db-dropdown { display: block; }
        .db-mobile-nav-content .db-has-dropdown.open > .db-nav-link .nav-arrow-svg { transform: rotate(180deg); }
        .db-mobile-actions { margin-top: 20px; }
        .db-login-btn-mobile { width: 100%; background: #111; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: 600; }
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.innerHTML = headerHtml;
    document.body.prepend(div.firstElementChild);

    const btnOpen = document.getElementById('db-mobile-menu-btn');
    const btnClose = document.getElementById('db-mobile-menu-close');
    const menu = document.getElementById('db-mobile-menu');
    const overlay = document.getElementById('db-mobile-overlay');

    const toggleMenu = () => {
      menu.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    };

    btnOpen.addEventListener('click', toggleMenu);
    btnClose.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    document.querySelectorAll('.db-mobile-nav-content .db-has-dropdown > .db-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });

  } catch (e) { console.error(e); }
})();