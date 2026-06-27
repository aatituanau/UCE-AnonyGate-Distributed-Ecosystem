import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [
    // Connect to DB_Forms in MongoDB (EC2-7)
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://anonygate:anonygate_pass@localhost:27017/DB_Forms?authSource=admin',
    ),
    
    // Code-First GraphQL Configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Enabled for academic research testing
    }),
    
    // Import our business module
    FormsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
