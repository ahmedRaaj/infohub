/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.service.excel;

import java.util.List;
import javax.ejb.Stateless;
import org.infineon.infohub.entities.Partner;

/**
 *
 * @author Raaj
 */
@Stateless
public class ExcelServeice {
    
   
    
    
    public List<Partner> updateFromExcel(List<Partner> toBeUpdateList, List<Partner> updateFromList){
        
        
        Partner source;
        for (Partner partner : updateFromList) {
            if (toBeUpdateList.isEmpty()) {
                toBeUpdateList.add(partner);
            } else {
                source = toBeUpdateList.parallelStream().filter(p -> p.equalsByNumber(partner)).findFirst().orElse(null);
                if (source != null) {
                    source.update(partner);
                } else {    // if partner from updateFromList doesnt exit in source(toBeList) add it
                    toBeUpdateList.add(partner);
                }
            }

        }
        return toBeUpdateList;
    }
    
    public List<Partner> updateFromExcelCLM(List<Partner> toBeUpdateList, List<Partner> clmPartner){
        Partner clmFound = null;
        for (Partner partner : toBeUpdateList) {
             clmFound = clmPartner.parallelStream().filter(p->p.equalsByNumber(partner)).findFirst().orElse(null);
             if(clmFound != null) partner.update(clmFound);
             clmFound = null;
        }
        
        return toBeUpdateList;
    }
    
}
