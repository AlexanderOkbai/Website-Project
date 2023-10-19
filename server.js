const express = require("express");
const app = express();
const path = require("path");
const User = require("./models/users");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const MongoStore = require("connect-mongo");
const Joi = require("joi");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "image");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const profilephoto = multer({ storage: storage });

app.use(
  session({
    secret: "123321AABBCCDD",
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/demo",
      collectionName: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  })
);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("user not found!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Incorrect password!");
  }
  req.session.user = {
    id: user.id,
    role: user.role,
  };

  res.render("Home.ejs");
});

const schema = Joi.object({
  firstname: Joi.string().alphanum().min(3).max(30).required(),
  lastname: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string(),
  role: Joi.string().valid("user", "admin"),
});

app.post("/register", async (req, res) => {
  const schema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),

    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    phonenumber: Joi.string(),
    password: Joi.string(),
    photo: Joi.string(),
    role: Joi.string().valid("user", "admin"),
  });

  try {
    const validateResults = schema.validate(req.body);
    if (validateResults.error) {
      return res.send(validateResults.error.details).status(400);
    }
  } catch (err) {
    return res.send("error happened!!").status(500);
  }

  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    role: req.body.role,
    photo: req.body.photo,
    password: await bcrypt.hash(req.body.password, 10),
  });

  await user.save();
  return res.render("Home.ejs");
});

const userform = require("./models/userform");
app.post("/blog", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  const newuserform = new userform({
    title: req.body.title,
    description: req.body.description,
  });

  await newuserform.save();

  res.sendStatus(201);
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.post("/profile", profilephoto.single("image"), (req, res) => {
  res.send("image uploaded");
});

app.get("/", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.render("admin");
      // } else {
      //   return res.send("You are logged out user!!!");
      // }
    } else {
      return res.render("Home.ejs");
    }
  }
});

app.get("/Register", (req, res) => {
  res.render("Register.ejs");
});

app.get("/Login", (req, res) => {
  res.render("Login.ejs");
});

app.get("/blog", (req, res) => {
  res.render("blog.ejs");
});

app.get("/About", (req, res) => {
  res.render("About.ejs");
});

app.get("/Logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("error logging out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/Login");
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`http://lvh.me:${port}`);
});
