const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable optimizations for web builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console.logs in production
      dead_code: true,
      unused: true,
    },
    mangle: {
      toplevel: true,
    },
    output: {
      comments: false,
    },
  },
};

// Enable lazy bundling for development
config.resolver = {
  ...config.resolver,
  // Enable better tree shaking
  unstable_enablePackageExports: true,
};

// Optimize for production
config.serializer = {
  ...config.serializer,
  // Experimental: Enable bundle splitting
  getModulesRunBeforeMainModule: () => [],
};

module.exports = withNativeWind(config, { input: './global.css' });