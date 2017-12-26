/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.entities;

import java.io.Serializable;
import java.math.BigInteger;
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author raaj
 */
@Cacheable
@Entity
@Table(name = "IFX_TNCOMBINATIONS")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TnCombination.findAll", query = "SELECT t FROM TnCombination t")
    , @NamedQuery(name = "TnCombination.findById", query = "SELECT t FROM TnCombination t WHERE t.id = :id")
    , @NamedQuery(name = "TnCombination.findByInstance", query = "SELECT t FROM TnCombination t WHERE t.instance = :instance")
    , @NamedQuery(name = "TnCombination.findByEnvironment", query = "SELECT t FROM TnCombination t WHERE t.environment = :environment")
    , @NamedQuery(name = "TnCombination.findBySenderid", query = "SELECT t FROM TnCombination t WHERE t.senderid = :senderid")
    , @NamedQuery(name = "TnCombination.findByReceiverid", query = "SELECT t FROM TnCombination t WHERE t.receiverid = :receiverid")
    , @NamedQuery(name = "TnCombination.findByDoctypeid", query = "SELECT t FROM TnCombination t WHERE t.doctypeid = :doctypeid")
    , @NamedQuery(name = "TnCombination.findBySoldTo", query = "SELECT t FROM TnCombination t WHERE t.soldTo = :soldTo")
    , @NamedQuery(name = "TnCombination.findByInitialDoc", query = "SELECT t FROM TnCombination t WHERE t.initialDoc = :initialDoc")
    , @NamedQuery(name = "TnCombination.findByFirstUsage", query = "SELECT t FROM TnCombination t WHERE t.firstUsage = :firstUsage")
    , @NamedQuery(name = "TnCombination.findByLastUsage", query = "SELECT t FROM TnCombination t WHERE t.lastUsage = :lastUsage")
    , @NamedQuery(name = "TnCombination.findByLastDocid", query = "SELECT t FROM TnCombination t WHERE t.lastDocid = :lastDocid")
    , @NamedQuery(name = "TnCombination.findByCount", query = "SELECT t FROM TnCombination t WHERE t.count = :count")
    , @NamedQuery(name = "TnCombination.findByTcCount", query = "SELECT t FROM TnCombination t WHERE t.tcCount = :tcCount")
    , @NamedQuery(name = "TnCombination.findByB2bManager", query = "SELECT t FROM TnCombination t WHERE t.b2bManager = :b2bManager")
    , @NamedQuery(name = "TnCombination.findByContenttype", query = "SELECT t FROM TnCombination t WHERE t.contenttype = :contenttype")})
public class TnCombination implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "ID")
    private Long id;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "INSTANCE")
    private String instance;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "ENVIRONMENT")
    private String environment;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "SENDERID")
    private String senderid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "RECEIVERID")
    private String receiverid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "DOCTYPEID")
    private String doctypeid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 512)
    @Column(name = "SOLD_TO")
    private String soldTo;
    @Column(name = "INITIAL_DOC")
    private Character initialDoc;
    @Column(name = "FIRST_USAGE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date firstUsage;
    @Column(name = "LAST_USAGE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUsage;
    @Size(max = 24)
    @Column(name = "LAST_DOCID")
    private String lastDocid;
    @Column(name = "COUNT")
    private BigInteger count;
    @Column(name = "TC_COUNT")
    private BigInteger tcCount;
    @Size(max = 64)
    @Column(name = "B2B_MANAGER")
    private String b2bManager;
    @Size(max = 100)
    @Column(name = "CONTENTTYPE")
    private String contenttype;

    public TnCombination() {
    }

    public TnCombination(Long id) {
        this.id = id;
    }

    public TnCombination(Long id, String instance, String environment, String senderid, String receiverid, String doctypeid, String soldTo) {
        this.id = id;
        this.instance = instance;
        this.environment = environment;
        this.senderid = senderid;
        this.receiverid = receiverid;
        this.doctypeid = doctypeid;
        this.soldTo = soldTo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstance() {
        return instance;
    }

    public void setInstance(String instance) {
        this.instance = instance;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getSenderid() {
        return senderid;
    }

    public void setSenderid(String senderid) {
        this.senderid = senderid;
    }

    public String getReceiverid() {
        return receiverid;
    }

    public void setReceiverid(String receiverid) {
        this.receiverid = receiverid;
    }

    public String getDoctypeid() {
        return doctypeid;
    }

    public void setDoctypeid(String doctypeid) {
        this.doctypeid = doctypeid;
    }

    public String getSoldTo() {
        return soldTo;
    }

    public void setSoldTo(String soldTo) {
        this.soldTo = soldTo;
    }

    public Character getInitialDoc() {
        return initialDoc;
    }

    public void setInitialDoc(Character initialDoc) {
        this.initialDoc = initialDoc;
    }

    public Date getFirstUsage() {
        return firstUsage;
    }

    public void setFirstUsage(Date firstUsage) {
        this.firstUsage = firstUsage;
    }

    public Date getLastUsage() {
        return lastUsage;
    }

    public void setLastUsage(Date lastUsage) {
        this.lastUsage = lastUsage;
    }

    public String getLastDocid() {
        return lastDocid;
    }

    public void setLastDocid(String lastDocid) {
        this.lastDocid = lastDocid;
    }

    public BigInteger getCount() {
        return count;
    }

    public void setCount(BigInteger count) {
        this.count = count;
    }

    public BigInteger getTcCount() {
        return tcCount;
    }

    public void setTcCount(BigInteger tcCount) {
        this.tcCount = tcCount;
    }

    public String getB2bManager() {
        return b2bManager;
    }

    public void setB2bManager(String b2bManager) {
        this.b2bManager = b2bManager;
    }

    public String getContenttype() {
        return contenttype;
    }

    public void setContenttype(String contenttype) {
        this.contenttype = contenttype;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof TnCombination)) {
            return false;
        }
        TnCombination other = (TnCombination) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.TnCombination[ id=" + id + " ]";
    }
    
}
