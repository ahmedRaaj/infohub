/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.application;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import javax.ejb.Asynchronous;
import javax.ejb.Stateless;
import javax.enterprise.inject.Default;
import javax.inject.Inject;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.SapUpdate;
import org.infineon.infohub.sap.excel.model.SapPartner;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.infineon.infohub.service.dao.SapUpdateFacadeREST;

import org.infineon.infohub.web.util.SessionIdentifierGenerator;

/**
 *
 * @author Raaj
 */
@Stateless
public class SapSyncEJB {

    @Inject
    PartnerFacadeREST partnerFacade;
    @Inject
    SapUpdateFacadeREST sapUpdateFacade;
    @Inject 
    ActiveDirectoryUser user;

    private static final Logger log = Logger.getLogger("SapSynEJB");

    @Inject
    ApplicationBean appBean;

    @Asynchronous
    public void syncSap(Set<SapPartner> sapPartners, String userGivenName) {
        List<Partner> partners = partnerFacade.findAll();
        boolean changes = false;
        Partner p;
        SapUpdate sapUpdate = new SapUpdate(SessionIdentifierGenerator.nextSessionLongId());
        sapUpdate.setUserName(userGivenName);
        sapUpdate.setComments("Success");
        sapUpdate.setUpdateTime(new Date());
        try {

            for (SapPartner sapPartner : sapPartners) {
                if (partners.stream().filter(pa -> pa.getPartnerNumber().equals(sapPartner.getCustomerNumber())).findAny().isPresent()) { //if partner exist in database
                    p = partners.stream().filter(pa -> pa.getPartnerNumber().equals(sapPartner.getCustomerNumber())).findFirst().get();
                    if (!p.isSyncedWithSap(sapPartner)) {
                        log.warning("#^ Partner is not synced with SAP: " + p.getPartnerNumber() + " " + p.getPartnerName());
                        p.updateWithSap(sapPartner, sapUpdate);
                        partnerFacade.edit(p);
                        if (!changes) {
                            changes = true;
                        }
                    } else {
                        log.fine("#= Partner synced with SAP: " + p.getPartnerNumber() + " " + p.getPartnerName());
                    }
                } else {  // new partner from sap system. 
                    p = new Partner(true);
                    p.updateWithSap(sapPartner, sapUpdate);
                    log.warning("#+ new Partner from SAP: " + p.getPartnerNumber() + " " + p.getPartnerName());
                    partnerFacade.create(p);
                    if (!changes) {
                        changes = true;
                    }

                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            changes = false;
            log.severe(e.toString());
        } finally {
            if (changes) {
                sapUpdate.setComments("SUCCESS");
                sapUpdateFacade.create(sapUpdate);
                appBean.reset();
            }
            appBean.setSapDesc("");
            appBean.setSapInitiated(false);
        }

    }

}
