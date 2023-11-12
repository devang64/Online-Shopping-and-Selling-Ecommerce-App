const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Product Name"],
        trim: true
    },

    description: {
        type: String,
        required: [true, "Please Enter Product Description"],
    },

    price: {
        type: Number,
        required: [true, "Please Enter Product Price"],
        maxLength: [8, "Price cannot exceed 8 figure"]
    },

    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          // altText: {
          //   type: String,
          //   required: true,
          // }
        },
      ],
    category: {
        type: String,
        required: [true, "Please Enter Product Category"]
    },
    stock: {
        type: Number,
        require: [true, "Please Enter Product Stock"],
        default: 0,
        maxLength: [4, "cannnot exceed 4 character"]
    },

    numofReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
           require : true
          },
          rating: {
            type: Number,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
        },
      ],
    user :{
        type:mongoose.Schema.ObjectId,
        ref: "User",
        require :true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("product", productSchema)