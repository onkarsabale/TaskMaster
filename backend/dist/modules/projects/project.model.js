import mongoose, { Schema, Document } from 'mongoose';
const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['project_manager', 'project_member'], required: true }
        }]
}, { timestamps: true });
export const Project = mongoose.model('Project', projectSchema);
//# sourceMappingURL=project.model.js.map