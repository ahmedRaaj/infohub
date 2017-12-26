/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.sap.excel.model;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

    
/**
 *
 * @author Raaj
 */
public class SapPartner implements Serializable{
    private String customerNumber;
    private String name;
    private String city;
    private String description; //contact name
    private List<SapTechnincal> technicals;

    public String getCustomerNumber() {
        return customerNumber;
    }

    public void setCustomerNumber(String customerNumber) {
        this.customerNumber = customerNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTechnicals(List<SapTechnincal> technicals) {
        this.technicals = technicals;
    }

    public List<SapTechnincal> getTechnicals() {
        return technicals;
    }

    @Override
    public String toString() {
        return "SapPartner{" + "customerNumber=" + customerNumber + ", name=" + name + ", city=" + city + ", description=" + description + ", technicals=" + Arrays.toString(technicals.toArray()) + '}';
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 29 * hash + Objects.hashCode(this.customerNumber);
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
        final SapPartner other = (SapPartner) obj;
        if (!Objects.equals(this.customerNumber, other.customerNumber)) {
            return false;
        }
        return true;
    }

   
   

   

  
    
    
}
