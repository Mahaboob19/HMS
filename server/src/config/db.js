const mongoose = require("mongoose");
const connectDB = async() => {
    try{
        let mongoURI;
        if(process.env.DB_MODE === "local"){
            mongoURI = process.env.MONGO_LOCAL_URI;
        }else if(process.env.DB_MODE === "atlas"){
            mongoURI = process.env.MONGO_ATLAS_URI;
        }else{
            throw new Error("Invalid DB_MODE. use 'local' or 'atlas'");
        }
        await mongoose.connect(mongoURI);
        console.log(`MongoDB connected using ${process.env.DB_MODE} mode`);
    }catch(error){
        console.log("MongoDB connection Failed: ",error.message);
        process.exit(1);
    }
};

module.exports = connectDB;