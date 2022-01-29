const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting Down The SErver Due to Unhdandled Promise Rejection`);
  process.exit(1);
});
// console.log(youtube);

// config
dotenv.config({ path: "backend/config/config.env" });

// connection to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working on http://localhost:${process.env.PORT}`);
});

//unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
