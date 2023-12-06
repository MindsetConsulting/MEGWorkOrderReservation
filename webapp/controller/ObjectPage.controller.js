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
        this.localModel.setProperty("/AddPartsItems", []);
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
              data.equipBOMItems[index].DesiredQuanVS = "Error";
            }
            if (data.equipBOMItems[index].Operation == "") {
              data.equipBOMItems[index].OperationVS = "Error";
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
            if (equiBOM.DesiredQuan == "" || equiBOM.Operation == "") {
              isRequiredCheck = false;
            }
          });
        }
        if (data.AddPartsItems) {
          data.AddPartsItems.forEach(function (addPart) {
            if (addPart.DesiredQuan == "" || addPart.Operation == "") {
              isRequiredCheck = false;
            }
          });
        }
        if (!isRequiredCheck) {
          MessageBox.error(
            "Please enter the Desired Quantity and Operation for the selected Items"
          );
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

        // var payload = {
        //   WorkOrder: "5001002",
        //   Plant: "7300",
        //   OrderType: "ZOCR",
        //   Description: "",
        //   PlannerGroup: "",
        //   WorkCenter: "ELECTRO",
        //   FunctLocation: "7300-FINI-CRAN-CRAN",
        //   Equipment: "80000138",
        //   OrdOperationNav: [
        //     {
        //       WorkOrder: "8001002",
        //       OperationNum: "0010",
        //       OperationDesc: "EMT - fixes Crane",
        //     },
        //   ],
        //   EquipBOMItemNav: [
        //     {
        //       WorkOrder: "8001002",
        //       Part: "16000000014",
        //       PartDesc: "PUMP",
        //       BOMQuan: "1.000 ",
        //       DesiredQuan: "2",
        //       Operation: "ops123",
        //       Select: false,
        //       StorageLocation: "7372",
        //     },
        //     {
        //       WorkOrder: "8001002",
        //       Part: "16000000031",
        //       PartDesc: "PUMP",
        //       BOMQuan: "1.000 ",
        //       DesiredQuan: "3",
        //       Operation: "10",
        //       Select: false,
        //       StorageLocation: "7372",
        //     },
        //   ],
        //   AddPartItemNav: [
        //     {
        //       WorkOrder: "8001002",
        //       Part: "16000000029",
        //       PartDesc: "",
        //       DesiredQuan: "2",
        //       Operation: "10",
        //       StorageLocation: "7372",
        //     },
        //     {
        //       WorkOrder: "8001002",
        //       Part: "16000000007",
        //       PartDesc: "",
        //       DesiredQuan: "3",
        //       Operation: "10",
        //       StorageLocation: "7372",
        //     },
        //   ],
        //   LogNav: [{}],
        // };
        console.log(payload);

        var response = await CallUtil.callPostData(url, payload);
        console.log(response);
      },
    });
  }
);
