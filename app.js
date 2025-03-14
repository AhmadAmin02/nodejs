const express = require('express');
const path = require('path');
const cors = require("cors");

const indexRouter = require('./routes/index');
const apiRouter = require("./routes/api");

const app = express();
const PORT = 3000;

app.enable("trust proxy")

app.set("json spaces", 2);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'error', '404.html'));
});

app.use((req, res, next) => {
  res.status(500).sendFile(path.join(__dirname, "error", "500.html"));
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
