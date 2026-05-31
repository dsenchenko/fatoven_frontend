module.exports = {
  apps: [
    {
      name: 'fatoven-web',
      script: 'node_modules/.bin/serve',
      args: '-s dist -l tcp://0.0.0.0:4173',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/fatoven-web-error.log',
      out_file: './logs/fatoven-web-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
