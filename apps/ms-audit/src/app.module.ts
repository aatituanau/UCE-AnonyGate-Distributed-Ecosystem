import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // Connect to DB_Audit in MongoDB (EC2-7)
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://anonygate:anonygate_pass@localhost:27017/DB_Audit?authSource=admin',
    ),
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
