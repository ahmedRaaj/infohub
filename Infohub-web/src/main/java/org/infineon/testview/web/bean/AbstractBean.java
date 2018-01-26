/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.web.bean;

import java.util.logging.Logger;
import javax.enterprise.context.Dependent;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.inject.Named;
import javax.servlet.http.HttpSession;

/**
 *
 * @author Raaj
 */
@Named
@Dependent
public abstract class AbstractBean {

    protected transient Logger log = Logger.getLogger(getLoggerName());

    public abstract String getLoggerName();

    public FacesContext currentFacesContextInstance() {
        return FacesContext.getCurrentInstance();
    }

    public void addErrorMessage(String msg) {
        FacesMessage facesMsg = new FacesMessage(FacesMessage.SEVERITY_ERROR, msg, msg);
        this.currentFacesContextInstance().addMessage(null, facesMsg);
    }

    public void addSuccessMessage(String msg) {
        FacesMessage facesMsg = new FacesMessage(FacesMessage.SEVERITY_INFO, msg, msg);
        this.currentFacesContextInstance().addMessage(null, facesMsg);
    }
    
    public HttpSession getSession(boolean create){
       return (HttpSession)this.currentFacesContextInstance().getExternalContext().getSession(create);
    }

}
