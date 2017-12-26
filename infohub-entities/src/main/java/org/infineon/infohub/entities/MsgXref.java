/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.entities;

import java.io.Serializable;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author Raaj
 */
@Entity
@Table(name = "DEV_MSG_XREF")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "MsgXref.findAll", query = "SELECT m FROM MsgXref m")
    , @NamedQuery(name = "MsgXref.findByMsg", query = "SELECT m FROM MsgXref m WHERE m.msg = :msg")
    , @NamedQuery(name = "MsgXref.findByMsgdescr", query = "SELECT m FROM MsgXref m WHERE m.msgdescr = :msgdescr")})
public class MsgXref implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 50)
    @Column(name = "MSG")
    private String msg;
    @Size(max = 70)
    @Column(name = "MSGDESCR")
    private String msgdescr;

    public MsgXref() {
    }

    public MsgXref(String msg) {
        this.msg = msg;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getMsgdescr() {
        return msgdescr;
    }

    public void setMsgdescr(String msgdescr) {
        this.msgdescr = msgdescr;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (msg != null ? msg.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof MsgXref)) {
            return false;
        }
        MsgXref other = (MsgXref) object;
        if ((this.msg == null && other.msg != null) || (this.msg != null && !this.msg.equals(other.msg))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.infineon.partnerdb.data.entity.MsgXref[ msg=" + msg + " ]";
    }
    
}
