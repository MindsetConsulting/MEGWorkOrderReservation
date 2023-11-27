sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "meg/workorder/utils/CallUtil",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Fragment, Filter, FilterOperator, CallUtil) {
    "use strict";

    return Controller.extend("meg.workorder.controller.ObjectPage", {
      onInit: async function () {
        sap.ui.core.BusyIndicator.show();
        this.localModel = this.getOwnerComponent().getModel("localModel");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteObjectPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: async function (oEvent) {
        this.WorkOrderId = oEvent.getParameter("arguments").id;

        this.serviceUrl =
          this.getOwnerComponent().getModel("WorkOrderModel").sServiceUrl;
        var filter = "?$filter=WorkOrder eq '" + this.WorkOrderId + "'";
        var expand = "&$expand=OrdOperationNav,EquipBOMItemNav,AddPartItemNav";
        var data = await CallUtil.callGetData(
          this.serviceUrl +
            "/ZUSPPMEG01_WORK_ORDER_HEADERSet" +
            filter +
            expand +
            "&$format=json"
        );

        data = data.d.results[0];
        var orderOps = data.OrdOperationNav.results;
        var equipBOMItems = data.EquipBOMItemNav.results;

        this.localModel.setProperty("/workOrderHeader", data);
        this.localModel.setProperty("/orderOperations", orderOps);
        this.localModel.setProperty("/equipBOMItems", equipBOMItems);
      },
    });
  }
);
