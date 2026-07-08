variable "environment" {
  type    = string
  default = "qa"
}

variable "key_name" {
  type = string
}

variable "aws_account_id" {
  type        = string
  description = "AWS Account ID for globally unique resources"
}
