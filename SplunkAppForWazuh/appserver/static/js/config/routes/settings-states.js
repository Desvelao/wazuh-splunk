define(['../module'], function(module) {
  'use strict'

  module.config([
    '$stateProvider',
    'BASE_URL',
    function($stateProvider, BASE_URL) {
      $stateProvider

        // settings
        .state('settings', {
          abstract: true,
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/settings/main/settings.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.api')
          }
        })
        // settings -> about
        .state('settings.about', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/settings/about/about.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.about')
          },
          controller: 'aboutCtrl',
          resolve: {
            appInfo: [
              '$requestService',
              async ($requestService, $state) => {
                try {
                  const result = await $requestService.httpReq(
                    'GET',
                    '/manager/app_info'
                  )
                  return result.data
                } catch (error) {
                  $state.go('settings.api')
                }
              }
            ]
          }
        })
        // settings -> api
        .state('settings.api', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/settings/api/api.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.api')
          },
          controller: 'settingsApiCtrl',
          resolve: {
            apiList: [
              '$currentDataService',
              async $currentDataService => {
                try {
                  return await $currentDataService.getApiList()
                } catch (error) {
                  console.error('Could not fetch API list')
                }
              }
            ]
          }
        })
        .state('settings.extensions', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/settings/extensions/extensions.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.extensions')
          },
          controller: 'extensionsCtrl',
          resolve: {
            extensions: [
              '$state',
              '$currentDataService',
              async ($state, $currentDataService) => {
                try {
                  const id = $currentDataService.getApi().id
                  const currentExtensions = await $currentDataService.getExtensionsById(
                    id
                  )
                  return currentExtensions
                } catch (err) {
                  $state.go('settings.api')
                }
              }
            ]
          }
        })
        .state('settings.index', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/settings/index/index.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.index')
          }
        })
        .state('settings.logs', {
          templateUrl:
            '/static/app/SplunkAppForWazuh/js/controllers/settings/logs/logs.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('settings.logs')
          },
          controller: 'logsCtrl',
          resolve: {
            logs: [
              '$requestService',
              '$state',
              async ($requestService, $state) => {
                try {
                  return await $requestService.httpReq(
                    `GET`,
                    `/manager/get_log_lines`
                  )
                } catch (error) {
                  $state.go('settings.api')
                }
              }
            ]
          }
        })
        .state('dev-tools', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/dev-tools/dev-tools.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('dev-tools')
          },
          controller: 'devToolsCtrl',
          resolve: {
            extensions: [
              '$state',
              '$currentDataService',
              async ($state, $currentDataService) => {
                try {
                  const id = $currentDataService.getApi().id
                  const currentExtensions = await $currentDataService.getExtensionsById(
                    id
                  )
                  return await currentExtensions
                } catch (err) {
                  $state.go('settings.api')
                }
              }
            ]
          }
        })
        .state('discover', {
          templateUrl:
            BASE_URL +
            '/static/app/SplunkAppForWazuh/js/controllers/discover/discover.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('discover')
          },
          params: { id: null }
        })
    }
  ])
})