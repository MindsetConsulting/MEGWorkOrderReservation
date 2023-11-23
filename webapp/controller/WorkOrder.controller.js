sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "meg/workorder/utils/FilterUtil",
    "sap/ui/model/FilterType",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    Fragment,
    Filter,
    FilterOperator,
    Token,
    FilterUtil,
    FilterType
  ) {
    "use strict";

    return Controller.extend("meg.workorder.controller.WorkOrder", {
      onInit: async function () {
        this.localModel = this.getOwnerComponent().getModel("localModel");

        // this.localModel.setProperty("/selectedValues", {});
        this.localModel.setProperty("/filterValues", {});

        // this.getView().getModel("localModel").setProperty("/valueHelp", {});
        // this.getView().getModel("localModel").setProperty("/filterValues", {});

        this.oFilterBar = this.getView().byId("FilterBar");
        this.oTable = this.getView().byId("workOrderTable");
      },

      onTableItemPress: function (oEvent) {
        var sPath = oEvent.getSource().getBindingContextPath();
        var value = sPath.split("/")[1];
        // var index = sPath.split('/')[2];

        // var selectedValues = this.getView().getModel("localModel").getData()[value][index];
        // this.localModel.setProperty("/selectedValues", selectedValues);

        var selectedValues =
          this.getView().getModel("WorkOrderModel").oData[value];
        this.localModel.setProperty("/selectedValues", selectedValues);

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteObjectPage");
      },

      //   onSuggestionItemSelected: function (oEvent) {
      //     var oItem = oEvent.getParameter("selectedItem");
      //     var oText = oItem ? oItem.getProperty("description") : "";
      //     var sID = oEvent.oSource.sId;

      //     if (sID == "workOrderVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/workOrderValueHelp", oText);
      //     }
      //     if (sID == "plantVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/plantValueHelp", oText);
      //     }
      //     if (sID == "orderTypeVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/orderTypeValueHelp", oText);
      //     }
      //     if (sID == "plannerGroupVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/plannerGroupValueHelp", oText);
      //     }
      //     if (sID == "workCenterVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/workCenterValueHelp", oText);
      //     }
      //     if (sID == "funcLocVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/funcLocValueHelp", oText);
      //     }
      //     if (sID == "equipmentVH") {
      //       this.getView()
      //         .getModel("localModel")
      //         .setProperty("/valueHelp/equipmentValueHelp", oText);
      //     }
      //   },

      onWOValueHelp: function (oEvent) {
        if (!this._oDialogWO) {
          this._oDialogWO = sap.ui.xmlfragment(
            "meg.workorder.fragments.WorkOrder",
            this
          );
          this.getView().addDependent(this._oDialogWO);
          this._oDialogWO.open();
        }
        this._oDialogWO.open();
      },

      handleValueHelpConfirm: function (oEvent) {
        var valueHelpId = oEvent.getParameters().id;
        var inputId = this.getInputId(valueHelpId);

        var aSelectedItems = oEvent.getParameter("selectedItems"),
          oMultiInput = this.byId(inputId);
        var DataModel = this.getView().getModel("localModel");

        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(function (oItem) {
            oMultiInput.addToken(
              new Token({
                text: oItem.getTitle(),
              })
            );
          });
        }

        this.setModelFilters(valueHelpId, aSelectedItems);
      },

      setModelFilters: function (id, items) {
        var DataModel = this.getView().getModel("localModel");
        if (id == "workOrderVH") {
          DataModel.setProperty("/filterValues/WorkOrder", items);
        }
        if (id == "plantVH") {
          DataModel.setProperty("/filterValues/Plant", items);
        }
        if (id == "orderTypeVH") {
          DataModel.setProperty("/filterValues/OrderType", items);
        }
      },

      getInputId: function (id) {
        if (id == "workOrderVH") {
          return "woInput";
        }
        if (id == "plantVH") {
          return "plantInput";
        }
        if (id == "orderTypeVH") {
          return "orderTypeInput";
        }
      },

      handleFilterChange: async function () {
        var DataModel = this.getView().getModel("localModel");
        var filterValues = DataModel.getData().filterValues;

        var filters = FilterUtil.prepareFilters({
          WorkOrder: filterValues.WorkOrder,
          Plant: filterValues.Plant,
          OrderType: filterValues.OrderType,
        });
        this.getView()
          .byId("workOrderTable")
          .getBinding("items")
          .filter(filters, FilterType.Application);
      },

      onPlantValueHelp: function (oEvent) {
        if (!this._oDialogPlant) {
          this._oDialogPlant = sap.ui.xmlfragment(
            "meg.workorder.fragments.Plant",
            this
          );
          this.getView().addDependent(this._oDialogPlant);
          this._oDialogPlant.open();
        }
        this._oDialogPlant.open();
      },

      onOrderTypeValueHelp: function (oEvent) {
        if (!this._oDialogOrderType) {
          this._oDialogOrderType = sap.ui.xmlfragment(
            "meg.workorder.fragments.OrderType",
            this
          );
          this.getView().addDependent(this._oDialogOrderType);
          this._oDialogOrderType.open();
        }
        this._oDialogOrderType.open();
      },

      onPlannerGroupValueHelp: function (oEvent) {
        if (!this._oDialogPlannerGroup) {
          this._oDialogPlannerGroup = sap.ui.xmlfragment(
            "meg.workorder.fragments.PlannerGroup",
            this
          );
          this.getView().addDependent(this._oDialogPlannerGroup);
          this._oDialogPlannerGroup.open();
        }
        this._oDialogPlannerGroup.open();
      },

      onWorkCenterValueHelp: function (oEvent) {
        if (!this._oDialogPlannerGroup) {
          this._oDialogPlannerGroup = sap.ui.xmlfragment(
            "meg.workorder.fragments.WorkCenter",
            this
          );
          this.getView().addDependent(this._oDialogPlannerGroup);
          this._oDialogPlannerGroup.open();
        }
        this._oDialogPlannerGroup.open();
      },

      onFuncLocValueHelp: function (oEvent) {
        if (!this._oDialogFuncLoc) {
          this._oDialogFuncLoc = sap.ui.xmlfragment(
            "meg.workorder.fragments.FuncLoc",
            this
          );
          this.getView().addDependent(this._oDialogFuncLoc);
          this._oDialogFuncLoc.open();
        }
        this._oDialogFuncLoc.open();
      },

      onEquipmentValueHelp: function (oEvent) {
        if (!this._oDialogFuncLoc) {
          this._oDialogFuncLoc = sap.ui.xmlfragment(
            "meg.workorder.fragments.Equipment",
            this
          );
          this.getView().addDependent(this._oDialogFuncLoc);
          this._oDialogFuncLoc.open();
        }
        this._oDialogFuncLoc.open();
      },

      onSearch: function () {
        var aTableFilters = this.oFilterBar
          .getFilterGroupItems()
          .reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl(),
              aSelectedKeys = oControl.getSelectedKeys(),
              aFilters = aSelectedKeys.map(function (sSelectedKey) {
                return new Filter({
                  path: oFilterGroupItem.getName(),
                  operator: FilterOperator.Contains,
                  value1: sSelectedKey,
                });
              });

            if (aSelectedKeys.length > 0) {
              aResult.push(
                new Filter({
                  filters: aFilters,
                  and: false,
                })
              );
            }

            return aResult;
          }, []);

        this.oTable.getBinding("items").filter(aTableFilters);
        this.oTable.setShowOverlay(false);
      },
    });
  }
);
