import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EvidenceModule } from './evidence/evidence.module';

@Module({
  imports: [
    // Global environment variables load
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection (EC2-7) targeting DB_Evidence specifically
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://anonygate:anonygate_pass@localhost:27017/DB_Evidence?authSource=admin',
    ),

    // Main module for evidence domain
    EvidenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
