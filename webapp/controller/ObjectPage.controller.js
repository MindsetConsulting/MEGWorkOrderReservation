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
        this.localModel.setProperty("/AddPartsItems", []);

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

        var orderOps, equipBOMItems;
        if (data && data.d.results.length > 0) {
          data = data.d.results[0];
          this.localModel.setProperty("/workOrderHeader", data);
          if (data && data.OrdOperationNav) {
            orderOps = data.OrdOperationNav.results;
          }
          if (data && data.EquipBOMItemNav) {
            this.getEquipBOMData(data.EquipBOMItemNav.results);
            // equipBOMItems = data.EquipBOMItemNav.results;
          }
        }
        this.localModel.setProperty("/orderOperations", orderOps);
        // this.localModel.setProperty("/equipBOMItems", equipBOMItems);
      },

      getEquipBOMData: async function (data) {
        var oTable = this.getView().byId("equiBOMID");
        oTable.setShowOverlay(true);
        var url = this.serviceUrl;
        var plant = this.localModel.getData().workOrderHeader.Plant;

        let i = 0;
        for (i = 0; i < data.length; i++) {
          var part = data[i].Part;
          var storageLoc = await CallUtil.callGetData(
            url +
              "/ZUSPPMEG01_MATERIAL_STORAGE_LOCATIONSet?$filter=Part eq '" +
              part +
              "' and Plant eq '" +
              plant +
              "'&$format=json"
          );
          if (storageLoc && storageLoc.d && storageLoc.d.results) {
            data[i].StorageLocation = storageLoc.d.results;
            if (storageLoc.d.results.length > 1) {
              data[i].isEnabled = true;
              data[i].isSelected = false;
            } else {
              data[i].isEnabled = false;
              data[i].isSelected = true;
            }
          }
        }
        this.localModel.setProperty("/equipBOMItems", data);
        oTable.setShowOverlay(false);
      },

      onAddPartValueHelp: async function (oEvent) {
        var bindingPath =
          oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel
            .sPath;
        this.valueHelpIndex = bindingPath.split("/")[2];
        if (!this._oDialogAddPart) {
          this._oDialogAddPart = sap.ui.xmlfragment(
            "meg.workorder.fragments.AdditionalPart",
            this
          );
          this.getView().addDependent(this._oDialogAddPart);
          this.VHID = "WorkOrder";

          var data = await CallUtil.callGetData(
            this.serviceUrl + "/ZUSPPMEG01_PART_F4Set?$format=json"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_PART_F4Set", data);

          this._oDialogAddPart.open();
        }
        this._oDialogAddPart.open();
      },

      onRowAddParts: function () {
        var addPartsData = this.localModel.getData();
        var obj = {
          Part: "",
          PartDesc: "",
          DesiredQuan: "",
          Operation: "",
          StorageLocation: "",
          isEnabled: false,
          isSelected: true,
        };
        addPartsData.AddPartsItems.push(obj);
        this.localModel.refresh();
      },
      onTableRowDelete: function (oEvent) {
        var bindingPath =
          oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel
            .sPath;
        var index = bindingPath.split("/")[2];
        var addItemsData = this.localModel.getData().AddPartsItems;
        addItemsData.splice(index, 1);
        this.localModel.refresh();
      },

      handlePartConfirm: async function (oEvent) {
        var part = oEvent.getParameter("selectedItem").getTitle();
        var partDesc = oEvent.getParameter("selectedItem").getDescription();
        var plant = this.localModel.getData().workOrderHeader.Plant;

        var addItemsData = this.localModel.getData().AddPartsItems;
        // addItemsData[this.valueHelpIndex].part = part;
        // addItemsData[this.valueHelpIndex].partDesc = partDesc;

        var storageLoc = await CallUtil.callGetData(
          this.serviceUrl +
            "/ZUSPPMEG01_MATERIAL_STORAGE_LOCATIONSet?$filter=Part eq '" +
            part +
            "' and Plant eq '" +
            plant +
            "'&$format=json"
        );

        addItemsData[this.valueHelpIndex].Part = part;
        addItemsData[this.valueHelpIndex].PartDesc = partDesc;
        addItemsData[this.valueHelpIndex].isEnabled = partDesc;

        if (storageLoc && storageLoc.d && storageLoc.d.results) {
          addItemsData[this.valueHelpIndex].StorageLocation =
            storageLoc.d.results;
          if (storageLoc.d.results.length > 1) {
            addItemsData[this.valueHelpIndex].isEnabled = true;
            addItemsData[this.valueHelpIndex].isSelected = false;
          } else {
            addItemsData[this.valueHelpIndex].isEnabled = false;
            addItemsData[this.valueHelpIndex].isSelected = true;
          }
        }

        this.localModel.refresh();
      },

      onValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Part", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },

      passWOReservation: function (oEvent) {
        var oEquiBOMTable = this.byId("equiBOMID");
        var aSelectedPaths = oEquiBOMTable.getSelectedContextPaths();
        var data = this.localModel.getData();
        this.localModel.setProperty("/selectedEquiBOM", []);

        if (aSelectedPaths && aSelectedPaths.length > 0) {
          aSelectedPaths.forEach(function (sPath) {
            var index = sPath.split("/")[2];
            var equiData = data.equipBOMItems[index];
            data.selectedEquiBOM.push(equiData);
          });
        }

        var payload = {
          WorkOrder: data.workOrderHeader.WorkOrder,
          Plant: data.workOrderHeader.Plant,
          OrderType: data.workOrderHeader.OrderType,
          Description: data.workOrderHeader.Description,
          PlannerGroup: data.workOrderHeader.PlannerGroup,
          WorkCenter: data.workOrderHeader.WorkCenter,
          FunctLocation: data.workOrderHeader.FunctLocation,
          Equipment: data.workOrderHeader.Equipment,
          // OrdOperationNav Data
          OrdOperationNav: data.OrdOperationNav.results,
          // EquipBOMItemNav Data
          EquipBOMItemNav: data.selectedEquiBOM,
          // AddPartItemNav Data
          AddPartItemNav: data.AddPartsItems,
        };
        console.log(payload);
      },
    });
  }
);
