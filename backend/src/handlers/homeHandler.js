const os = require('os');

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

const getHomeStats = (request, h) => {
  const uptime = formatUptime(os.uptime());
  const load = os.loadavg();
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2); // in MB
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);
  const cpuCount = os.cpus().length;
  const platform = os.platform();
  const arch = os.arch();

  return h
    .response({
      status: 'success',
      message: 'WereCooked API is running 🚀',
      data: {
        platform,
        architecture: arch,
        uptime,
        cpuCount,
        loadAverage: {
          '1min': load[0],
          '5min': load[1],
          '15min': load[2],
        },
        memory: {
          total: `${totalMem} MB`,
          used: `${usedMem} MB`,
          free: `${freeMem} MB`,
        },
      },
    })
    .code(200);
};

module.exports = { getHomeStats };
