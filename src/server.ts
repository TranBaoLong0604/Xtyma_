import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/", async () => {
  return {
    message: "Xtyma_ API is running",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "127.0.0.1",
    });

    console.log("Xtyma_ API is running at http://127.0.0.1:3000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();