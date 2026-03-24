# ============================================
# OCI Terraform - oci-devops-lab
# Tres modelos: VM, Container Instance, OKE
# ============================================

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  region = var.region
}

# ── Variables ──
variable "region" {
  default = "sa-bogota-1"
}

variable "compartment_id" {
  description = "OCID del compartment donde crear los recursos"
  type        = string
}

variable "tenancy_ocid" {
  description = "OCID del tenancy"
  type        = string
}

variable "ssh_public_key" {
  description = "Llave publica SSH para acceder a la VM"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Tag de las imagenes Docker"
  default     = "latest"
}

variable "ocir_namespace" {
  description = "Namespace de OCIR (ej: ax9kokncwtdj/dcarrero)"
  type        = string
}

locals {
  backend_image  = "${var.region}.ocir.io/${var.ocir_namespace}/backend:${var.image_tag}"
  frontend_image = "${var.region}.ocir.io/${var.ocir_namespace}/frontend:${var.image_tag}"
}

# ── Networking (compartido entre los 3 modelos) ──
resource "oci_core_vcn" "lab" {
  compartment_id = var.compartment_id
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "oci-devops-lab-vcn"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "lab-igw"
}

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "lab-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.lab.id
  display_name   = "lab-public-sl"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "6" # TCP
    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "6"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "6"
    tcp_options {
      min = 3000
      max = 3001
    }
  }

  # NodePort range para K8s
  ingress_security_rules {
    source   = "0.0.0.0/0"
    protocol = "6"
    tcp_options {
      min = 30000
      max = 32767
    }
  }
}

resource "oci_core_subnet" "public" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.lab.id
  cidr_block          = "10.0.1.0/24"
  display_name        = "lab-public-subnet"
  route_table_id      = oci_core_route_table.public.id
  security_list_ids   = [oci_core_security_list.public.id]
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_id
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# ============================================
# MODELO 1: VM con Docker Compose
# Usa Ampere A1 (Always Free eligible)
# ============================================
resource "oci_core_instance" "vm" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "oci-devops-lab-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(<<-SCRIPT
      #!/bin/bash
      apt-get update -y
      apt-get install -y docker.io docker-compose-plugin
      systemctl enable docker
      systemctl start docker
      usermod -aG docker ubuntu
      mkdir -p /opt/oci-devops-lab
      echo "VM lista para despliegue con Docker Compose" > /opt/oci-devops-lab/STATUS
    SCRIPT
    )
  }
}

# ============================================
# MODELO 2: OCI Container Instances
# Contenedor sin K8s, mismo pricing que compute
# ============================================
resource "oci_container_instances_container_instance" "backend" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "oci-devops-lab-backend-ci"

  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = 1
    memory_in_gbs = 4
  }

  containers {
    display_name = "backend"
    image_url    = local.backend_image
    environment_variables = {
      NODE_ENV = "production"
    }
    resource_config {
      vcpus_limit         = 1
      memory_limit_in_gbs = 4
    }
  }

  vnics {
    subnet_id = oci_core_subnet.public.id
  }
}

# ============================================
# MODELO 3: OKE (Kubernetes)
# Basic cluster = control plane gratuito
# ============================================
resource "oci_containerengine_cluster" "oke" {
  compartment_id = var.compartment_id
  name           = "oci-devops-lab-oke"
  vcn_id         = oci_core_vcn.lab.id

  kubernetes_version = "v1.30.1"
  type               = "BASIC_CLUSTER"

  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = oci_core_subnet.public.id
  }
}

resource "oci_containerengine_node_pool" "workers" {
  compartment_id     = var.compartment_id
  cluster_id         = oci_containerengine_cluster.oke.id
  name               = "lab-workers"
  kubernetes_version = "v1.30.1"

  node_shape = "VM.Standard.A1.Flex"
  node_shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  node_config_details {
    size = 2
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.public.id
    }
  }

  node_source_details {
    source_type = "IMAGE"
    image_id    = data.oci_core_images.ubuntu.images[0].id
  }
}

# ── Outputs ──
output "vm_public_ip" {
  value       = oci_core_instance.vm.public_ip
  description = "IP publica de la VM para SSH y Docker Compose"
}

output "container_instance_id" {
  value       = oci_container_instances_container_instance.backend.id
  description = "OCID del Container Instance del backend"
}

output "oke_cluster_id" {
  value       = oci_containerengine_cluster.oke.id
  description = "OCID del cluster OKE"
}

output "oke_get_kubeconfig" {
  value       = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.oke.id} --file $HOME/.kube/config --region ${var.region} --token-version 2.0.0"
  description = "Comando para obtener kubeconfig"
}
