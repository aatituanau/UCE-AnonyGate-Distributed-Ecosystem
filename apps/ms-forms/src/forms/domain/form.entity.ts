import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('FormSchema')
@Schema({ collection: 'forms', timestamps: true })
export class FormEntity extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true, unique: true })
  categoryId: string; // Unique identifier (e.g., "corruption", "harassment")

  @Field()
  @Prop({ required: true })
  title: string;

  @Field(() => GraphQLJSON)
  @Prop({ type: Object, required: true })
  schemaDefinition: Record<string, any>; // Raw JSON that defines the form fields in the Frontend
}

export const FormSchema = SchemaFactory.createForClass(FormEntity);
