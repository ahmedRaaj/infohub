/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.Serializable;
import java.util.List;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.infohub.entities.User;
import org.infineon.infohub.entities.UserRole;
import org.infineon.infohub.service.dao.UserFacade;
import org.infineon.infohub.web.util.JsfUtil;

import org.primefaces.event.RowEditEvent;

/**
 *
 * @author Raaj
 */
@Named 
@ViewScoped
public class AdminBackendBean implements Serializable {
    private List<User> users;
    private UserRole[] userRoles ;
    
    @Inject
    UserFacade userFacade;
    
    
    public void onRowEdit(RowEditEvent ev){
        User user = (User) ev.getObject();
        userFacade.edit(user);
        JsfUtil.addSuccessMessage("Sucess!");
        
    }
     public void onRowCancel(RowEditEvent ev){
        JsfUtil.addSuccessMessage("Cancelled!");
    }

    public List<User> getUsers() {
        if(users == null){
            users = userFacade.findAll();
        }
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public UserRole[] getUserRoles() {
        if(userRoles == null){
            userRoles = UserRole.values();
        }
        return userRoles;
    }

    
   
    
    
    public void reset(){
        users = null;
    }
}
