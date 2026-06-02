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

variable "associate_public_ip_address" {
  type    = bool
  default = false
}

variable "allowed_ports" {
  type    = list(number)
  default = [22]
}

variable "user_data" {
  type    = string
  default = ""
}

variable "key_name" {
  type    = string
  default = ""
}
