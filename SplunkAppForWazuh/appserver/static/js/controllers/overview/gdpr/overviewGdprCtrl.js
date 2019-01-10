define([
  '../../module',
  '../../../services/visualizations/chart/column-chart',
  '../../../services/visualizations/chart/pie-chart',
  '../../../services/visualizations/inputs/time-picker',
  '../../../services/visualizations/inputs/dropdown-input'
], function(app, ColumnChart, PieChart, TimePicker, Dropdown) {
  'use strict'
  class OverviewGDPR {
    /**
     * Class GDPR
     * @param {*} $urlTokenModel
     * @param {*} $scope
     * @param {*} $currentDataService
     * @param {*} $state
     * @param {*} $reportingService
     */
    constructor(
      $urlTokenModel,
      $scope,
      $currentDataService,
      $state,
      $reportingService
    ) {
      this.scope = $scope
      this.state = $state
      this.getFilters = $currentDataService.getSerializedFilters
      this.reportingService = $reportingService
      this.tableResults = {}
      this.filters = this.getFilters()
      this.scope.$on('deletedFilter', () => {
        this.launchSearches()
      })

      this.scope.$on('barFilter', () => {
        this.launchSearches()
      })

      this.timePicker = new TimePicker(
        '#timePicker',
        $urlTokenModel.handleValueChange
      )
      this.dropdown = new Dropdown(
        'dropDownInputAgent',
        `${
          this.filters
        } sourcetype=wazuh rule.gdpr{}="*"| stats count by "rule.gdpr{}" | spath "rule.gdpr{}" | fields - count`,
        'rule.gdpr{}',
        '$form.gdpr$',
        'dropDownInput',
        this.scope
      )

      this.dropdownInstance = this.dropdown.getElement()
      this.dropdownInstance.on('change', newValue => {
        if (newValue && this.dropdownInstance) {
          $urlTokenModel.handleValueChange(this.dropdownInstance)
        }
      })

      this.vizz = [
        /**
         * Visualizations
         */
        new ColumnChart(
          'gdprRequirements',
          `${
            this.filters
          } sourcetype=wazuh rule.gdpr{}="$gdpr$"  | stats count by rule.gdpr{}`,
          'gdprRequirements',
          this.scope
        ),
        new PieChart(
          'groupsViz',
          `${
            this.filters
          } sourcetype=wazuh rule.gdpr{}="$gdpr$" | stats count by rule.groups`,
          'groupsViz',
          this.scope
        ),
        new PieChart(
          'agentsViz',
          `${
            this.filters
          } sourcetype=wazuh rule.gdpr{}="$gdpr$" | stats count by agent.name`,
          'agentsViz',
          this.scope
        ),
        new ColumnChart(
          'requirementsByAgents',
          `${
            this.filters
          } sourcetype=wazuh rule.gdpr{}="$gdpr$" agent.name=*| chart  count(rule.gdpr{}) by rule.gdpr{},agent.name`,
          'requirementsByAgents',
          this.scope
        ),
        new ColumnChart(
          'alertsSummaryViz',
          `${
            this.filters
          } sourcetype=wazuh rule.gdpr{}="$gdpr$" | stats count sparkline by agent.name, rule.gdpr{}, rule.description | sort count DESC | rename agent.name as "Agent Name", rule.gdpr{} as Requirement, rule.description as "Rule description", count as Count`,
          'alertsSummaryViz',
          this.scope
        )
      ]

      /**
       * Generates report
       */
      this.scope.startVis2Png = () =>
        this.reportingService.startVis2Png(
          'overview-gdpr',
          'GDPR',
          this.filters,
          [
            'gdprRequirements',
            'groupsViz',
            'agentsViz',
            'requirementsByAgents',
            'alertsSummaryViz'
          ],
          {}, //Metrics,
          this.tableResults
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

      /**
       * When controller is destroyed
       */
      this.scope.$on('$destroy', () => {
        this.timePicker.destroy()
        this.dropdown.destroy()
        this.vizz.map(vizz => vizz.destroy())
      })
    }

    /**
     * Get filters and launches the search
     */
    launchSearches() {
      this.filters = this.getFilters()
      this.state.reload()
    }
  }
  app.controller('overviewGdprCtrl', OverviewGDPR)
})