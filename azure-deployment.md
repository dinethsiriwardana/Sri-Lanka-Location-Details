# Azure Deployment Guide

## Prerequisites

1. An Azure account with active subscription
2. Azure CLI installed on your machine

## Steps to Deploy to Azure App Service

### 1. Login to Azure

```bash
az login
```

### 2. Create a Resource Group

```bash
az group create --name sl-cities-rg --location eastus
```

### 3. Create Azure Container Registry (ACR)

```bash
az acr create --name slcitiesregistry --resource-group sl-cities-rg --sku Basic --admin-enabled true
```

### 4. Get the ACR credentials

```bash
az acr credential show --name slcitiesregistry
```

### 5. Build and push the Docker image to ACR

```bash
# Login to ACR
az acr login --name slcitiesregistry

# Build the image
docker build -t slcitiesregistry.azurecr.io/sl-cities:latest .

# Push the image to ACR
docker push slcitiesregistry.azurecr.io/sl-cities:latest
```

### 6. Create an App Service Plan

```bash
az appservice plan create --name sl-cities-plan --resource-group sl-cities-rg --is-linux --sku B1
```

### 7. Create a Web App

```bash
az webapp create --resource-group sl-cities-rg --plan sl-cities-plan --name sl-cities --deployment-container-image-name slcitiesregistry.azurecr.io/sl-cities:latest
```

### 8. Configure the Web App to use ACR

```bash
az webapp config container set --name sl-cities --resource-group sl-cities-rg --docker-custom-image-name slcitiesregistry.azurecr.io/sl-cities:latest --docker-registry-server-url https://slcitiesregistry.azurecr.io --docker-registry-server-user slcitiesregistry --docker-registry-server-password <password_from_step_4>
```

Your app will be accessible at: https://sl-cities.azurewebsites.net/
