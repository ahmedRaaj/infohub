/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.view.bean;

import java.io.Serializable;
import java.util.List;
import javax.ejb.EJB;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.testview.entities.Testcase;
import org.infineon.testview.service.dao.DoctypesFacade;
import org.infineon.testview.service.dao.TestcasesFacade;

import org.primefaces.event.RowEditEvent;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class TestCaseBean extends AbstractBean implements Serializable {

    @Inject
    private LazyTestCaseModel testcasesList;
    private List<String> statuses;
    
  
    

    @EJB
    DoctypesFacade doctypeFacade;
    @EJB
    TestcasesFacade testCaseFacade;

    public LazyTestCaseModel getTestcasesList() {

        return testcasesList;
    }

    public void setTestcasesList(LazyTestCaseModel testcasesList) {
        this.testcasesList = testcasesList;
    }

    public void onRowEdit(RowEditEvent event) {
        
        Testcase testCase =  (Testcase) event.getObject();
        Testcase change = testCaseFacade.find(testCase.getId());
        change.setDescription(testCase.getDescription());
        change.setStatus(testCase.getStatus());
        change.setAssigned(testCase.getAssigned());
        testCaseFacade.edit(change);
    }

    public List<String> getStatuses() {
        if(statuses == null){
            statuses = testCaseFacade.findAllStatus();
        }
        return statuses;
    }

    public void setStatuses(List<String> statuses) {
        this.statuses = statuses;
    }
    
    

    @Override
    public String getLoggerName() {
        return this.getClass().getName();
    }

}
