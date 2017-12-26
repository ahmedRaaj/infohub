/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.view.bean;

import java.io.Serializable;
import java.util.List;
import javax.ejb.EJB;
import javax.enterprise.context.SessionScoped;
import javax.inject.Named;
import org.infineon.testview.entities.Doctype;
import org.infineon.testview.service.dao.DoctypesFacade;


/**
 *
 * @author raaj
 */
@Named
@SessionScoped
public class DoctypeBean extends AbstractBean implements Serializable{
    
    @EJB
    DoctypesFacade doctypesFacade;
    private List<Doctype> doctypeList;

    @Override
    public String getLoggerName() {
         return DoctypeBean.class.getName(); 
    }

    public List<Doctype> getDoctypeList() {
        if(doctypeList == null){
            doctypeList = doctypesFacade.findAll();
        }
        return doctypeList;
    }

    public void setDoctypeList(List<Doctype> doctypeList) {
        this.doctypeList = doctypeList;
    }
    
    public void reset(){
        doctypeList = null;
    }
    
}
