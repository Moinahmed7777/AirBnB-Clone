const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv").config();
const connectDb = require("./config/dbConnections");
const User = require("./models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const Place = require("./models/Place");
const Booking = require("./models/Booking");
const { resolve } = require("path");
const multer = require("multer");
const mime = require("mime-types");
//solves CORS error when app can't communicate with the port
// credentials true to pass the header
// origin what type of app should comunicate with out api
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

//inbuilt middleware app.use(), express.json() provides a parser for the body
app.use(express.json());
//cookie parser
app.use(cookieParser());
//
app.use("/uploads", express.static(__dirname + "\\uploads"));

connectDb();
const bucket = "moin-booking-app";

async function uploadToS3(path, originalFilename, mimetype) {
  const client = new S3Client({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const parts = originalFilename.split(".");
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + "." + ext;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: "public-read",
    })
  );
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      req.cookies.token,
      process.env.ACCESS_TOKEN_SECRET,
      {},
      async (err, userData) => {
        if (err) throw err;
        resolve(userData);
      }
    );
  });
}

app.get("/api/test", (req, res) => {
  connectDb();
  res.status(200).json("test ok");
});

app.post("/api/register", async (req, res) => {
  connectDb();
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/api/login", async (req, res) => {
  connectDb();
  const { email, password } = req.body;

  const userDoc = await User.findOne({ email });
  if (userDoc) {
    if (await bcrypt.compare(password, userDoc.password)) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {}, //expiresIn: "15m"
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("password incorrect");
    }
  } else {
    res.json("user not found");
  }
});

app.get("/api/profile", (req, res) => {
  connectDb();
  const { token } = req.cookies;
  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      {},
      async (err, userData) => {
        if (err) throw err;
        const { name, email, _id } = await User.findById(userData.id);
        res.json({ name, email, _id });
      }
    );
  } else {
    res.json(null);
  }
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post("/api/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: "/tmp/" + newName,
  });
  const url = await uploadToS3(
    "/tmp/" + newName,
    newName,
    mime.lookup("/tmp/" + newName)
  );
  res.json(url);
});

const photosMiddleware = multer({ dest: "/tmp" });
// photosMiddleware.array("photos", 100)
app.post(
  "/api/upload",
  photosMiddleware.array("photos", 100),
  async (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname, mimetype } = req.files[i];

      const url = await uploadToS3(path, originalname, mimetype);
      uploadedFiles.push(url);
    }
    res.json(uploadedFiles);
  }
);

app.post("/api/places", async (req, res) => {
  connectDb();
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    {},
    async (err, userData) => {
      if (err) throw err;
      let ID = userData.id;
      const placeDoc = await Place.create({
        owner: ID,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      res.json(placeDoc);
    }
  );
});

app.get("/api/user-places", (req, res) => {
  connectDb();
  const { token } = req.cookies;
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    {},
    async (err, userData) => {
      if (err) throw err;
      const { id } = userData;
      res.json(await Place.find({ owner: id }));
    }
  );
});

app.get("/api/places/:id", async (req, res) => {
  connectDb();
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.get("/api/places", async (req, res) => {
  connectDb();
  res.json(await Place.find());
});

app.put("/api/places", async (req, res) => {
  connectDb();
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    {},
    async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.findById(id);
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,
          address,
          photos: addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        });
        await placeDoc.save();
        res.json("ok");
      }
    }
  );
});

app.post("/api/bookings", async (req, res) => {
  connectDb();
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    user: userData.id,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/api/bookings", async (req, res) => {
  connectDb();
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});
app.listen(4000);
