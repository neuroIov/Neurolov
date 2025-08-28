// Production-safe console utility
const isProduction = process.env.NODE_ENV === 'production';

export const prodConsole = {
  log: isProduction ? () => {} : console.log,
  error: isProduction ? () => {} : console.error,
  warn: isProduction ? () => {} : console.warn,
  info: isProduction ? () => {} : console.info,
  debug: isProduction ? () => {} : console.debug,
  
  // Security-critical logs should still work in production
  security: isProduction ? () => {} : console.error,
  
  // For development only
  dev: (message: any, ...args: any[]) => {
    if (!isProduction) {
      console.log('[DEV]', message, ...args);
    }
  }
};

// Replace all console statements in production
if (isProduction && typeof window !== 'undefined') {
  // Override console methods
  Object.keys(console).forEach(key => {
    if (typeof (console as any)[key] === 'function') {
      (console as any)[key] = () => {};
    }
  });
}
