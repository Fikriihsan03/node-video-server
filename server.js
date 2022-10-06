const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
var cors = require("cors");
const drivelist = require("drivelist");

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
app.set("view engine", "ejs");

app.get("/", async function (req, res) {
  const drives = await drivelist.list();

  drives.forEach((drive) => {});
  drives.shift();
  res.render("index", {
    title: "halo",
    data: drives,
  });
});
app.post("/generateMovie", function (req, res) {
  const folder = [];
  fs.readdirSync(`${req.body.path}/doctor`).forEach((file) => {
    const path =
      req.body.path.split("").slice(1).join("") + "/doctor" + "/" + file;
    const title = file
      .replace("-", " ")
      .substring(0, file.length - 4)
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    let movieData = {
      id:
        new Date().getTime().toString(36) + Math.random().toString(36).slice(2),
      title,
      path,
    };
    folder.push(movieData);
  });
  fs.writeFileSync("movieData.json", JSON.stringify(folder));

  res.send("success");
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

  res.send("success");
});

app.get("/movie", function (req, res) {
  let rawdata = fs.readFileSync("movieData.json");
  let movies = JSON.parse(rawdata);
  if (req.query.title === "" || req.query.title === undefined) {
    res.json(movies);
  } else {
    var result = movies.filter((o) => o.title.includes(req.query.title));
    res.json(result);
  }
});

app.get("/movie/:id", function (req, res) {
  let rawdata = fs.readFileSync("movieData.json");
  let movies = JSON.parse(rawdata);
  let specificMovie = movies.filter((movie) => movie.id === req.params.id);
  res.json(specificMovie);
});
app.get("/video", (req, res) => {
  streamController.streamMovie(req, res);
});

app.listen(3005, function () {
  console.log("Listening on port 3005");
});
