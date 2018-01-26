/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Named;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.excel.common.ExcelType;
import org.infineon.infohub.excel.upload.InvalidExcelException;
import org.infineon.infohub.excel.upload.ScannedExcelPartner;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.web.util.JsfUtil;
import org.primefaces.event.FileUploadEvent;
import org.primefaces.event.FlowEvent;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class ExcelBatchUpdateBeanContact implements Serializable {

    private List<Partner> partners;
    private int tabNo = 2;

    private String[] contactsCols = {"PARTNERNUMBER", "CONTACTNAME", "CONTACTTYPE", "EMAIL", "TELEPHONE"};

    private ScannedExcelPartner contacts;

    private List<String> contactExcelName = new ArrayList<>();

    @EJB
    PartnerFacadeREST partnerFacade;

    public void updatePartners() {
        try {
            Objects.requireNonNull(contacts);

            List<Partner> mainPartners = getPartners();
            List<Partner> result = partnerFacade.updateTargetbyWith(mainPartners, contacts.getDataList(), true);
            partnerFacade.edit(result);
            JsfUtil.addSuccessMessage("Update done");

        } catch (Exception ex) {
            JsfUtil.addErrorMessage("Something went wrong, Update not succesfull");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    public String onFlowProcess(FlowEvent event) {
        String newStep = event.getNewStep();
        if (newStep.equals("update")) {
            if (contacts != null) {
                return newStep;
            } else {
                JsfUtil.addErrorMessage("Please upload the excel file first.");
                return event.getOldStep();
            }
        }
        return event.getNewStep();
    }

    public void handleFileUploadInbound(FileUploadEvent ev) {
        try (InputStream in = ev.getFile().getInputstream()) {
            contacts = getScannedExcel(in, contactsCols, ExcelType.Contact, tabNo);
            if (contacts != null) {
                contactExcelName.clear();
                contactExcelName.add(ev.getFile().getFileName());
            } else {
                contacts = null;
                contactExcelName.clear();
            }
        } catch (IOException ex) {
            JsfUtil.addErrorMessage("File could not Found: IO exception");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
            contacts = null;
            contactExcelName.clear();
        }

    }

    private ScannedExcelPartner getScannedExcel(InputStream input, String[] headers, ExcelType type, int positon) {
        ScannedExcelPartner excel = null;
        try {
            excel = new ScannedExcelPartner(input, headers, positon, type);
        } catch (IOException ex) {
            JsfUtil.addErrorMessage("File not Found: IO exception");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InvalidFormatException ex) {
            JsfUtil.addErrorMessage("Invalid Format, Cant read the Excel,Please upload a excel file");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InvalidExcelException ex) {
            JsfUtil.addErrorMessage("Invalid Excel, Could not find the listed colums, please update the columns mapping in the left and try again");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
        }
        return excel;
    }

    public List<Partner> getPartners() {
        if (partners == null) {
            partners = partnerFacade.findAll();
        }
        return partners;
    }

    public void setPartners(List<Partner> partners) {
        this.partners = partners;
    }

    public String[] getContactsCols() {
        return contactsCols;
    }

    public void setContactsCols(String[] contactsCols) {
        this.contactsCols = contactsCols;
    }

    public ScannedExcelPartner getContacts() {
        return contacts;
    }

    public void setContacts(ScannedExcelPartner contacts) {
        this.contacts = contacts;
    }

    public List<String> getContactExcelName() {
        return contactExcelName;
    }

    public void setContactExcelName(List<String> contactExcelName) {
        this.contactExcelName = contactExcelName;
    }

    public int getTabNo() {
        return tabNo;
    }

    public void setTabNo(int tabNo) {
        this.tabNo = tabNo;
    }

}
