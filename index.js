require('dotenv').config();
const mongoose = require('./middleware/mongo');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const UserRouter = require('./router/User.router');
const ItemsRouter = require('./router/item.router');
const OrderRouter = require('./router/order.router');
const errorMiddleWare = require('./middleware/error.middleware');
const path = require('path');

// const upload = multer({ storage });

app.use('/images', express.static(path.join(process.cwd(), '..', 'images')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', ItemsRouter);

app.use('/api', UserRouter);
app.use('/api', OrderRouter);

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
