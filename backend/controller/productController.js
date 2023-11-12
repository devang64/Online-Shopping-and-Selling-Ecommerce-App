const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apiFeatures");
const EroorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
// Create Product --Admin
exports.createProduct = async (req, res, next) => {
  try {
    let images = [];

    // Check if req.body.images is defined and log its type
    if (req.body.images) {

      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === "string") {
        images.push(req.body.images);
      }
    } else {
      console.log("req.body.images is undefined or null");
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
    console.log(req.body.user)
    const product = await Product.create(req.body);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
// Get admin Product
exports.getAdminProducts = async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

//  Update Product --admin
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  try {
    if (!product) {
      return next(new EroorHandler("product not found", 404));
    }
    let images = [];
    if (req.body.images) {

      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === "string") {
        images.push(req.body.images);
      }
    } else {
      console.log("req.body.images is undefined or null");
    }
    if (images !== undefined) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//  Delete Product --admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new EroorHandler("product not found", 404));
    }
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// get All Products
exports.getAllProduct = async (req, res, next) => {
  // return next(new ErrorHander("This is my temp error"))
  try {

    const resultPerPage = 8;
    const productsCount = await Product.countDocuments()
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
    let products = await apiFeatures.query;
    const filteredProductsCount = products.length;
    console.log(filteredProductsCount)
    apiFeatures.pagination(resultPerPage);

    products = await apiFeatures.query.clone();
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
// get single product

exports.getProductDetails = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new EroorHandler("product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
};

// Create New Review or Update the review
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      //Update the existing review
      isReviewed.rating = rating;
      isReviewed.comment = comment;
    } else {
      product.reviews.push(review);
      product.numofReviews += 1
    }
    // Calculate the new average rating for the product
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = totalRating / product.numofReviews;


    await product.save({ validateBeforeSave: false });

    return res.json({ message: 'Review added/updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Reviews of a product
exports.getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

// Delete Review
exports.deleteReview = async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
};