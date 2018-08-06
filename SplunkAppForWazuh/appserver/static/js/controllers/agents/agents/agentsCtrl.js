/*
 * Wazuh app - Agents controller
 * Copyright (C) 2018 Wazuh, Inc.
 *
 * This program is free software you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

define(['../../module', 
'splunkjs/mvc',
'splunkjs/mvc/simplexml/searcheventhandler',
'splunkjs/mvc/searchmanager',
"splunkjs/mvc/utils"], function (controllers, mvc, SearchEventHandler, SearchManager,utils) {

  'use strict'

  controllers.controller('agentsCtrl', function ($scope, $currentApiIndexService, data) {
    const vm = this
    const submittedTokenModel = mvc.Components.getInstance('submitted', { create: true })

    vm.search = term => {
      $scope.$broadcast('wazuhSearch', { term })
    }

    vm.filter = filter => {
      $scope.$broadcast('wazuhFilter', { filter })
    }

    vm.isClusterEnabled = $currentApiIndexService.getClusterInfo() && $currentApiIndexService.getClusterInfo().status === 'enabled'
    vm.loading = true

    vm.status = 'all'
    vm.osPlatform = 'all'
    vm.version = 'all'
    vm.osPlatforms = []
    vm.versions = []
    vm.groups = []
    vm.nodes = []
    vm.node_name = 'all'
    vm.mostActiveAgent = {
      name: '',
      id: ''
    }

    const load = async () => {
      try {
        const clusterInfo = $currentApiIndexService.getClusterInfo()
        const firstUrlParam = clusterInfo.status === 'enabled' ? 'cluster' : 'manager'
        const epoch = (new Date).getTime()
        
        console.log('data ', data)
        // const unique = data[0].data.result
        const selectedIndex = $currentApiIndexService.getIndex()
        const filter = $currentApiIndexService.getFilter()
        const nameFilter = filter[0] + '=' + filter[1]
        const searchTopAgent = new SearchManager({
          "id": `searchTopAgent${epoch}`,
          "cancelOnUnload": true,
          "sample_ratio": 1,
          "earliest_time": "$when.earliest$",
          "status_buckets": 0,
          "search": "index=" + selectedIndex + " " + nameFilter + "| top agent.name",
          "latest_time": "$when.latest$",
          "app": utils.getCurrentApp(),
          "auto_cancel": 90,
          "preview": true,
          "tokenDependencies": {
          },
          "runWhenTimeIsUndefined": true
        }, { tokens: true, tokenNamespace: "submitted" })

        new SearchEventHandler({
          managerid: `searchTopAgent${epoch}`,
          event: "done",
          conditions: [
            {
              attr: "any",
              value: "*",
              actions: [
                { "type": "set", "token": "activeAgentToken", "value": "$result.agent.name$" },
              ]
            }
          ]
        })

        submittedTokenModel.on("change:activeAgentToken", function (model, activeAgentToken, options) {
          const activeAgentTokenJS = submittedTokenModel.get("activeAgentToken");
          if (activeAgentTokenJS !== undefined) {
            vm.mostActiveAgent = `${activeAgentTokenJS}`
            if (!$scope.$$phase) $scope.$digest()
          }
        })
        const summary = data[0].data.data
        const lastAgent = data[1].data.data.items[0]
        // vm.groups = unique.groups
        // vm.nodes = unique.nodes
        // vm.versions = unique.versions
        // vm.osPlatforms = unique.osPlatforms
        vm.lastAgent = lastAgent
        vm.agentsCountActive = summary.Active
        vm.agentsCountDisconnected = summary.Disconnected
        vm.agentsCountNeverConnected = summary['Never connected']
        vm.agentsCountTotal = summary.Total 
        vm.agentsCoverity = vm.agentsCountTotal ? (vm.agentsCountActive / vm.agentsCountTotal) * 100 : 0


        // if (data[1].data.data === '') {
        //   vm.mostActiveAgent.name = $currentApiIndexService.getClusterInfo().manager
        //   vm.mostActiveAgent.id = '000'
        // } else {
        //   vm.mostActiveAgent.name = data[1].data.data

        //   if (info.data.data === '' && vm.mostActiveAgent.name !== '') {
        //     vm.mostActiveAgent.id = '000'
        //   } else {
        //     vm.mostActiveAgent.id = info.data.data
        //   }
        // }

        vm.loading = false
        if (!$scope.$$phase) $scope.$digest()
        return
      } catch (error) {
        console.error('Agents Preview', error)
      }
      return
    }

    vm.showAgent = agent => {
    }

    //Load
    load()

  })
})