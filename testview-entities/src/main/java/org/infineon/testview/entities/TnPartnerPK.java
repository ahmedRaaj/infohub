/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.entities;

import java.io.Serializable;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 *
 * @author raaj
 */
@Embeddable
public class TnPartnerPK implements Serializable {

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
    @Column(name = "PARTNERID")
    private String partnerid;

    public TnPartnerPK() {
    }

    public TnPartnerPK(String instance, String environment, String partnerid) {
        this.instance = instance;
        this.environment = environment;
        this.partnerid = partnerid;
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

    public String getPartnerid() {
        return partnerid;
    }

    public void setPartnerid(String partnerid) {
        this.partnerid = partnerid;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (instance != null ? instance.hashCode() : 0);
        hash += (environment != null ? environment.hashCode() : 0);
        hash += (partnerid != null ? partnerid.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof TnPartnerPK)) {
            return false;
        }
        TnPartnerPK other = (TnPartnerPK) object;
        if ((this.instance == null && other.instance != null) || (this.instance != null && !this.instance.equals(other.instance))) {
            return false;
        }
        if ((this.environment == null && other.environment != null) || (this.environment != null && !this.environment.equals(other.environment))) {
            return false;
        }
        if ((this.partnerid == null && other.partnerid != null) || (this.partnerid != null && !this.partnerid.equals(other.partnerid))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.TnPartnerPK[ instance=" + instance + ", environment=" + environment + ", partnerid=" + partnerid + " ]";
    }
    
}
