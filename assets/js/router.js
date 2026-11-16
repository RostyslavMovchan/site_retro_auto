(() => {
  const main = document.getElementById('main-content');
  const views = [...main.querySelectorAll(':scope > [data-view]')];
  const navLinks = document.querySelectorAll('[data-view-link]');
  const title = document.title;
  const routes = new Map();
  const anchors = new Map();
  let activeRoute;

  for (const panel of views) {
    const view = panel.dataset.view;
    const sections = [...panel.querySelectorAll(':scope > section[id], details[id]')];
    for (const [index, target] of sections.entries()) {
      const path = '#/' + view + (index ? '/' + target.id : '');
      const route = { panel, target, path, view };
      routes.set(path, route);
      anchors.set('#' + target.id, route);
    }
  }

  function navigate(route, { focus, scroll = true } = {}) {
    const viewChanged = activeRoute?.view !== route.view;
    if (viewChanged) {
      for (const panel of views) panel.hidden = panel !== route.panel;
      for (const link of navLinks) {
        const active = link.dataset.viewLink === route.view;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
      document.title = route.view === 'home' ? title : route.panel.dataset.title + ' | Retro Auto';
    }
    activeRoute = route;
    if (route.target.tagName === 'DETAILS') route.target.open = true;
    if (scroll) {
      if (route.target === route.panel.firstElementChild) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        route.target.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
    if (focus) {
      const destination = focus === true
        ? document.getElementById(route.target.getAttribute('aria-labelledby')) || route.target
        : focus;
      if (focus === true && !destination.hasAttribute('tabindex')) destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    }
    if (viewChanged) {
      document.dispatchEvent(new CustomEvent('retro:view-change', { detail: { view: route.view } }));
    }
  }

  function resolve(hash) {
    return routes.get(hash) || anchors.get(hash);
  }

  function fromLocation({ initial = false } = {}) {
    const resolved = resolve(location.hash);
    const route = resolved || routes.get('#/home');
    if (resolved && location.hash !== route.path || !resolved && location.hash.startsWith('#/')) {
      history.replaceState(history.state, '', route.path);
    }
    if (initial || route !== activeRoute) {
      const secondary = route.target !== route.panel.firstElementChild;
      navigate(route, { scroll: !initial || secondary, focus: !initial });
    }
  }

  function openRoute(route, focus) {
    if (location.hash !== route.path) history.pushState(null, '', route.path);
    navigate(route, { focus });
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey
        || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (href === '#main-content') {
      event.preventDefault();
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const route = resolve(href);
    if (!route) return;
    event.preventDefault();
    openRoute(route, true);
  });

  document.addEventListener('retro:navigate', ({ detail }) => {
    const route = resolve('#' + detail.anchor);
    if (route) openRoute(route, detail.focus || true);
  });

  window.addEventListener('popstate', () => fromLocation());
  window.addEventListener('hashchange', () => fromLocation());
  fromLocation({ initial: true });
})();
