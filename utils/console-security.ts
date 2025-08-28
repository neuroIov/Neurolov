// Production console security utility
export const disableConsole = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable all console methods
    const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
    
    consoleMethods.forEach(method => {
      (console as any)[method] = () => {};
    });

    // Block F12, right-click, and keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    });

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Advanced console detection and blocking
    const devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect or take action when devtools detected
          window.location.href = 'about:blank';
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Override toString to detect console inspection
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
      if (this === disableConsole) {
        window.location.href = 'about:blank';
      }
      return originalToString.call(this);
    };
  }
};

// Production-safe console replacement
export const secureConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  error: process.env.NODE_ENV === 'development' ? console.error : () => {},
  warn: process.env.NODE_ENV === 'development' ? console.warn : () => {},
  info: process.env.NODE_ENV === 'development' ? console.info : () => {},
  debug: process.env.NODE_ENV === 'development' ? console.debug : () => {},
};
