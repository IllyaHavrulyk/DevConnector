const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
//Initializing application.
const app = express();

//Connecting to our database.
connectDB();

//Init middleware
app.use(express.json({ extended: false }));

//Defining routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    })
}
//Port setting and app starting.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => `Server started on port ${PORT}`);