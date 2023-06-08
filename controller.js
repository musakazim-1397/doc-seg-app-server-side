const fs = require("fs");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const User = require("./Models/User");

const azureApiKey = "f8395187ef00409c8036ecf377ea39fa";
const azureEndpoint =
  "https://emiratesnbd-document-segmentation-001.cognitiveservices.azure.com/";

cloudinary.config({
  cloud_name: "doftqoqcu",
  api_key: "661627151578491",
  api_secret: "Zbk9_3gCbgWhTJl73uOEv4Yqu9I",
});

exports.postOCR = async (req, res) => {
//   console.log(req.file);
// console.log(req.body)
  let imgRes = await cloudinary.uploader.upload(req.file.path, {
    public_id: req.file.originalname,
  });
  const response = await axios.post(
    `${azureEndpoint}computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=caption&language=en`,
    {
      url: imgRes.secure_url,
      //   visualFeatures: "Categories",
    },
    {
      headers: {
        "Ocp-Apim-Subscription-Key": azureApiKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
//   console.log(response)
  if (response.status === 200) {
    res.status(200).json(response.data);
    return User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        user.previousDocuments.push(response.data.captionResult.text);
        return user.save();
      }
    });
  } else {
    res.status(400).json(response.data);
  }
};

exports.postRegister = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    previousDocuments: [],
  });
  try {
    const savedUser = await newUser.save();
    res.status(200).json({
        name: savedUser.name,
        email: savedUser.email,
        previousDocuments: savedUser.previousDocuments,
        id: savedUser._id,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.postLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    else {
      if (user.password === req.body.password) {
       return res.status(200).json({
            name: user.name,
            email: user.email,
            previousDocuments: user.previousDocuments,
            id: user._id,
       });
      } else {
        res.status(400).json({ message: "Incorrect password" });
      }
    }
};

exports.getPreviousDocuments = async (req, res) => {
  const email = req.params.email;
  console.log(email);
  return User.findOne({ email: email }).then((user) => {
    if (user) {
      res.status(200).json(user.previousDocuments);
    } else {
      res.status(400).json({ message: "User not found" });
    }
  });
};

exports.addPreviousDocument = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
      user.previousDocuments.push(req.body.caption);
     await user.save();
      res.status(200).json(user.previousDocuments);
};
