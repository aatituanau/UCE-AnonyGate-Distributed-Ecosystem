import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormEntity } from './domain/form.entity';

@Injectable()
export class FormsService implements OnModuleInit {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    @InjectModel(FormEntity.name) private formModel: Model<FormEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultForms();
  }

  private async seedDefaultForms() {
    try {
      this.logger.log('Checking default forms for QA prototype...');
      const defaultForms = [
        {
          categoryId: 'acoso',
          title: 'Denuncia por Acoso',
          schemaDefinition: { 
            fields: [
              { name: 'descripcion', label: 'Descripción de los hechos', type: 'textarea', required: true },
              { name: 'fecha', label: 'Fecha aproximada', type: 'date', required: false }
            ] 
          },
        },
        {
          categoryId: 'fraude',
          title: 'Fraude Académico',
          schemaDefinition: { 
            fields: [
              { name: 'materia', label: 'Materia/Asignatura', type: 'text', required: true },
              { name: 'descripcion', label: 'Detalles del fraude', type: 'textarea', required: true }
            ] 
          },
        },
        {
          categoryId: 'infraestructura',
          title: 'Daño a Infraestructura',
          schemaDefinition: { 
            fields: [
              { name: 'ubicacion', label: 'Ubicación (Facultad, Aula)', type: 'text', required: true },
              { name: 'danio', label: 'Descripción del daño', type: 'textarea', required: true }
            ] 
          },
        },
        {
          categoryId: 'corrupcion',
          title: 'Corrupción / Soborno',
          schemaDefinition: { 
            fields: [
              { name: 'involucrados', label: 'Personas involucradas (opcional)', type: 'text', required: false },
              { name: 'detalles', label: 'Detalles de la denuncia', type: 'textarea', required: true }
            ] 
          },
        },
        {
          categoryId: 'otros',
          title: 'Otros',
          schemaDefinition: { 
            fields: [
              { name: 'tema', label: 'Tema principal', type: 'text', required: true },
              { name: 'explicacion', label: 'Explicación detallada', type: 'textarea', required: true }
            ] 
          },
        }
      ];
      
      let seededCount = 0;
      for (const form of defaultForms) {
        const existing = await this.formModel.findOne({ categoryId: form.categoryId });
        if (!existing) {
          await this.formModel.create(form);
          seededCount++;
        }
      }

      if (seededCount > 0) {
        this.logger.log(`Successfully seeded ${seededCount} missing default forms.`);
      } else {
        this.logger.log('All default forms already exist. Skipping seed.');
      }
    } catch (error) {
      this.logger.error('Error during form seeding', error);
    }
  }

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
