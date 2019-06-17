//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

// Tell express to serve up the public folder as a static resource
app.use(express.static(__dirname + '/public'));
// Tells express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// Create new database inside mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

// Create mongoDB schema
const itemsSchema = {
  name: String,
};

// Create mongoose model
const Item = mongoose.model("Item", itemsSchema);

// Create some items
const item1 = new Item ({
  name: "Eat Food"
});

const item2 = new Item ({
  name: "Buy Food"
});

const item3 = new Item ({
  name: "Cook Food"
});

// Set up an array of all defined items to be "inserted Many"
const defaultItems = [item1, item2, item3];

// Create a schema for lists
const listSchema = {
  name: String,
  items: [itemsSchema]
};

// Create a model for lists
const List = mongoose.model("List", listSchema);

// home route
app.get("/", function(req, res) {

  // "Read" and finds data for items, and renders interval
  // If nothing is found, default items will be created

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      // save all the items at once with insert many and array
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Insert many success.");
        }
      });

      res.redirect("/");
    }

    else {
      res.render("home", {title: "Home", newListItems: foundItems});
    }
  });
});

// a get route for params
app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);

  // find if a list with the given name exists
  // if no exist, create and save a new one
  List.findOne({name: listName}, function(err, foundList) {
    if (err) {
      console.log(err);
    }
    else if (foundList) {
      //Show existing list
      res.render("home", {title: foundList.name, newListItems: foundList.items})

    } else {
      //Create new list
      const list = new List({
        name: listName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + listName);
    }
  })
});

// takes post request from the home route
// creates a new item and saves it into the database
app.post("/", function(req, res) {
  let listName = req.body.list;
  let newItem = new Item ({
    name: req.body.newItem
  });

  // checks if the list name is the home route or a custom route
  if (listName === "Home") {
    newItem.save();
    res.redirect("/");
  }

  // for custom lists, we find the list by name
  // we then push the new item into the found list's array of items
  // update the foundslist with new data
  // redirect to the custom route
  else {
    List.findOne({name: listName}, function(err, foundList){
      // found list's embedded list of items
      let listArr = foundList.items
      listArr.push(newItem);
      foundList.save();
    });

    res.redirect("/" + listName);
  }
});

// takes a post request sent to be deleted
// used delete one and deletes a specific id number
// redirects back to the home route
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  let listName = req.body.list;

  if (listName === "Home") {

    Item.deleteOne({_id: checkedItemId}, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Delete success.");
        res.redirect("/");
      }
    });
  }

  else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
       function(err){
         if (err) {
           console.log(err);
         } else {
           console.log("Delete success.");
         }
    });

    res.redirect("/" + listName);
  }
});



app.listen(3000, function(){
  console.log("Server has started on port 3000");
});
