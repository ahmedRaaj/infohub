/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.sap.excel.model;

/**
 *
 * @author Raaj
 */
public enum CustomerColName {
    Customer("Customer"),Name1("Name 1"),City("City"),Description("Description");
     private final String name;
    private CustomerColName(String value) { 
        this.name = value;
    }

    @Override
    public String toString() {
        return name; //To change body of generated methods, choose Tools | Templates.
    }
}
