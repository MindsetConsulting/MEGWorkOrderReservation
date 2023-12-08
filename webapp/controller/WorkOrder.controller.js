sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "meg/workorder/utils/FilterUtil",
    "meg/workorder/utils/CallUtil",
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
    CallUtil,
    FilterType
  ) {
    "use strict";

    return Controller.extend("meg.workorder.controller.WorkOrder", {
      onInit: async function () {
        // sap.ui.core.BusyIndicator.show();
        var date = new Date();
        // this.byId("toDate").setDateValue(date);
        // var curDate =
        //   date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate();
        // date.setDate(date.getDate() - 30);
        // var prevDate =
        //   date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate();

        // var getMonth = String(date.getMonth() + 1).padStart(2, "0");
        // var getDate = String(date.getDate()).padStart(2, "0");
        // var curDate = date.getFullYear() + "" + getMonth + "" + getDate;
        var curDate = FilterUtil.getFormattedDate(date);
        date.setDate(date.getDate() - 30);

        // getMonth = String(date.getMonth() + 1).padStart(2, "0");
        // getDate = String(date.getDate()).padStart(2, "0");
        // var prevDate = date.getFullYear() + "" + getMonth + "" + getDate;
        var prevDate = FilterUtil.getFormattedDate(date);

        this.dateFilter =
          "(Date ge '" + prevDate + "' and Date le '" + curDate + "')";

        this.localModel = this.getOwnerComponent().getModel("localModel");
        this.WorkOrderModel =
          this.getOwnerComponent().getModel("WorkOrderModel");

        this.serviceUrl = this.WorkOrderModel.sServiceUrl;
        var data = await CallUtil.callGetData(
          this.serviceUrl +
            "/ZUSPPMEG01_WORK_ORDER_HEADERSet?$format=json&$filter=" +
            this.dateFilter
        );

        data = data.d.results;

        this.localModel.setProperty("/workOrderList", data);

        // this.localModel.setProperty("/filterValues", {});
        // this.oFilterBar = this.getView().byId("FilterBar");
        this.oTable = this.getView().byId("workOrderTable");
        // var toDate = new Date();
        // this.byId("fromDate").setDateValue(date);
        // this.byId("toDate").setDateValue(toDate);
      },

      onTableItemPress: function (oEvent) {
        var sPath = oEvent.getSource().getBindingContextPath();
        var value = sPath.split("/")[1];
        var index = sPath.split("/")[2];

        var selectedValues = this.getView().getModel("localModel").getData()[
          value
        ][index];

        var WOID = selectedValues.WorkOrder;
        // this.localModel.setProperty("/selectedValues", selectedValues);
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteObjectPage", { id: WOID });
      },

      handleValueHelpConfirm: function (oEvent) {
        var valueHelpId = oEvent.getParameters().id;
        var inputId = this.getInputId(valueHelpId);

        var aSelectedItems = oEvent.getParameter("selectedItems"),
          oMultiInput = this.byId(inputId);

        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(function (oItem) {
            oMultiInput.addToken(
              new Token({
                text: oItem.getTitle(),
              })
            );
          });
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
        if (id == "plannerGroupVH") {
          return "plannerGroupInput";
        }
        if (id == "workCenterVH") {
          return "workCenterInput";
        }
        if (id == "funcLocVH") {
          return "funLocInput";
        }
        if (id == "equipmentVH") {
          return "equipmentInput";
        }
      },

      onResetFilters: function () {
        this.byId("woInput").setValue("");
        this.byId("fromDate").setValue("");
        this.byId("toDate").setValue("");
        this.byId("woInput").removeAllTokens();
        this.byId("plantInput").removeAllTokens();
        this.byId("orderTypeInput").removeAllTokens();
        this.byId("plannerGroupInput").removeAllTokens();
        this.byId("workCenterInput").removeAllTokens();
        this.byId("funLocInput").removeAllTokens();
        this.byId("equipmentInput").removeAllTokens();
      },

      // prepareGetCall: async function (entityName) {
      //   var data = await CallUtil.callGetData(
      //     this.serviceUrl + entityName + "?$format=json"
      //   );
      //   data = data.d.results;
      //   this.localModel.setProperty(entityName, data);
      // },

      onWOValueHelp: async function (oEvent) {
        if (!this._oDialogWO) {
          this._oDialogWO = sap.ui.xmlfragment(
            "meg.workorder.fragments.WorkOrder",
            this
          );
          this.getView().addDependent(this._oDialogWO);
          this.VHID = "WorkOrder";
          // this.prepareGetCall("/ZUSPPMEG01_WORK_ORDER_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_WORK_ORDER_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_WORK_ORDER_F4Set", data);
          this.byId("woInput").setValue("");
          this._oDialogWO.open();
        }
        this.byId("woInput").setValue("");
        this.byId("woInput").removeAllTokens();
        this.VHID = "WorkOrder";
        this._oDialogWO.open();
      },

      onPlantValueHelp: async function (oEvent) {
        if (!this._oDialogPlant) {
          this._oDialogPlant = sap.ui.xmlfragment(
            "meg.workorder.fragments.Plant",
            this
          );
          this.getView().addDependent(this._oDialogPlant);
          this.VHID = "Plant";

          // this.prepareGetCall("/ZUSPPMEG01_PLANT_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_PLANT_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_PLANT_F4Set", data);

          this._oDialogPlant.open();
        }
        this.byId("plantInput").removeAllTokens();
        this.VHID = "Plant";
        this._oDialogPlant.open();
      },

      onOrderTypeValueHelp: async function (oEvent) {
        if (!this._oDialogOrderType) {
          this._oDialogOrderType = sap.ui.xmlfragment(
            "meg.workorder.fragments.OrderType",
            this
          );
          this.getView().addDependent(this._oDialogOrderType);
          this.VHID = "OrderType";
          // this.prepareGetCall("/ZUSPPMEG01_ORDER_TYPE_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_ORDER_TYPE_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_ORDER_TYPE_F4Set", data);

          this._oDialogOrderType.open();
        }
        this.byId("orderTypeInput").removeAllTokens();
        this.VHID = "OrderType";
        this._oDialogOrderType.open();
      },

      onPlannerGroupValueHelp: async function (oEvent) {
        if (!this._oDialogPlannerGroup) {
          this._oDialogPlannerGroup = sap.ui.xmlfragment(
            "meg.workorder.fragments.PlannerGroup",
            this
          );
          this.getView().addDependent(this._oDialogPlannerGroup);
          this.VHID = "PlannerGroup";
          // this.prepareGetCall("/ZUSPPMEG01_PLANNER_GROUP_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_PLANNER_GROUP_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_PLANNER_GROUP_F4Set", data);

          this._oDialogPlannerGroup.open();
        }
        this.byId("plannerGroupInput").removeAllTokens();
        this.VHID = "PlannerGroup";
        this._oDialogPlannerGroup.open();
      },

      onWorkCenterValueHelp: async function (oEvent) {
        if (!this._oDialogWorkCenter) {
          this._oDialogWorkCenter = sap.ui.xmlfragment(
            "meg.workorder.fragments.WorkCenter",
            this
          );
          this.getView().addDependent(this._oDialogWorkCenter);
          this.VHID = "WorkCenter";
          // this.prepareGetCall("/ZUSPPMEG01_WORK_CENTER_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_WORK_CENTER_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_WORK_CENTER_F4Set", data);

          this._oDialogWorkCenter.open();
        }
        this.byId("workCenterInput").removeAllTokens();
        this.VHID = "WorkCenter";
        this._oDialogWorkCenter.open();
      },

      onFuncLocValueHelp: async function (oEvent) {
        if (!this._oDialogFuncLoc) {
          this._oDialogFuncLoc = sap.ui.xmlfragment(
            "meg.workorder.fragments.FuncLoc",
            this
          );
          this.getView().addDependent(this._oDialogFuncLoc);
          this.VHID = "FunctLocation";
          // this.prepareGetCall("/ZUSPPMEG01_FUNCTION_LOCATION_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_FUNCTION_LOCATION_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty(
            "/ZUSPPMEG01_FUNCTION_LOCATION_F4Set",
            data
          );

          this._oDialogFuncLoc.open();
        }
        this.byId("funLocInput").removeAllTokens();
        this.VHID = "FunctLocation";
        this._oDialogFuncLoc.open();
      },

      onEquipmentValueHelp: async function (oEvent) {
        if (!this._oDialogEquipment) {
          this._oDialogEquipment = sap.ui.xmlfragment(
            "meg.workorder.fragments.Equipment",
            this
          );
          this.getView().addDependent(this._oDialogEquipment);
          this.VHID = "Equipment";
          // this.prepareGetCall("/ZUSPPMEG01_EQUIPMENT_F4Set");
          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_EQUIPMENT_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_EQUIPMENT_F4Set", data);

          this._oDialogEquipment.open();
        }
        this.byId("equipmentInput").removeAllTokens();
        this.VHID = "Equipment";
        this._oDialogEquipment.open();
      },

      onFilterSearch: async function () {
        // sap.ui.core.BusyIndicator.show();
        this.oTable.setShowOverlay(true);
        // var sFilters = "";
        var WOValue = this.byId("woInput").getProperty("value");
        var fromDate = this.byId("fromDate").getDateValue();
        var toDate = this.byId("toDate").getDateValue();

        var oFilterBar = this.getView().byId("FilterBar");

        var aTableFilters = oFilterBar
          .getFilterGroupItems()
          .reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl();
            if (oControl._tokenizer) {
              var aSelectedKeys = oControl._tokenizer.getAggregation("tokens");
            }
            // aSelectedKeys = oControl._tokenizer.getAggregation("tokens"),
            var sFilterName = oFilterGroupItem.getName(),
              sFilters = "";

            if (aSelectedKeys && aSelectedKeys.length > 1) {
              sFilters = "(";
              aSelectedKeys.map(function (sSelectedKey) {
                if (aSelectedKeys.length != aSelectedKeys.length > 1)
                  sFilters +=
                    sFilterName + " eq '" + sSelectedKey.getText() + "' or ";
              });
              sFilters = sFilters.slice(0, -4);
              sFilters += ")";
            } else if (aSelectedKeys && aSelectedKeys.length == 1) {
              sFilters =
                sFilterName + " eq '" + aSelectedKeys[0].getText() + "'";
            }

            if (sFilters && sFilters !== "") {
              aResult.push(sFilters);
            }

            return aResult;
          }, []);

        var filter = FilterUtil.prepareFilters(aTableFilters);

        if (WOValue != "") {
          if (filter == "") {
            filter += "WorkOrder eq '" + WOValue + "'";
          } else {
            filter += " and WorkOrder eq '" + WOValue + "'";
          }
        }

        if (fromDate && toDate) {
          fromDate = FilterUtil.getFormattedDate(fromDate);
          toDate = FilterUtil.getFormattedDate(toDate);
          this.dateFilter =
            " and (Date ge '" +
            fromDate +
            "'" +
            " and Date le '" +
            toDate +
            "')";
        } else if (fromDate) {
          fromDate = FilterUtil.getFormattedDate(fromDate);
          this.dateFilter = " and Date ge '" + fromDate + "'";
        } else if (toDate) {
          toDate = FilterUtil.getFormattedDate(toDate);
          this.dateFilter = " and Date ge '" + toDate + "'";
        } else {
          this.dateFilter = "";
        }

        if (filter == "") {
          var date = new Date();
          var curDate = FilterUtil.getFormattedDate(date);
          date.setDate(date.getDate() - 30);
          var prevDate = FilterUtil.getFormattedDate(date);
          this.dateFilter =
            "(Date ge '" + prevDate + "' and Date le '" + curDate + "')";
        }

        var data = await CallUtil.callGetData(
          this.serviceUrl +
            "/ZUSPPMEG01_WORK_ORDER_HEADERSet?$format=json&$filter=" +
            filter +
            this.dateFilter
        );

        data = data.d.results;

        this.localModel.setProperty("/workOrderList", data);
        this.oTable.setShowOverlay(false);
      },

      onValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter(this.VHID, FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },
    });
  }
);
