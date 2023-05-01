const Product = require("../models/product");
const User = require("../models/user");
const fs = require("fs");

const createProduct = async (req, res, next) => {
  const {
    title,
    category,
    subCategory,
    price,
    desc,
    featured,
    place,
    condition,
    madeYear,
  } = req.body;
  let images = [];

  try {
    if (req.files) {
      let files = [...req.files];
      files.map((file) => {
        images.push(file.path);
      });
    }

    let jsonPlace = JSON.parse(place);

    const newProduct = new Product({
      title: title,
      category: category,
      subCategory: subCategory,
      price: price,
      desc: desc,
      featured: featured,
      condition: condition,
      place: {
        city: jsonPlace.nev,
        county: jsonPlace.megye,
      },
      madeYear: madeYear || null,
      images: images,
      user: req.userId,
    });

    await newProduct.save();
    res.status(201).json({ msg: "Termék sikeresen hozzáadva!" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ msg: "A termék nem található" });
  
    const {
      title,
      category,
      subCategory,
      price,
      desc,
      deletedImages,
      place,
      condition,
      madeYear,
      featured,
    } = req.body;

    //elmentett kepek szelektalasa
    let delImages = deletedImages ? deletedImages.split(", ") : [];
    let images = product.images;

    for (const el of delImages) {
      let fImages = images.filter((img) => el !== img);
      images = [...fImages];
    }

    if (req.files) {
      let files = [...req.files];
      files.map((file) => {
        images.push(file.path);
      });
    }

    if (req.userId.equals(product.user)) {
      let jsonPlace = JSON.parse(place);

      product.title = title;
      product.category = category;
      product.subCategory = subCategory;
      product.price = price;
      product.desc = desc;
      product.images = images;
      product.place = {
        city: jsonPlace.nev,
        county: jsonPlace.megye,
      };
      product.condition = condition;
      product.madeYear = madeYear || null;
      product.featured = featured;

      await product.save();

      for (const imgPath of delImages) {
        fs.unlink(imgPath, (err) => {
          console.log(err);
        });
      }
    } else {
      return res.status(403).json({ msg: "Jogosulatlan hozzáférés" });
    }
    res.status(200).json({ msg: "A termék sikeresen szerkesztve!" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const response = await Product.find().populate('user');
    res.status(201).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

const getProductsByUserId = async (req, res, next) => {
  try {
    const response = await Product.find({ user: req.userId });
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

const deleteProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ msg: "A termék nem található" });
    
    let images = product.images;
    await product.remove();

    for (const image of images) {
      fs.unlink(image, (err) => {
        console.log(err);
      });
    }

    res.status(201).json({ msg: "A termék sikeresen törölve!" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

const getProductById = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id).populate('user');

    if (!product)
      return res.status(404).json({ msg: "A termék nem található" });

    res.status(201).json({ product: product.toObject({ getters: true }) });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Oops...valami hiba történt! Kérlek, próbáld meg később!" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProductsByUserId,
  deleteProductById,
  getProductById,
};
