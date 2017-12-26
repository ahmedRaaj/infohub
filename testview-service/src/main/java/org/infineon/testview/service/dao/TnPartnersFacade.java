/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.service.dao;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.infineon.testview.entities.TnPartner;

/**
 *
 * @author Raaj
 */
@Stateless
public class TnPartnersFacade extends AbstractFacade<TnPartner> {

    @PersistenceContext(unitName = "com.infineon_B2BTESTVIEW_war_1.0-SNAPSHOTPU")
    private EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public TnPartnersFacade() {
        super(TnPartner.class);
    }

    public TnPartner getTnPartnerByPartnerID(String Id) {
            return (TnPartner) em.createNamedQuery("TnPartners.findByPartnerid").setParameter("partnerid", Id).setMaxResults(1).getResultList().get(0);
    }

}
