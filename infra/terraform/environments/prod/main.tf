module "vpc" {
  source               = "../../modules/vpc"
  environment          = var.environment
  vpc_cidr             = "10.2.0.0/16"
  public_subnet_cidrs  = ["10.2.1.0/24", "10.2.3.0/24"]
  private_subnet_cidrs = ["10.2.2.0/24", "10.2.4.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

# --- EC2-1: PUBLIC SUBNET (Nginx + Bastion) ---
module "ec2_1_nginx_bastion" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-1-nginx-bastion"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.public_subnet_ids[0]
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  allowed_ports               = [22, 80, 8080]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y nginx
              cat > /etc/nginx/sites-available/default <<'NGINXCONF'
              server {
                  listen 80 default_server;
                  listen [::]:80 default_server;

                  location / {
                      proxy_pass http://127.0.0.1:8080;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }

                  location /auth/ {
                      proxy_pass http://${module.ec2_2_ms_core.private_ip}:3000;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }

                  location /aliases/ {
                      proxy_pass http://${module.ec2_2_ms_core.private_ip}:3001;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }

                  location /api/v1/complaints {
                      proxy_pass http://${module.ec2_3_ms_processing.private_ip}:3003;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }

                  location /admin/ {
                      proxy_pass http://${module.ec2_3_ms_processing.private_ip}:3009;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }

                  location /ws/ {
                      proxy_pass http://${module.ec2_3_ms_processing.private_ip}:3009;
                      proxy_set_header Host $${host};
                      proxy_set_header X-Real-IP $${remote_addr};
                  }
                  # Future routes for forms, submission, etc will be added here
              }
              NGINXCONF
              systemctl restart nginx
              EOF
}

# --- Elastic IP for Nginx/Bastion (static public IP, never changes) ---
resource "aws_eip" "nginx_bastion_eip" {
  instance = module.ec2_1_nginx_bastion.instance_id
  domain   = "vpc"
  tags = {
    Name        = "prod-nginx-bastion-eip"
    Environment = var.environment
  }
}

# --- EC2-2: PRIVATE SUBNET (ms-auth, ms-alias, ms-forms) ---
module "ec2_2_ms_core" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-2-ms-core"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.private_subnet_ids[0]
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  allowed_ports               = [22, 3000, 3001, 3002, 50051]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              EOF
}

# --- EC2-3: PRIVATE SUBNET (ms-submission, ms-evidence, ms-admin) ---
module "ec2_3_ms_processing" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-3-ms-processing"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.private_subnet_ids[0]
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  allowed_ports               = [22, 3003, 3004, 3005, 3009]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              EOF
}

# --- EC2-4: PRIVATE SUBNET (ms-status :3006, ms-audit :3005) ---
module "ec2_4_ms_status" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-4-ms-status"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.private_subnet_ids[0]
  instance_type               = "t3.small"
  associate_public_ip_address = false
  allowed_ports               = [22, 3005, 3006, 3007]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              EOF
}

# --- EC2-5: PRIVATE SUBNET (ms-sanitization, ms-ai) ---
# TEMPORARILY DISABLED FOR RAPID TESTING
# module "ec2_5_ms_specialized" {
#   source                      = "../../modules/ec2"
#   environment                 = var.environment
#   instance_name               = "ec2-5-ms-specialized"
#   vpc_id                      = module.vpc.vpc_id
#   subnet_id                   = module.vpc.private_subnet_ids[0]
#   instance_type               = "t2.micro"
#   associate_public_ip_address = false
#   allowed_ports               = [22, 3008, 3009] # Using arbitrary ports for n8n/Python
#   key_name                    = var.key_name
#   user_data = <<-EOF
#               #!/bin/bash
#               apt-get update
#               apt-get install -y docker.io docker-compose
#               systemctl start docker
#               systemctl enable docker
#               EOF
# }

# --- EC2-6: PRIVATE SUBNET (PostgreSQL) ---
module "ec2_6_db_postgres" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-6-db-postgres"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.private_subnet_ids[0]
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  allowed_ports               = [22, 5432]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              mkdir -p /home/ubuntu/postgres_data
              docker run -d --name postgres --restart unless-stopped -v /home/ubuntu/postgres_data:/var/lib/postgresql/data -e POSTGRES_USER=anonygate -e POSTGRES_PASSWORD=anonygate_pass -e POSTGRES_DB=anonygate_db -p 5432:5432 postgres:16-alpine
              EOF
}

# --- EC2-7: PRIVATE SUBNET (MongoDB — shared for MS-03, MS-05, MS-07, MS-10) ---
# TEMPORARILY DISABLED — enable before deploying MS-03, MS-05, MS-07 or MS-10
# Databases: DB_Forms (MS-03) | DB_Evidence (MS-05) | DB_AI_Summaries (MS-07)
#            DB_AuditLog (MS-10) | DB_AuditArchive (MS-10)
# module "ec2_7_db_mongodb" {
#   source                      = "../../modules/ec2"
#   environment                 = var.environment
#   instance_name               = "ec2-7-db-mongodb"
#   vpc_id                      = module.vpc.vpc_id
#   subnet_id                   = module.vpc.private_subnet_ids[0]
#   instance_type               = "t2.micro"
#   associate_public_ip_address = false
#   allowed_ports               = [22, 27017]
#   key_name                    = var.key_name
#   user_data                   = <<-EOF
#               #!/bin/bash
#               apt-get update
#               apt-get install -y docker.io docker-compose
#               systemctl start docker
#               systemctl enable docker
#               mkdir -p /home/ubuntu/mongo_data
#               docker run -d --name mongodb --restart unless-stopped \
#                 -v /home/ubuntu/mongo_data:/data/db \
#                 -e MONGO_INITDB_ROOT_USERNAME=anonygate \
#                 -e MONGO_INITDB_ROOT_PASSWORD=anonygate_pass \
#                 -p 27017:27017 \
#                 mongo:7.0
#               EOF
# }

# --- EC2-8: PRIVATE SUBNET (Redis + Kafka + RabbitMQ) ---
module "ec2_8_db_queues" {
  source                      = "../../modules/ec2"
  environment                 = var.environment
  instance_name               = "ec2-8-db-queues"
  vpc_id                      = module.vpc.vpc_id
  subnet_id                   = module.vpc.private_subnet_ids[0]
  instance_type               = "t3.small"
  associate_public_ip_address = false
  allowed_ports               = [22, 6379, 9092, 5672, 15672]
  key_name                    = var.key_name
  user_data                   = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              
              # Get Private IP for Kafka Advertised Listeners
              PRIVATE_IP=$(hostname -I | awk '{print $1}')
              
              # Start Redis
              docker run -d --name redis --restart unless-stopped -p 6379:6379 redis:7-alpine redis-server --requirepass anonygate_pass
              
              # Start Zookeeper
              docker run -d --name zookeeper --restart unless-stopped -p 2181:2181 -e ZOOKEEPER_CLIENT_PORT=2181 -e ZOOKEEPER_TICK_TIME=2000 confluentinc/cp-zookeeper:7.5.0
              
              # Start Kafka
              docker run -d --name kafka --restart unless-stopped \
                -p 9092:9092 \
                -e KAFKA_BROKER_ID=1 \
                -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
                -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$PRIVATE_IP:9092 \
                -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
                --link zookeeper \
                confluentinc/cp-kafka:7.5.0
                
              # Start RabbitMQ
              docker run -d --name rabbitmq --restart unless-stopped -p 5672:5672 -p 15672:15672 rabbitmq:3-management
              
              # Start Mosquitto
              cat > mosquitto.conf <<'MQCONF'
              listener 1883
              allow_anonymous true
              listener 9001
              protocol websockets
              allow_anonymous true
              MQCONF
              docker run -d --name mosquitto --restart unless-stopped -p 1883:1883 -p 9001:9001 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto:2.0
              EOF
}
