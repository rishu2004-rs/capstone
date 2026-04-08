const mongoose = require('mongoose');

const uri = "mongodb+srv://rishu2006:Nagaji2006@rishu12302804.khohztp.mongodb.net";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Connection failed!");
    console.error(err);
    process.exit(1);
  });
