/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.testview.view.bean;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import org.infineon.testview.entities.Testcase;
import org.infineon.testview.service.dao.TestcasesFacade;
import org.primefaces.model.LazyDataModel;
import org.primefaces.model.SortOrder;

/**
 *
 * @author Raaj
 */
@Named
@ViewScoped
public class LazyTestCaseModel extends LazyDataModel<Testcase> {

    private static final Logger log = Logger.getLogger(LazyTestCaseModel.class.getName());
    private List<Testcase> datasource;
    private String instanceFilter;

    @Inject
    TestcasesFacade testCaseFacade;

//    public LazyTestCaseModel(List<Testcases> datasource) {
//        this.datasource = datasource;
//    }
    @Override
    public Testcase getRowData(String rowKey) {
        try {
            return testCaseFacade.find(Long.valueOf(rowKey));
        } catch (Exception e) {
            log.warning("Row data not found");
        }
        return null;
    }

    @Override
    public Object getRowKey(Testcase object) {
        return object.getId();
    }

    public List<Testcase> getDatasource() {
        return datasource;
    }

    @Override
    public List<Testcase> load(int first, int pageSize, String sortField, SortOrder sortOrder, Map<String, Object> filters) {
        List<Testcase> data = new ArrayList<>();

        if (instanceFilter != null) {                 //adding instance filter radiobox filtering. 
            filters.put("instance", instanceFilter);
        }

        if (sortField != null) {
            //todo sorting
            System.out.println("to do sorting");
        }

        int dataSize = testCaseFacade.count(filters);
        this.setRowCount(dataSize);

        try {
            datasource = testCaseFacade.findRange(new int[]{first, first + pageSize}, filters);

            // return data.subList(first, first + pageSize);
        } catch (IndexOutOfBoundsException e) {
            datasource = testCaseFacade.findRange(new int[]{first, first + (dataSize % pageSize)}, filters);

            // return data.subList(first, first + (dataSize % pageSize));
        }

//        if (sortField != null) {
//            if (datasource != null) {
//                return datasource.stream().sorted((t1, t2) -> {
//                    return (int) (t1.getId() - t2.getId());
//                }).collect(Collectors.toList());
//            }
//
//            System.out.println("to do sorting");
//        }

        return datasource;

    }

    public String getInstanceFilter() {
        return instanceFilter;
    }

    public void setInstanceFilter(String instanceFilter) {
        this.instanceFilter = instanceFilter;
    }

}
