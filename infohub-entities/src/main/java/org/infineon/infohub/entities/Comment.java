/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import java.math.BigInteger;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Objects;
import javax.inject.Named;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author Raaj
 */
@Entity
@Table(name = "DEV_COMMENT")
@Named
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Comment.findAll", query = "SELECT c FROM Comment c")
    , @NamedQuery(name = "Comment.findByCommentBy", query = "SELECT c FROM Comment c WHERE c.commentBy = :commentBy")
    , @NamedQuery(name = "Comment.findByCommentText", query = "SELECT c FROM Comment c WHERE c.commentText = :commentText")
    , @NamedQuery(name = "Comment.findByRecstat", query = "SELECT c FROM Comment c WHERE c.status = :status")
    , @NamedQuery(name = "Comment.findByUpdateTime", query = "SELECT c FROM Comment c WHERE c.updateTime = :updateTime")
    , @NamedQuery(name = "Comment.findByCommentId", query = "SELECT c FROM Comment c WHERE c.commentId = :commentId")})
public class Comment implements Serializable {

    private static final long serialVersionUID = 1L;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "COMMENTBY")
    private String commentBy;
    @Size(max = 1500)
    @Column(name = "COMMENTTEXT")
    private String commentText;
    @Column(name = "RECSTAT")
    private Boolean status;
    @Column(name = "RECTIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;
    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "commentSeq", sequenceName = "DEV_COMMENT_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "commentSeq")

    @Size(min = 1, max = 32)
    @Column(name = "RECGUID")
    private String commentId;
    @JoinColumn(name = "PGUID", referencedColumnName = "RECGUID")
    @ManyToOne
    private Partner partner;

    public Comment() {

        this.status = true;
        

    }

    public Comment(String recguid) {
        this.commentId = recguid;
    }

    public Comment(String recguid, String commentby) {
        this.commentId = recguid;
        this.commentBy = commentby;
    }

    public String getCommentBy() {
        return commentBy;
    }

    public void setCommentBy(String commentBy) {
        this.commentBy = commentBy;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public String getCommentId() {
        return commentId;
    }

    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }

    public Partner getPartner() {
        return partner;
    }

    public void setParnter(Partner partner) {
        this.partner = partner;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 29 * hash + Objects.hashCode(this.commentId);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Comment other = (Comment) obj;
        if (!Objects.equals(this.commentId, other.commentId)) {
            return false;
        }
        return true;
    }

    public Comment clone() {
        Comment c = new Comment();
        c.commentBy = commentBy;
        c.commentText = commentText;
        c.status = status;
        c.updateTime = updateTime;

        return c;
    }


}
