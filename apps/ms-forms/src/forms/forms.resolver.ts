import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FormsService } from './forms.service';
import { FormEntity } from './domain/form.entity';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => FormEntity)
export class FormsResolver {
  constructor(private readonly formsService: FormsService) {}

  @Query(() => [FormEntity], { name: 'getAllForms' })
  async getAllForms(): Promise<FormEntity[]> {
    return this.formsService.getForms();
  }

  @Query(() => FormEntity, { name: 'getFormByCategory' })
  async getFormByCategory(@Args('categoryId') categoryId: string): Promise<FormEntity> {
    return this.formsService.getFormByCategory(categoryId);
  }

  // TODO: [INVESTIGATIVO] Add AuthGuard(JWT) so only Admins can create/edit forms
  @Mutation(() => FormEntity)
  async saveForm(
    @Args('categoryId') categoryId: string,
    @Args('title') title: string,
    @Args({ name: 'schemaDefinition', type: () => GraphQLJSON }) schemaDefinition: any,
  ): Promise<FormEntity> {
    return this.formsService.createOrUpdateForm(categoryId, title, schemaDefinition);
  }

  @Mutation(() => Boolean)
  async deleteForm(@Args('categoryId') categoryId: string): Promise<boolean> {
    return this.formsService.deleteForm(categoryId);
  }
}
