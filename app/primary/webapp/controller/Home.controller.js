sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/StandardListItem",
], function (Controller, StandardListItem) {
    "use strict";

    return Controller.extend("com.bezolli.primary.controller.Home", {
        onInit: function () {
                var oModel = this.getOwnerComponent().getModel("kati");
                var oContext = oModel.bindContext("/TodoList");
                oContext.requestObject().then(function(oData) {
                    // Create a new JSON model
                    var oJsonModel = new sap.ui.model.json.JSONModel();
                    // Set the data to the JSON model
                    oJsonModel.setData(oData);
                    // Set the model to the view
                    this.getView().setModel(oJsonModel, "zz");
                }.bind(this)).catch(function(oError){
                    console.error("Error", oError);
                });
            }

        });
});