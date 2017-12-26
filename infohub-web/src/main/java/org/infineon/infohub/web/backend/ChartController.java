/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.io.Serializable;
import javax.annotation.PostConstruct;
import javax.enterprise.context.RequestScoped;
import javax.enterprise.context.SessionScoped;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.infohub.service.dao.PartnerFacadeREST;
import org.primefaces.model.chart.PieChartModel;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class ChartController implements Serializable {

    private PieChartModel pieRegion;
    private PieChartModel pieType;

    private PieChartModel pieTechStandard;
        private PieChartModel pieTechConType;


    @Inject
    PartnerFacadeREST partnerFacade;

    @PostConstruct
    public void init() {
        pieRegion = new PieChartModel(partnerFacade.countRegions());
        pieRegion.setTitle("Partners Region");
        pieRegion.setLegendPosition("w");
        pieRegion.setShowDataLabels(true);

        
        
         pieType = new PieChartModel(partnerFacade.countPartnerType());
        pieType.setTitle("Partners Types");
        pieType.setLegendPosition("w");
        pieType.setShowDataLabels(true);
        
     
       

        
        
         pieTechStandard = new PieChartModel(partnerFacade.countTechStandard());
        pieTechStandard.setTitle("Technical Standards");
        pieTechStandard.setLegendPosition("w");
        pieTechStandard.setShowDataLabels(true);
        
        
         pieTechConType = new PieChartModel(partnerFacade.countTechConnectionType());
        pieTechConType.setTitle("Technical Connection Types");
        pieTechConType.setLegendPosition("w");
        pieTechConType.setShowDataLabels(true);
    }

    public PieChartModel getPieRegion() {

        return pieRegion;
    }

    public void setPieRegion(PieChartModel pieRegion) {
        this.pieRegion = pieRegion;
    }

    public PieChartModel getPieType() {
        return pieType;
    }

    public void setPieType(PieChartModel pieType) {
        this.pieType = pieType;
    }

    public PieChartModel getPieTechStandard() {
        return pieTechStandard;
    }

    public void setPieTechStandard(PieChartModel pieTechStandard) {
        this.pieTechStandard = pieTechStandard;
    }

    public PieChartModel getPieTechConType() {
        return pieTechConType;
    }

    public void setPieTechConType(PieChartModel pieTechConType) {
        this.pieTechConType = pieTechConType;
    }

   
    
    

}
