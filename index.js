const express = require("express");
const app = express();
const port = 5501;

app.use(express.static("frontend"));

app.listen(port, () => {
  console.log(`NurtureChat instance listening on port ${port}`);
});
