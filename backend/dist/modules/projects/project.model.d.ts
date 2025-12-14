import mongoose, { Document } from 'mongoose';
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
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IProject>;
//# sourceMappingURL=project.model.d.ts.map