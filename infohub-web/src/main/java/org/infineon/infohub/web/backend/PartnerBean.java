/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.io.Serializable;
import java.util.Collection;
import java.util.logging.Logger;
import javax.faces.event.ActionEvent;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.infohub.entities.Comment;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.web.util.JsfUtil;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class PartnerBean implements Serializable{

    static final Logger log = Logger.getLogger(PartnerBean.class.getName());

    private Partner selectedPartner;
    private Collection<Contact> selectedContactList;
    private Collection<Comment> selectedCommentList;
    private Collection<Technical> selectedTechnicalList;

    @Inject
    CommentBean commentBean;

    @Inject
    PartnerFacadeREST partnerFacade;

    public Partner getSelectedPartner() {
        return selectedPartner;
    }

    public void setSelectedPartner(Partner selcted) {
        if (selcted == null) {
            return;
        }
        System.out.println(selcted);
        this.selectedPartner = selcted;
       // this.selectedPartner = partnerFacade.find(selcted.getPartnerId());
        this.selectedTechnicalList = this.selectedPartner.getTechnicls();
        this.selectedContactList = this.selectedPartner.getContacts();
        this.selectedCommentList = this.selectedPartner.getComments();
    }

    public Collection<Contact> getSelectedContactList() {
        return selectedContactList;
    }

    public Collection<Comment> getSelectedCommentList() {
        return selectedCommentList;
    }

    public Collection<Technical> getSelectedTechnicalList() {
        return selectedTechnicalList;
    }

    public void onAddNewComment(ActionEvent event) {

        if (commentBean.getCommentText() == null || commentBean.getCommentText().equals("")) {
            log.warning("comment text missing " + commentBean);
            JsfUtil.addErrorMessage("Comment must not be empty");
            return;
        }
        Comment c = commentBean.addCommentToPartner();
        selectedPartner.getComments().add(c);
        c.setParnter(selectedPartner);
        partnerFacade.edit( selectedPartner);

    }

}
