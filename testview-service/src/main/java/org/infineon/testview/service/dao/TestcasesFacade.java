/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.service.dao;

import java.util.List;
import java.util.Map;
import javax.ejb.Stateful;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.ParameterExpression;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import org.infineon.testview.entities.Doctype;
import org.infineon.testview.entities.Testcase;
import org.infineon.testview.entities.Testcase_;
import org.infineon.testview.entities.TnPartner;


/**
 *
 * @author Raaj
 */
@Stateful
public class TestcasesFacade extends AbstractFacade<Testcase> {

    @PersistenceContext(unitName = "com.infineon_B2BTESTVIEW_war_1.0-SNAPSHOTPU")
    private EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public TestcasesFacade() {
        super(Testcase.class);
    }

    public List<Testcase> findRange(int[] range, Map<String, Object> filters) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();

        CriteriaQuery query = cb.createQuery();
        Root root = query.from(Testcase.class);
        query.select(root);
        Predicate predicate = cb.and();
        if (filters != null) {
            for (Map.Entry<String, Object> entry : filters.entrySet()) {

                if (entry.getKey().equals("receiver.corporationname")) {
                    Join<Testcase, TnPartner> join = root.join(Testcase_.receiver);
                    join.on(cb.like(cb.upper(join.get("corporationname")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else if (entry.getKey().equals("sender.corporationname")) {
                    Join<Testcase, TnPartner> join = root.join(Testcase_.sender);
                    join.on(cb.like(cb.upper(join.get("corporationname")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else if (entry.getKey().equals("doctype.typename")) {
                    Join<Testcase, Doctype> join = root.join(Testcase_.doctype);
                    join.on(cb.like(cb.upper(join.get("typename")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else {
                    String qString = entry.getKey().equals("id") ? String.valueOf(entry.getValue()).toUpperCase() : String.valueOf("%" + entry.getValue() + "%").toUpperCase();
                    predicate = cb.and(predicate, cb.like(cb.upper(root.get(entry.getKey())), qString));

                }

            }
        }
        query.where(predicate);

        query.orderBy(cb.asc(root.get(Testcase_.id)));
        javax.persistence.Query q = getEntityManager().createQuery(query);
        q.setMaxResults(range[1] - range[0] + 1);
        q.setFirstResult(range[0]);

        return q.getResultList();
    }

    public int count(Map<String, Object> filters) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery query = cb.createQuery();
        Root<Testcase> root = query.from(Testcase.class);
        Predicate predicate = cb.and();
        if (filters != null) {
            for (Map.Entry<String, Object> entry : filters.entrySet()) {

                if (entry.getKey().equals("receiver.corporationname")) {
                    Join<Testcase, TnPartner> join = root.join(Testcase_.receiver);
                    join.on(cb.like(cb.upper(join.get("corporationname")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else if (entry.getKey().equals("sender.corporationname")) {
                    Join<Testcase, TnPartner> join = root.join(Testcase_.sender);
                    join.on(cb.like(cb.upper(join.get("corporationname")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else if (entry.getKey().equals("doctype.typename")) {
                    Join<Testcase, Doctype> join = root.join(Testcase_.doctype);
                    join.on(cb.like(cb.upper(join.get("typename")), String.valueOf("%" + entry.getValue() + "%").toUpperCase()));
                } else {
                    String qString = entry.getKey().equals("id") ? String.valueOf(entry.getValue()).toUpperCase() : String.valueOf("%" + entry.getValue() + "%").toUpperCase();
                    predicate = cb.and(predicate, cb.like(cb.upper(root.get(entry.getKey())), qString));

                }

            }
        }
        query.where(predicate);
        query.select(getEntityManager().getCriteriaBuilder().count(root));
        javax.persistence.Query q = getEntityManager().createQuery(query);
        return ((Long) q.getSingleResult()).intValue();
    }

    public List<String> findAllStatus() {
        return em.createNamedQuery("Testcase.findAllStatus").getResultList();
    }

}
