import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log(`datbase is connected`);
    })
    mongoose.connection.on('error', () => {
      console.log(`datbase is not connected`);

    })
    await mongoose.connect(`${process.env.MONGOOSE_URL}`)
  } catch (error) {
    console.log(`something wrong`, error)
  }
}
export default connectDB;