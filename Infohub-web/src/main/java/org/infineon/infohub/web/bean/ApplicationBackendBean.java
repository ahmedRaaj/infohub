/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

/**
 *
 * @author Raaj
 */
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.PostConstruct;
import javax.ejb.Asynchronous;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.service.dao.CommentFacadeREST;
import org.infineon.infohub.service.dao.ContactFacadeREST;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.service.dao.TechnicalFacadeREST;


/**
 *
 * @author Raaj
 */
@Singleton
@Startup
public class ApplicationBackendBean {

    @Inject
    PartnerFacadeREST partnerFacade;
    @Inject
    ContactFacadeREST contactFacade;
    @Inject
    TechnicalFacadeREST technicalFacade;
    @Inject
    CommentFacadeREST commentFacade;

    @PersistenceContext(unitName = "JSFTESTPU")
    EntityManager em;

    private List<String> countries;
    private List<String> regions;
    private List<String> partnerTypes;
    private List<String> b2bManagers;

    private List<String> connections;
    private List<String> businessProcess;
    private List<String> sourceMessages;
    private List<String> targetMessages;
    private List<String> directions;
    private List<String> standards;
    private List<String> tnTo;
    private List<String> tnForm;

    private static final Logger log = Logger.getLogger("ApplicationEJBBEAN");
    private boolean sapInitiated;
    private String sapDesc;

    private List<Partner> partners;

    private List<String> contactTypes;

    @PostConstruct
    public void init() {
        this.sapDesc = "";
        this.sapInitiated = false;
        log.setLevel(Level.ALL);
    }

    public List<Partner> getPartners() {
        if (partners == null) {
            partners = partnerFacade.findAll();
        }
        return partners;
    }

   

    
    public String getSapDesc() {
        return sapDesc;
    }

    public void setSapDesc(String sapDesc) {
        this.sapDesc = sapDesc;
    }

    public boolean isSapInitiated() {
        return sapInitiated;
    }

    public void setSapInitiated(boolean sapInitiated) {
        this.sapInitiated = sapInitiated;
    }

    public List<String> getConnections() {
        if (connections == null) {
            connections = em.createNamedQuery("Technical.findAllDistConnectionType").getResultList();
        }

        return connections;
    }

    public List<String> getBusinessProcess() {
        if (businessProcess == null) {
            businessProcess = em.createNamedQuery("Technical.findAllDistBusinessProcess").getResultList();
        }
        return businessProcess;
    }

    public List<String> getSourceMessages() {
        if (sourceMessages == null) {
            sourceMessages = em.createNamedQuery("Technical.findAllDistSourceMessage").getResultList();
        }
        return sourceMessages;
    }

    public List<String> getTargetMessages() {
        if (targetMessages == null) {
            targetMessages = em.createNamedQuery("Technical.findAllDistTargetMessage").getResultList();
        }
        return targetMessages;
    }

    public List<String> getDirections() {
        if (directions == null) {
            directions = em.createNamedQuery("Technical.findAllDistDirection").getResultList();
        }
        return directions;
    }

    public List<String> getStandards() {
        if (standards == null) {
            standards = em.createNamedQuery("Technical.findAllDistStandard").getResultList();
        }
        return standards;
    }

    public List<String> getTnTo() {
        if (tnTo == null) {
            tnTo = em.createNamedQuery("Technical.findAllDistTnTo").getResultList();
        }
        return tnTo;
    }

    public List<String> getTnForm() {
        if (tnForm == null) {
            tnForm = em.createNamedQuery("Technical.findAllDistTnFrom").getResultList();
        }
        return tnForm;
    }

   

    public List<String> getContactTypes() {
        if (this.contactTypes == null) {
            contactTypes = em.createNamedQuery("Contact.findDistType").getResultList();
        }
        return contactTypes;
    }

    public List<String> getPartnerTypes() {
        if (this.partnerTypes == null) {
            partnerTypes = em.createNamedQuery("Partner.distinctType").getResultList();
        }
        return partnerTypes;
    }

    public List<String> getCountries() {
        if (this.countries == null) {
            countries = em.createNamedQuery("Partner.distictCountry").getResultList();
        }
        return countries;
    }

    public List<String> getRegions() {
        if (this.regions == null) {
            regions = em.createNamedQuery("Partner.distinctRegion").getResultList();
        }
        return regions;
    }

    public List<String> getB2bManagers() {
        if (this.b2bManagers == null) {
            b2bManagers = em.createNamedQuery("Partner.distictB2BManager").getResultList();
        }
        return b2bManagers;
    }

    public void reset() {
      
        this.countries = null;
        this.regions = null;
        this.partnerTypes = null;
        this.b2bManagers = null;
        this.connections = null;
        this.businessProcess = null;
        this.sourceMessages = null;
        this.targetMessages = null;
        this.directions = null;
        this.standards = null;
        this.tnTo = null;
        this.tnForm = null;
        this.sapInitiated = false;
        this.sapDesc = null;
        this.partners = null;
        this.contactTypes = null;
    }
    
    
}
