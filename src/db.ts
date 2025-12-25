import mongoose, {model , Schema} from "mongoose"

const MONGO_URI = process.env.MONGO_CONNECTION_STRING;

if (!MONGO_URI) {
  throw new Error("MONGO_CONNECTION_STRING is not defined");
}
mongoose
.connect(MONGO_URI)
.then(() => console.log("Mongo connected"))
.catch((err) => {
    console.error("Mongo DB connection error: ", err);
    process.exit(1);
})


const UserSchema = new Schema ({
    username: {type: String , unique: true},
    password: String,
})

export const Usermodel = model ('Users' , UserSchema);
