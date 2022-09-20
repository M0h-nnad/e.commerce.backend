require('dotenv').config();
const mongoose = require('./middleware/mongo');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const UserRouter = require('./router/User.router');
const errorMiddleWare = require('./middleware/error.middleware');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const User = require('./models/User.model');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images'));
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, name + '.' + '-' + new Date().toDateString().replace(/:/g, '-'));
  },
});

const upload = multer({ storage });

app.use('/images', express.static('images'));

// app.use("/c",express.static('../../../../Courses/Udemy/[FreeCourseSite.com] Udemy - React - The Complete Guide (incl Hooks, React Router, Redux)'))

// app.get('',(req,res,next)=>{fs.readdir('../../../../Courses/Udemy/[FreeCourseSite.com] Udemy - React - The Complete Guide (incl Hooks, React Router, Redux)', function (err, files) {
//   //handling error
//   if (err) {
//       return console.log('Unable to scan directory: ' + err);
//   }
//   //listing all files using forEach
//   files.forEach(function (file) {
//       // Do whatever you want to do with the file
//       console.log(file)
//     });
//     return res.send(files);
//   })});
// app.post(
//   "/",
//   upload.fields([
//     {
//       name: "cover",
//       maxCount:1
//     },
//     { name: "images" },
//   ]),
//   (req, res) => {
//     console.log(req.files.images);
//     // console.log(req.headers.origin);
//     // console.log(os.hostname());
//     // console.log(os.platform());
//     // console.log(os.cpus());
//     // console.log(os.networkInterfaces());

//     res.send("ok");
//   }
// );

// User.getUser()
//   .then((user) => console.log(user))
//   .catch((err) => console.log(err));

// app.get('/', (req, res) => {
//   const user = User.find({ _id: ' ' }).then((p) => {
//     res.send(p);
//   });
// });

// app.get("/", (req,res) => {
//   // const Users = User.find({_id:'61489128ff7905fde63d928e'})
//   //   .populate("addresses")
//   //   .then((p) => {
//   //     console.log(p);
//   //     res.send(p);
//   //   })
//   //   .catch((e) => console.log(e));

//   bwipjs.toBuffer({
//     bcid:'code128',
//     text:"0123456789",
//     scale:3,
//     height:10,
//     includetext:true,
//     textxalign:'center'
//   },(err,png)=>{
//     if(err) return next(err)
//     console.log(png);

//    const buffer =  new Buffer(png).toString('base64');
//    const template = `
//    <div>
//     <img src="data:img/png;base64, ${buffer}">
//     </div>
//    `
//    return res.send(template);
//   })
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', UserRouter);

app.use(errorMiddleWare);
app.listen(process.env.port || 3000);

class Person {
  firstName;
  lastName;
  gender;
  roles = {
    admin,
    customer,
  };
  addresses = {
    name,
    addressesLine1,
    addressesLine2,
    city,
    state,
    postalCode,
    Country,
    timeZone,
    phone1,
    phone2,
    phone3,
  };
  email;
  password;
  enabled;
  cards = [
    {
      cardNumber,
      expiryMoth,
      expiryYear,
    },
  ];
}
/* 

category: men , women 
subCategory: top, bottom
SubCategorySub: Pants

*/
class item {
  name;
  cover;
  description;
  category;
  subCategory;
  subItem = {
    name,
    brand,
    subCategory,
    images,
    measure,
    color,
    price,
    usedPrice,
    cover,
    status,
    tags,
    discription,
    // fabric = {
    //     cotton,
    //     polyester,
    //     lycra,
    // },
    // Sku,
  };
}

class Category {
  name;
  subCategory = {
    name,
  };
}

class Favourite {
  items;
  user;
}
class ratings {
  rate;
  subItem;
  owner;
}

class Comments {
  content;
  owner;
  replyTo;
  numOfReplies;
  repliesId = [];
  subItem;
  User;
}

class recentItems {
  items = [];
  User;
}

class need {
  User; // the Requester
  requestedCount;
}

class orderLine {
  item;
  owner;
  opertaor;
  itemAudit;
  status; //fulfilled, cancelled
  barcode; // barcode image as Base64
  barcodeText;
  deliveryDetails;
}

class order {
  owner;
  status; // fullfilled
  barcode;
  address;
  addressAudit;
  orderLines = [];
}

class chat {
  fromPerson;
  toPerson;
  content;
  attachments = [{ fileName, path, mimeType }];
}

class cart {
  items = [];
  user;
}

class shop {
  name;
  category;
  subCategory;
  ratings;
  rating;
  comments;
  cover;
  images = [];
  discription;
  paymentTypes;
  address;
  owner = [];
  enabled;
}
