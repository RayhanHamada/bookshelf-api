const Hapi = require('@hapi/hapi');
const routes = require('./routes');

async function main() {
  const server = Hapi.server({
    port: 5000,
  });

  server.route(routes);

  await server.start().then(() => {
    console.log(`server berjalan pada port ${server.info.port}`);
  });
}

main();
