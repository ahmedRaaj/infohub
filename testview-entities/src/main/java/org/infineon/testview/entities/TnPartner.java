/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.entities;

import java.io.Serializable;
import java.util.List;
import javax.persistence.Basic;
import javax.persistence.Cacheable;
import javax.persistence.CascadeType;
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
import javax.xml.bind.annotation.XmlTransient;

/**
 *
 * @author raaj
 */
@Cacheable
@Entity
@Table(name = "IFX_TN_PARTNERS")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TnPartner.findAll", query = "SELECT t FROM TnPartner t")
    , @NamedQuery(name = "TnPartner.findByInstance", query = "SELECT t FROM TnPartner t WHERE t.tnPartnerPK.instance = :instance")
    , @NamedQuery(name = "TnPartner.findByEnvironment", query = "SELECT t FROM TnPartner t WHERE t.tnPartnerPK.environment = :environment")
    , @NamedQuery(name = "TnPartner.findByPartnerid", query = "SELECT t FROM TnPartner t WHERE t.tnPartnerPK.partnerid = :partnerid")
    , @NamedQuery(name = "TnPartner.findByCorporationname", query = "SELECT t FROM TnPartner t WHERE t.corporationname = :corporationname")
    , @NamedQuery(name = "TnPartner.findByOrgunitname", query = "SELECT t FROM TnPartner t WHERE t.orgunitname = :orgunitname")})
public class TnPartner implements Serializable {

    private static final long serialVersionUID = 1L;
    @EmbeddedId
    protected TnPartnerPK tnPartnerPK;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "CORPORATIONNAME")
    private String corporationname;
    @Size(max = 255)
    @Column(name = "ORGUNITNAME")
    private String orgunitname;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "sender")
    private List<Testcase> testcaseList;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "receiver")
    private List<Testcase> testcaseList1;

    public TnPartner() {
    }

    public TnPartner(TnPartnerPK tnPartnerPK) {
        this.tnPartnerPK = tnPartnerPK;
    }

    public TnPartner(TnPartnerPK tnPartnerPK, String corporationname) {
        this.tnPartnerPK = tnPartnerPK;
        this.corporationname = corporationname;
    }

    public TnPartner(String instance, String environment, String partnerid) {
        this.tnPartnerPK = new TnPartnerPK(instance, environment, partnerid);
    }

    public TnPartnerPK getTnPartnerPK() {
        return tnPartnerPK;
    }

    public void setTnPartnerPK(TnPartnerPK tnPartnerPK) {
        this.tnPartnerPK = tnPartnerPK;
    }

    public String getCorporationname() {
        return corporationname;
    }

    public void setCorporationname(String corporationname) {
        this.corporationname = corporationname;
    }

    public String getOrgunitname() {
        return orgunitname;
    }

    public void setOrgunitname(String orgunitname) {
        this.orgunitname = orgunitname;
    }

    @XmlTransient
    public List<Testcase> getTestcaseList() {
        return testcaseList;
    }

    public void setTestcaseList(List<Testcase> testcaseList) {
        this.testcaseList = testcaseList;
    }

    @XmlTransient
    public List<Testcase> getTestcaseList1() {
        return testcaseList1;
    }

    public void setTestcaseList1(List<Testcase> testcaseList1) {
        this.testcaseList1 = testcaseList1;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (tnPartnerPK != null ? tnPartnerPK.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof TnPartner)) {
            return false;
        }
        TnPartner other = (TnPartner) object;
        if ((this.tnPartnerPK == null && other.tnPartnerPK != null) || (this.tnPartnerPK != null && !this.tnPartnerPK.equals(other.tnPartnerPK))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.TnPartner[ tnPartnerPK=" + tnPartnerPK + " ]";
    }
    
}
