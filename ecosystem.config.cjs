module.exports = {
  apps: [
    {
      name: 'geotasker-web',
      script: 'npx',
      args: 'serve dist -l 3000',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
