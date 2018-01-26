/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.bean;

import java.io.Serializable;
import javax.faces.view.ViewScoped;
import javax.inject.Named;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class PartnerFilterBean implements Serializable {

    private String sourceMessage;
    private String targetMessage;
    private String connection;
    private String standerd;
    private boolean lastSapUpdated;
    private boolean nonSap;
    private boolean missingIT;
    private String filterCondition = "And";
    private int count=0;

    public String getSourceMessage() {
        return sourceMessage;
    }

    public void setSourceMessage(String sourceMessage) {
       
        this.sourceMessage = sourceMessage;
    }

    public String getTargetMessage() {
        return targetMessage;
    }

    public void setTargetMessage(String targetMessage) {
        
        this.targetMessage = targetMessage;
    }

    public boolean isLastSapUpdated() {
        return lastSapUpdated;
    }

    public void setLastSapUpdated(boolean lastSapUpdated) {
        this.lastSapUpdated = lastSapUpdated;
    }

    public boolean isNonSap() {
        return nonSap;
    }

    public void setNonSap(boolean nonSap) {
        this.nonSap = nonSap;
    }

    public boolean isMissingIT() {
        return missingIT;
    }

    public void setMissingIT(boolean missingIT) {
        this.missingIT = missingIT;
    }

    public String getConnection() {
        return connection;
    }

    public void setConnection(String connection) {
       
        this.connection = connection;
    }

    public String getStanderd() {
        return standerd;
    }

    public void setStanderd(String standerd) {
        
        this.standerd = standerd;
    }

    @Override
    public String toString() {
        return "PartnerFilter{" + "sourceMessage=" + sourceMessage + ", targetMessage=" + targetMessage + ", connection=" + connection + ", standerd=" + standerd + ", lastSapUpdated=" + lastSapUpdated + ", nonSap=" + nonSap + ", missingIT=" + missingIT + '}';
    }

    public void reset() {
        this.sourceMessage = null;
        this.targetMessage = null;
        this.lastSapUpdated = false;
        this.nonSap = false;
        this.missingIT = false;
        this.connection = null;
        this.standerd = null;
        this.count = 0;
        this.filterCondition = "And";
    }

    public String getFilterCondition() {
        return filterCondition;
    }

    public void setFilterCondition(String filterCondition) {
        this.filterCondition = filterCondition;
    }

    public int getCount() {
        count = 0;
        if(this.connection != null)count++;
        if(this.sourceMessage != null) count++;
        if(this.targetMessage != null) count++;
        if(this.standerd != null) count++;
        if(this.lastSapUpdated)count++;
        if(this.missingIT) count++;
        if(this.nonSap) count++;
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

   

}
