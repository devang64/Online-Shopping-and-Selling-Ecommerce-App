const ErrorHandler = require('../utils/errorHandler');


module.exports = (err,req,res,next) =>{
    err.statuscode= err.statuscode || 500;
    err.message = err.message || "INTERNAL SERVER ERROR";
    res.status(200).json({
        success : false,
        message : err.message,
        // error : err.stack
    })
}