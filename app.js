//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

const items = ["Eat Food", "Cook Food", "Buy Food"];

app.set('view engine', 'ejs');

// Tell express to serve up the public folder as a static resource
app.use(express.static(__dirname + '/public'));
// Tells express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {

  let options = {
    weekday: "long",
    month: "long",
    day: "numeric"
  }

  let today = new Date().toLocaleDateString("en-US", options);

  res.render("home", {day: today, newListItems: items});
});

app.post("/", function(req, res) {
  let newItem = req.body.newItem;

  items.push(newItem);
  res.redirect("/");
});



app.listen(3000, function(){
  console.log("Server has started on port 3000");
});
