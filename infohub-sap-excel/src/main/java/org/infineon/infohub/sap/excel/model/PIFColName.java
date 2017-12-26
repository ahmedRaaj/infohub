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
public enum PIFColName {
     PartnerNo("Partner No."),PartnerType("Partn.Type"),MESTYP("Message Type"),MESCOD("Message code"),OutPutMode("Output Mode"),InputMode("Processing");
     private final String name;
    private PIFColName(String value) { 
        this.name = value;
    }

    @Override
    public String toString() {
        return name; //To change body of generated methods, choose Tools | Templates.
    }
    
}
