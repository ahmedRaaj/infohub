/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.service.dao;

import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.infineon.infohub.entities.Comment;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.service.exception.PartnerNotFoundException;

/**
 *
 * @author Raaj
 */
@Stateless
@Path("org.infineon.partnerdb.data.entity.comment")
public class CommentFacadeREST extends AbstractFacade<Comment> {

    @PersistenceContext(unitName = "JSFTESTPU")
    private EntityManager em;

    public CommentFacadeREST() {
        super(Comment.class);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void create(Comment entity) {
        super.create(entity);
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") String id, Comment entity) {
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
    public Comment find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<Comment> findAll() {
        return super.findAll();
    }

    public List<Comment> findAllByPartner(Partner partner) throws PartnerNotFoundException {
        if (partner == null || partner.getPartnerId() == null) {
            throw new PartnerNotFoundException("Partner is null");
        }
        return em.createNamedQuery("Comment.findByPartner").setParameter("partner", partner).getResultList();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<Comment> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

}
