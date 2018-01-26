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
import java.util.Objects;
import java.util.logging.Level;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.service.dao.TechnicalFacadeREST;
import org.infineon.infohub.service.exception.PartnerNotFoundException;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class TechnicalBackendBean extends AbstractBean<Technical> implements Serializable{
    
    private Technical technical;
    private Collection<Technical> technicals;
    private boolean edit;
    
    
    private List<Technical> deleted;
    
    @EJB
    TechnicalFacadeREST facade;
    @Inject
    ApplicationBackendBean appBean;
    
    private Partner parent;
    
    public TechnicalBackendBean(){
        super(Technical.class);
    }
    
    @PostConstruct
    public void init(){
        technical = new Technical();
        parent = new Partner();
        deleted = new ArrayList<>();
    }

    public Partner getParent() {
        return parent;
    }

    public void setParent(Partner parent) {
        this.parent = parent;
        this.reset();
    }
    
    public void onAddNewTechnical() {
        
        try {
            Objects.requireNonNull(technical.getDirection());
            Objects.requireNonNull(technical.getConnectionType());
            technical.setPartner(parent);
            getTechnicals().add(technical);
            prepareCreate();
        } catch (NullPointerException e) {
            addErrorMessage("Direction and Connection type must not be empty");
        }catch(Exception e){
            addErrorMessage(e.toString());
        }
        
        
        

    }

    public void onDeleteTechnical(Technical t) {
        if (t != null) {
            getTechnicals().remove(t);
            deleted.add(t);
        }
    }
    
     private Technical prepareCreate() {
        technical = new Technical();
        return technical;
    }
     
     
     public void save(){
         
         if(technical.getDirection() != null &&!technical.getDirection().equals("")){
             technical.setPartner(parent);
             this.getTechnicals().add(technical);
         }
         try {
             List<Technical> latest = facade.findAllByPartner(parent);
             latest.stream().filter(t->!technicals.contains(t)).forEach(c->technicals.add(c));
             technicals.removeAll(deleted);
             technicals = technicals.stream().map(x->x).distinct().collect(Collectors.toList());
             
         } catch (PartnerNotFoundException e) {
              LOGGER.log(Level.INFO, "Partner not found in database,New Partner Mode");
         }catch(Exception e){
             LOGGER.log(Level.SEVERE,"Operation latest db  Failed in Technical Bean");
         }
         
         
         
         parent.setTechnicls(technicals);
         this.reset();
         
         this.edit = false;
     }

    public Collection<Technical> getTechnicals() {
        if(technicals == null){
            try {
               technicals = getFacade().findAllByPartner(parent);
            } catch (PartnerNotFoundException ex) {
               LOGGER.log(Level.SEVERE, "Partner not found");
               technicals = (parent.getTechnicls() == null ? new ArrayList<>() : parent.getTechnicls());
            }
        }
        return technicals;
    }

    public void setTechnicals(Collection<Technical> technicals) {
        this.technicals = technicals;
    }
    
    

    @Override
    protected Technical getSelected() {
        return technical;
    }

    @Override
    protected TechnicalFacadeREST getFacade() {
        return facade;
    }

    @Override
    protected void reset() {
        technical = new Technical();
        technicals = null;
        deleted = new ArrayList<>();
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    public Technical getTechnical() {
        return technical;
    }

    public void setTechnical(Technical technical) {
        this.technical = technical;
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
