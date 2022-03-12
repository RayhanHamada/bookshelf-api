const Hapi = require('@hapi/hapi');

async function main() {
  const server = Hapi.server({
    port: 5000,
  });

  await server.start().then(() => {
    console.log(`server berjalan pada port ${server.info.port}`);
  });
}

main();
