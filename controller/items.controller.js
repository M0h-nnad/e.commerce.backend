const Item = require('../models/items.model');
const SubItem = require('../models/subItem.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/subcategory.model');
const SubCategorySub = require('../models/subcategorysub.model');
const Comments = require('../models/comment.model');
const fs = require('fs');
const conn = require('../middleware/mongo');

/* Items */

const createItem = async (req, res, next) => {
  if (req.file.cover) {
    req.body['cover'] = '/images/' + req.file.filename;
  }
  try {
    const NewItem = await new Item(req.body);
    await NewItem.save();
  } catch (rrr) {
    return next(err);
  }
};

const UpdateItem = async (req, res, next) => {
  if (req.file.cover) {
    req.body['cover'] = '/images/' + req.file.filename;
  }
  try {
    const UpdateItem = await Item.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'Item Update Successfully', UpdateItem });
  } catch (err) {
    if (err) return next(err);
  }
};

const GetItem = async (req, res, next) => {
  const itemId = req.params.id;
  try {
    const items = await Item.find({ _id: itemId }).populate('subItems');
    return res
      .status(200)
      .send({ messages: 'Items Fetched Successfully ', items });
  } catch (err) {
    return next(err);
  }
};

const DeleteItem = async (req, res, next) => {
  const itemId = req.params.id;
  try {
    const deletedItem = await Item.findOneAndDelete({ _id: itemId });
    const ImagePath = deletedItem.cover.split('/').shift().join('/');
    fs.unlink(ImagePath, (err) => {
      if (err) return next(err);
      console.log('Cover Is Deleted Successfully');
    });
    return res
      .status(200)
      .send({ messages: 'Item Deleted Successfully', itemId });
  } catch (err) {
    return next(err);
  }
};

/* SubItems */

const createSubItem = async (req, res, next) => {
  if (req.files.images.length !== 0) {
    req.files.images.forEach((img) => {
      req.body['images'].push('/images/' + img.filename);
    });
  }
  if (req.files.cover.length !== 0) {
    req.body.cover = '/images/' + req.files.cover[0].filename;
  }
  const NewSubItem = await new SubItem(req.body);
  NewSubItem.save(async (err) => {
    if (err) return next(err);

    try {
      const item = await Item.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: { subitems: NewSubItem._id } },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    return res
      .status(201)
      .send({ messages: 'SubItem Created Successfully', NewSubItem });
  });
};

const updateSubItem = async (req, res, next) => {
  if (req.files.imageslength !== 0) {
    req.files.images.forEach((img) => {
      req.body['images'].push('/images/' + img.filename);
    });
  }
  if (req.files.cover.length !== 0) {
    req.body.cover = '/images/' + req.files.cover[0].filename;
  }
  try {
    const UpdatedSubItem = await SubItem.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    conn.collection('SubItem Audit').insertOne(UpdatedSubItem);
    return res.status(200).send({ messages: 'SubItem Updated Successfully' });
  } catch (err) {
    return next(err);
  }
};

const DeleteSubItem = async (req, res, next) => {
  const SubitemId = req.params.id;
  try {
    const deletedSubItem = await SubItem.findOneAndDelete({ _id: SubitemId });
    const CoverPath = deletedSubItem.cover.split('/').shift().join('/');
    fs.unlink(CoverPath, (err) => {
      if (err) next(err);
      console.log('Cover Is Deleted Successfully');
    });
    const imagesPath = deletedSubItem.images.forEach((link) => {
      fs.unlink(link, (err) => {
        if (err) next(err);
        console.log('Image Is Deleted Successfully');
      });
    });

    return res
      .status(200)
      .send({ messages: 'Document Deleted Successfully', SubitemId });
  } catch (err) {
    return next(err);
  }
};

const GetSubItems = async (req, res, next) => {
  try {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    const itemId = req.params.id;
    if (pageSize && currentPage) {
      const SubItems = await SubItem.find({})
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
      return res
        .status(200)
        .send({ messages: 'Items Fetched Successfully', SubItems });
    } else if (itemId) {
      const SubItems = await SubItem.find({ _id: itemId });
      return res
        .status(200)
        .send({ messages: 'Items Fetched Successfully', SubItems });
    } else {
      const SubItems = await SubItem.find({});
      return res
        .status(200)
        .send({ messages: 'Items Fetched Successfully', SubItems });
    }
  } catch (err) {
    return next(err);
  }
};

/* Category */

const createCategory = async (req, res, next) => {
  try {
    const Category = await new Category(req.body.name);
    await Category.save();
    return res
      .status(200)
      .send({ messages: 'Category Created Successfully', Category });
  } catch (err) {
    return next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
    });
    return res
      .status(200)
      .send({ messages: 'Category Updated Successfully', updatedCategory });
  } catch (err) {
    return next(err);
  }
};

const DeleteCategory = async (req, res, next) => {
  try {
    const DeletedCategory = await Category.findByIdAndDelete(req.params.id);
    const DeleteSubCategory = await SubCategory.findOneAndDelete({
      category: req.params.id,
    });
    const DeleteSubCategorySub = await SubCategorySub.findOneAndDelete({
      subCategory: DeleteSubItem._id,
    });
    const UpdateItem = await Item.findOneAndUpdate(
      { category: req.params.id },
      { category: null, subCategory: null, SubCategorySub: null },
      { new: true }
    );
    const UpdateSubItem = await SubItem.findOneAndUpdate(
      { category: req.params.id },
      { category: null, subCategory: null, SubCategorySub: null },
      { new: true }
    );

    res.status(200).send({ messages: 'Category Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    if (pageSize && currentPage) {
      const Categories = await Category.find({})
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
      return res
        .status(200)
        .send({ messages: 'Categories Fetched Successfully', Categories });
    } else if (id) {
      const Categories = await Category.find({ _id: id });
      return res
        .status(200)
        .send({ messages: 'Categories Fetched Successfully', Categories });
    } else {
      const Categories = await Category.find({});
      return res
        .status(200)
        .send({ messages: 'Categories Fetched Successfully', Categories });
    }
  } catch (err) {
    return next(err);
  }
};

/* SubCategories */

const CreateSubCategory = async (req, res, next) => {
  try {
    const subCategory = await new SubCategory(req.body);
    await subCategory.save();
    return res.status(200).send({ messages: 'SubCategory Successfully' });
  } catch (err) {
    return next(err);
  }
};

const UpdateSubCategory = async (req, res, next) => {
  try {
    const UpdateSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'SubCategory Updated Successfully' });
  } catch (err) {
    return next(err);
  }
};

const DeleteSubCategory = async (req, res, next) => {
  try {
    const DeletedSubCategory = await SubCategory.findByIdAndDelete(
      req.params.id
    );
    return res.send(200).status({ messages: 'Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

const getSubCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    if (pageSize && currentPage) {
      const subCategories = await SubCategory.find({})
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
      return res
        .status(200)
        .send({ messages: 'SubCategory Fetched Successfully', subCategories });
    } else if (id) {
      const subCategories = await SubCategory.find({ category: req.params.id });
      return res
        .status(200)
        .send({ messages: 'SubCategory Fetched Successfully', subCategories });
    } else {
      const subCategories = await SubCategory.find({});
      return res
        .status(200)
        .send({ messages: 'SubCategory Fetched Successfully', subCategories });
    }
  } catch (err) {
    return next(err);
  }
};

/* SubCategoriesSub */

const CreateSubCategorySub = async (req, res, next) => {
  try {
    const subCategorySub = await new SubCategorySub(req.body);
    await subCategorySub.save();
    return res.status(200).send({ messages: 'SubCategorySub Successfully' });
  } catch (err) {
    return next(err);
  }
};

const UpdateSubCategorySub = async (req, res, next) => {
  try {
    const UpdateSubCategorySub = await SubCategorySub.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'SubCategorySub Updated Successfully' });
  } catch (err) {
    return next(err);
  }
};

const DeleteSubCategorySub = async (req, res, next) => {
  try {
    const DeletedSubCategorySub = await SubCategorySub.findByIdAndDelete(
      req.params.id
    );
    return res.send(200).status({ messages: 'Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

const getSubCategorySub = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    if (pageSize && currentPage) {
      const subCategories = await SubCategorySub.find({})
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
      return res.status(200).send({
        messages: 'SubCategorySub Fetched Successfully',
        subCategories,
      });
    } else if (id) {
      const subCategories = await SubCategorySub.find({
        subCategory: id,
      });
      return res.status(200).send({
        messages: 'SubCategorySub Fetched Successfully',
        subCategories,
      });
    } else {
      const subCategories = await SubCategorySub.find({});
      return res.status(200).send({
        messages: 'SubCategorySub Fetched Successfully',
        subCategories,
      });
    }
  } catch (err) {
    return next(err);
  }
};

/* Comments */

const CreateComment = async (req, res, next) => {
  const { content, replyTo, item, shop } = req.body;
  try {
    const newComment = await new Comments({
      content,
      owner: req.decToken.UserId,
      replyTo,
      item,
      shop,
    });
    if (item) {
      const updateItem = await SubItem.updateOne(
        { _id: item },
        { $addToSet: { comments: newComment._id } }
      );
      await newComment.save();
      return res.status(201).send({ messages: 'Comment Created Successfully' });
    }
    const updateShop = await Shop.updateOne(
      { _id: shop },
      { $addToSet: { comments: newComment._id } }
    );
    await newComment.save();
    return res.status(201).send({ messages: 'Comment Created Successfully' });
  } catch (err) {
    return next(err);
  }
};

const updateComments = async (req, res, next) => {
  try {
    const updatedComment = await Comments.updateOne(
      { owner: req.decToken.UserId, _id: req.params.id },
      { content: req.body.content }
    );
    return res.status(200).send({ messages: 'Comment Updated Successfully' });
  } catch (err) {
    return next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const deletedComment = await Comments.deleteOne({ _id: req.params.id });
    return res.status(200).send({ messages: 'Comment Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

/* Shop */

const CreateShop = async (req, res, next) => {
  try {
    const newShop = await new Shop(req.body);
    await newShop.save();
    return res
      .status(201)
      .send({ messages: 'Shop Created Successfully', newShop });
  } catch (err) {
    return next(err);
  }
};

const UpdateShop = async (req, res, next) => {
  try {
    const updatedShop = await Shop.findOneAndUpdate(
      { _id: req.body.id, owner: req.decToken.UserId },
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .send({ messages: 'Shop Updated Successfully', updatedShop });
  } catch (err) {
    return next(err);
  }
};

const getShops = async (req, res, next) => {
  try {
    const Shops = await Shop.find({}).populate();
    return res
      .status(200)
      .send({ messages: 'Shops Fetched Successfully', Shops });
  } catch (err) {
    return next(err);
  }
};

const getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    return res
      .status(200)
      .send({ messages: 'Shop Fetched Successfully', shop });
  } catch (err) {
    return next(err);
  }
};

const getUserShop = async (req, res, next) => {
  try {
    const shop = await Shop.find({
      _id: req.params.id,
      owner: rq.decToken.UserId,
    }).populate();
    return res
      .status(200)
      .send({ messages: 'Shops Fetched Successfully', shop });
  } catch (err) {
    return next(err);
  }
};

const getUserShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({
      _id: req.params.id,
      owner: req.decToken.UserId,
    }).populate();
    return res
      .status(200)
      .send({ messages: 'Shops Fetched Successfully', shops });
  } catch (err) {
    return next(err);
  }
};

const deleteShop = async (req, res, next) => {
  try {
    const deletedShop = await Shop.deleteOne({
      _id: req.params.id,
      owner: req.decToken.UserId,
    });
    res.status(200).send({ messages: 'Shop Deleted Successfully' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  items: {
    createItem,
    GetItem,
    UpdateItem,
    DeleteItem,
  },
  SubItems: {
    createSubItem,
    updateSubItem,
    DeleteSubItem,
    GetSubItems,
  },
  category: {
    createCategory,
    updateCategory,
    DeleteCategory,
    getCategories,
  },
  subCategories: {
    CreateSubCategory,
    UpdateSubCategory,
    DeleteSubCategory,
    getSubCategory,
  },
  subCategorySub: {
    CreateSubCategorySub,
    UpdateSubCategorySub,
    DeleteSubCategorySub,
    getSubCategorySub,
  },
  comments: {
    CreateComment,
    deleteComment,
    updateComments,
  },
  shop: {
    CreateShop,
    UpdateShop,
    deleteShop,
    getUserShop,
    getUserShops,
    getShop,
    getShops,
  },
};
