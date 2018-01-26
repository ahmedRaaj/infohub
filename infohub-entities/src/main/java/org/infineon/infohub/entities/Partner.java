/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Objects;
import javax.inject.Named;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;


/**
 *
 * @author Raaj
 */
@Entity
@Table(name = "DEV_PARTNER")
@Named
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Partner.findAll", query = "SELECT p FROM Partner p ORDER BY p.partnerName")
    , @NamedQuery(name = "Partner.findAllActive", query = "SELECT p FROM Partner p WHERE p.status = TRUE ORDER BY p.partnerName")
    , @NamedQuery(name = "Partner.findBypartnerNumber", query = "SELECT p FROM Partner p WHERE p.partnerNumber = :partnerNumber")
    , @NamedQuery(name = "Partner.findByPartnerName", query = "SELECT p FROM Partner p WHERE p.partnerName = :partnerName")
    , @NamedQuery(name = "Partner.findByPartnerGroup", query = "SELECT p FROM Partner p WHERE p.partnerGroup = :partnerGroup")
    , @NamedQuery(name = "Partner.findByPartnerType", query = "SELECT p FROM Partner p WHERE p.partnerType = :partnerType")
    , @NamedQuery(name = "Partner.findBySalesorg", query = "SELECT p FROM Partner p WHERE p.salesOrg = :salesOrg")
    , @NamedQuery(name = "Partner.findByRegion", query = "SELECT p FROM Partner p WHERE p.region = :region")
    , @NamedQuery(name = "Partner.findByCountry", query = "SELECT p FROM Partner p WHERE p.country = :country")
    , @NamedQuery(name = "Partner.findByCity", query = "SELECT p FROM Partner p WHERE p.city = :city")
    , @NamedQuery(name = "Partner.findByB2bmgr", query = "SELECT p FROM Partner p WHERE p.b2bManager = :b2bManager")
    , @NamedQuery(name = "Partner.findByStatus", query = "SELECT p FROM Partner p WHERE p.status = :status")
    , @NamedQuery(name = "Partner.findByUpdateTime", query = "SELECT p FROM Partner p WHERE p.updateTime = :updateTime")
    , @NamedQuery(name = "Partner.findByPartnerId", query = "SELECT p FROM Partner p WHERE p.partnerId = :partnerId")
    , @NamedQuery(name = "Partner.findByInsap", query = "SELECT p FROM Partner p WHERE p.insap = :insap")
    , @NamedQuery(name = "Partner.distictCountry", query = "select DISTINCT(p.country)  FROM Partner p WHERE p.country IS NOT NULL ORDER BY p.country")
    , @NamedQuery(name = "Partner.distinctRegion", query = "select DISTINCT(p.region)  FROM Partner p WHERE p.region IS NOT NULL ORDER BY p.country")
    , @NamedQuery(name = "Partner.distinctType", query = "select DISTINCT(p.partnerType)  FROM Partner p WHERE p.partnerType IS NOT NULL ORDER BY p.partnerType")
    , @NamedQuery(name = "Partner.distictB2BManager", query = "select DISTINCT(p.b2bManager)  FROM Partner p WHERE p.b2bManager IS NOT NULL ORDER BY p.b2bManager")
    , @NamedQuery(name = "Partner.techSourceMessage", query = "SELECT DISTINCT(p) FROM Partner p JOIN p.technicls t where (:sourceMsg IS NULL or t.sourceMessage = :sourceMsg)")

})
public class Partner implements Serializable {

    private static final long serialVersionUID = 1L;
    @Size(max = 100)
    @Column(name = "PNUM")
    private String partnerNumber;
    @Size(max = 200)
    @Column(name = "PNAME")
    private String partnerName;
    @Size(max = 100)
    @Column(name = "PGRP")
    private String partnerGroup;
    @Size(max = 50)
    @Column(name = "PTYPE")
    private String partnerType;
    @Size(max = 10)
    @Column(name = "SALESORG")
    private String salesOrg;
    @Size(max = 50)
    @Column(name = "REGION")
    private String region;
    @Size(max = 50)
    @Column(name = "COUNTRY")
    private String country;
    @Size(max = 50)
    @Column(name = "CITY")
    private String city;
    @Size(max = 50)
    @Column(name = "B2BMGR")
    private String b2bManager;
    @Column(name = "RECSTAT")
    private Boolean status;
    @Column(name = "RECTIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;
    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "partnerSeq", sequenceName = "DEV_PARTNER_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "partnerSeq")

    @Size(min = 1, max = 32)
    @Column(name = "RECGUID")
    private String partnerId;
    @Column(name = "INSAP")
    private Boolean insap;
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Collection<Technical> technicls;
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Collection<Comment> comments;
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Collection<Contact> contacts;

    @ManyToOne(fetch = FetchType.LAZY)
    private SapUpdate sapUpdate;

    public Partner() {
        this.status = true;
        this.insap = false; //handle this in sap sync;
        this.contacts = new ArrayList<>();
        this.technicls = new ArrayList<>();
        this.comments = new ArrayList<>();
    }

    public Partner(boolean inSap) {
        this();
        this.insap = inSap; //handle this in sap sync;

    }

    //copy constructor
    public Partner(Partner copy) {
        this.b2bManager = copy.b2bManager;
        this.city = copy.city;
        this.country = copy.country;
        this.partnerGroup = copy.partnerGroup;
        this.partnerName = copy.partnerName;
        this.partnerType = copy.partnerType;
        this.region = copy.region;
        this.salesOrg = copy.salesOrg;
        this.status = true;
        this.updateTime = new Date();
        this.contacts = new ArrayList<>();
        this.technicls = new ArrayList<>();
        this.comments = new ArrayList<>();
        this.partnerNumber = null;
        
        Contact c;
        Technical t;
        for (Contact contact : copy.contacts) {
            c = new Contact(contact);
            c.setPartner(this);
            this.contacts.add(c);
        }
        for (Technical technicl : copy.technicls) {
            t = new Technical(technicl);
            t.setPartner(this);
            this.technicls.add(t);

        }

    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPartnerNumber() {
        return partnerNumber;
    }

    public void setPartnerNumber(String partnerNumber) {
        this.partnerNumber = partnerNumber;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getPartnerGroup() {
        return partnerGroup;
    }

    public void setPartnerGroup(String partnerGroup) {
        this.partnerGroup = partnerGroup;
    }

    public String getPartnerType() {
        return partnerType;
    }

    public void setPartnerType(String partnerType) {
        this.partnerType = partnerType;
    }

    public String getSalesOrg() {
        return salesOrg;
    }

    public void setSalesOrg(String slesOrg) {
        this.salesOrg = slesOrg;
    }

    public String getB2bManager() {
        return b2bManager;
    }

    public void setB2bManager(String b2bManager) {
        this.b2bManager = b2bManager;
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

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public Boolean getInsap() {
        return insap;
    }

    public void setInsap(Boolean insap) {
        this.insap = insap;
    }

    @XmlTransient
    public Collection<Technical> getTechnicls() {
        return technicls;
    }

    public void setTechnicls(Collection<Technical> technicls) {
        this.technicls = technicls;
    }

    @XmlTransient
    public Collection<Comment> getComments() {
        return comments;
    }

    public void setComments(Collection<Comment> comments) {
        this.comments = comments;
    }

    @XmlTransient
    public Collection<Contact> getContacts() {
        return contacts;
    }

    public void setContacts(Collection<Contact> contacts) {
        this.contacts = contacts;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 97 * hash + Objects.hashCode(this.partnerNumber);
        hash = 97 * hash + Objects.hashCode(this.partnerId);
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
        final Partner other = (Partner) obj;
//      
        if (!Objects.equals(this.partnerId, other.partnerId)) {
            return false;
        }
        
        if(Objects.equals(this.partnerId, other.partnerId)){
            if(this.partnerId != null && other.partnerId != null){
                return true;
            }else{
                
                return this == obj;
            }
        }
        return true;
    }
    
    public boolean equalsByNumber(Partner obj){
        if(this.partnerNumber == null || obj.partnerNumber == null) return false;
        if(this.partnerNumber.equals(obj.partnerNumber)) return true;
        return false;
    }
    
    public void update(Partner p){
        if(this.equalsByNumber(p)){ // only update if its equal by partnerNumber
            if(p.country != null){
                this.country = p.country;
            }
            if(p.partnerName != null){
                this.partnerName = p.partnerName;
            }
            if(p.salesOrg != null){
                this.salesOrg = p.salesOrg;
            }
            if(p.technicls != null){
                for (Technical tec : p.technicls) {
                    if( !this.technicls.stream().anyMatch(t->t.equalsByDirectionAndMessage(tec))){
                        tec.setPartner(this);
                        this.technicls.add(tec); // append the techincal to update the partner. 
                    }
                }
            }
            
            if(p.contacts != null){
                for (Contact con : p.contacts) {
                    if(!this.contacts.stream().anyMatch(c->c.equalsByNameAndType(con))){
                        con.setPartner(this);
                        this.contacts.add(con); //apend the contact;
                    }
                }
            }
        }
    }

    @Override
    public String toString() {
        return partnerName;
    }

   


    public SapUpdate getSapUpdate() {
        return sapUpdate;
    }

    public void setSapUpdate(SapUpdate sapUpdate) {
        this.sapUpdate = sapUpdate;
    }

    @PreUpdate
    @PrePersist
    public void setLastUpdate() {
        this.setUpdateTime(new Date());
    }
}
