import mongoose, {Schema} from "mongoose";


const packageSchema = new Schema({
    planID : {type:mongoose.Schema.Types.ObjectId, ref:"pricings"},
    userID : {type:mongoose.Schema.Types.ObjectId, ref:"users"},
},
    {versionKey: false, timestamps:true});

const Package = mongoose.model("packages", packageSchema);
export default Package;