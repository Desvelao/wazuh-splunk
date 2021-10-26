/*
 * Wazuh app - Roles controller
--
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

define([
  "../../module",
  "splunkjs/mvc/searchmanager",
  "splunkjs/mvc/multidropdownview",
  "splunkjs/mvc"
], function(controllers, SearchManager, MultiDropdownView, mvc) {
  "use strict";

  const RESERVED_ROLES = [
    "administrator",
    "readonly",
    "users_admin",
    "agents_readonly",
    "agents_admin",
    "cluster_readonly",
    "cluster_admin"
  ];

  class Roles {
    constructor(
      $scope,
      isAdmin,
      roleData,
      policyData,
      $notificationService,
      $securityService
    ) {
      this.scope = $scope;
      this.scope.isAdmin = isAdmin;
      this.scope.policyData = this.getPolicyList(
        policyData.data.data.affected_items || []
      );
      this.notification = $notificationService;
      this.securityService = $securityService;
      this.scope.roleName = "";
      this.scope.addingNewRole = false;
      this.scope.editingRole = false;

      this.dropdown = new MultiDropdownView({
        id: "policies-dropdown",
        managerid: "policies-search",
        choices: this.scope.policyData,
        el: $("#policies-dropdown-view")
      }).render();
      this.searchManager = new SearchManager({
        id: "policies-search",
        search:
          "| eventcount summarize=false index=* index=_* | dedup index | fields index"
      });

      this.dropdown.on("change", newValue => {
        if (newValue && this.dropdown) {
          this.scope.policies = newValue;
          this.scope.$applyAsync();
        }
      });
    }

    getPolicyList(policyData) {
      return policyData.map(policy => {
        return { label: policy.name, value: policy.id };
      });
    }

    $onInit() {
      this.scope.addNewRole = () => this.addNewRole();
      this.scope.cancelRoleEdition = () => this.cancelRoleEdition();
      this.scope.enableSave = () => this.enableSave();
      this.scope.saveRole = () => this.saveRole();
      this.scope.addingNewRole = false;

      // Come from the pencil icon on the roles table
      this.scope.$on("openRoleFromList", (ev, parameters) => {
        ev.stopPropagation();
        this.scope.addingNewRole = true;
        this.scope.editingRole = true;
        this.scope.roleId = parameters.role.id;
        this.scope.roleName = parameters.role.name;
        this.scope.policies = parameters.role.policies;
        this.dropdown.settings.set(
          "disabled",
          RESERVED_ROLES.includes(parameters.role.name)
        );
        this.dropdown.val(this.scope.policies);
      });

      this.scope.$on("$destroy", () => {
        mvc.Components.revokeInstance("policies-dropdown");
        mvc.Components.revokeInstance("policies-search");
        this.dropdown = null;
        this.searchManager = null;
      });
    }

    /**
     * Open the editor for a new role
     */
    addNewRole() {
      try {
        this.clearAll();
        this.scope.overwrite = false;
        this.scope.addingNewRole = true;
        this.scope.policies = [];
        this.dropdown.settings.set("disabled", false);
      } catch (error) {
        this.notification.showErrorToast("Cannot add new Role.");
      }
    }

    clearAll() {
      this.scope.policies = [];
      this.scope.roleName = "";
      this.dropdown.val([]);
      this.scope.addingNewRole = false;
      this.scope.editingRole = false;
    }

    /**
     * Cancel Role edition
     */
    cancelRoleEdition() {
      this.clearAll();
    }

    /**
     * Enables save button
     */
    enableSave() {
      this.scope.overwrite = false;
    }

    /**
     * Saves Role
     */
    async saveRole() {
      try {
        const constainsBlanks = /.* .*/;
        const roleName = this.scope.roleName;
        const roleId = this.scope.roleId;

        if (roleName) {
          if (constainsBlanks.test(roleName)) {
            this.notification.showErrorToast(
              "Error creating a new role. The name can not contain white spaces."
            );
          } else {
            this.scope.saveIncomplete = true;
            const policies = this.scope.policies;
            const result = await this.securityService.saveRole(
              { name: roleName, id: roleId },
              policies
            );
            if (result.failed_items[0] && result.failed_items[0].error.code === 4005) {
              this.notification.showWarningToast(
                result.failed_items[0].error.message || "Role already exists."
              );
              this.scope.overwrite = true;
              this.scope.saveIncomplete = false;
              this.scope.$applyAsync();
              return;
            }
            if (result && result.affected_items[0] && result.affected_items[0].error === 0) {
              this.notification.showSuccessToast("Role saved successfully.");
              this.scope.saveIncomplete = false;
              this.scope.$applyAsync();
            } else {
              throw new Error(result.data.message || "Cannot save this Role.");
            }
          }
        } else {
          this.notification.showWarningToast(
            "Please set a name for the new Role."
          );
        }
      } catch (error) {
        this.scope.saveIncomplete = false;
        this.notification.showErrorToast(error);
      }
    }
  }

  controllers.controller("rolesCtrl", Roles);
  return Roles;
});
