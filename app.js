const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sokritha:xperial17@cluster0-hk0y7.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

// Schema in DB
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

// new model based on Schema
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "sleep",
});
const item2 = new Item({
  name: "eat",
});
const item3 = new Item({
  name: "code",
});
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  Item.find({}, (err, foundItem) => {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("Successful insert");
      });
      res.redirect("/");
    } else {
      console.log(foundItem);
      res.render("list", { listTitle: "Today", newListItem: foundItem });
    }
  });
});

app.post("/", (req, res) => {
  let itemName = req.body.newItem;
  let listTitle = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listTitle === "Title") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, (err) => {
      if (err) console.log("Error");
      else {
        console.log("Successful Remove that Item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},
      {$pull: {items: {_id: checkedItemID}}},
      (err, foundList)=>{
        if (!err){
          res.redirect("/"+listName);
        }
      });
  }

  
});

app.get("/:customeListName", (req, res) => {
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({ name: customeListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customeListName,
          items: defaultItems,
        });
        list.save();
        console.log("Doesn't Exist");
        res.redirect("/" + customeListName);
      } else {
        // Show an existing list
        console.log("Exists");
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items,
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("server start at port 3000");
});
