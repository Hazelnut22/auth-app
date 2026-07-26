import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    event: { 
        type: String, 
        required: true 
    },
    meta: { 
        type: Object, 
        default: {} 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
});

activityLogSchema.index({ userId: 1, timestamp: -1 });

const ActivityLog = mongoose.model("ActvityLog", activityLogSchema);

export default ActivityLog;