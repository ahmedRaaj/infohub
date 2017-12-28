package org.infineon.infohub.web.backend;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.ejb.EJB;
import javax.ejb.EJBException;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.faces.convert.FacesConverter;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.validation.ValidationException;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.infineon.infohub.entities.Comment;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.MsgXref;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;
import org.infineon.infohub.service.dao.MsgXrefFacadeREST;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.web.application.ApplicationBean;
import org.infineon.infohub.web.print.ExcelPrinter;
import org.infineon.infohub.web.print.Printer;
import org.infineon.infohub.web.util.JsfUtil;
import org.infineon.infohub.web.util.JsfUtil.PersistAction;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class PartnerController implements Serializable {

    public static final Logger log = Logger.getLogger(PartnerController.class.getName());

    @EJB
    private PartnerFacadeREST ejbFacade;
    @EJB
    private ApplicationBean appBean;

    @EJB
    private MsgXrefFacadeREST messageFacade;

    @Inject
    ActiveDirectoryUser user;
    @Inject
    PartnerBean partnerBean;

    @Inject
    PartnerFilter filter;
    private List<Partner> items = null;
    private List<Partner> filteredPartners;
    private Partner selected;
    private Contact selectedContact;
    private Technical selectedTechnical;
    private Comment selectedComment;
    private Operation operation;

    public PartnerController() {
    }

    public Partner getSelected() {
        return selected;
    }

    public void setSelected(Partner selected) {

        this.selected = selected;

        partnerBean.setSelectedPartner(selected);
    }

    public Contact getSelectedContact() {
        if (selectedContact == null) {
            initializeSelectedContact();
        }
        return selectedContact;
    }

    public void setSelectedContact(Contact selectedContact) {
        this.selectedContact = selectedContact;
    }

    public Technical getSelectedTechnical() {
        if (selectedTechnical == null) {
            initializeSelectedTechnical();
        }
        return selectedTechnical;
    }

    public void setSelectedTechnical(Technical selectedTechnical) {
        this.selectedTechnical = selectedTechnical;
    }

    public Comment getSelectedComment() {
        if (selectedComment == null) {
            initializeSelectedComment();
        }
        return selectedComment;
    }

    public void setSelectedComment(Comment selectedComment) {
        this.selectedComment = selectedComment;
    }

    private PartnerFacadeREST getFacade() {
        return ejbFacade;
    }

    public List<Partner> getFilteredPartners() {
        return filteredPartners;
    }

    public void setFilteredPartners(List<Partner> filteredPartners) {
        this.filteredPartners = filteredPartners;
    }

    /**
     * calls before creating any new partner, initialize create form
     *
     * @return partner
     */
    public Partner prepareCreate() { //calls before showing the create form with ajax. 
        selected = new Partner();
        initializeSelectedContact();
        initializeSelectedTechnical();
        initializeSelectedComment();
        selected.setContacts(new ArrayList<>());
        selected.setTechnicls(new ArrayList<>());
        selected.setComments(new ArrayList<>());

        return selected;
    }

    /**
     * calls by other method to initialize selected contact.
     *
     */
    private void initializeSelectedContact() { //calls by other partner method to initialize contact
        selectedContact = new Contact();
    }

    private void initializeSelectedTechnical() { //calls by other partner method to initialize contact
        selectedTechnical = new Technical();
    }

    private void initializeSelectedComment() { //calls by other partner method to initialize contact
        selectedComment = new Comment();
        selectedComment.setCommentBy(user.getUserName());
        selectedComment.setUpdateTime(new Date());
    }

    /**
     * calls before Copying any partner, initialize create form
     *
     */
    public void prepareCopyPartner(Partner p) {
        if (p == null) {
            return;
        }
        this.setSelected(p.clone());

        initializeSelectedContact();
        initializeSelectedTechnical();
        initializeSelectedComment();

    }

    public void prepareEditPartner(Partner p) {
        if (p == null) {
            return;
        }
        this.setSelected(getFacade().find(p.getPartnerId()));
        initializeSelectedContact();
        initializeSelectedTechnical();
        initializeSelectedComment();

    }

    public void onAddNewContact() {
        try {
            if (selectedContact.getContactName() == null || selectedContact.getContactType() == null) {
                throw new ValidationException("Conatct Name and Type Must not be empty");
            }
            selectedContact.setPartner(selected);
            selected.getContacts().add(selectedContact);
            initializeSelectedContact();
        } catch (Exception e) {
            JsfUtil.addErrorMessage("Conatct Name and Type Must not be empty");

        }

    }

    public void doDeleteNewContact(Contact delContact) {
        if (selected.getContacts().contains(delContact)) {
            selected.getContacts().remove(delContact);
        }
    }

    public void onAddNewTechnical() {
        try {
            if (selectedTechnical.getSourceMessage() == null && selectedTechnical.getTargetMessage() == null) {
                throw new ValidationException("Source Or Target Message is Must not be empty");
            }
            selectedTechnical.setPartner(selected);
            selected.getTechnicls().add(selectedTechnical);
            initializeSelectedTechnical();
        } catch (ValidationException e) {
            JsfUtil.addErrorMessage("Source Or Target Message is Must not be empty");
        }

    }

    public void doDeleteNewTechnical(Technical delTech) {
        if (selected.getTechnicls().contains(delTech)) {
            selected.getTechnicls().remove(delTech);
        }
    }

    public void onAddNewComment() {
        if (selectedComment == null || selectedComment.getCommentText() == null || selectedComment.getCommentText().length() < 1) {
            JsfUtil.addErrorMessage("Comment can not be empty");
            return;
        }
        selectedComment.setParnter(selected);
        selected.getComments().add(selectedComment);
        initializeSelectedComment();
    }

    public void doDeleteNewComment(Comment delCom) {
        if (selected.getComments().contains(delCom)) {
            selected.getComments().remove(delCom);
        }
    }

    public void prepareCrudOperation(Partner p, Operation op) {
        if (p == null && op != op.CREATE) {
            return;
        }
        this.operation = op;
        switch (op) {
            case UPDATE:
            case COPY:
                this.selected = p;
                break;
            case CREATE:
                this.selected = new Partner();
                this.initializeSelectedComment();
                this.initializeSelectedContact();
                this.initializeSelectedTechnical();
                break;
        }
    }

    public void performCrudOperation() {
        if (this.operation == null || this.selected == null) {
            log.warning("selected partner or operation null. not processing the operation");
            return;
        }

        if (selectedContact != null && selectedContact.getContactName() != null && selectedContact.getContactType() != null) {
            selectedContact.setPartner(selected);
            selected.getContacts().add(selectedContact);
        }

        if (operation == Operation.UPDATE) {
            persist(PersistAction.UPDATE, "PartnerUpdated");
        } else {
            persist(PersistAction.CREATE, "PartnerUpdated");
            this.reset();
        }

    }

    public void create() {
        if (selected == null) {
            return; //nothing to update
        }
        if (selectedContact != null && selectedContact.getContactName() != null && selectedContact.getContactType() != null) {
            selectedContact.setPartner(selected);
            selected.getContacts().add(selectedContact);
        }

        if (selectedTechnical != null && selectedTechnical.getSourceMessage() != null && selectedTechnical.getTargetMessage() != null) {
            selectedTechnical.setPartner(selected);
            selected.getTechnicls().add(selectedTechnical);
            selectedTechnical = null;
        }

        persist(PersistAction.CREATE, ResourceBundle.getBundle("bundles.Bundle").getString("PartnerCreated"));
        if (!JsfUtil.isValidationFailed()) {
            items = null;    // Invalidate list of items to trigger re-query.
        }
    }

    public void update() {

        if (selected == null) {
            return; //nothing to update
        }
        if (selectedContact != null && selectedContact.getContactName() != null && selectedContact.getContactType() != null) {
            selectedContact.setPartner(selected);
            selected.getContacts().add(selectedContact);
            selectedContact = null;
        }

        if (selectedTechnical != null && selectedTechnical.getSourceMessage() != null && selectedTechnical.getTargetMessage() != null) {
            selectedTechnical.setPartner(selected);
            selected.getTechnicls().add(selectedTechnical);
            selectedTechnical = null;
        }
        persist(PersistAction.UPDATE, "Partner Updated");
        reset();
    }

    public void cancel() {
        this.selected = null;
        this.selectedComment = null;
        this.selectedContact = null;
        this.selectedTechnical = null;
        //   this.reset();

    }

    public void destroy(Partner p) {
        if (p == null) {
            return;
        }
        setSelected(p);
        persist(PersistAction.DELETE, "Partner Deleted");
        if (!JsfUtil.isValidationFailed()) {
            // selected = null; // Remove selection
            // items = null;    // Invalidate list of items to trigger re-query.
            reset(); // reset all member variable. 

        }
    }

    public List<Partner> getItems() {
        if (items == null) {
            items = getFacade().findAll();
        }
        return items;
    }

    private void persist(PersistAction persistAction, String successMessage) {
        if (selected != null) {
            try {
                if (persistAction != PersistAction.DELETE) {
                    getFacade().edit(selected);

                } else {
                    getFacade().remove(selected);
                }
                JsfUtil.addSuccessMessage(successMessage);
            } catch (EJBException ex) {
                String msg = "";
                Throwable cause = ex.getCause();
                if (cause != null) {
                    msg = cause.getLocalizedMessage();
                }
                if (msg.length() > 0) {
                    JsfUtil.addErrorMessage("Parnter number already exist\n" + msg);
                } else {
                    JsfUtil.addErrorMessage(ex, "Parnter number already exist");
                }
            } catch (Exception ex) {
                Logger.getLogger(this.getClass().getName()).log(Level.SEVERE, null, ex);
                JsfUtil.addErrorMessage(ex, "Persistence Error Occured");
            }
        }
    }

    public Partner getPartner(java.lang.String id) {
        return getFacade().find(id);
    }

    public List<Partner> getItemsAvailableSelectMany() {
        return getFacade().findAll();
    }

    public List<Partner> getItemsAvailableSelectOne() {
        return getFacade().findAll();
    }

    public void performPartnerFilter() {

        // this.items = null;
        boolean lastUpdated = false;
        this.items = ejbFacade.filter(filter.getSourceMessage(), filter.getTargetMessage(), filter.getConnection(), filter.getStanderd(), filter.isNonSap(), filter.isMissingIT(), filter.isLastSapUpdated());
        System.out.println("$$$$total: " + items.size());
        FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formPartner:tablePartner");

    }

    public String resetPartnerFilter() {
        filter.reset();
        this.reset();

        return "index";
        //FacesContext.getCurrentInstance().getPartialViewContext().getRenderIds().add("formPartner:tablePartner");

    }

    @FacesConverter(forClass = Partner.class)
    public static class PartnerControllerConverter implements Converter {

        @Override
        public Object getAsObject(FacesContext facesContext, UIComponent component, String value) {
            if (value == null || value.length() == 0) {
                return null;
            }
            PartnerController controller = (PartnerController) facesContext.getApplication().getELResolver().
                    getValue(facesContext.getELContext(), null, "partnerController");
            return controller.getPartner(getKey(value));
        }

        java.lang.String getKey(String value) {
            java.lang.String key;
            key = value;
            return key;
        }

        String getStringKey(java.lang.String value) {
            StringBuilder sb = new StringBuilder();
            sb.append(value);
            return sb.toString();
        }

        @Override
        public String getAsString(FacesContext facesContext, UIComponent component, Object object) {
            if (object == null) {
                return null;
            }
            if (object instanceof Partner) {
                Partner o = (Partner) object;
                return getStringKey(o.getPartnerId());
            } else {
                Logger.getLogger(this.getClass().getName()).log(Level.SEVERE, "object {0} is of type {1}; expected type: {2}", new Object[]{object, object.getClass().getName(), Partner.class.getName()});
                return null;
            }
        }

    }

    public void postProcessXLS(Object document) {
        HSSFWorkbook wb = (HSSFWorkbook) document;
        HSSFSheet sheet = wb.getSheetAt(0);
        HSSFRow header = sheet.getRow(0);
        sheet.setColumnHidden(0, true);
        sheet.setColumnHidden(1, true);
//        UIViewRoot viewRoot = FacesContext.getCurrentInstance().getViewRoot();
//        UIComponent component = viewRoot.findComponent(":formPartner:tablePartner");
//        if (component instanceof DataTable) {
//            DataTable table = (DataTable) component;
//            List<Partner> p = (List<Partner>) table.getValue();
//            ExcelPrint print = new ExcelPrint(p, wb);
//            print.print();
//        }
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
            print = new ExcelPrinter(this.getItems(), wb, msgMap);
        }

        print.print();
        HSSFCellStyle cellStyle = wb.createCellStyle();
        cellStyle.setFillForegroundColor(HSSFColor.GREEN.index);
        for (int i = 0; i < header.getPhysicalNumberOfCells(); i++) {
            HSSFCell cell = header.getCell(i);
            cell.setCellStyle(cellStyle);
        }
    }

    public void reset() {
        this.selected = null;
        this.selectedComment = null;
        this.selectedContact = null;
        this.selectedTechnical = null;
        this.items = null;
        this.filter.reset();
    }

    public List<String> completePartnerType(String q) {
        return appBean.getPartnerTypes().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeRegions(String q) {
        return appBean.getRegions().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeCountries(String q) {
        return appBean.getCountries().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeB2BManagers(String q) {
        return appBean.getB2bManagers().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeContactType(String q) {
        return appBean.getContactTypes().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeConnections(String q) {
        return appBean.getConnections().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeBussProecss(String q) {
        return appBean.getBusinessProcess().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeSourceMessage(String q) {
        return appBean.getSourceMessages().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeTargetMessage(String q) {
        //List<String> targetMessages = new ArrayList<>(appBean.getTargetMessages());
        return appBean.getTargetMessages().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeDirection(String q) {
        return appBean.getDirections().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeStandards(String q) {
        return appBean.getStandards().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeTnTo(String q) {
        return appBean.getTnTo().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

    public List<String> completeTnFrom(String q) {
        return appBean.getTnForm().parallelStream().filter(s -> s != null && (s.contains(q) || s.contains(q.toUpperCase()))).collect(Collectors.toList());
    }

}
