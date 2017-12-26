/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.entities;

import java.io.Serializable;
import java.util.Collection;
import javax.persistence.Basic;
import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author raaj
 */
@Cacheable
@Entity
@Table(name = "IFX_TN_DOCTYPES")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Doctype.findAll", query = "SELECT d FROM Doctype d")
    , @NamedQuery(name = "Doctype.findByInstance", query = "SELECT d FROM Doctype d WHERE d.doctypePK.instance = :instance")
    , @NamedQuery(name = "Doctype.findByEnvironment", query = "SELECT d FROM Doctype d WHERE d.doctypePK.environment = :environment")
    , @NamedQuery(name = "Doctype.findByTypeid", query = "SELECT d FROM Doctype d WHERE d.doctypePK.typeid = :typeid")
    , @NamedQuery(name = "Doctype.findByTypename", query = "SELECT d FROM Doctype d WHERE d.typename = :typename")})
public class Doctype implements Serializable {

    private static final long serialVersionUID = 1L;
    @EmbeddedId
    protected DoctypePK doctypePK;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 128)
    @Column(name = "TYPENAME")
    private String typename;
    @OneToMany(mappedBy = "doctype")
    private Collection<Testcase> testCases;

    public Doctype() {
    }

    public Doctype(DoctypePK doctypePK) {
        this.doctypePK = doctypePK;
    }

    public Doctype(DoctypePK doctypePK, String typename) {
        this.doctypePK = doctypePK;
        this.typename = typename;
    }

    public Doctype(String instance, String environment, String typeid) {
        this.doctypePK = new DoctypePK(instance, environment, typeid);
    }

    public DoctypePK getDoctypePK() {
        return doctypePK;
    }

    public void setDoctypePK(DoctypePK doctypePK) {
        this.doctypePK = doctypePK;
    }

    public String getTypename() {
        return typename;
    }

    public void setTypename(String typename) {
        this.typename = typename;
    }

    public Collection<Testcase> getTestCases() {
        return testCases;
    }

    public void setTestCases(Collection<Testcase> testCases) {
        this.testCases = testCases;
    }
    

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (doctypePK != null ? doctypePK.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Doctype)) {
            return false;
        }
        Doctype other = (Doctype) object;
        if ((this.doctypePK == null && other.doctypePK != null) || (this.doctypePK != null && !this.doctypePK.equals(other.doctypePK))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.Doctype[ doctypePK=" + doctypePK + " ]";
    }
    
}
