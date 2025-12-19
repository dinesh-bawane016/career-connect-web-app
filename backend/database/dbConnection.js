import mongoose from "mongoose"; //just mongoose import!
import dotenv from "dotenv"
dotenv.config()

//Database connection here!
const dbConnection = () => {
   console.log("Attempting to connect to MongoDB...");
   console.log("DB_URL exists:", !!process.env.DB_URL);

   if (!process.env.DB_URL) {
      console.error("ERROR: DB_URL environment variable is not set!");
      return;
   }

   mongoose.connect(process.env.DB_URL, {
      dbName: "Job_Portal"

   }).then(() => { //agar connect ho jaye toh!
      console.log("MongoDB Connected Successfully!")
   }).catch((error) => {
      console.error(`Failed to connect to MongoDB:`, error.message)
      console.error("Full error:", error)
   })

}
export default dbConnection;