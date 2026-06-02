output "nginx_bastion_public_ip" {
  value = module.ec2_1_nginx_bastion.public_ip
}

output "ms_core_private_ip" {
  value = module.ec2_2_ms_core.private_ip
}

output "ms_processing_private_ip" {
  value = module.ec2_3_ms_processing.private_ip
}

output "ms_tracking_private_ip" {
  value = module.ec2_4_ms_tracking.private_ip
}

output "ms_specialized_private_ip" {
  value = module.ec2_5_ms_specialized.private_ip
}

output "db_postgres_private_ip" {
  value = module.ec2_6_db_postgres.private_ip
}

output "db_mongodb_private_ip" {
  value = module.ec2_7_db_mongodb.private_ip
}

output "db_queues_private_ip" {
  value = module.ec2_8_db_queues.private_ip
}
