require('dotenv').config();
const mongoose = require('./middleware/mongo');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const UserRouter = require('./router/User.router');
const errorMiddleWare = require('./middleware/error.middleware');
const multer = require('multer');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
	user; // the Requester
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
	status; // fullfilled,
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
