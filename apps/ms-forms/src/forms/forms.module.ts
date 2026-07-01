import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsService } from './forms.service';
import { FormsResolver } from './forms.resolver';
import { FormEntity, FormSchema } from './domain/form.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormEntity.name, schema: FormSchema },
    ]),
  ],
  providers: [FormsService, FormsResolver],
})
export class FormsModule {}
