/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.infineon.infohub.entities.MsgXref;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.excel.export.print.ExcelPrinter;
import org.infineon.infohub.excel.export.print.Printer;
import org.infineon.infohub.service.dao.AbstractFacade;
import org.infineon.infohub.service.dao.MsgXrefFacadeREST;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.web.util.JsfUtil;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class PartnerBackendBean extends AbstractBean<Partner> implements Serializable {

    private Partner partner;
    private List<Partner> partners;
    private List<Partner> filteredPartners;
    private String partnerId;
    private boolean edit;

    @EJB
    PartnerFacadeREST partnerFacade;
    @EJB
    MsgXrefFacadeREST messageFacade;

    @Inject
    ContactBackendBean contactBean;
    @Inject
    TechnicalBackendBean technicBean;
    @Inject
    CommentBackendBean commentBean;
    @Inject
    PartnerFilterBean filterBean;

    public PartnerBackendBean() {
        super(Partner.class);
    }

    @Override
    protected AbstractFacade<Partner> getFacade() {
        return partnerFacade;
    }

    @Override
    protected Partner getSelected() {
        return partner;
    }

    @Override
    public void reset() {
        partners = null;
        partner = new Partner();
        this.setEdit(false);

    }

    public void cancel() {
        this.setEdit(false);
        addSuccessMessage("Chnage reverted");
        
    }

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        if (partner != null && !partner.equals(this.partner)) {
            this.partner = partner;
            technicBean.setParent(partner);
            contactBean.setParent(partner);
            commentBean.setParent(partner);
        }

    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
        technicBean.setEdit(edit);
        contactBean.setEdit(edit);
        commentBean.setEdit(edit);
    }

    public void save() {
        if (partner.getPartnerNumber() != null && !partner.getPartnerNumber().equals("")) {
            technicBean.save();
            contactBean.save();
            commentBean.save();
            this.persist(JsfUtil.PersistAction.UPDATE);
            this.reset();
        }else{
            addErrorMessage("Partner Number Must not be empty");
        }

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

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public List<Partner> getFilteredPartners() {
        return filteredPartners;
    }

    public void setFilteredPartners(List<Partner> filterpartners) {
        this.filteredPartners = filterpartners;
    }

    //starting custom methods
    public Partner prepareCreate() {
        partner = new Partner();
        prepareEdit(null);
        return partner;
    }

    public Partner prepareCopy(String partnerId) {
        Partner found = getFacade().find(partnerId);
        if (found != null) {
            this.partner = new Partner(found);
            prepareEdit(null);
        } else {
            addErrorMessage("Partner Not found");
        }
        return found;
    }

    public void prepareEdit(String partnerId) {
        if (partnerId != null) {
            this.partner = getFacade().find(partnerId);
        }
        this.setEdit(true);
        technicBean.setParent(partner);
        contactBean.setParent(partner);
        commentBean.setParent(partner);

    }

    public void destroy(String partnerId) {
        Partner found = getFacade().find(partnerId);
        if (found != null) {
            getFacade().remove(found);
            partners.remove(found); // to-do check
        }

    }
    
     public void performPartnerFilter() {
        this.partners = partnerFacade.filter(filterBean.getSourceMessage(),filterBean.getTargetMessage(),
        filterBean.getConnection(),filterBean.getStanderd(),filterBean.isNonSap(),filterBean.isMissingIT(),filterBean.isLastSapUpdated());
        System.out.println("==>Filtered partners count: " + partners.size());
        //FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formPartner:tablePartner");
    }
     
         public void postProcessXLS(Object document) {
        HSSFWorkbook wb = (HSSFWorkbook) document;
        HSSFSheet sheet = wb.getSheetAt(0);
        HSSFRow header = sheet.getRow(0);
        sheet.setColumnHidden(0, true);
        sheet.setColumnHidden(1, true);

        List<MsgXref> msgs = messageFacade.findAll();
        Map<String, String> msgMap = new HashMap<>();
        for (MsgXref msg : msgs) {
            String key = msg.getMsg().trim();
            msgMap.put(key, msg.getMsgdescr().trim());
        }
        Printer print;

        if (this.filteredPartners != null) {
            print = new ExcelPrinter(this.filteredPartners, wb, msgMap);

        } else {
            print = new ExcelPrinter(this.getPartners(), wb, msgMap);
        }

        print.print();
        HSSFCellStyle cellStyle = wb.createCellStyle();
        cellStyle.setFillForegroundColor(HSSFColor.GREEN.index);
        for (int i = 0; i < header.getPhysicalNumberOfCells(); i++) {
            HSSFCell cell = header.getCell(i);
            cell.setCellStyle(cellStyle);
        }
    }

    public void resetPartnerFilter() {
        filterBean.reset();
        this.reset();
    }

}
