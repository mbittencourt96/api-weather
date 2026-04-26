param location string = resourceGroup().location
param appName string = 'fn-clima-${uniqueString(resourceGroup().id)}'
@secure() // Isso impede que o valor apareça nos logs da Azure
param weatherApiKey string

// 1. Conta de Armazenamento (Necessária para a Function)
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: 'st${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}

// 2. Plano de Consumo (Serverless - você só paga o que usa)
resource hostingPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'plan-${appName}'
  location: location
  sku: { name: 'Y1', tier: 'Dynamic' }
}

// 3. A Function App
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.9'
      appSettings: [
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'python' }
        { name: 'OPENWEATHER_KEY', value: weatherApiKey } // Veremos como proteger isso depois!
      ]
    }
  }
}
