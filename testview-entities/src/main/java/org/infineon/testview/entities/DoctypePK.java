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
public class DoctypePK implements Serializable {

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
    @Column(name = "TYPEID")
    private String typeid;

    public DoctypePK() {
    }

    public DoctypePK(String instance, String environment, String typeid) {
        this.instance = instance;
        this.environment = environment;
        this.typeid = typeid;
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

    public String getTypeid() {
        return typeid;
    }

    public void setTypeid(String typeid) {
        this.typeid = typeid;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (instance != null ? instance.hashCode() : 0);
        hash += (environment != null ? environment.hashCode() : 0);
        hash += (typeid != null ? typeid.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof DoctypePK)) {
            return false;
        }
        DoctypePK other = (DoctypePK) object;
        if ((this.instance == null && other.instance != null) || (this.instance != null && !this.instance.equals(other.instance))) {
            return false;
        }
        if ((this.environment == null && other.environment != null) || (this.environment != null && !this.environment.equals(other.environment))) {
            return false;
        }
        if ((this.typeid == null && other.typeid != null) || (this.typeid != null && !this.typeid.equals(other.typeid))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.b2btestview.model.entity.DoctypePK[ instance=" + instance + ", environment=" + environment + ", typeid=" + typeid + " ]";
    }
    
}
