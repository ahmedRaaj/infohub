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
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.excel.common.ExcelType;
import org.infineon.infohub.excel.upload.InvalidExcelException;
import org.infineon.infohub.excel.upload.ScannedExcelCLMPartner;
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
public class ExcelBatchUpdateBeanSAP implements Serializable {

    private List<Partner> partners;

    private String[] inboundCols = {"SNDPRN", "SNDPRT", "MESTYP", "MESCOD"};
    private String[] outboundCols = {"RCVPRN", "RCVPRT", "MESTYP", "MESCOD"};
    private String[] clmCols = {"Customer", "Name 1", "City", "Description"};

    private List<ScannedExcelPartner> inbounds = new ArrayList<>();
    private List<ScannedExcelPartner> outbounds = new ArrayList<>();
    private Workbook clmWorkbook;
    private ScannedExcelCLMPartner clm;

    private List<String> inboundExcelNames = new ArrayList<>();
    private List<String> outboundExcelNames = new ArrayList<>();
    private List<String> clmExcelName = new ArrayList<>();

    @EJB
    PartnerFacadeREST partnerFacade;

    public String onFlowProcess(FlowEvent event) {
        String newStep = event.getNewStep();

        if (newStep.equals("outbound")) {
            if (inbounds.size() == 2) {
                return newStep;
            } else {
                JsfUtil.addErrorMessage("Please upload 2 inbound technical file before clicking next");
                return event.getOldStep();
            }
        } else if (newStep.equals("clm")) {
            if (outbounds.size() == 2) {
                return newStep;
            } else {
                JsfUtil.addErrorMessage("Please upload 2 outbound technical file before clicking next");
                return event.getOldStep();
            }
        }
        return event.getNewStep();
    }

    public void updatePartners() {
        try {
            Objects.requireNonNull(inbounds);
            Objects.requireNonNull(outbounds);

            List<Partner> mainPartners = getPartners();
            partnerFacade.updateTargetbyWith(mainPartners, inbounds.get(0).getDataList());
            partnerFacade.updateTargetbyWith(mainPartners, inbounds.get(1).getDataList());
            partnerFacade.updateTargetbyWith(mainPartners, outbounds.get(0).getDataList());
            partnerFacade.updateTargetbyWith(mainPartners, outbounds.get(1).getDataList());
            try {
                clm = new ScannedExcelCLMPartner(clmWorkbook, clmCols, 0, mainPartners);
                List<Partner> clmList = clm.getDataList();
                List<Partner> result = partnerFacade.updateTargetbyWith(mainPartners, clmList);
                partnerFacade.edit(result);
                JsfUtil.addSuccessMessage("Update Succeeded");
            } catch (Exception e) {
                JsfUtil.addErrorMessage("Update Failed");
                System.out.println(e.getMessage() + e);
            }

        } catch (Exception ex) {
            JsfUtil.addErrorMessage("Update Failed");

            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    public void handleFileUploadInbound(FileUploadEvent ev) {
        if (inbounds.size() == 2) {
            JsfUtil.addErrorMessage("Maximum 2. please click next, or refresh the page to re-upload");
            return;
        }
        try (InputStream in = ev.getFile().getInputstream()) {
            ScannedExcelPartner excel = getScannedExcel(in, inboundCols, ExcelType.TechInbound, 0);
            if (excel != null) {
                inbounds.add(excel);
                inboundExcelNames.add(ev.getFile().getFileName());
            } else {
                inbounds.clear();
                inboundExcelNames.clear();
            }
        } catch (IOException ex) {
            JsfUtil.addErrorMessage("File could not Found: IO exception");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
            inbounds.clear();
            inboundExcelNames.clear();
        }

    }

    public void handleFileUploadOutbound(FileUploadEvent ev) {
        if (outbounds.size() == 2) {
            JsfUtil.addErrorMessage("Maximum 2. please click next, or refresh the page to re-upload");
            return;
        }
        try (InputStream in = ev.getFile().getInputstream()) {
            ScannedExcelPartner excel = getScannedExcel(in, outboundCols, ExcelType.TechOutbound, 0);
            if (excel != null) {
                outbounds.add(excel);
                outboundExcelNames.add(ev.getFile().getFileName());
            } else {
                outbounds.clear();
                outboundExcelNames.clear();
            }
        } catch (IOException ex) {
            JsfUtil.addErrorMessage("File could not Found: IO exception");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
            outbounds.clear();
            outboundExcelNames.clear();
        }

    }

    public void handleFileUploadCLM(FileUploadEvent ev) throws IOException, InvalidFormatException {

        try (InputStream in = ev.getFile().getInputstream()) {
            this.clmWorkbook = WorkbookFactory.create(in);
            clmExcelName.clear();
            clmExcelName.add(ev.getFile().getFileName());
        } catch (Exception ex) {
            JsfUtil.addErrorMessage("Could not upload this file");
            Logger.getLogger(ExcelBatchUpdateBeanSAP.class.getName()).log(Level.SEVERE, null, ex);
            clmExcelName.clear();
            this.clmWorkbook = null;
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

    public String[] getInboundCols() {
        return inboundCols;
    }

    public void setInboundCols(String[] inboundCols) {
        this.inboundCols = inboundCols;
    }

    public List<ScannedExcelPartner> getInbounds() {
        return inbounds;
    }

    public List<ScannedExcelPartner> getOutbounds() {
        return outbounds;
    }

    public List<String> getInboundExcelNames() {
        return inboundExcelNames;
    }

    public void setInboundExcelNames(List<String> inputExcelNames) {
        this.inboundExcelNames = inputExcelNames;
    }

    public String[] getOutboundCols() {
        return outboundCols;
    }

    public void setOutboundCols(String[] outboundsCols) {
        this.outboundCols = outboundsCols;
    }

    public String[] getClmCols() {
        return clmCols;
    }

    public void setClmCols(String[] clmCols) {
        this.clmCols = clmCols;
    }

    public List<String> getOutboundExcelNames() {
        return outboundExcelNames;
    }

    public void setOutboundExcelNames(List<String> outboundExcelNames) {
        this.outboundExcelNames = outboundExcelNames;
    }

    public List<String> getClmExcelName() {
        return clmExcelName;
    }

    public void setClmExcelName(List<String> clmExcelName) {
        this.clmExcelName = clmExcelName;
    }

}
