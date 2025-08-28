// Enhanced browser security for production
export const initBrowserSecurity = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // Prevent console access
  const noop = () => {};
  const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd', 'clear', 'table'];
  
  consoleMethods.forEach(method => {
    (window.console as any)[method] = noop;
  });

  // Advanced DevTools detection
  let devtools = {
    open: false,
    orientation: null as string | null
  };

  const threshold = 160;
  let checkCount = 0;

  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (!(heightThreshold && widthThreshold) && ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
      if (!devtools.open || devtools.orientation !== (widthThreshold ? 'vertical' : 'horizontal')) {
        devtools.open = true;
        devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
        
        // Redirect to blank page
        if (checkCount > 2) { // Allow some tolerance
          document.body.innerHTML = '<div style="background: #000; color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace;">Access Denied</div>';
          setTimeout(() => {
            window.location.href = 'about:blank';
          }, 1000);
        }
        checkCount++;
      }
    } else {
      devtools.open = false;
      devtools.orientation = null;
      if (checkCount > 0) checkCount--;
    }
  };

  // Check every 100ms
  setInterval(detectDevTools, 100);

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+Shift+C (Inspect)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable drag
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Clear debug variables
  (window as any).console = undefined;
  (window as any).debug = undefined;
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = undefined;

  // Override toString to detect inspection
  const originalToString = Function.prototype.toString;
  Function.prototype.toString = function() {
    if (this === detectDevTools || this === initBrowserSecurity) {
      window.location.href = 'about:blank';
      return '';
    }
    return originalToString.call(this);
  };
};
