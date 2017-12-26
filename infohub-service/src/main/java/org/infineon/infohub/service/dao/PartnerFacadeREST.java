/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.service.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.EJBException;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CollectionJoin;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Partner_;
import org.infineon.infohub.entities.SapUpdate;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.entities.Technical_;

/**
 *
 * @author Raaj
 */
@Stateless
@Path("org.infineon.partnerdb.data.entity.partner")
public class PartnerFacadeREST extends AbstractFacade<Partner> {

    @PersistenceContext(unitName = "JSFTESTPU")
    private EntityManager em;

    @Inject
    SapUpdateFacadeREST sapUpdateFacade;

    private static Logger log = Logger.getLogger("PartnerEJB");

    public PartnerFacadeREST() {
        super(Partner.class);
        log.setLevel(Level.ALL);
    }

    public void detach(Partner p) {
        em.detach(p);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void create(Partner entity) {
        try {
            super.create(entity);

        } catch (EJBException e) {
            System.out.println(e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") String id, Partner entity) {
        super.edit(entity);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public Partner find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<Partner> findAll() {
        // return super.findAll();
        return em.createNamedQuery("Partner.findAllActive").getResultList();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<Partner> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }

    public List<Partner> findAllActive() {
        return getEntityManager().createNamedQuery("Partner.findAllActive", Partner.class).getResultList();
    }

    public List<String> getB2BManagers() {
        List<String> list = em.createNamedQuery("Partner.distictB2BManager", String.class).getResultList();//To change body of generated methods, choose Tools | Templates.
        return list;
    }

    public List<String> getCountries() {
        return em.createNamedQuery("Partner.distictCountry", String.class).getResultList();

    }

    public List<String> getType() {
        return em.createNamedQuery("Partner.distinctType", String.class).getResultList();

    }

    public List<String> getRegions() {
        return em.createNamedQuery("Partner.distinctRegion", String.class).getResultList();
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public Map<String, Number> countRegions() {
        Map<String, Number> result = new HashMap<>();
        List<String> regions = getEntityManager().createQuery("SELECT DISTINCT p.region FROM Partner p").getResultList();
        Number count;
        for (String region : regions) {
            if (region != null) {
                count = (Number) getEntityManager().createQuery("SELECT COUNT(p.partnerNumber) FROM Partner p WHERE p.region =:region").setParameter("region", region).getSingleResult();
                result.put(region, count);
                log.info("#: Region: " + region + " TotalCount: " + count);
            }
        }
        if (result.size() == 0) {
            result.put("No Data", 0);
        }
        return result;
    }

    public Map<String, Number> countPartnerType() {
        Map<String, Number> result = new HashMap<>();
        List<String> types = getEntityManager().createQuery("SELECT DISTINCT p.partnerType FROM Partner p").getResultList();
        Number count;
        for (String type : types) {
            if (type != null) {
                count = (Number) getEntityManager().createQuery("SELECT COUNT(DISTINCT (p.partnerNumber)) FROM Partner p WHERE p.partnerType =:type").setParameter("type", type).getSingleResult();
                result.put(type, count);
                log.info("# Type: " + type + " TotalCount: " + count);
            }
        }
        if (result.size() == 0) {
            result.put("No Data", 0);
        }
        return result;
    }

    public Map<String, Number> countTechStandard() {
        Map<String, Number> result = new HashMap<>();
        List<String> standards = getEntityManager().createQuery("SELECT DISTINCT t.standard FROM Partner p,Technical t WHERE t.partner.partnerId=p.partnerId").getResultList();
        Number count;
        for (String standard : standards) {
            if (standard != null) {
                count = (Number) getEntityManager().createQuery("SELECT COUNT(DISTINCT (p.partnerNumber)) FROM Partner p,Technical t WHERE t.partner.partnerId=p.partnerId AND t.standard =:standard").setParameter("standard", standard).getSingleResult();
                result.put(standard, count);
                log.info("# Type: " + standard + " TotalCount: " + count);
            }
        }
        if (result.size() == 0) {
            result.put("No Data", 0);
        }
        return result;
    }

    public Map<String, Number> countTechConnectionType() {
        Map<String, Number> result = new HashMap<>();
        List<String> types = getEntityManager().createQuery("SELECT DISTINCT t.connectionType FROM Partner p,Technical t WHERE t.partner.partnerId=p.partnerId").getResultList();
        Number count;
        for (String type : types) {
            if (type != null) {
                count = (Number) getEntityManager().createQuery("SELECT COUNT(DISTINCT (p.partnerNumber)) FROM Partner p,Technical t WHERE t.partner.partnerId=p.partnerId AND t.connectionType =:connectionType").setParameter("connectionType", type).getSingleResult();
                result.put(type, count);
                log.info("#Conection Type: " + type + " TotalCount: " + count);
            }
        }
        if (result.size() == 0) {
            result.put("No Data", 0);
        }
        return result;
    }

    public List<Partner> filter(String sourceMessage,String targetMessage,
                                String connection, String standard,
                                boolean isNonSap,boolean isMissingIT,boolean isLastSapUpdated) {

        
        log.info("Filter==> Source Message: "+sourceMessage + " TargetMessage: "+targetMessage + " connction: "+connection + " standard: "+standard);
        EntityManager em = getEntityManager();
        CriteriaBuilder qb = em.getCriteriaBuilder();
        CriteriaQuery<Partner> query = qb.createQuery(Partner.class);
        Root<Partner> partner = query.from(Partner.class);
        if (sourceMessage != null || targetMessage != null || connection != null || standard != null) {
            CollectionJoin<Partner, Technical> joinTech = partner.join(Partner_.technicls);
            Predicate criteria = qb.conjunction();
            if (sourceMessage != null) {
                criteria = qb.and(criteria, qb.like(qb.upper(joinTech.get(Technical_.sourceMessage)), sourceMessage.toUpperCase() + "%"));
            }
            if (targetMessage != null) {
                criteria = qb.and(criteria, qb.like(qb.upper(joinTech.get(Technical_.targetMessage)), targetMessage.toUpperCase() + "%"));

            }
            if (connection != null) {
                criteria = qb.and(criteria, qb.like(qb.upper(joinTech.get(Technical_.connectionType)), connection.toUpperCase() + "%"));

            }
            if (standard != null) {
                criteria = qb.and(criteria, qb.like(qb.upper(joinTech.get(Technical_.standard)), standard.toUpperCase() + "%"));

            }
            joinTech.on(criteria);

        }

        CriteriaQuery<Partner> select = query.select(partner).distinct(true);
        if (isNonSap) {
            select.where(qb.or(qb.isNull(partner.get(Partner_.insap)), qb.equal(partner.get(Partner_.insap), !isNonSap)));
        }
        if (isMissingIT) {
            //todo
        }

        if (isLastSapUpdated) {
            SapUpdate lastOne = sapUpdateFacade.findLastUpdated();
            if (lastOne != null) {
//                SimpleDateFormat ft
//                        = new SimpleDateFormat("dd/MM/yy");
//
//                System.out.println("%" + ft.format(lastOne.getUpdateTime()) + "%");
//                select.where(qb.like(partner.get(Partner_.updateTime).as(String.class), "%" + ft.format(lastOne.getUpdateTime()) + "%"));

                //   select.where(qb.equal(qb.function("TO_CHAR", Date.class, partner.get(Partner_.updateTime),qb.literal("DD/MM/YY")), lastOne.getUpdateTime()));
                select.where(qb.equal(partner.get(Partner_.sapUpdate), lastOne));
            }
        }
        List<Partner> list = em.createQuery(query).getResultList();
        return list;

    }

}
