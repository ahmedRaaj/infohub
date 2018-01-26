/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Named;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.service.dao.ContactFacadeREST;
import org.infineon.infohub.service.exception.PartnerNotFoundException;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class ContactBackendBean extends AbstractBean<Contact> implements Serializable {

    @EJB
    ContactFacadeREST contactFacade;

    private Contact contact;
    private Collection<Contact> contacts;
    private List<Contact> deleted; //workout to keep same session multiple delete

    private Partner parent;
    private boolean edit;

    public ContactBackendBean() {
        super(Contact.class);
    }

    @PostConstruct
    public void init() {
        this.contact = new Contact();
        this.parent = new Partner();
        deleted = new ArrayList<>();
    }

    public void onAddNewContact() {
        if (contact.getContactName() != null && !contact.getContactName().equals("")) {
            contact.setPartner(parent);
            getContacts().add(contact);
            prepareCreate();
        }else{
            addErrorMessage("Contact Name must not be empty");
        }

    }

    public void onDeleteContact(Contact c) {
        if (c != null) {
            getContacts().remove(c);
            deleted.add(c);
        }
    }

    @Override
    protected void reset() {
        contact = new Contact();
        contacts = null;
        deleted = new ArrayList<>();
    }

    private Contact prepareCreate() {
        contact = new Contact();
        return contact;
    }

//    public void edit() {
//        this.edit = true;
//    }

    public void save() {
        if (contact.getContactName() != null && !contact.getContactName().equals("")) {
            contact.setPartner(parent);
            contacts.add(contact);
        }
        try { // solving of multiple session saving.
            List<Contact> latest = contactFacade.findAllByPartner(parent);
            latest.stream().filter((c) -> (!contacts.contains(c))).forEach((c) -> {
                contacts.add(c);
            });
            contacts.removeAll(deleted);
            contacts = contacts.stream().map(x -> x).distinct().collect(Collectors.toList());
        } catch (PartnerNotFoundException ex) {
            LOGGER.log(Level.SEVERE, "Partner not found in database");
        }

        parent.setContacts(contacts);
        this.reset();
        this.edit = false;
    }

    public void cancel() {
        this.edit = false;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public Collection<Contact> getContacts() {
        try {
            if (contacts == null) {
                contacts = getFacade().findAllByPartner(parent);
            }
        } catch (PartnerNotFoundException ex) {  // dealing with new partner
            contacts =  (parent.getContacts() == null ? new ArrayList<>() : parent.getContacts()); // create new partner and contacts. 
        }
        return contacts;
    }

    public void setContacts(List<Contact> contacts) {
        this.contacts = contacts;
    }

    public Partner getParent() {
        return parent;
    }

    public void setParent(Partner parent) {
        this.parent = parent;
        this.reset();
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    @Override
    protected Contact getSelected() {
        return contact;
    }

    @Override
    protected ContactFacadeREST getFacade() {
        return contactFacade;
    }
}
