/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.entities;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.ManyToOne;
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

@Entity
@Table(name = "IFX_TESTCASES")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Testcase.findAll", query = "SELECT t FROM Testcase t"),
    @NamedQuery(name = "Testcase.findAllStatus", query = "SELECT DISTINCT t.status FROM Testcase t")
    , @NamedQuery(name = "Testcase.findById", query = "SELECT t FROM Testcase t WHERE t.id = :id")
    , @NamedQuery(name = "Testcase.findByTestEnv", query = "SELECT t FROM Testcase t WHERE t.testEnv = :testEnv")
    , @NamedQuery(name = "Testcase.findByDoctype", query = "SELECT t FROM Testcase t WHERE t.doctype = :doctype")
    , @NamedQuery(name = "Testcase.findBySoldTo", query = "SELECT t FROM Testcase t WHERE t.soldTo = :soldTo")
    , @NamedQuery(name = "Testcase.findBySourceDocid", query = "SELECT t FROM Testcase t WHERE t.sourceDocid = :sourceDocid")
    , @NamedQuery(name = "Testcase.findByTestDocid", query = "SELECT t FROM Testcase t WHERE t.testDocid = :testDocid")
    , @NamedQuery(name = "Testcase.findByStatus", query = "SELECT t FROM Testcase t WHERE t.status = :status")
    , @NamedQuery(name = "Testcase.findByTestDt", query = "SELECT t FROM Testcase t WHERE t.testDt = :testDt")
    , @NamedQuery(name = "Testcase.findByB2bManager", query = "SELECT t FROM Testcase t WHERE t.b2bManager = :b2bManager")
    , @NamedQuery(name = "Testcase.findByEmailTo", query = "SELECT t FROM Testcase t WHERE t.emailTo = :emailTo")
    , @NamedQuery(name = "Testcase.findByDescription", query = "SELECT t FROM Testcase t WHERE t.description = :description")
    , @NamedQuery(name = "Testcase.findByMachine", query = "SELECT t FROM Testcase t WHERE t.machine = :machine")
    , @NamedQuery(name = "Testcase.findByFilename", query = "SELECT t FROM Testcase t WHERE t.filename = :filename")
    , @NamedQuery(name = "Testcase.findByLastUpd", query = "SELECT t FROM Testcase t WHERE t.lastUpd = :lastUpd")})
public class Testcase implements Serializable {

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
    @Column(name = "SOURCE_ENV")
    private String sourceEnvironment;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "TEST_ENV")
    private String testEnv;
    

    @JoinColumns({
          @JoinColumn(name = "DOCTYPEID", referencedColumnName = "typeid")
            ,@JoinColumn(name = "INSTANCE", referencedColumnName = "INSTANCE",insertable = false,updatable = false)
        , @JoinColumn(name = "SOURCE_ENV", referencedColumnName = "ENVIRONMENT",insertable = false,updatable = false)
  
    })
    @ManyToOne(optional = false)
    private Doctype doctype;
    @Size(max = 512)
    @Column(name = "SOLD_TO")
    private String soldTo;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 24)
    @Column(name = "SOURCE_DOCID")
    private String sourceDocid;
    @Size(max = 24)
    @Column(name = "TEST_DOCID")
    private String testDocid;
    @Size(max = 24)
    @Column(name = "STATUS")
    private String status;
    @Column(name = "TEST_DT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date testDt;
    @Size(max = 64)
    @Column(name = "B2B_MANAGER")
    private String b2bManager;
    @Size(max = 512)
    @Column(name = "EMAIL_TO")
    private String emailTo;
    @Size(max = 2000)
    @Column(name = "DESCRIPTION")
    private String description;
    @Size(max = 24)
    @Column(name = "MACHINE")
    private String machine;
    @Size(max = 255)
    @Column(name = "FILENAME")
    private String filename;
    @Column(name = "LAST_UPD")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpd;
    @Size(max = 24)
    @Column(name="ASSIGNED")
    private String assigned;
    @JoinColumns({
        @JoinColumn(name = "INSTANCE", referencedColumnName = "INSTANCE",insertable = false,updatable = false)
        , @JoinColumn(name = "SOURCE_ENV", referencedColumnName = "ENVIRONMENT",insertable = false,updatable = false)
        , @JoinColumn(name = "SENDERID", referencedColumnName = "PARTNERID")})
    @ManyToOne(optional = false)
    private TnPartner sender;
    @JoinColumns({
        @JoinColumn(name = "INSTANCE", referencedColumnName = "INSTANCE",insertable = false,updatable = false)
        , @JoinColumn(name = "SOURCE_ENV", referencedColumnName = "ENVIRONMENT",insertable = false,updatable = false)
        , @JoinColumn(name = "RECEIVERID", referencedColumnName = "PARTNERID")})
    @ManyToOne(optional = false)
    private TnPartner receiver;

    public Testcase() {
    }

    public Testcase(Long id) {
        this.id = id;
    }

    public Testcase(Long id, String testEnv, Doctype doctype, String sourceDocid) {
        this.id = id;
        this.testEnv = testEnv;
        this.doctype = doctype;
        this.sourceDocid = sourceDocid;
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

    public String getSourceEnvironment() {
        return sourceEnvironment;
    }

    public void setSourceEnvironment(String sourceEnvironment) {
        this.sourceEnvironment = sourceEnvironment;
    }
    

    public String getTestEnv() {
        return testEnv;
    }

    public void setTestEnv(String testEnv) {
        this.testEnv = testEnv;
    }

    public Doctype getDoctype() {
        return doctype;
    }

    public void setDoctype(Doctype doctype) {
        this.doctype = doctype;
    }

    public String getSoldTo() {
        return soldTo;
    }

    public void setSoldTo(String soldTo) {
        this.soldTo = soldTo;
    }

    public String getSourceDocid() {
        return sourceDocid;
    }

    public void setSourceDocid(String sourceDocid) {
        this.sourceDocid = sourceDocid;
    }

    public String getTestDocid() {
        return testDocid;
    }

    public void setTestDocid(String testDocid) {
        this.testDocid = testDocid;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getTestDt() {
        return testDt;
    }

    public void setTestDt(Date testDt) {
        this.testDt = testDt;
    }

    public String getB2bManager() {
        return b2bManager;
    }

    public void setB2bManager(String b2bManager) {
        this.b2bManager = b2bManager;
    }

    public String getEmailTo() {
        return emailTo;
    }

    public void setEmailTo(String emailTo) {
        this.emailTo = emailTo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMachine() {
        return machine;
    }

    public void setMachine(String machine) {
        this.machine = machine;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Date getLastUpd() {
        return lastUpd;
    }

    public void setLastUpd(Date lastUpd) {
        this.lastUpd = lastUpd;
    }

    public String getAssigned() {
        return assigned;
    }

    public void setAssigned(String assigned) {
        this.assigned = assigned;
    }
    
    

    public TnPartner getSender() {
        return sender;
    }

    public void setSender(TnPartner sender) {
        this.sender = sender;
    }

    public TnPartner getReceiver() {
        return receiver;
    }

    public void setReceiver(TnPartner receiver) {
        this.receiver = receiver;
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
        if (!(object instanceof Testcase)) {
            return false;
        }
        Testcase other = (Testcase) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.Testcase[ id=" + id + " ]";
    }
    
}
