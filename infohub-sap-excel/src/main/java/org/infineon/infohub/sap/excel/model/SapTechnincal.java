/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.sap.excel.model;

import java.io.Serializable;

/**
 *
 * @author Raaj
 */
public class SapTechnincal implements Serializable {

    private String messageType;
    private String messageCode;
    private String partnerNo;
    private Direction type;

    public SapTechnincal(SapExcelType type) {
        if(type == SapExcelType.Invalid || type == SapExcelType.Customer) throw new IllegalArgumentException("This sap excel is not tecnical file");
        if (type == SapExcelType.PC1In || type == SapExcelType.PIFin) {
            this.type = Direction.Inbound;
        }else{
            this.type = Direction.Outbound;
        }
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getMessageCode() {
        return messageCode;
    }

    public void setMessageCode(String messageCode) {
        if (messageCode.length() < 3) {
            this.messageCode = ("000" + messageCode).substring(messageCode.length());
        } else {
            this.messageCode = messageCode;
        }
    }

    public String getPartnerNo() {
        return partnerNo;
    }

    public void setPartnerNo(String partnerNo) {
        if (partnerNo.length() < 10) {
            this.partnerNo = ("0000000000" + partnerNo).substring(partnerNo.length());
        } else {
            this.partnerNo = partnerNo;
        }
    }

    public Direction getType() {
        return type;
    }

    public void setType(Direction type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "SapTechnincal{" + " partnerNo=" + partnerNo + ", messageType=" + messageType + ", messageCode=" + messageCode + ", type=" + type + '}';
    }

    public String getPartnerTechical() {
        return this.type + "IDOC-" + this.messageType + (this.messageCode == null ? "" :  "-"+messageCode);
    }

    public String getTechTerms() {
        return "IDOC-" + this.messageType +(this.messageCode == null ? "" :   "-"+messageCode);
    }

}
