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

define([
  '../../module',
  '../../../services/visualizations/chart/pie-chart',
  '../../../services/visualizations/chart/area-chart',
  '../../../services/visualizations/table/table',
  '../../../services/visualizations/inputs/time-picker',
  '../../../services/rawTableData/rawTableDataService'
], function(app, PieChart, AreaChart, Table, TimePicker, rawTableDataService) {
  'use strict'

  class OsqueryAgents {
    /**
     * Class Agents Osquery
     * @param {Object} $urlTokenModel
     * @param {Object} $state
     * @param {Object} $scope
     * @param {Object} $currentDataService
     * @param {Object} $notificationService
     * @param {Object} agent
     * @param {Object} osquery
     * @param {*} $reportingService
     */

    constructor(
      $urlTokenModel,
      $scope,
      agent,
      $notificationService,
      $currentDataService,
      $state,
      osquery,
      $reportingService
    ) {
      this.state = $state
      this.currentDataService = $currentDataService
      this.scope = $scope
      this.urlTokenModel = $urlTokenModel
      this.notificationService = $notificationService
      this.tableResults = {}
      this.reportingService = $reportingService
      this.osquery = osquery
      this.currentDataService.addFilter(
        `{"rule.groups":"osquery", "implicit":true}`
      )
      this.agent = agent
      if (
        this.agent &&
        this.agent.data &&
        this.agent.data.data &&
        this.agent.data.data.id
      )
        this.currentDataService.addFilter(
          `{"agent.id":"${this.agent.data.data.id}", "implicit":true}`
        )
      this.filters = this.currentDataService.getSerializedFilters()
      this.timePicker = new TimePicker(
        '#timePicker',
        this.urlTokenModel.handleValueChange
      )
      this.scope.osqueryWodle = null

      this.scope.$on('deletedFilter', () => {
        this.launchSearches()
      })

      this.scope.$on('barFilter', () => {
        this.launchSearches()
      })

      this.vizz = [
        /**
         * Visualizations
         */
        new PieChart(
          'mostCommonPacks',
          `${this.filters} sourcetype=wazuh  | top data.osquery.pack limit=5`,
          'mostCommonPacks',
          this.scope
        ),
        new AreaChart(
          'alertsPacksOverTime',
          `${
            this.filters
          } sourcetype=wazuh | timechart span=1h count by data.osquery.pack`,
          'alertsPacksOverTime',
          this.scope
        ),
        new PieChart(
          'mostCommonActions',
          `${
            this.filters
          } sourcetype=wazuh  | top "data.osquery.action" limit=5`,
          'mostCommonActions',
          this.scope
        ),
        new Table(
          'topRules',
          `${
            this.filters
          } sourcetype=wazuh  | top rule.id, rule.description limit=5`,
          'topRules',
          this.scope
        ),
        new AreaChart(
          'alertsOverTime',
          `${this.filters} sourcetype=wazuh | timechart span=1h count`,
          'alertsOverTime',
          this.scope
        )
      ]

      this.topRulesTable = new rawTableDataService(
        'topRulesTable',
        `${
          this.filters
        } sourcetype=wazuh | stats count sparkline by agent.name,rule.description, audit.exe, audit.type, audit.euid | sort count DESC | rename agent.name as "Agent name", rule.description as Description, audit.exe as Command, audit.type as Type, audit.euid as "Effective user id"`,
        'topRulesTableToken',
        '$result$',
        this.scope
      )
      this.vizz.push(this.topRulesTable)

      this.topRulesTable.getSearch().on('result', result => {
        this.tableResults['Top Rules'] = result
      })

      // Set agent info
      try {
        this.agentReportData = {
          ID: this.agent.data.data.id,
          Name: this.agent.data.data.name,
          IP: this.agent.data.data.ip,
          Version: this.agent.data.data.version,
          Manager: this.agent.data.data.manager,
          OS: this.agent.data.data.os.name,
          dateAdd: this.agent.data.data.dateAdd,
          lastKeepAlive: this.agent.data.data.lastKeepAlive,
          group: this.agent.data.data.group.toString()
        }
      } catch (error) {
        this.agentReportData = false
      }

      /**
       * Generates report
       */
      this.scope.startVis2Png = () =>
        this.reportingService.startVis2Png(
          'agents-osquery',
          'Osquery',
          this.filters,
          [
            'mostCommonPacks',
            'alertsPacksOverTime',
            'mostCommonActions',
            'topRules',
            'alertsOverTime'
          ], //Metrics,
          this.tableResults,
          this.agentReportData
        )

      this.scope.$on('loadingReporting', (event, data) => {
        this.scope.loadingReporting = data.status
      })

      this.scope.$on('checkReportingStatus', () => {
        this.vizzReady = !this.vizz.filter(v => {
          return v.finish === false
        }).length
        if (this.vizzReady) {
          this.scope.loadingVizz = false
        } else {
          this.scope.loadingVizz = true
        }
        if (!this.scope.$$phase) this.scope.$digest()
      })

      /*
       * When controller is destroyed
       */
      this.scope.$on('$destroy', () => {
        this.timePicker.destroy()
        this.vizz.map(vizz => vizz.destroy())
      })
    }

    /**
     * On controller loads
     */
    $onInit() {
      this.scope.agent =
        this.agent && this.agent.data && this.agent.data.data
          ? this.agent.data.data
          : { error: true }
      try {
        this.wodles = this.osquery.data.data.wmodules
        this.scope.osqueryWodle = this.wodles.filter(
          item => item.osquery
        )[0].osquery
      } catch (err) {
        this.notificationService.showSimpleToast(
          'Cannot load wodle configuration. Osquery not configured.'
        )
      }

      this.scope.getAgentStatusClass = agentStatus =>
        agentStatus === 'Active' ? 'teal' : 'red'
      this.scope.formatAgentStatus = agentStatus => {
        return ['Active', 'Disconnected'].includes(agentStatus)
          ? agentStatus
          : 'Never connected'
      }
    }

    /**
     * Get filters and launches the search
     */
    launchSearches() {
      this.filters = this.currentDataService.getSerializedFilters()
      this.state.reload()
    }
  }

  app.controller('osqueryAgentCtrl', OsqueryAgents)
})