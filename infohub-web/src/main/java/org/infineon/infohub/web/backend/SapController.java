/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.ValidatorException;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.Part;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.infineon.infohub.entities.SapUpdate;
import org.infineon.infohub.sap.excel.model.SapExcel;
import org.infineon.infohub.sap.excel.model.SapExcelType;
import org.infineon.infohub.sap.excel.model.SapPartner;
import org.infineon.infohub.sap.excel.service.SapSync;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.service.dao.SapUpdateFacadeREST;
import org.infineon.infohub.web.application.ApplicationBean;
import org.infineon.infohub.web.application.SapSyncEJB;

import org.infineon.infohub.web.util.JsfUtil;
import org.primefaces.event.FileUploadEvent;
import org.primefaces.model.UploadedFile;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class SapController implements Serializable {

    @Inject
    ApplicationBean appBean;
    @Inject
    SapSyncEJB sapEjb;
    @Inject
    SapUpdateFacadeREST sapFacade;
    @Inject
    PartnerController partnerController;

    private List<UploadedFile> uploadedFiles;
    private SapSync sap;
    private boolean filePC1In;
    private boolean filePC1Out;
    private boolean filePIFIn;
    private boolean filePIFOut;
    private boolean fileSapCustomers;

    private Integer pc1InProgress = 0;
    private Integer pc1OutProgress = 0;
    private Integer pifInProgress = 0;
    private Integer pifOutProgress = 0;
    private Integer customerProgress = 0;

    private static final Logger log = Logger.getLogger("SapController");
    private int fileCount = 0;
    private String history = "";
    
    private List<SapUpdate> sapUpdates;

    @EJB
    PartnerFacadeREST partnerFacade;
    @Inject
    ActiveDirectoryUser user;

    @PostConstruct
    public void init() {
        uploadedFiles = new ArrayList<>();

        log.setLevel(Level.ALL);

    }

    public List<SapUpdate> getSapUpdates() {
        if(sapUpdates == null) sapUpdates = sapFacade.findAll();
        return sapUpdates;
    }

    public void setSapUpdates(List<SapUpdate> sapUpdates) {
        this.sapUpdates = sapUpdates;
    }
    
    

    public void upload() {
        if (sap == null) {
            return;
        }
        if (sap.getSapTechExcels().size() == 5 && filePC1In && filePC1Out && filePIFIn && filePIFOut && fileSapCustomers) {
            sap.processSapFiles();
            Set<SapPartner> sapPartners = sap.getSapPartners();
            System.out.println("###Total Partner to be synced: " + sapPartners.size());
            appBean.setSapInitiated(true);
           

            appBean.setSapDesc(user.getGivenName() + " @ " + new Date());
            sapEjb.syncSap(sapPartners,user.getGivenName()); //calling async method
            this.reset();
        } else {
            JsfUtil.addErrorMessage("Sap Sync cant be proceed, Please Upload all the 5 required files");

        }

        // Send only one email.
    }

    public void handleFileUpload(FileUploadEvent event) {
        StringBuilder builder = new StringBuilder();
        if (sap == null) {
            sap = new SapSync();
        }
        System.out.println("Handiling: " + event.getFile().getFileName());
        java.util.Date date = new java.util.Date();
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
        builder.append(sdf.format(date) + " Uploaded File Name: ").append(event.getFile().getFileName());
        List<FacesMessage> msgs = new ArrayList<FacesMessage>();
        UploadedFile file = event.getFile();

        try {
            InputStream is = file.getInputstream();
            SapExcel sapExcel = new SapExcel(is);

            SapExcelType fileType = sapExcel.getFileType();
            if (fileType == SapExcelType.PC1In && !filePC1In) {
                sap.getSapTechExcels().add(sapExcel);
                uploadedFiles.add(event.getFile());
                filePC1In = true;
                pc1InProgress = 100;
            } else if (fileType == SapExcelType.PC1Out && !filePC1Out) {
                sap.getSapTechExcels().add(sapExcel);
                uploadedFiles.add(event.getFile());
                filePC1Out = true;
                pc1OutProgress = 100;
            } else if (fileType == SapExcelType.PIFin && !filePIFIn) {
                sap.getSapTechExcels().add(sapExcel);
                uploadedFiles.add(event.getFile());
                filePIFIn = true;
                pifInProgress = 100;
            } else if (fileType == SapExcelType.PIFout && !filePIFOut) {
                sap.getSapTechExcels().add(sapExcel);
                uploadedFiles.add(event.getFile());
                filePIFOut = true;
                pifOutProgress = 100;
            } else if (fileType == SapExcelType.Customer && !fileSapCustomers) {
                sap.getSapTechExcels().add(sapExcel);
                uploadedFiles.add(event.getFile());
                fileSapCustomers = true;
                customerProgress = 100;
            } else {
                log.severe("invalid or mulitple same file found");
                if (fileType != SapExcelType.Invalid) {
                    JsfUtil.addErrorMessage("File: " + event.getFile().getFileName() + " with type: " + fileType.toString() + " Already Exist ");
                } else {
                    JsfUtil.addErrorMessage("File: " + event.getFile().getFileName() + " with type: " + fileType.toString() + " is Not  Suported");
                }

            }
            builder.append(" Type: ").append(fileType.toString());

        } catch (InvalidFormatException e) {
            JsfUtil.addErrorMessage("File: " + event.getFile().getFileName() + " Is Invalid to SAP sync");

        } catch (IOException ex) {
            JsfUtil.addErrorMessage("File: " + event.getFile().getFileName() + " Is Having IO Exception");

        } finally {
            // builder.append("&lt;br /&gt;");
        }
        fileCount = uploadedFiles.size();

//        UIComponent parent = event.getComponent().getParent();
//        parent.getChildren().stream().forEach(c -> System.out.println("#" + c.getClientId() + "#"));
        history += builder.toString() + "<br/>";

        FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formSap:progressBar");
        FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formSap:history");
        FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formSap:buttonLunch");

    }

    public void validateFile(FacesContext ctx,
            UIComponent comp,
            Object value) {
        List<FacesMessage> msgs = new ArrayList<FacesMessage>();
        Part file = (Part) value;
        try {
            InputStream is = file.getInputStream();
            SapExcel sapExcel = new SapExcel(is);
            if (!sapExcel.isValid()) {
                String msg = String.format("%s is not a valid sap file", (file == null ? "" : file.getSubmittedFileName()));
                msgs.add(new FacesMessage(msg));
            }
        } catch (Exception e) {
            msgs.add(new FacesMessage("Unknown File"));

        }

        if (!msgs.isEmpty()) {
            throw new ValidatorException(msgs);
        }
    }

    public int getFileCount() {
        return fileCount;
    }

    public void setFileCount(int fileCount) {
        this.fileCount = fileCount;
    }

    public Integer getPc1InProgress() {
        return pc1InProgress;
    }

    public void setPc1InProgress(Integer pc1InProgress) {
        this.pc1InProgress = pc1InProgress;
    }

//    public void upload() {
//        SapSync sync = new SapSync();
//
//        try {
//            sync.procssTechnicalFile(sync.getWorkBook(pc1In.getInputStream()));
//            sync.procssTechnicalFile(sync.getWorkBook(pc1Out.getInputStream()));
//            sync.procssTechnicalFile(sync.getWorkBook(pifIn.getInputStream()));
//            sync.procssTechnicalFile(sync.getWorkBook(pifOut.getInputStream()));
//
//            Map<String, List<SapTechnincal>> techMap = sync.getTechMap();
//
//            for (Map.Entry<String, List<SapTechnincal>> entry : techMap.entrySet()) {
//                System.out.println(entry.getKey());
//                for (SapTechnincal sapTechnincal : entry.getValue()) {
//                    System.out.println(sapTechnincal.getPartnerTechical());
//
//                }
//            }
//
//        } catch (InvalidSapExcelFileException ex) {
//            JsfUtil.addErrorMessage(ex, "error");
//            Logger.getLogger(SapController.class.getName()).log(Level.SEVERE, null, ex);
//        } catch (IOException ex) {
//            Logger.getLogger(SapController.class.getName()).log(Level.SEVERE, null, ex);
//        }
//
//    }
    public void processValidations() {
        FacesContext context = FacesContext.getCurrentInstance();
        System.out.println("Validating: *****");
    }

    private void reset() {
        sap = null;
        partnerController.reset(); //reset the partners list to reload the partner table. 
        uploadedFiles = new ArrayList<>();
        filePC1In = filePC1Out = filePIFIn = filePIFOut = fileSapCustomers = false;
        pc1OutProgress = pc1InProgress = pifInProgress = pifOutProgress = customerProgress = fileCount = 0;
    }

    public Integer getPc1OutProgress() {
        return pc1OutProgress;
    }

    public void setPc1OutProgress(Integer pc1OutProgress) {
        this.pc1OutProgress = pc1OutProgress;
    }

    public Integer getPifInProgress() {
        return pifInProgress;
    }

    public void setPifInProgress(Integer pifInProgress) {
        this.pifInProgress = pifInProgress;
    }

    public Integer getPifOutProgress() {
        return pifOutProgress;
    }

    public void setPifOutProgress(Integer pifOutProgress) {
        this.pifOutProgress = pifOutProgress;
    }

    public Integer getCustomerProgress() {
        return customerProgress;
    }

    public void setCustomerProgress(Integer customerProgress) {
        this.customerProgress = customerProgress;
    }

    public String getHistory() {
        return history;
    }

    public void setHistory(String history) {
        this.history = history;
    }

    public boolean isSapInitiated() {
        return appBean.isSapInitiated();
    }

    public String getSapDesc() {
        return appBean.getSapDesc();
    }

    public boolean isLunch() {
        return !(this.filePC1In && this.filePC1Out && this.filePIFIn && this.filePIFOut && this.fileSapCustomers);
    }
}
