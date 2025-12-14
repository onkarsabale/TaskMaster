import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: 'project_manager' | 'project_member';
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['project_manager', 'project_member'], required: true }
    }]
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', projectSchema);
