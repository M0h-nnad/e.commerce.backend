const mongoose = require("mongoose");
const { MONGOURI } = process.env;
mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((E) => {
    console.log(E);
  });
const conn = mongoose.connection;

mongoose.set("strict", true);
mongoose.set("toJSON", { getters: true, virtuals: false });
mongoose.set("toObject", { getters: true, virtuals: false });

module.exports = conn;
