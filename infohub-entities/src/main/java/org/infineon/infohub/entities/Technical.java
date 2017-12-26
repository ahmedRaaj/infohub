/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import java.math.BigInteger;
import java.util.Date;
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
import org.infineon.infohub.sap.excel.model.Direction;

/**
 *
 * @author Raaj
 */
@Entity
@Named
@Table(name = "DEV_TECHNICAL")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Technical.findAll", query = "SELECT t FROM Technical t")
    , @NamedQuery(name = "Technical.findByConnectionType", query = "SELECT t FROM Technical t WHERE t.connectionType = :connectionType")
    , @NamedQuery(name = "Technical.findByTechid", query = "SELECT t FROM Technical t WHERE t.techid = :techid")
    , @NamedQuery(name = "Technical.findByBusinessProcess", query = "SELECT t FROM Technical t WHERE t.businessProcess = :businessProcess")
    , @NamedQuery(name = "Technical.findBySourceMessage", query = "SELECT t FROM Technical t WHERE t.sourceMessage = :sourceMessage")
    , @NamedQuery(name = "Technical.findByTargetMessage", query = "SELECT t FROM Technical t WHERE t.targetMessage = :targetMessage")
    , @NamedQuery(name = "Technical.findByDirection", query = "SELECT t FROM Technical t WHERE t.direction = :direction")
    , @NamedQuery(name = "Technical.findByStandard", query = "SELECT t FROM Technical t WHERE t.standard = :standard")
    , @NamedQuery(name = "Technical.findByTnFrom", query = "SELECT t FROM Technical t WHERE t.tnFrom = :tnFrom")
    , @NamedQuery(name = "Technical.findByTnto", query = "SELECT t FROM Technical t WHERE t.tnTo = :tnTo")
    , @NamedQuery(name = "Technical.findByStatus", query = "SELECT t FROM Technical t WHERE t.status = :status")
    , @NamedQuery(name = "Technical.findByUpdateTime", query = "SELECT t FROM Technical t WHERE t.updateTime = :updateTime")
    , @NamedQuery(name = "Technical.findByTechnicalId", query = "SELECT t FROM Technical t WHERE t.technicalId = :technicalId")
    , @NamedQuery(name = "Technical.findByPriority", query = "SELECT t FROM Technical t WHERE t.priority = :priority")
    , @NamedQuery(name = "Technical.findAllDistConnectionType", query = "SELECT DISTINCT t.connectionType FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistBusinessProcess", query = "SELECT DISTINCT t.businessProcess FROM Technical t")
        
    , @NamedQuery(name = "Technical.findAllDistSourceMessage", query = "SELECT DISTINCT t.sourceMessage FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistTargetMessage", query = "SELECT DISTINCT t.targetMessage FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistDirection", query = "SELECT DISTINCT t.direction FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistStandard", query = "SELECT DISTINCT t.standard FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistTnFrom", query = "SELECT DISTINCT t.tnFrom FROM Technical t")
    , @NamedQuery(name = "Technical.findAllDistTnTo", query = "SELECT DISTINCT t.tnTo FROM Technical t")
    , @NamedQuery(name = "Technical.findByComments", query = "SELECT t FROM Technical t WHERE t.comments = :comments")})
public class Technical implements Serializable {

    private static final long serialVersionUID = 1L;
    @Size(max = 50)
    @Column(name = "CONNTYPE")
    private String connectionType;    //should be included in search
    @Size(max = 50)
    @Column(name = "TECHID")
    private String techid;
    @Size(max = 100)
    @Column(name = "BUSPROC")
    private String businessProcess;
    @Size(max = 100)
    @Column(name = "SOURCEMSG")
    private String sourceMessage;  //should be included in search
    @Size(max = 100)
    @Column(name = "TARGETMSG")
    private String targetMessage;   //should be included in search
    @Size(max = 10)
    @Column(name = "DIRECTION")
    private String direction;
    @Size(max = 50)
    @Column(name = "STANDARD")
    private String standard;
    @Size(max = 100)
    @Column(name = "TNFROM")
    private String tnFrom;
    @Size(max = 100)
    @Column(name = "TNTO")
    private String tnTo;
    @Column(name = "RECSTAT")
    private Boolean status;
    @Column(name = "RECTIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;
    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "techSeq", sequenceName = "DEV_TECH_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "techSeq")
    @Size(min = 1, max = 32)
    @Column(name = "RECGUID")
    private String technicalId;
    @Size(max = 1)
    @Column(name = "PRIORITY")
    private String priority;
    @Size(max = 4000)
    @Column(name = "COMMENTS")
    private String comments;
    @JoinColumn(name = "PGUID", referencedColumnName = "RECGUID")
    @ManyToOne
    private Partner partner;

    public Technical() {

    }

    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }

    public String getTechid() {
        return techid;
    }

    public void setTechid(String techid) {
        this.techid = techid;
    }

    public String getBusinessProcess() {
        return businessProcess;
    }

    public void setBusinessProcess(String businessProcess) {
        this.businessProcess = businessProcess;
    }

    public String getSourceMessage() {
        return sourceMessage;
    }

    public void setSourceMessage(String sourceMessage) {
        this.sourceMessage = sourceMessage;
    }

    public String getTargetMessage() {
        return targetMessage;
    }

    public void setTargetMessage(String targetMessage) {
        this.targetMessage = targetMessage;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getStandard() {
        return standard;
    }

    public void setStandard(String standard) {
        this.standard = standard;
    }

    public String getTnFrom() {
        return tnFrom;
    }

    public void setTnFrom(String tnFrom) {
        this.tnFrom = tnFrom;
    }

    public String getTnTo() {
        return tnTo;
    }

    public void setTnTo(String tnTo) {
        this.tnTo = tnTo;
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

    public String getTechnicalId() {
        return technicalId;
    }

    public void setTechnicalId(String technicalId) {
        this.technicalId = technicalId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    public Technical clone() {
        Technical t = new Technical();
        t.businessProcess = this.businessProcess;
        t.comments = this.comments;
        t.connectionType = this.connectionType;
        t.direction = this.direction;
        t.priority = this.priority;
        t.sourceMessage = this.sourceMessage;
        t.standard = this.standard;
        t.targetMessage = this.targetMessage;
        t.techid = this.techid;
        t.tnFrom = this.tnFrom;
        t.tnTo = this.tnTo;
        return t;

    }

    public String getTechTerms() {
         String message = "";
        if(this.direction != null){
             message = (this.direction.equals(Direction.Inbound.name()) ? this.targetMessage : this.sourceMessage);
             
        }
        
        if(message == null){
            System.err.println("Error: getTechTerms() returned null for " + this.partner.getPartnerNumber() + " " +this.partner.getPartnerName() + " TechID: " + this.technicalId);
        }
       

        return message;
    }

    @Override
    public String toString() {
        return "Technical{" + "connectionType=" + connectionType + ", techid=" + techid + ", businessProcess=" + businessProcess + ", sourceMessage=" + sourceMessage + ", targetMessage=" + targetMessage + ", direction=" + direction + ", standard=" + standard + ", tnFrom=" + tnFrom + ", tnTo=" + tnTo + ", status=" + status + ", updateTime=" + updateTime + ", technicalId=" + technicalId + ", priority=" + priority + ", comments=" + comments + ", partner=" + partner + '}';
    }

    
    
    

}
