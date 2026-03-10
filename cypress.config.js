const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'trt15m',
  e2e: {
    baseUrl: "http://13.219.156.132:5173/",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
