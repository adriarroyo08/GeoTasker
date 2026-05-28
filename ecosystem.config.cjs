module.exports = {
  apps: [
    {
      name: 'geotasker-web',
      script: 'npx',
      args: 'serve dist -l 3000',
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
