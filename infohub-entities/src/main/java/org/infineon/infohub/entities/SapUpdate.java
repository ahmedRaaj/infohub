/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import javax.persistence.Basic;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author Raaj
 */
@Entity
@Table(name = "DEV_SAPUPDATE")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "SapUpdate.findLastUpdated", query = "SELECT s FROM SapUpdate s ORDER BY s.updateTime DESC ")
  

})
public class SapUpdate implements Serializable {

    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "sapSeq", sequenceName = "DEV_SAP_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sapSeq")
    private Long sapUpdateId;

    @Temporal(javax.persistence.TemporalType.TIMESTAMP)
    private Date updateTime;
    private String userName;
    private String comments;

    @OneToMany(mappedBy = "sapUpdate")
    private List<Partner> partners;

    public SapUpdate() {
    }
     public SapUpdate(Long id) {
         this.sapUpdateId = id;
    }
    
    

    public Long getSapUpdateId() {
        return sapUpdateId;
    }

    public void setSapUpdateId(Long sapUpdateId) {
        this.sapUpdateId = sapUpdateId;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public List<Partner> getPartners() {
        return partners;
    }

    public void setPartners(List<Partner> partners) {
        this.partners = partners;
    }

}
