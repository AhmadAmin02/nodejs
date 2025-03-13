const express = require('express');
const path = require('path');
const { rateLimit } = require("express-rate-limit");
const indexRouter = require('./routes/index');

const app = express();
const PORT = 3000;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  message: { error: "Hanya bisa 1 menit per 10 requests!" }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use("/screenshot", limiter);

// Use the router for handling routes
app.use('/', indexRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
