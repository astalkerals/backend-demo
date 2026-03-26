const mongoose = require("mongoose");
const port = process.env.PORT || 4000 


//testdb is name of database, it will automatically make it
mongoose
  .connect("mongodb+srv://astalker:iloveCREAMCHEESE@data.rit5kyh.mongodb.net/")
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

const schema = new mongoose.Schema({
  name: String,
});

async function createMessage() {
  const result = await message.save();
  console.log(result);
}

//this creates a Message class in our app
const Message = mongoose.model("Message", schema);
const message = new Message({
  name: "Hello World",
});

createMessage();