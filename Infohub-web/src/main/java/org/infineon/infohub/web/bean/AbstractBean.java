/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.EJBException;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import org.infineon.infohub.service.dao.AbstractFacade;
import org.infineon.infohub.web.util.JsfUtil;
import org.infineon.infohub.web.util.JsfUtil.PersistAction;

/**
 *
 * @author Raaj
 */

public abstract class AbstractBean<T> {

    protected abstract T getSelected();

    protected abstract AbstractFacade<T> getFacade();

    protected abstract void reset();

    protected transient final Logger LOGGER ;

     private Class<T> entityClass;

    public AbstractBean(Class<T> entityClass) {
        this.entityClass = entityClass;
        LOGGER = Logger.getLogger(entityClass.getClass().getName());
    }
    
    public void create() {
        persist(PersistAction.CREATE);
        if (!JsfUtil.isValidationFailed()) {
            reset();    // Invalidate list of items to trigger re-query.
        }
    }

    public void update() {
        persist(PersistAction.UPDATE);
    }

    public void destroy() {
        persist(PersistAction.DELETE);
        if (!isValidationFailed()) {
            reset();
        }
    }

    protected void persist(PersistAction persistAction) {
        if (getSelected() != null) {
            LOGGER.log(Level.INFO, "Invoking persisting action: {0} on {1}", new Object[]{persistAction, getSelected()});
            try {
                if (persistAction != PersistAction.DELETE) {
                    if (persistAction == PersistAction.CREATE) {
                        getFacade().create(getSelected());
                    } else {
                        getFacade().edit(getSelected());
                    }
                } else {
                    getFacade().remove(getSelected());
                }
                addSuccessMessage("Success: Record update");
            } catch (EJBException ex) {
                String msg = "";
                Throwable cause = ex.getCause();
                if (cause != null) {
                    msg = cause.getLocalizedMessage();
                }
                if (msg.length() > 0) {
                    addErrorMessage(msg);
                } else {
                    addErrorMessage(ex, "Failed: Record Update not successfull");
                }
            } catch (Exception ex) {
                Logger.getLogger(this.getClass().getName()).log(Level.SEVERE, null, ex);
                addErrorMessage(ex, "Failed: Record Update not successfull");
            }
        } else {
            addErrorMessage("Error: No selection");
        }
    }
    

    public String getRequestParameterValue(String key) {
        return FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap().get(key);
    }

    public boolean isValidationFailed() {
        return FacesContext.getCurrentInstance().isValidationFailed();
    }

    public static void addErrorMessage(String msg) {
        FacesMessage facesMsg = new FacesMessage(FacesMessage.SEVERITY_ERROR, msg, msg);
        FacesContext.getCurrentInstance().addMessage(null, facesMsg);
    }

    public static void addSuccessMessage(String msg) {
        FacesMessage facesMsg = new FacesMessage(FacesMessage.SEVERITY_INFO, msg, msg);
        FacesContext.getCurrentInstance().addMessage("successInfo", facesMsg);
    }

    public static void addErrorMessage(Exception ex, String defaultMsg) {
        String msg = ex.getLocalizedMessage();
        if (msg != null && msg.length() > 0) {
            addErrorMessage(msg);
        } else {
            addErrorMessage(defaultMsg);
        }
    }

}
