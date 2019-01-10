//index=wazuh data.integration="virustotal"

define([
  '../../module',
  '../../../services/visualizations/chart/pie-chart',
  '../../../services/visualizations/table/table',
  '../../../services/visualizations/chart/linear-chart',
  '../../../services/visualizations/inputs/time-picker',
  '../../../services/visualizations/chart/bar-chart',
  '../../../services/rawTableData/rawTableDataService'
], function(
  app,
  PieChart,
  Table,
  LinearChart,
  TimePicker,
  BarChart,
  rawTableDataService
) {
  'use strict'

  class OverviewVirusTotal {
    /**
     * Class Overview Virus Total
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
      this.reportingService = $reportingService
      this.tableResults = {}
      //Add filer for VirusTotal
      $currentDataService.addFilter(
        `{"rule.groups":"virustotal", "implicit":true}`
      )
      this.getFilters = $currentDataService.getSerializedFilters
      this.filters = this.getFilters()
      this.submittedTokenModel = $urlTokenModel.getSubmittedTokenModel()
      this.timePicker = new TimePicker(
        '#timePicker',
        $urlTokenModel.handleValueChange
      )

      this.vizz = [
        /**
         * Visualizations
         */
        new PieChart(
          'top5AgentsPositive',
          `${this.filters} rule.id=87105 | top agent.name limit=5`,
          'top5AgentsPositive',
          this.scope
        ),
        new PieChart(
          'top5AgentsNoPositive',
          `${this.filters} rule.id=87104 | top agent.name limit=5`,
          'top5AgentsNoPositive',
          this.scope
        ),
        new Table(
          'top5Rules',
          `${
            this.filters
          } |stats count sparkline by rule.id, rule.description | sort count DESC | head 5 | rename rule.id as "Rule ID", rule.description as "Description", rule.level as Level, count as Count`,
          'top5Rules',
          this.scope
        ),
        new LinearChart(
          'eventsSummary',
          `${this.filters} | timechart count`,
          'eventsSummary',
          this.scope
        ),
        new BarChart(
          'alertsPerAgent',
          `${this.filters} | top agent.name`,
          'alertsPerAgent',
          this.scope
        )
      ]

      this.top5RulesTable = new rawTableDataService(
        'top5RulesTable',
        `${
          this.filters
        } |stats count sparkline by rule.id, rule.description | sort count DESC | head 5 | rename rule.id as "Rule ID", rule.description as "Description", rule.level as Level, count as Count`,
        'top5RulesTableToken',
        '$result$',
        this.scope
      )
      this.vizz.push(this.top5RulesTable)

      this.top5RulesTable.getSearch().on('result', result => {
        this.tableResults['Top 5 Rules'] = result
      })

      /**
       * Generates report
       */
      this.scope.startVis2Png = () =>
        this.reportingService.startVis2Png(
          'overview-virustotal',
          'VirusTotal',
          this.filters,
          [
            'top5AgentsPositive',
            'eventsSummary',
            'top5AgentsNoPositive',
            'alertsPerAgent',
            'top5Rules'
          ],
          {}, //Metrics
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

      this.scope.$on('deletedFilter', () => {
        this.launchSearches()
      })

      this.scope.$on('barFilter', () => {
        this.launchSearches()
      })

      /**
       * On controller destroy
       */
      this.scope.$on('$destroy', () => {
        this.timePicker.destroy()
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
  app.controller('overviewVirusTotal', OverviewVirusTotal)
})