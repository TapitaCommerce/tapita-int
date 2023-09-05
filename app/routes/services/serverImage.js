import imageModel from "~/models/image.model";
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
export default function ServerImage() {
  const app = express();
  app.use(cors());
  //CREATE EXPRESS APP
  app.use(bodyParser.urlencoded({ extended: true }));

  //ROUTES WILL GO HERE
  app.get("/", function (req, res) {
    res.json({ message: "WELCOME" });
  });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage }).single("tenfile");
  const stringServer = "https://serial-lab-univ-rfc.trycloudflare.com/uploads/";
  app.get("/uploads", (req, res) => {
    res.json({ url: "abc" });
  });
  app.post("/uploads", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.log(err);
      } else {
        const newImage = new imageModel({
          name: req.body.name,
          image: {
            data: req.file.filename,
            contentType: "image/jpg",
          },
          paths: `${stringServer}` + req.body.name,
        });
        newImage
          .save()
          .then(() => res.send("success!"))
          .catch((err) => console.log(err));
      }
    });
  });

  app.listen(3000, () => console.log("Server started on port 3000"));
}
