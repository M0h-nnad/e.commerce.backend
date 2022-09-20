/* Models */

const User = require('../models/User.model');
const Address = require('../models/addresses.model');
const Card = require('../models/cards.model');
const Role = require('../models/role.model');
const Favourite = require('../models/favourite.model');
const Cart = require('../models/cart.model');

/* Third Parties */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Secret } = process.env;

const signUp = async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).send({ messages: 'Invalid Credentials' });
  req.body.password = await bcrypt.hash(req.body.password, 12);
  try {
    const newUser = await new User(req.body);
    console.log(newUser);
    const newCart = await new Cart({ owner: req.decToken.UserId });
    const newFavourite = await new Favourite({
      owner: req.decToken.UserId,
      // items: [req.body.itemId],
    });
    if (req.body.itemId)
      req.body.itemId.length
        ? (newFavourite.items = [req.body.itemId])
        : (newFavourite.items = req.body.itemId);

    await newFavourite.save();
    awaitnewUser.save();
    newUser.token = jwt.sign(
      { UserId: newUser._id, email: newUser.email },
      Secret,
      {
        expiresIn: '24h',
      }
    );
    return res
      .status(201)
      .send({ messages: 'User Created Successfully', UserDoc: newUser });
  } catch (err) {
    return next(err);
  }
};

const logIn = async (req, res, next) => {
  let { email, password } = req.body;
  let UserDoc = await User.findOne({ email }).populate('addresses').lean();
  if (UserDoc && (await bcrypt.compare(password, UserDoc.password))) {
    UserDoc.token = jwt.sign(
      { UserId: UserDoc._id, email: UserDoc.email },
      Secret,
      { expiresIn: '24h' }
    );
    delete UserDoc.password;
    return res
      .status(200)
      .send({ messages: 'Logged In SuccessFully', UserDoc });
  }
  return res.status(404).send({ messages: 'Account Is not Found' });
};

const UpdateUser = async (req, res, next) => {
  try {
    const UpdatedUser = await User.findOneAndUpdate(
      { _id: req.decToken.UserId },
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'User Updated Successfully', UpdatedUser });
  } catch (err) {
    return next(err);
  }
};

const UpdatePassword = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 12);
    const UpdatedUser = await User.findOneAndUpdate(
      { _id: req.decToken.UserId },
      { password: hashedPass },
      { new: true }
    );

    return res.send(200).status({ messages: 'Password Updated Successfully' });
  } catch (err) {
    return next(err);
  }
};

const DeleteUser = async (req, res, next) => {
  try {
    const DeleteUser = await User.findOneAndDelete({
      _id: req.decToken.UserId,
    });
    const DeleteAddresses = await Address.deleteMany({
      UserId: req.decToken.UserId,
    });
    const DeleteCards = await Card.findOneAndDelete({
      owner: req.decToken.UserId,
    });
    const cart = await Cart.findByIdAndDelete({ owner: req.decToken.UserId });
    return res.status(200).send({ messages: 'Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

const restPassword = async (req, res, next) => {};

/* Creating User Cards */

const createCards = async (req, res, next) => {
  const NewCard = await new Card(req.body);
  NewCard.save((err) => {
    if (err) return next(err);
    return res
      .status(201)
      .send({ messages: 'Card added Succsessfully', Card: NewCard });
  });
};

const getUserCards = async (req, res, next) => {
  try {
    const Cards = await Card.find({ owner: req.decToken.UserId });
    return res.status(200).send({ messages: 'Retrived Successfully', Cards });
  } catch (err) {
    return next(err);
  }
};

const DeleteCards = async (req, res, next) => {
  try {
    const DeletedCard = await Card.findOneAndDelete({ _id: req.params.id });
    return res.status(200).send({ messages: 'Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

const UpdateCard = async (req, res, next) => {
  try {
    const UpdatedCard = await Card.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      }
    );
    return res
      .status(200)
      .send({ messages: 'Updated Successfully', UpdatedCard });
  } catch (err) {
    return next(err);
  }
};

/* Address Controller */

const CreateAddress = async (req, res, next) => {
  let NewAdd = await new Address(req.body);

  NewAdd.save(async (err) => {
    if (err) return next(err);
    console.log(NewAdd._id);
    const UpdateUser = await User.findOneAndUpdate(
      { _id: req.decToken.UserId },
      { $addToSet: { addresses: NewAdd._id } },
      { new: true }
    );
    return res
      .status(201)
      .send({ messages: 'Address Created Successfully', UpdateUser });
  });
};

const UpdateAddress = async (req, res, next) => {
  try {
    const UpdateAddress = await Address.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      }
    );
    return res
      .status(200)
      .send({ messages: 'Updated Successfully', UpdateAddress });
  } catch (err) {
    return next(err);
  }
};

const DeleteAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    const DeleteAddress = await Address.findOneAndDelete({ _id: id });
    const UpdatedUser = await User.findOneAndUpdate(
      { _id: req.decToken.UserId },
      { $pull: { addresses: id } }
    );
    return res.status(200).send({
      messages: 'Address Deleted Successfully',
      UpdatedUser,
      AddressId: id,
    });
  } catch (err) {
    return next(err);
  }
};

/* Role */

const CreateRole = async (req, res, next) => {
  try {
    const NewRole = await new Role(req.body);
    NewRole.save((err) => {
      if (err) return next(err);
      return res
        .status(200)
        .send({ messages: 'Role Created Successfully', NewRole });
    });
  } catch (err) {
    return next(err);
  }
};

const AddRole = async (req, res, next) => {
  try {
    const role = await Role.findOne({ _id: req.body.id });
    const UpdateUser = await User.findByIdAndUpdate(req.decToken.UserId, {
      role: role.name,
    });
    return res
      .status(200)
      .send({ messages: 'Role Added to User Successfully', UpdateUser });
  } catch (err) {
    return next(err);
  }
};

const UpdateRole = (req, res, next) => {
  // Just Testing My knowleage in Using normal Promises In mongoose Queries
  const UpdatedRole = Role.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  )
    .exec()
    .then((d) => {
      return res
        .status(200)
        .send({ messages: 'Role Updated Successfully', Role: d });
    })
    .catch((err) => next(err));
};

const GetRoles = async (req, res, next) => {
  try {
    const roles = await Roles.find({});
    return res
      .status(200)
      .send({ messages: 'Roles Fetched Successfully', Roles: roles });
  } catch (err) {
    return next(err);
  }
};

const DeleteRole = async (req, res, next) => {
  try {
    const DelRole = await Role.findOneAndDeleteOne({ _id: req.params.id });
    const UpdateUser = await User.findOneAndUpdateOne(
      { role: DelRole._id },
      { role: null },
      { new: true }
    );
    return res.status(200).send({
      messages: 'Role Deleted Successfully',
      RoleId: DelRole._id,
      UpdateUser,
    });
  } catch (err) {
    return next(err);
  }
};

/* Favourite  */

const addToFavourite = async (req, res, next) => {
  try {
    const updatedFavourite = await Favourite.findOneAndUpdate(
      { owner: req.decToken.UserId },
      { $addToSet: { items: req.body.itemId } },
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'Updated Successfully', updatedFavourite });
  } catch (err) {
    return next(err);
  }
};

const deleteFromFavourite = async (req, res, next) => {
  try {
    const updateFavourite = await Favourite.updateOne(
      { owner: req.decToken.UserId },
      { $pull: { items: req.params.id } }
    );
    res.status(200).send({ messages: 'Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

/* Cart */

const addToCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { owner: req.decToken.UserId },
      { $addToSet: { item: req.params.id } },
      { new: true }
    );
    return res.status(200).send({ messages: 'Item Added Successfully' });
  } catch (err) {
    return next(err);
  }
};

const deleteFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { owner: req.decToken.UserId },
      { $pull: { item: req.params.id } },
      { new: true }
    );
    return res.status(200).send({ messages: 'Item Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  User: {
    signUp,
    logIn,
    DeleteUser,
    UpdateUser,
    UpdatePassword,
  },
  Cards: {
    getUserCards,
    createCards,
    DeleteCards,
    UpdateCard,
  },
  Address: {
    CreateAddress,
    DeleteAddress,
    UpdateAddress,
  },
  Roles: {
    GetRoles,
    DeleteRole,
    CreateRole,
    UpdateRole,
    AddRole,
  },
  Cart: {
    addToCart,
    deleteFromCart,
  },
  Favourite: {
    addToFavourite,
    deleteFromFavourite,
  },
};
