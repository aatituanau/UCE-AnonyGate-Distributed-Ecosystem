output "nginx_bastion_public_ip" {
  description = "Static Elastic IP of the Nginx Bastion (never changes between lab restarts)"
  value       = aws_eip.nginx_bastion_eip.public_ip
}

output "ms_core_private_ip" {
  value = module.ec2_2_ms_core.private_ip
}

# output "ms_processing_private_ip" {
#   value = module.ec2_3_ms_processing.private_ip
# }

# output "ms_tracking_private_ip" {
#   value = module.ec2_4_ms_tracking.private_ip
# }

# output "ms_specialized_private_ip" {
#   value = module.ec2_5_ms_specialized.private_ip
# }

output "db_postgres_private_ip" {
  value = module.ec2_6_db_postgres.private_ip
}

# output "db_mongodb_private_ip" {
#   value = module.ec2_7_db_mongodb.private_ip
# }

output "db_queues_private_ip" {
  value = module.ec2_8_db_queues.private_ip
}
