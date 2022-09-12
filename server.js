const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
var cors = require("cors");
const streamController = require("./controller/streamMovieController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "movies");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
const app = express();

// app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/uploadMovie", upload.single("file_movie"), function (req, res) {
  let rawdata = fs.readFileSync("movieData.json");
  let movies = JSON.parse(rawdata);
  let movieData = {
    id: new Date().getTime().toString(36) + Math.random().toString(36).slice(2),
    title: req.body.title,
    filename: req.file.filename.substring(0, req.file.filename.length - 4),
  };

  let data = JSON.stringify([...movies, movieData]);
  fs.writeFileSync("movieData.json", data);

  // console.log(`y ${Date.now()}`);
  res.send("success");
  // console.log(req.file, req.body);
});

app.get("/movie", function (req, res) {
  let rawdata = fs.readFileSync("movieData.json");
  let movies = JSON.parse(rawdata);
  // console.log(req.query.title === "");
  if (req.query.title === "") {
    res.json(movies);
  } else {
    var result = movies.filter((o) => o.title.includes(req.query.title));
    res.json(result);
  }

  // console.log(student);
});
app.get("/movie/:id", function (req, res) {
  let rawdata = fs.readFileSync("movieData.json");
  let movies = JSON.parse(rawdata);
  let specificMovie = movies.filter((movie) => movie.id === req.params.id);
  // console.log(student);
  res.json(specificMovie);
});
app.get("/video/:name", (req, res) => {
  streamController.streamMovie(req, res);
});

app.listen(3005, function () {
  console.log("Listening on port 3005");
});
