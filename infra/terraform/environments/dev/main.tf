module "vpc" {
  source             = "../../modules/vpc"
  environment        = var.environment
  vpc_cidr           = "10.2.0.0/16"
  public_subnet_cidr = "10.2.1.0/24"
  availability_zone  = "us-east-1a"
}

module "ec2" {
  source        = "../../modules/ec2"
  environment   = var.environment
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_id
  instance_type = "t3.micro"
}
