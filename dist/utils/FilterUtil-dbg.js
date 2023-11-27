sap.ui.define(
  ["sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
  function (Filter, FilterOperator) {
    "use strict";

    return {
      prepareFilters1: function (oFilterValues) {
        var aFilters = [];

        Object.keys(oFilterValues).forEach(function (filterName) {
          if (Array.isArray(oFilterValues[filterName])) {
            if (oFilterValues[filterName].length > 0) {
              aFilters.push(
                new Filter(
                  {
                    filters: oFilterValues[filterName].map(function (value) {
                      value = value.getProperty("title");
                      return new Filter(filterName, FilterOperator.EQ, value);
                    }),
                  },
                  false
                )
              );
            }
          }
        });

        return aFilters;
      },

      prepareFilters: function (oFilterValues) {
        var sFilters = "";
        oFilterValues.forEach(function (filter) {
          sFilters += filter + " and ";
        });
        // sFilters = sFilters.slice(0, -5);
        return sFilters;
      },
    };
  }
);
