/*
 * Wazuh app - Security service
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

define(["../module"], function(module) {
  "use strict";

  module.service("$securityService", function($requestService, $state) {
    const getRoleData = async () => {
      try {
        return await $requestService.apiReq("/security/roles");
      } catch (error) {
        $state.go("settings.api");
      }
    };

    const getPoliciesData = async () => {
      try {
        return await $requestService.apiReq("/security/policies");
      } catch (error) {
        $state.go("settings.api");
      }
    };

    const saveRole = async (roleName, policies) => {
      try {
        const result = await $requestService.apiReq(
          "/security/roles",
          {
            content: JSON.stringify({ name: roleName }),
            origin: "json"
          },
          "POST"
        );

        const data = (result.data || {}).data;
        if (data.failed_items && data.failed_items.length) {
          return;
        }

        let roleId = "";
        if (data.affected_items && data.affected_items) {
          roleId = data.affected_items[0].id;
        }

        const policyResult = await $requestService.apiReq(
          `/security/roles/${roleId}/policies/`,
          {
            content: JSON.stringify({
              params: {
                policy_ids: policies.toString()
              }
            }),
            origin: "raw"
          },
          "POST"
        );

        const policiesData = (policyResult.data || {}).data;
        if (policiesData.failed_items && policiesData.failed_items.length) {
          return policiesData;
        }

        if (result.data.error === 1905) {
          return result;
        } else {
          throw new Error(
            result.data.message || result.data.error || "Cannot save Role."
          );
        }
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const removeRole = async role => {
      try {
        const result = await $requestService.apiReq(
          `/security/roles?role_ids=${role}`,
          {},
          "DELETE"
        );

        if (
          result.data.data.failed_items.length &&
          result.data.data.failed_items[0].error.code === 4008
        ) {
          throw new Error(result.data.data.failed_items[0].error.message);
        }

        if (result.data.error !== 0) {
          throw new Error(result.data.message);
        }
        return result;
      } catch (error) {
        return Promise.reject(error);
      }
    };

    return {
      getRoleData: getRoleData,
      getPoliciesData: getPoliciesData,
      saveRole: saveRole,
      removeRole: removeRole
    };
  });
});
