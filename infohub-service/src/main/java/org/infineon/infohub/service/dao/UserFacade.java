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
import org.infineon.infohub.entities.User;

/**
 *
 * @author Raaj
 */
@Stateless
public class UserFacade extends AbstractFacade<User> {

    @PersistenceContext(unitName = "JSFTESTPU")
    private EntityManager em;

    public UserFacade() {
        super(User.class);
    }

    @Override
    protected EntityManager getEntityManager() {
        return em; //To change body of generated methods, choose Tools | Templates.
    }

    public User findByEmail(String email) {
        User user = null;
        try {
            user = (User) em.createNamedQuery("User.findByEmail").setParameter("email", email).getSingleResult();

        } catch (Exception e) {
            return user;

        }
        return user;
    }

    public void create(User entity) {
        super.create(entity);
    }

    public void edit(String id, User entity) {
        super.edit(entity);
    }

    public void remove(String id) {
        super.remove(super.find(id));
    }

    public User find(String id) {
        return super.find(id);
    }

    public List<User> findAll() {
        return super.findAll();
    }

    public List<User> findRange(Integer from, Integer to) {
        return super.findRange(new int[]{from, to});
    }

    public String countREST() {
        return String.valueOf(super.count());
    }

    public void refresh(User authUser) {
        em.refresh(authUser);
    }
   
}
