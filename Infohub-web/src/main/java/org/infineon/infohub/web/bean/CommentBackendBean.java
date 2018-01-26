/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;
import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Named;
import org.infineon.infohub.entities.Comment;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.service.dao.CommentFacadeREST;
import org.infineon.infohub.service.exception.PartnerNotFoundException;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class CommentBackendBean extends AbstractBean<Comment> implements Serializable{

    private Comment comment;
    private Collection<Comment> comments;
    private boolean edit;
    private Partner parent;

    @EJB
    CommentFacadeREST commentFacade;

    public CommentBackendBean() {
        super(Comment.class);
    }

    @PostConstruct
    public void init() {
        comment = new Comment();
        parent= new Partner();
        comments = null;
        edit = false;
    }

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public Collection<Comment> getComments() {
        if (comments == null) {
            try {
               comments =  commentFacade.findAllByPartner(parent);
            } catch (PartnerNotFoundException ex) {
                LOGGER.log(Level.WARNING, "partner not found,new partner mode");
                comments = parent.getComments();
            }
        }
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    public Partner getParent() {
        return parent;
    }

    public void setParent(Partner parent) {
        this.parent = parent;
        this.reset();
    }
    
    public void onAddNewComment(){
        if(comment.getCommentText() != null && !comment.getCommentText().equals("")){
            comment.setParnter(parent);
            comment.setCommentBy("dummy");
            getComments().add(comment);
            prepareCreate();
        }else{
            addErrorMessage("comment must not be empty");
        }
    }
    
    public void save(){
        parent.setComments(comments);
        this.reset();
        this.edit = false;
    }
  private Comment prepareCreate() {
        comment = new Comment();
        return comment;
    }
    @Override
    protected Comment getSelected() {
        return comment;
    }

    @Override
    protected CommentFacadeREST getFacade() {
        return commentFacade;
    }

    @Override
    protected void reset() {
        this.comment = new Comment();
        this.comments = null;
    }

}
