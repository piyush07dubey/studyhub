exports.connect = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {console.log("DB Connected successfully")})
    .catch((error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    });
};