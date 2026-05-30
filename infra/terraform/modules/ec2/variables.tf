variable "environment" {
  type = string
}

variable "instance_name" {
  type        = string
  description = "Nombre especifico de la instancia (ej. db-server, auth-node)"
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}
