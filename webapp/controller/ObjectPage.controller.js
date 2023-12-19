sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "meg/workorder/utils/CallUtil",
    "sap/m/MessageBox",
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
    CallUtil,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("meg.workorder.controller.ObjectPage", {
      onInit: async function () {
        this.localModel = this.getOwnerComponent().getModel("localModel");
        // this.localModel.setProperty("/AddPartsItems", []);

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteObjectPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: async function (oEvent) {
        // sap.ui.core.BusyIndicator.show();
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

        var orderOps, orderOpLength, equipBOMItems, addPartsData;
        if (data && data.d.results.length > 0) {
          data = data.d.results[0];
          this.localModel.setProperty("/workOrderHeader", data);
          if (data && data.OrdOperationNav) {
            orderOps = data.OrdOperationNav.results;
            // orderOpLength = data.OrdOperationNav.results.length;
          }
          if (data && data.EquipBOMItemNav) {
            this.getEquipBOMData(data.EquipBOMItemNav.results, orderOps);
            // equipBOMItems = data.EquipBOMItemNav.results;
          }
          if (data && data.AddPartItemNav) {
            // this.getEquipBOMData(data.AddPartItemNav.results);
            this.getAddPartsData(data.AddPartItemNav.results);
            // addPartsData = data.AddPartItemNav.results;
          }
        }
        this.localModel.setProperty("/orderOperations", orderOps);
        // this.localModel.setProperty("/AddPartsItems", addPartsData);
        // this.localModel.setProperty("/equipBOMItems", equipBOMItems);
      },

      getAddPartsData: async function (data) {
        var oTableAdd = this.getView().byId("addPartItemsID");
        oTableAdd.setShowOverlay(true);
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
            var SL = "";
            if (data[i].StorageLocation != "") {
              SL = data[i].StorageLocation;
            }
            data[i].StorageLocation = storageLoc.d.results;
            if (storageLoc.d.results.length > 1) {
              data[i].isEnabled = true;
              data[i].isSelected = false;
            } else {
              data[i].isEnabled = false;
              data[i].isSelected = true;
            }
            if (SL != "") {
              data[i].StorageLocation.StorageLocation = SL;
            }
          }
        }

        this.localModel.setProperty("/AddPartsItems", data);
        oTableAdd.setShowOverlay(false);
      },

      getEquipBOMData: async function (data, orderOps) {
        var oTable = this.getView().byId("equiBOMID");
        oTable.setShowOverlay(true);
        oTable.removeSelections(true);
        var url = this.serviceUrl;
        var plant = this.localModel.getData().workOrderHeader.Plant;

        let i = 0;
        for (i = 0; i < data.length; i++) {
          if (orderOps.length == 1) {
            data[i].Operation = orderOps[0].OperationNum;
            data[i].OperationDesc = orderOps[0].OperationDesc;
          }
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
            var SL = "";
            if (data[i].StorageLocation != "") {
              SL = data[i].StorageLocation;
            }
            data[i].StorageLocation = storageLoc.d.results;
            if (storageLoc.d.results.length > 1) {
              data[i].isEnabled = true;
              data[i].isSelected = false;
            } else {
              data[i].isEnabled = false;
              data[i].isSelected = true;
            }
            if (SL != "") {
              data[i].StorageLocation.StorageLocation = SL;
            }
          }
        }
        this.localModel.setProperty("/equipBOMItems", data);
        oTable.setShowOverlay(false);
      },

      onOperationValueHelp: async function (oEvent) {
        var bindingPath =
          oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel
            .sPath;
        this.OPValueHelpIndex = bindingPath.split("/")[2];
        if (!this._oDialogOperation) {
          this._oDialogOperation = sap.ui.xmlfragment(
            "meg.workorder.fragments.OrderOperation",
            this
          );
          this.getView().addDependent(this._oDialogOperation);
          this.VHID = "Operation";
          var data = await CallUtil.callGetData(
            this.serviceUrl +
              "/ZUSPPMEG01_OPERATION_F4Set?$format=json&$filter=WorkOrder eq '" +
              this.WorkOrderId +
              "'"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_OPERATION_F4Set", data);
          this._oDialogOperation.open();
        }
        // this.byId("OperationInput").removeAllTokens();
        this.VHID = "Operation";
        this._oDialogOperation.open();
      },

      onAddOperationValueHelp: async function (oEvent) {
        var bindingPath =
          oEvent.getSource().oPropagatedProperties.oBindingContexts.localModel
            .sPath;
        this.AddOPValueHelpIndex = bindingPath.split("/")[2];
        if (!this._oDialogAddOperation) {
          this._oDialogAddOperation = sap.ui.xmlfragment(
            "meg.workorder.fragments.OrderOperationAdd",
            this
          );
          this.getView().addDependent(this._oDialogAddOperation);
          this.VHID = "AddOperation";
          var data = await CallUtil.callGetData(
            this.serviceUrl +
              "/ZUSPPMEG01_OPERATION_F4Set?$format=json&$filter=WorkOrder eq '" +
              this.WorkOrderId +
              "'"
          );
          data = data.d.results;
          this.localModel.setProperty("/ZUSPPMEG01_ADD_OPERATION_F4Set", data);
          this._oDialogAddOperation.open();
        }
        // this.byId("OperationInput").removeAllTokens();
        this.VHID = "AddOperation";
        this._oDialogAddOperation.open();
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
        var orderOps = this.localModel.getData().orderOperations;
        var Operation = "",
          Description = "";
        if (orderOps.length == 1) {
          Operation = orderOps[0].OperationNum;
          Description = orderOps[0].OperationDesc;
        }
        var obj = {
          Part: "",
          PartDesc: "",
          DesiredQuan: "",
          Operation: Operation,
          OperationDesc: Description,
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
        var orderOps = this.localModel.getData().orderOperations;

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

        if (orderOps && orderOps.length == 1) {
          addItemsData[this.valueHelpIndex].Operation =
            orderOps[0].OperationNum;
          addItemsData[this.valueHelpIndex].OperationDesc =
            orderOps[0].OperationDesc;
        }

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

      onSelectOperation: function (oEvent) {
        var Operation = oEvent.getParameter("selectedItem").getTitle();
        var Description = oEvent.getParameter("selectedItem").getDescription();
        var data =
          this.localModel.getData().equipBOMItems[this.OPValueHelpIndex];
        data.Operation = Operation;
        data.OperationDesc = Description;
        this.localModel.refresh();
      },

      onAddSelectOperation: function (oEvent) {
        var Operation = oEvent.getParameter("selectedItem").getTitle();
        var Description = oEvent.getParameter("selectedItem").getDescription();
        var data =
          this.localModel.getData().AddPartsItems[this.AddOPValueHelpIndex];
        data.Operation = Operation;
        data.OperationDesc = Description;
        this.localModel.refresh();
      },

      onValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Part", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },

      passWOReservation: async function (oEvent) {
        var oEquiBOMTable = this.byId("equiBOMID");
        var aSelectedPaths = oEquiBOMTable.getSelectedContextPaths();
        var data = this.localModel.getData();
        this.localModel.setProperty("/selectedEquiBOM", []);
        var url = this.serviceUrl + "/ZUSPPMEG01_WORK_ORDER_HEADERSet";

        if (aSelectedPaths && aSelectedPaths.length > 0) {
          aSelectedPaths.forEach(function (sPath) {
            var index = sPath.split("/")[2];
            var equiData = data.equipBOMItems[index];
            if (data.equipBOMItems[index].DesiredQuan == "") {
              // data.equipBOMItems[index].DesiredQuanVS = "Error";
            }
            if (data.equipBOMItems[index].Operation == "") {
              // data.equipBOMItems[index].OperationVS = "Error";
            }
            equiData = {
              WorkOrder: equiData.WorkOrder,
              Part: equiData.Part,
              PartDesc: equiData.PartDesc,
              BOMQuan: equiData.BOMQuan,
              DesiredQuan: equiData.DesiredQuan,
              Operation: equiData.Operation,
              Select: equiData.Select,
              StorageLocation: equiData.StorageLocation.StorageLocation,
            };
            data.selectedEquiBOM.push(equiData);
          });
        }

        if (data.orderOperations) {
          data.orderOperations.forEach(function (orderOp) {
            delete orderOp.__metadata;
            delete orderOp.Status;
          });
        }

        if (data.AddPartsItems) {
          data.AddPartsItems.forEach(function (addPart) {
            addPart.WorkOrder = data.workOrderHeader.WorkOrder;
            delete addPart.isEnabled;
            delete addPart.isSelected;
            if (addPart.StorageLocation) {
              addPart.StorageLocation = addPart.StorageLocation.StorageLocation;
            }
          });
        }

        // mandatory check
        var isRequiredCheck = true;
        if (data.selectedEquiBOM) {
          data.selectedEquiBOM.forEach(function (equiBOM) {
            if (
              equiBOM.DesiredQuan == "" ||
              equiBOM.Operation == "" ||
              equiBOM.StorageLocation == "" ||
              equiBOM.StorageLocation == undefined
            ) {
              isRequiredCheck = false;
            }
          });
        }
        if (data.AddPartsItems) {
          data.AddPartsItems.forEach(function (addPart) {
            if (
              addPart.DesiredQuan == "" ||
              addPart.Operation == "" ||
              addPart.StorageLocation == "" ||
              addPart.StorageLocation == undefined
            ) {
              isRequiredCheck = false;
            }
          });
        }
        if (!isRequiredCheck) {
          MessageBox.warning(
            "PLEASE ENTER THE DESIRED QUANTITY, OPERATION AND STORAGE LOCATION FOR THE SELECTED ITEMS"
          ),
            {
              styleClass: "alignCenter",
            };
          return;
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
          /** OrdOperationNav Data  */
          OrdOperationNav: data.orderOperations,
          /** EquipBOMItemNav Data  */
          EquipBOMItemNav: data.selectedEquiBOM,
          /** AddPartItemNav Data  */
          AddPartItemNav: data.AddPartsItems,
          LogNav: [{}],
        };

        var response = await CallUtil.callPostData(url, payload);
        console.log(response);
        this.localModel.refresh();
      },
      onBomItemSel: function (oEvent) {
        var isSelected = oEvent.getParameter("selected");
        var sPath = oEvent.getParameter("listItem").getBindingContextPath();
        var index = sPath.split("/")[2];
        var equipBOMItem = this.localModel.getData().equipBOMItems[index];
        if (equipBOMItem.DesiredQuan == "") {
          equipBOMItem.DesiredQuan = equipBOMItem.BOMQuan;
        }
        this.localModel.refresh();
        // else {
        //   equipBOMItem.DesiredQuan = "";
        // }
      },
    });
  }
);
