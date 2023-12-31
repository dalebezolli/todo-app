sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/CheckBox",
    "sap/m/SplitAppMode",
], function (Controller, JSONModel, Filter, FilterOperator, ColumnListItem, Text, Input, Button, CheckBox, SplitAppMode) {
    "use strict";

    return Controller.extend("com.bezolli.primary.controller.Home", {
        onInit: function() {
            const oModel = new JSONModel({
                selectedList: -1
            });
            this.getView().setModel(oModel, "state");
            
            this.updateTodoListDetails();
        },
        displayTodoListDetails: function(iTodoListId) {
            this.getView().getModel("state").setProperty("/selectedList", iTodoListId);

            const oDetails = this.getView().byId("details");

            oDetails.bindAggregation("items", {
                path: "/Todo",
                filters: new Filter("list_ID", FilterOperator.EQ, iTodoListId),
                template: new ColumnListItem({ 
                cells: [
                    new CheckBox({ selected: "{completed}", select: function() { this.updateTodoListDetails() }.bind(this) }),
                    new Text({ text: "{text}", visible: true }),
                    new Button({ icon: "sap-icon://edit", type: "Transparent", press: this.onEnableEditTodoName.bind(this) }),
                    new Button({ icon: "sap-icon://delete", type: "Transparent", press: this.onDeleteTodoItem })
                ]
                })
            });

            const oSplitContainer = this.getView().byId("container");
            oSplitContainer.setMode(SplitAppMode.ShowHideMode);
        },
        displayTodoListName: function(iTodoListId) {
            const oTitleControl = this.getView().byId("detailsTitle");
            const oTitleInputControl = this.getView().byId("detailsTitleInput");

            oTitleControl.bindElement({ path: `/TodoList(${ iTodoListId })` });
            oTitleControl.bindProperty("text", { path: `name` });

            oTitleInputControl.bindElement({ path: `/TodoList(${ iTodoListId })` });
            oTitleInputControl.bindProperty("value", { path: `name` });
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
                    const oCurrentTodoListDetails = mTodoListDetails.get(todoListId) || { total: 0, complete: 0 };

                    oTile.setSubheader(`Total - ${oCurrentTodoListDetails.total}\nComplete - ${oCurrentTodoListDetails.complete}`);
                }
            }.bind(this));
        },
        onCreateList: function() {
            const oList = this.getView().byId("list");
            const iPosition = oList.getBinding("content").getContexts().length;
            oList.getBinding("content").create({
                "ID": iPosition + 1,
                "name": "New List"
            }, null, true);

            oList.getAggregation("content")[iPosition].firePress();
        },
        onCreateTodo: function() {
            const iSelectedListID = this.getView().getModel("state").getProperty("/selectedList");
            const oModel = this.getView().getModel().bindList("/Todo")

            oModel.requestContexts().then(function(aContexts) {
                const aTodos = aContexts.map(oContext => oContext.getObject());
                
                oModel.create({
                    ID:        aTodos.length + 1,
                    text:      "New Todo",
                    completed: false,
                    list_ID:   iSelectedListID
                });

                this.displayTodoListDetails(iSelectedListID);
                this.displayTodoListName(iSelectedListID);
                this.updateTodoListDetails();
            }.bind(this));
        },
        onDisplayTodoListDetails: function(oEvent) {
            const iTodoListId = oEvent.getSource().getBindingContext().getProperty("ID");
            this.displayTodoListDetails(iTodoListId);
            this.displayTodoListName(iTodoListId);
        },
        onEnableEditTodoListName: function() {
            const oTitleControl = this.getView().byId("detailsTitle");
            const oTitleInputControl = this.getView().byId("detailsTitleInput");

            oTitleControl.setVisible(false);
            oTitleInputControl.setVisible(true);
        },
        onDisableEditTodoListName: function() {
            const oTitleControl = this.getView().byId("detailsTitle");
            const oTitleInputControl = this.getView().byId("detailsTitleInput");
            const iTodoListId = this.getView().getModel("state").getProperty("/selectedList");

            // TODO: find a way to work with the binding and not around it
            oTitleControl.setText(oTitleInputControl.getValue());
            const oTileListContent = this.byId("list").getAggregation("content");
            for(const oTile of oTileListContent) {
                const iCurrentTodoListId = oTile.getBindingContext().getProperty("ID");
                if(iCurrentTodoListId !== iTodoListId) {
                    continue;
                }

                oTile.setHeader(oTitleInputControl.getValue());
            }

            oTitleControl.setVisible(true);
            oTitleInputControl.setVisible(false);
        },
        onEnableEditTodoName: function(oEvent) {
            const oColumnListItem = oEvent.getSource().getParent();
            const oNameCell = oColumnListItem.getCells()[1];
            const oInputNameCell = new Input({ value: "{text}" });

            oInputNameCell.attachSubmit(null, this.onDisableEditTodoName);

            oColumnListItem.removeCell(oNameCell);
            oColumnListItem.insertCell(oInputNameCell, 1);
        },
        onDisableEditTodoName: function(oEvent) {
            const oColumnListItem = oEvent.getSource().getParent();
            const oInputNameCell = oColumnListItem.getCells()[1];
            const oNameCell = new Text({ text: "{text}" });

            oColumnListItem.removeCell(oInputNameCell);
            oColumnListItem.insertCell(oNameCell, 1);
        },
        onDeleteTodoList: function() {
            const iTodoListId = this.getView().getModel("state").getProperty("/selectedList");
            this.getOwnerComponent().getModel().delete(`/TodoList(${iTodoListId})`);
        },
        onDeleteTodoItem: function(oEvent) {
            oEvent.getSource().getParent().getBindingContext().delete();
        }
    });
});