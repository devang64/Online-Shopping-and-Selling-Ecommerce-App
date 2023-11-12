const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");


// Create new Order
exports.newOrder = async (req, res, next) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;
        const user = req.user._id;
        // Create a new order instance
        const order = new Order({
            shippingInfo,
            orderItems,
            user,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(), // Automatically set paidAt to the current date and time
        });

        // Save the order to the database
        const createdOrder = await order.save();

        return res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// get Single Order
exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
};

// get logged in user  Orders
exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
};

// get all Orders -- Admin
exports.getAllOrders = async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
};

// update Order Status -- Admin
exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new Error('Order not found with this Id', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new Error('You have already delivered this order', 400));
    }

    try {
        if (req.body.status === 'Shipped') {
            // Update stock for each ordered item
            for (const orderItem of order.orderItems) {
                await updateStock(orderItem.product, orderItem.quantity);
            }
        }
        

        order.orderStatus = req.body.status;

        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        return next(new Error('Internal server error', 500));
    }
};
async function updateStock(id, quantity) {
    try {
        const product = await Product.findById(id);

        if (!product) {
            throw new Error(`Product with id ${id} not found`);
        }

        product.stock -= quantity;

        await product.save({ validateBeforeSave: false });

        // You can return the updated product if needed
        return product;
    } catch (error) {
        // Handle errors here, e.g., log the error
        console.error(error);
        // You can also throw the error further if needed
        throw error;
    }
}


// delete Order -- Admin
exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
    });
};
