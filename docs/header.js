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

    const arrowSvg = `<svg class="nav-arrow-svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg>`;

    const navItemsHtml = links.map(link => {
      const active = isActive(link.href);

      if (!link.dropdown) {
        return `<div class="db-nav-item">
          <a href="${link.href}" class="db-nav-link ${active ? 'db-active' : ''}">${link.label}</a>
        </div>`;
      }

      const dropHtml = link.dropdown.map(d => `
        <a href="${d.href}" class="db-drop-link">
          <span>
            <span class="db-drop-title">${d.label}</span>
            <span class="db-drop-sub">${d.sub}</span>
          </span>
        </a>
      `).join('');

      return `<div class="db-nav-item db-has-dropdown">
        <a class="db-nav-link ${active ? 'db-active' : ''}">
          ${link.label}
          <span class="db-nav-arrow">${arrowSvg}</span>
        </a>
        <div class="db-dropdown">${dropHtml}</div>
      </div>`;
    }).join('');

    const headerHtml = `
      <header class="db-header">
        <a href="/" class="db-logo">Ither</a>
        <nav class="db-nav">${navItemsHtml}</nav>

        <div class="db-header-right">
          <button class="db-mobile-menu-btn" id="db-mobile-menu-btn">☰</button>
          <div id="nav-right">
            <button class="db-login-btn" onclick="window.location.href='/login/'">Sign in</button>
          </div>
        </div>

        <div class="db-mobile-menu" id="db-mobile-menu">
          <div class="db-mobile-menu-content">
            <button id="db-mobile-menu-close">×</button>
            <div class="db-mobile-nav">${navItemsHtml}</div>
          </div>
        </div>
      </header>
    `;

    const css = `
      .db-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        height: 60px;
        border-bottom: 1px solid #eee;
        background: #fff;
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .db-nav {
        display: flex;
        gap: 20px;
        flex: 1;
        justify-content: center; /* ✅ FIX */
      }

      .db-nav-item { position: relative; }

      .db-nav-link {
        text-decoration: none;
        color: #555;
        padding: 10px;
        cursor: pointer;
      }

      .db-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid #eee;
        display: none;
      }

      .db-has-dropdown:hover .db-dropdown {
        display: block;
      }

      /* MOBILE */
      .db-mobile-menu { display: none; }
      .db-mobile-menu.open { display: block; }

      @media (max-width: 768px) {
        .db-nav { display: none; }
        .db-mobile-menu-btn { display: block; }

        .db-mobile-nav .db-dropdown {
          display: none;
        }

        .db-mobile-nav .db-has-dropdown.open .db-dropdown {
          display: block; /* ✅ FIX */
        }
      }

      /* DESKTOP FIX */
      @media (min-width: 769px) {
        .db-dropdown {
          display: block !important;
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = headerHtml;
    document.body.prepend(wrapper.firstElementChild);

    // Mobile menu
    const btn = document.getElementById('db-mobile-menu-btn');
    const menu = document.getElementById('db-mobile-menu');
    const close = document.getElementById('db-mobile-menu-close');

    btn.addEventListener('click', () => menu.classList.toggle('open'));
    close.addEventListener('click', () => menu.classList.remove('open'));

    // Dropdown mobile only
    const dropdownItems = document.querySelectorAll('.db-has-dropdown');
    dropdownItems.forEach(item => {
      const link = item.querySelector('.db-nav-link');

      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) { // ✅ FIX
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    });

  } catch (e) {
    console.error(e);
  }
})();