/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.test;

import java.util.ArrayList;
import java.util.List;
import javax.inject.Inject;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.service.dao.AbstractFacade;
import org.infineon.infohub.service.dao.ContactFacadeREST;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.shrinkwrap.api.Archive;
import org.jboss.shrinkwrap.api.ArchivePath;
import org.jboss.shrinkwrap.api.ArchivePaths;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.asset.EmptyAsset;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.junit.runner.RunWith;

/**
 *
 * @author Raaj
 */
@RunWith(Arquillian.class)
public class Tester {
    @Inject
    ContactFacadeREST cf;
    @Inject 
    PartnerFacadeREST pf;
    
    
    @Deployment
    public static Archive<?> init(){
        
     
        WebArchive war = ShrinkWrap.create(WebArchive.class)
          //  .addPackage(Partner.class.getPackage())
           // .addPackage(ContactFacadeREST.class.getPackage())
            .addPackages(true, "org.infineon")
            .addAsResource("test-persistence.xml", "META-INF/persistence.xml")
            .addAsWebInfResource(EmptyAsset.INSTANCE, "beans.xml");
        System.out.println(war.toString(true));
        
        
                 
        return war;
    }
    
    @Test
    public void sapSyncTest(){
        List<Partner> partners = pf.findAll();
        
    }
   
    @Ignore
    @Test
    public void count() {
        
        Contact c1 = new Contact("ahmed one", "ahmed one", "ahmed one", "ahmed one");
        Contact c2 = new Contact(c1);
        
        Contact c3 = cf.find("1545");
        c3.setContactName("ahmed one changed");
        
        List<Contact> list = new ArrayList<>();
        list.add(c1); list.add(c2);
        list.add(c3);
        cf.edit(list);
        
        assertEquals(4, cf.count());
    }
    
    @Test
    public void edit(){
        
    }
}
