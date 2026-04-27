(() => {
  // Aktiv sahifani aniqlash
  const path = window.location.pathname;

  const isActive = (href) => {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.includes(href);
  };

  // Har bir sahifadan root ga nisbatan prefix
  // docs/articles/index.html => ../../
  // docs/index.html => ../  (agar root da bo'lsa => ./)
  const depth = path.split('/').filter(Boolean).length;
  // GitHub Pages / custom domain uchun root path
  const root = depth <= 1 ? './' : '../'.repeat(depth - 1);

  const links = [
    { label: 'Home',      href: '/',            dropdown: null },
    {
      label: 'Articles', href: '/articles/',   dropdown: [
        { label: 'Articles', sub: 'In-depth guides & tutorials',         href: '/articles/',  icon: 'articles' },
        { label: 'News',     sub: 'Tech & dev news',  href: '/news/',      icon: 'news'     },
        { label: 'Code',     sub: 'Snippets & open source',  href: '/code/',      icon: 'code'     },
      ]
    },
    {
      label: 'Community', href: '/community/', dropdown: [
        { label: 'Community', sub: 'Discussions & networking',    href: '/community/', icon: 'community' },
        { label: 'Showcase',  sub: 'Community projects',     href: '/showcase/',  icon: 'showcase'  },
      ]
    },
    { label: 'About',    href: '/about/',       dropdown: null },
  ];

  const icons = {
    articles:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h10"/></svg>`,
    news:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><path d="M14 4v5h5"/></svg>`,
    code:      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    community: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
    showcase:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  };

  const iconBg = {
    articles:  '#EEF2FF', articles_c:  '#3730a3',
    news:      '#FEF3C7', news_c:      '#92400e',
    code:      '#ECFDF5', code_c:      '#065f46',
    community: '#F5F3FF', community_c: '#6d28d9',
    showcase:  '#F0F9FF', showcase_c:  '#0369a1',
  };

  const arrowSvg = `<svg class="nav-arrow-svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg>`;

  const navItemsHtml = links.map(link => {
    const active = isActive(link.href);

    if (!link.dropdown) {
      return `
        <div class="db-nav-item">
          <a href="${link.href}" class="db-nav-link ${active ? 'db-active' : ''}">${link.label}</a>
        </div>`;
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

  const headerHtml = `
    <header class="db-header" id="db-header">
      <a href="/" class="db-logo">Dev<span>.</span>Blog</a>
      <nav class="db-nav">${navItemsHtml}</nav>
      <div class="db-header-right">
        <button class="db-search-btn" aria-label="Search">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>
          </svg>
        </button>
        <button class="db-mobile-menu-btn" id="db-mobile-menu-btn" aria-label="Menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div id="nav-right">
          <button class="db-login-btn" onclick="window.location.href='/login/'">Sign in</button>
        </div>
      </div>
      <div class="db-mobile-menu" id="db-mobile-menu">
        <div class="db-mobile-menu-content">
          <div class="db-mobile-nav">${navItemsHtml}</div>
          <div class="db-mobile-actions">
            <button class="db-login-btn-mobile" onclick="window.location.href='/login/'">Sign in</button>
          </div>
        </div>
      </div>
    </header>`
    </header>`

  const css = `
    .db-header {
      background: #fff;
      border-bottom: 1px solid #e8e4de;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 1000;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .db-logo {
      font-family: Georgia, serif;
      font-size: 17px;
      color: #111;
      text-decoration: none;
      letter-spacing: -0.3px;
      flex-shrink: 0;
    }
    .db-logo span { color: #2563eb; }

    .db-nav {
      display: flex;
      align-items: center;
      height: 56px;
    }
    .db-nav-item {
      position: relative;
      height: 56px;
      display: flex;
      align-items: center;
    }
    .db-nav-link {
      font-size: 13px;
      letter-spacing: 0.4px;
      color: #555;
      text-decoration: none;
      padding: 0 14px;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 4px;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      cursor: pointer;
      white-space: nowrap;
    }
    .db-nav-link:hover,
    .db-has-dropdown:hover .db-nav-link {
      color: #111;
      border-bottom-color: #2563eb;
    }
    .db-nav-link.db-active {
      color: #111;
      border-bottom-color: #111;
      font-weight: 500;
    }
    .db-nav-arrow { display: flex; align-items: center; }
    .db-nav-arrow-svg { transition: transform 0.2s; }
    .db-has-dropdown:hover .db-nav-arrow-svg { transform: rotate(180deg); }

    .db-dropdown {
      position: absolute;
      top: calc(100% + 1px);
      left: 0;
      background: #fff;
      border: 1px solid #e8e4de;
      border-radius: 10px;
      padding: 8px;
      min-width: 210px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px);
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .db-has-dropdown:hover .db-dropdown {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }
    .db-drop-link {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 7px;
      text-decoration: none;
      transition: background 0.1s;
    }
    .db-drop-link:hover { background: #f8f7f4; }
    .db-drop-icon {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .db-drop-title {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #111;
      line-height: 1.3;
    }
    .db-drop-sub {
      display: block;
      font-size: 11px;
      color: #999;
      line-height: 1.3;
      margin-top: 1px;
    }
    .db-drop-divider {
      height: 1px;
      background: #f0ece6;
      margin: 4px 0;
    }
    .db-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .db-search-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #777;
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .db-search-btn:hover { color: #111; background: #f5f5f5; }
    .db-login-btn {
      background: #111;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 13px;
      padding: 7px 16px;
      border-radius: 6px;
      font-family: inherit;
      letter-spacing: 0.3px;
      transition: background 0.15s;
    }
    .db-login-btn:hover { background: #333; }

    .db-mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: #777;
      padding: 6px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .db-mobile-menu-btn:hover { color: #111; background: #f5f5f5; }

    .db-mobile-menu {
      display: none;
      position: fixed;
      top: 56px;
      left: 0;
      width: 100%;
      height: calc(100vh - 56px);
      background: #fff;
      z-index: 999;
      overflow-y: auto;
    }
    .db-mobile-menu.open { display: block; }

    .db-mobile-menu-content {
      padding: 20px;
    }

    .db-mobile-nav {
      margin-bottom: 20px;
    }

    .db-mobile-nav .db-nav-item {
      height: auto;
      margin-bottom: 10px;
    }

    .db-mobile-nav .db-nav-link {
      padding: 12px 0;
      height: auto;
      border-bottom: none;
      font-size: 16px;
    }

    .db-mobile-nav .db-has-dropdown .db-nav-link {
      justify-content: space-between;
    }

    .db-mobile-nav .db-dropdown {
      position: static;
      opacity: 1;
      pointer-events: all;
      transform: none;
      border: none;
      box-shadow: none;
      padding: 0;
      margin-top: 10px;
      display: none;
    }

    .db-mobile-nav .db-has-dropdown.open .db-nav-arrow-svg { transform: rotate(180deg); }

    .db-mobile-nav .db-drop-link {
      padding: 12px 0;
      margin-bottom: 5px;
    }

    .db-mobile-actions {
      border-top: 1px solid #e8e4de;
      padding-top: 20px;
    }

    .db-login-btn-mobile {
      background: #111;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 12px 24px;
      border-radius: 6px;
      font-family: inherit;
      letter-spacing: 0.3px;
      transition: background 0.15s;
      width: 100%;
    }
    .db-login-btn-mobile:hover { background: #333; }

    @media (max-width: 768px) {
      .db-nav { display: none; }
      .db-mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
      #nav-right { display: none; }
    }

    @media (max-width: 640px) {
      .db-nav-link { padding: 0 10px; font-size: 12px; }
      .db-header { padding: 0 1rem; }
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Inject HTML at top of body
  const wrapper = document.createElement('div');
  wrapper.innerHTML = headerHtml;
  document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);

  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById('db-mobile-menu-btn');
  const mobileMenu = document.getElementById('db-mobile-menu');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });

  // Handle dropdowns in mobile menu
  const dropdownItems = mobileMenu.querySelectorAll('.db-has-dropdown');
  dropdownItems.forEach(item => {
    const link = item.querySelector('.db-nav-link');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      item.classList.toggle('open');
    });
  });
})();