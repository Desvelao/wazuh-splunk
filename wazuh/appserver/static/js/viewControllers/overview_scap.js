// <![CDATA[
// <![CDATA[
//
// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
// 
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

require([
  "splunkjs/mvc",
  "splunkjs/mvc/utils",
  "splunkjs/mvc/tokenutils",
  "underscore",
  "jquery",
  "splunkjs/mvc/simplexml",
  "splunkjs/mvc/layoutview",
  "splunkjs/mvc/simplexml/dashboardview",
  "splunkjs/mvc/simplexml/dashboard/panelref",
  "splunkjs/mvc/simplexml/element/chart",
  "splunkjs/mvc/simplexml/element/event",
  "splunkjs/mvc/simplexml/element/html",
  "splunkjs/mvc/simplexml/element/list",
  "splunkjs/mvc/simplexml/element/map",
  "splunkjs/mvc/simplexml/element/single",
  "splunkjs/mvc/simplexml/element/table",
  "splunkjs/mvc/simplexml/element/visualization",
  "splunkjs/mvc/simpleform/formutils",
  "splunkjs/mvc/simplexml/eventhandler",
  "splunkjs/mvc/simplexml/searcheventhandler",
  "splunkjs/mvc/simpleform/input/dropdown",
  "splunkjs/mvc/simpleform/input/radiogroup",
  "splunkjs/mvc/simpleform/input/linklist",
  "splunkjs/mvc/simpleform/input/multiselect",
  "splunkjs/mvc/simpleform/input/checkboxgroup",
  "splunkjs/mvc/simpleform/input/text",
  "splunkjs/mvc/simpleform/input/timerange",
  "splunkjs/mvc/simpleform/input/submit",
  "splunkjs/mvc/searchmanager",
  "splunkjs/mvc/savedsearchmanager",
  "splunkjs/mvc/postprocessmanager",
  "splunkjs/mvc/simplexml/urltokenmodel"
  // Add comma-separated libraries and modules manually here, for example:
  // ..."splunkjs/mvc/simplexml/urltokenmodel",
  // "splunkjs/mvc/tokenforwarder"
],
  function (
    mvc,
    utils,
    TokenUtils,
    _,
    $,
    DashboardController,
    LayoutView,
    Dashboard,
    PanelRef,
    ChartElement,
    EventElement,
    HtmlElement,
    ListElement,
    MapElement,
    SingleElement,
    TableElement,
    VisualizationElement,
    FormUtils,
    EventHandler,
    SearchEventHandler,
    DropdownInput,
    RadioGroupInput,
    LinkListInput,
    MultiSelectInput,
    CheckboxGroupInput,
    TextInput,
    TimeRangeInput,
    SubmitButton,
    SearchManager,
    SavedSearchManager,
    PostProcessManager,
    UrlTokenModel

    // Add comma-separated parameter names here, for example: 
    // ...UrlTokenModel, 
    // TokenForwarder
  ) {

    var pageLoading = true;


    // 
    // TOKENS
    //

    // Create token namespaces
    var urlTokenModel = new UrlTokenModel();
    mvc.Components.registerInstance('url', urlTokenModel);
    var defaultTokenModel = mvc.Components.getInstance('default', { create: true });
    var submittedTokenModel = mvc.Components.getInstance('submitted', { create: true });

    urlTokenModel.on('url:navigate', function () {
      defaultTokenModel.set(urlTokenModel.toJSON());
      if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
        submitTokens();
      } else {
        submittedTokenModel.clear();
      }
    });

    // Initialize tokens
    defaultTokenModel.set(urlTokenModel.toJSON());

    function submitTokens() {
      // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
      FormUtils.submitForm({ replaceState: pageLoading });
    }

    function setToken(name, value) {
      defaultTokenModel.set(name, value);
      submittedTokenModel.set(name, value);
    }

    function unsetToken(name) {
      defaultTokenModel.unset(name);
      submittedTokenModel.unset(name);
    }



    //
    // SEARCH MANAGERS
    //


    var search1 = new SearchManager({
      "id": "search1",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh  sourcetype=wazuh oscap.scan.score=* | stats latest(oscap.scan.score) as Latest",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search2 = new SearchManager({
      "id": "search2",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh  sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" | stats latest(agent.name) as Latest",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search3 = new SearchManager({
      "id": "search3",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=* | stats latest(oscap.scan.profile.title) as Latest",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search4 = new SearchManager({
      "id": "search4",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top agent.name",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search5 = new SearchManager({
      "id": "search5",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.profile.title",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search6 = new SearchManager({
      "id": "search6",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.content",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search7 = new SearchManager({
      "id": "search7",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.severity",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search8 = new SearchManager({
      "id": "search8",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" oscap.check.severity=\"high\" | chart count by agent.name",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search9 = new SearchManager({
      "id": "search9",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search10 = new SearchManager({
      "id": "search10",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\"  oscap.check.severity=\"high\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search11 = new SearchManager({
      "id": "search11",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.scan.score=* | stats max(oscap.scan.score)",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search12 = new SearchManager({
      "id": "search12",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.scan.score=* | stats min(oscap.scan.score)",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search13 = new SearchManager({
      "id": "search13",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" | stats latest(oscap.check.title)",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search14 = new SearchManager({
      "id": "search14",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" | stats count by agent.name, oscap.check.title, oscap.scan.profile.title, oscap.scan.id, oscap.scan.content | sort count DESC | rename agent.name as \"Agent name\", oscap.check.title as Title, oscap.scan.profile.title as Profile, oscap.scan.id as \"Scan ID\", oscap.scan.content as Content",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search15 = new SearchManager({
      "id": "search15",
      "cancelOnUnload": true,
      "sample_ratio": null,
      "earliest_time": "-24h@h",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh  rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=* | stats count by oscap.scan.profile.title | sort oscap.scan.profile.title ASC|fields - count",
      "latest_time": "now",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true });


    //
    // SPLUNK LAYOUT
    //

    $('header').remove();
    new LayoutView({ "hideFooter": false, "hideSplunkBar": false, "hideAppBar": false, "hideChrome": false })
      .render()
      .getContainerElement()
      .appendChild($('.dashboard-body')[0]);

    //
    // DASHBOARD EDITOR
    //

    new Dashboard({
      id: 'dashboard',
      el: $('.dashboard-body'),
      showTitle: true,
      editable: true
    }, { tokens: true }).render();


    //
    // VIEWS: VISUALIZATION ELEMENTS
    //

    var element1 = new SingleElement({
      "id": "element1",
      "numberPrecision": "0",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "all",
      "rangeColors": "[\"0xf7bc38\",\"0x65a637\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[0]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search1",
      "el": $('#element1')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element1.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh  sourcetype=wazuh oscap.scan.score=* | stats latest(oscap.scan.score) as Latest&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });

    var element2 = new SingleElement({
      "id": "element2",
      "numberPrecision": "0",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "all",
      "rangeColors": "[\"0x65a637\",\"0xd93f3c\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[0]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search2",
      "el": $('#element2')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element2.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh  sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" | stats latest(agent.name) as Latest&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });

    var element3 = new SingleElement({
      "id": "element3",
      "numberPrecision": "0",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "all",
      "rangeColors": "[\"0x65a637\",\"0xd93f3c\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[0]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search3",
      "el": $('#element3')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element3.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=* | stats latest(oscap.scan.profile.title) as Latest&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });

    var element4 = new ChartElement({
      "id": "element4",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "pie",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "visible",
      "charting.axisTitleY.visibility": "visible",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "right",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "none",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search4",
      "el": $('#element4')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element5 = new ChartElement({
      "id": "element5",
      "charting.drilldown": "none",
      "resizable": true,
      "charting.chart": "pie",
      "managerid": "search5",
      "el": $('#element5')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element6 = new ChartElement({
      "id": "element6",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "bar",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "collapsed",
      "charting.axisTitleY.visibility": "collapsed",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "none",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "-45",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "all",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search6",
      "el": $('#element6')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element7 = new ChartElement({
      "id": "element7",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "pie",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "visible",
      "charting.axisTitleY.visibility": "visible",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "right",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "none",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search7",
      "el": $('#element7')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element8 = new ChartElement({
      "id": "element8",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "area",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "collapsed",
      "charting.axisTitleY.visibility": "visible",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "none",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "all",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search8",
      "el": $('#element8')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element9 = new ChartElement({
      "id": "element9",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "pie",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "collapsed",
      "charting.axisTitleY.visibility": "visible",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "right",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "all",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search9",
      "el": $('#element9')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element10 = new ChartElement({
      "id": "element10",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "default",
      "resizable": true,
      "charting.layout.splitSeries.allowIndependentYRanges": "0",
      "charting.drilldown": "none",
      "charting.chart.nullValueMode": "gaps",
      "charting.axisTitleY2.visibility": "visible",
      "charting.chart": "pie",
      "trellis.scales.shared": "1",
      "charting.layout.splitSeries": "0",
      "charting.chart.style": "shiny",
      "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
      "charting.axisTitleX.visibility": "collapsed",
      "charting.axisTitleY.visibility": "visible",
      "charting.axisX.scale": "linear",
      "charting.chart.bubbleMinimumSize": "10",
      "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
      "charting.axisY2.enabled": "0",
      "trellis.enabled": "0",
      "charting.legend.placement": "right",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "all",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search10",
      "el": $('#element10')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element11 = new SingleElement({
      "id": "element11",
      "numberPrecision": "0",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "none",
      "rangeColors": "[\"0x65a637\",\"0x65a637\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[0]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search11",
      "el": $('#element11')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    var element12 = new SingleElement({
      "id": "element12",
      "numberPrecision": "0.00",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "none",
      "rangeColors": "[\"0x65a637\",\"0x65a637\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[60]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search12",
      "el": $('#element12')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    var element13 = new SingleElement({
      "id": "element13",
      "numberPrecision": "0.00",
      "trellis.size": "medium",
      "unitPosition": "after",
      "useColors": "1",
      "colorMode": "block",
      "trendDisplayMode": "absolute",
      "colorBy": "value",
      "trendColorInterpretation": "standard",
      "drilldown": "all",
      "rangeColors": "[\"0x65a637\",\"0xd93f3c\"]",
      "trellis.enabled": "0",
      "showTrendIndicator": "1",
      "trellis.scales.shared": "1",
      "height": "50",
      "rangeValues": "[0]",
      "showSparkline": "1",
      "useThousandSeparators": "1",
      "managerid": "search13",
      "el": $('#element13')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element13.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" | stats latest(oscap.check.title)&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });

    var element14 = new TableElement({
      "id": "element14",
      "dataOverlayMode": "none",
      "drilldown": "cell",
      "percentagesRow": "false",
      "rowNumbers": "true",
      "totalsRow": "false",
      "wrap": "false",
      "managerid": "search14",
      "el": $('#element14')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element14.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" | stats count by agent.name, oscap.check.title, oscap.scan.profile.title, oscap.scan.id, oscap.scan.content | sort count DESC | rename agent.name as \"Agent name\", oscap.check.title as Title, oscap.scan.profile.title as Profile, oscap.scan.id as \"Scan ID\", oscap.scan.content as Content&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });


    //
    // VIEWS: FORM INPUTS
    //

    var input1 = new TimeRangeInput({
      "id": "input1",
      "searchWhenChanged": true,
      "default": { "latest_time": "now", "earliest_time": "-24h@h" },
      "earliest_time": "$form.when.earliest$",
      "latest_time": "$form.when.latest$",
      "el": $('#input1')
    }, { tokens: true }).render();

    input1.on("change", function (newValue) {
      FormUtils.handleValueChange(input1);
    });

    var input2 = new DropdownInput({
      "id": "input2",
      "choices": [
        { "label": "ALL", "value": "*" }
      ],
      "labelField": "oscap.scan.profile.title",
      "searchWhenChanged": true,
      "default": "*",
      "valueField": "oscap.scan.profile.title",
      "initialValue": "*",
      "selectFirstChoice": false,
      "showClearButton": true,
      "value": "$form.profile$",
      "managerid": "search15",
      "el": $('#input2')
    }, { tokens: true }).render();

    input2.on("change", function (newValue) {
      FormUtils.handleValueChange(input2);
    });

    DashboardController.onReady(function () {
      if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
        submittedTokenModel.set({ earliest: '0', latest: '' });
      }
    });

    // Initialize time tokens to default
    if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
      defaultTokenModel.set({ earliest: '0', latest: '' });
    }

    submitTokens();


    //
    // DASHBOARD READY
    //

    DashboardController.ready();
    pageLoading = false;

  }
);
// ]]>