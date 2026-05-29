module.exports = {
  apps: [
    {
      name: 'geotasker-web',
      script: 'npx',
      args: 'serve dist -l 3000',
      max_memory_restart: '128M',
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
