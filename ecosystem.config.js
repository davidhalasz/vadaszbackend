module.exports = {
  apps: [
    {
      name: "vadaszbackend",
      script: "./app.js",
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      exec_mode: "cluster",
      ignore_watch: ['uploads']
    },
  ],
};
