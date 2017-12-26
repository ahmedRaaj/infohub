/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.service.dao;

import java.util.Set;
import javax.ws.rs.core.Application;

/**
 *
 * @author Raaj
 */
@javax.ws.rs.ApplicationPath("webresources")
public class ApplicationConfig extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new java.util.HashSet<>();
        addRestResourceClasses(resources);
        return resources;
    }

    /**
     * Do not modify addRestResourceClasses() method.
     * It is automatically populated with
     * all resources defined in the project.
     * If required, comment out calling this method in getClasses().
     */
    private void addRestResourceClasses(Set<Class<?>> resources) {
        resources.add(org.infineon.infohub.service.dao.CommentFacadeREST.class);
        resources.add(org.infineon.infohub.service.dao.ContactFacadeREST.class);
        resources.add(org.infineon.infohub.service.dao.MsgXrefFacadeREST.class);
        resources.add(org.infineon.infohub.service.dao.PartnerFacadeREST.class);
        resources.add(org.infineon.infohub.service.dao.SapUpdateFacadeREST.class);
        resources.add(org.infineon.infohub.service.dao.TechnicalFacadeREST.class);
    }
    
}
