import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormEntity } from './domain/form.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(FormEntity.name) private formModel: Model<FormEntity>,
  ) {}

  async getForms(): Promise<FormEntity[]> {
    return this.formModel.find().exec();
  }

  async getFormByCategory(categoryId: string): Promise<FormEntity> {
    const form = await this.formModel.findOne({ categoryId }).exec();
    if (!form) {
      throw new NotFoundException(`Form schema for category ${categoryId} not found`);
    }
    return form;
  }

  async createOrUpdateForm(
    categoryId: string,
    title: string,
    schemaDefinition: Record<string, any>,
  ): Promise<FormEntity> {
    const existingForm = await this.formModel.findOne({ categoryId }).exec();
    
    // Update if exists
    if (existingForm) {
      existingForm.title = title;
      existingForm.schemaDefinition = schemaDefinition;
      return existingForm.save();
    }
    
    // Create new if it does not exist
    const newForm = new this.formModel({ categoryId, title, schemaDefinition });
    return newForm.save();
  }

  async deleteForm(categoryId: string): Promise<boolean> {
    const result = await this.formModel.deleteOne({ categoryId }).exec();
    return result.deletedCount === 1;
  }
}
