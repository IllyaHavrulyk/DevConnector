const mongoose = require("mongoose");
const config = require("config");

//Getting database connection uri
const db = config.get("mongoUri");

const connectDB = async () => {
    try {
        //Trying asynchronously connect to db.
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("MongoDB connected...");
    } catch (err) {
        console.error(err.code);
        console.error(err.message);
        //Exiting program in case of error.
        process.exit(1);
    }
}

module.exports = connectDB;