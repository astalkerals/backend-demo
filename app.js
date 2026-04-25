require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
//openbrewerydb.org
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

const charactersData = require("./characters.json");

async function seedOnce() {
  try {
    const count = await Character.countDocuments();
    if (count === 0) {
      await Character.insertMany(charactersData);
      console.log("Database seeded");
    } else {
      console.log("Database already has data");
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    seedOnce();
    console.log("Connected to mongodb...")})
  .catch((err) => console.error("could not connect to mongodb...", err));

  const characterSchema = new mongoose.Schema({
    name:String,
    occupation:String,
    generalBackground:String,
    personality:String,
    relationToDeceased:String,
    suspiciousAttributes:String,
    biggestSecret:String,
    imgsrc:String
  });

  const Character = mongoose.model("Character", characterSchema);

//let idCount = characters.length+1;
//let idCount = 15;

app.get("/api/characters", async(req, res) => {
  const characters = await Character.find();
  res.send(characters);
});

app.get("/api/characters/:id", async(req, res) => {
  const character = await Character.findById(req.params.id);
  res.send(character);
});

app.post("/api/characters", upload.single("img"), async(req,res) => {
  //console.log("In post request");
  //console.log(req.body);
  const result = validateCharacter(req.body);

  if(result.error){
    console.log("Error in validation");
    res.status(400).send(result.error.details[0].message);
    return;
    
  }
  console.log("Passed validation");
  console.log(req.body);

  //idCount += 1;

  const char = new Character({
//    _id:idCount,
    name:req.body.name,
    occupation:req.body.occupation,
    generalBackground:req.body.generalBackground,
    personality:req.body.personality,
    relationToDeceased:req.body.relationToDeceased,
    suspiciousAttributes:req.body.suspiciousAttributes,
    biggestSecret:req.body.biggestSecret
  });
  
  if(req.file){
    char.imgsrc = req.file.filename;
  }


  const newCharacter = await char.save();
  res.status(200).send(newCharacter);
});

app.put("/api/characters/:id", upload.single("img"), async(req,res) => {
  console.log("in put");
  const result = validateCharacter(req.body);

  if(result.error){
    console.log("Error in validation");
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const fieldsToUpdate = {
    name:req.body.name,
    occupation:req.body.occupation,
    generalBackground:req.body.generalBackground,
    personality:req.body.personality,
    relationToDeceased:req.body.relationToDeceased,
    suspiciousAttributes:req.body.suspiciousAttributes,
    biggestSecret:req.body.biggestSecret
  };

  /*
  if(!character){
    res.status(404).send("The character you wanted to modify is not available");
    return;
  }*/

  if(req.file){
    fieldsToUpdate.imgsrc = req.file.filename;
  }

  //const success = await Character.updateOneCharacter({_id:req.params.id}, fieldsToUpdate);

  const success = await Character.findByIdAndUpdate(req.params.id, fieldsToUpdate, {new : true});

  if(!success) {
    res.status(404).send("We couldn't find that character");
  } else {
    const character = await Character.findById(req.params.id);
    res.status(200).send(character);
  }

  
  
});

app.delete("/api/characters/:id", async(req,res) => {
  const character = await Character.findByIdAndDelete(req.params.id);

  if(!character){
    res.status(404).send("The character you wanted to delete is not available");
    return;
  }

  res.status(200).send(character);
});

const validateCharacter = (char) => {
  const schema = Joi.object({
    _id:Joi.allow(""),
    name:Joi.string().min(3).required(),
    occupation:Joi.string().min(3).required(),
    generalBackground:Joi.string().min(0).required(),
    personality:Joi.string().min(0).required(),
    relationToDeceased:Joi.string().min(0).required(),
    suspiciousAttributes:Joi.string().min(0).required(),
    biggestSecret:Joi.string().min(0).required()
  });

  return schema.validate(char);
};

//listen for incoming requests
const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log("Server is up and running");
});