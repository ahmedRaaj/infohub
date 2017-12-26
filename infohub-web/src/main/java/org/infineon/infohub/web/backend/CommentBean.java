/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.util.Date;
import java.util.logging.Logger;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.infohub.entities.Comment;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;


/**
 *
 * @author Raaj
 */
@Named
@RequestScoped
public class CommentBean {

    static final Logger log = Logger.getLogger(CommentBean.class.getName());

    private Comment selected;

    //for new comment creation
    private String commentText;
    private String commentBy;

    @Inject
    ActiveDirectoryUser user;

    public Comment getSelected() {
        return selected;
    }

    public void setSelected(Comment selected) {
        this.selected = selected;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public String getCommentBy() {
        if (user != null && user.getUserName()!= null) {
            String[] split = user.getUserName().trim().split(" ");
            return split[0];
        } else {
           log.warning("User Given Name for Comment is null "+ user);
        }
        return commentBy;
    }

   

    public Comment addCommentToPartner() {
        Comment c = new Comment();
       
        c.setCommentBy(getCommentBy());
        c.setCommentText(commentText);
        c.setUpdateTime(new Date());
        clear();
        return c;
    }
    
    private void clear(){
        this.commentText = null;
    }

}
