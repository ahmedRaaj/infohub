/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import java.math.BigInteger;
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
@Named
@Table(name = "DEV_CONTACT")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Contact.findAll", query = "SELECT c FROM Contact c")
    , @NamedQuery(name = "Contact.findByContactName", query = "SELECT c FROM Contact c WHERE c.contactName = :contactName")
    , @NamedQuery(name = "Contact.findByContactType", query = "SELECT c FROM Contact c WHERE c.contactType = :contactType")
    , @NamedQuery(name = "Contact.findByEmail", query = "SELECT c FROM Contact c WHERE c.email = :email")
    , @NamedQuery(name = "Contact.findByTelephone", query = "SELECT c FROM Contact c WHERE c.telephone = :telephone")
    , @NamedQuery(name = "Contact.findByStatus", query = "SELECT c FROM Contact c WHERE c.status = :status")
    , @NamedQuery(name = "Contact.findByUpdateTime", query = "SELECT c FROM Contact c WHERE c.updateTime = :updateTime")
    , @NamedQuery(name = "Contact.findByPartner", query = "SELECT c FROM Contact c WHERE c.partner = :partner")
            , @NamedQuery(name = "Contact.findDistType", query = "SELECT DISTINCT c.contactType FROM Contact c ")

    , @NamedQuery(name = "Contact.findByContactId", query = "SELECT c FROM Contact c WHERE c.contactId = :contactId")})
public class Contact implements Serializable {

    private static final long serialVersionUID = 1L;
    @Size(max = 100)
    @Column(name = "CNAME")
    private String contactName;
    @Size(max = 50)
    @Column(name = "CTYPE")
    private String contactType;
    // @Pattern(regexp="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", message="Invalid email")//if the field contains email address consider using this annotation to enforce field validation
    @Size(max = 100)
    @Column(name = "EMAIL")
    private String email;
    @Size(max = 50)
    @Column(name = "TEL")
    private String telephone;
    @Column(name = "RECSTAT")
    private Boolean status;
    @Column(name = "RECTIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;
    @Id
    @Basic(optional = false)
    @SequenceGenerator(name = "contactseq", sequenceName = "DEV_CONTACT_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "contactseq")

    @Size(min = 1, max = 32)
    @Column(name = "RECGUID")
    private String contactId;
    @JoinColumn(name = "PGUID", referencedColumnName = "RECGUID")
    @ManyToOne
    private Partner partner;

    public Contact() {
//        this.contactId = new SessionIdentifierGenerator().nextSessionId();
//        this.status = true;
//        this.updateTime = new Date();

    }

    public Contact(String contactId) {
        this();
        this.contactId = contactId;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactType() {
        return contactType;
    }

    public void setContactType(String contactType) {
        this.contactType = contactType;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
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

    public String getContactId() {
        return contactId;
    }

    public void setContactId(String contactId) {
        this.contactId = contactId;
    }

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 73 * hash + Objects.hashCode(this.contactId);
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
        final Contact other = (Contact) obj;
        if (!Objects.equals(this.contactId, other.contactId)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Contact ID: " + this.getContactId(); //To change body of generated methods, choose Tools | Templates.
    }

    public Contact clone() {
        Contact c = new Contact();
        c.contactName = contactName;
        c.contactType = contactType;
        c.email = email;
        c.status = true;
        c.telephone = telephone;
        return c;
    }
    
    @PrePersist
    public void setLastUpdate() {
        this.setUpdateTime(new Date() );
        this.status = true;
    }

}
