sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/CheckBox",
    "sap/m/FlexBox",
    "sap/m/SplitAppMode",
], function (Controller, Filter, FilterOperator, ColumnListItem, Text, CheckBox, FlexBox, SplitAppMode) {
    "use strict";

    return Controller.extend("com.bezolli.primary.controller.Home", {
        onInit: function() {
            this.updateTodoListDetails();
        },
        displayDetails: function(oEvent) {
            const oDetails = this.getView().byId("details");
            const oTodoList = oEvent.getSource().getBindingContext();
            const oTextObject = new Text({ text: "{text}" });
            oTextObject.addStyleClass("sapUiTinyMargin");

            oDetails.bindAggregation("items", {
                path: "/Todo",
                filters: new Filter("list_ID", FilterOperator.EQ, oTodoList.getProperty("ID")),
                template: new ColumnListItem({ 
                cells: [
                    new CheckBox({ selected: "{completed}", select: function() { this.updateTodoListDetails() }.bind(this) }),
                    oTextObject,
                    new Text({ text: "Test" }),
                ]
                })
            });

            const oSplitContainer = this.getView().byId("container");
            oSplitContainer.setMode(SplitAppMode.ShowHideMode);
            this.getView().byId("detailsTitle").setText(oTodoList.getProperty("name"));
        },
        updateTodoListDetails: function() {
            this.getOwnerComponent().getModel().bindList("/Todo", null, null).requestContexts().then(function(aContexts) {
                const aTodos = aContexts.map(oContext => oContext.getObject());
                const mTodoListDetails = new Map();
                for(const oData of aTodos) {
                    const oTodoListDetails = mTodoListDetails.get(oData.list_ID) || { total: 0, complete: 0 };

                    oTodoListDetails.total++;
                    if(oData.completed) oTodoListDetails.complete++;

                    mTodoListDetails.set(oData.list_ID, oTodoListDetails);
                }

                const oTileListContent = this.byId("list").getAggregation("content");
                for(const oTile of oTileListContent) {
                    const todoListId = oTile.getBindingContext().getProperty("ID");
                    const oCurrentTodoListDetails = mTodoListDetails.get(todoListId);

                    oTile.setSubheader(`Total - ${oCurrentTodoListDetails.total}\nComplete - ${oCurrentTodoListDetails.complete}`);
                }
            }.bind(this));
        }
    });
});