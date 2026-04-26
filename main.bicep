param location string = resourceGroup().location
param appName string = 'fn-clima-${uniqueString(resourceGroup().id)}'

@secure()
param weatherApiKey string

// 1. Conta de Armazenamento (Necessária para a Function)
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: 'st${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}

// 2. Plano App Service B1 (Dedicado)
resource hostingPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'plan-${appName}'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true // Necessário para Linux
  }
}

// 3. A Function App configurada para o Plano B1
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    reserved: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.9'
      appSettings: [
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'python' }
        { name: 'OPENWEATHER_KEY', value: weatherApiKey }
      ]
    }
  }
}

// Output para o GitHub Actions saber o nome da app
output appName string = functionApp.name
