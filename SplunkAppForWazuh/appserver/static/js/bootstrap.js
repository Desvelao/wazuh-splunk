/**
 * bootstraps angular onto the window.document node
 */
define(['angular', 'js/app'], function(ng) {
  'use strict'
  console.log("ee")
  ng.bootstrap(document, ['wazuhApp'])
})
