/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.sap.excel.service;

import org.infineon.infohub.sap.excel.model.PC1InColName;
import org.infineon.infohub.sap.excel.model.PC1OutColName;
import org.infineon.infohub.sap.excel.model.PIFColName;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.sap.excel.exception.InvalidSapExcelFileException;
import org.infineon.infohub.sap.excel.model.CustomerColName;
import org.infineon.infohub.sap.excel.model.Direction;
import org.infineon.infohub.sap.excel.model.SapExcel;
import org.infineon.infohub.sap.excel.model.SapExcelType;
import org.infineon.infohub.sap.excel.model.SapPartner;
import org.infineon.infohub.sap.excel.model.SapTechnincal;

/**
 *
 * @author Raaj
 */
public class SapSync implements Serializable{

    private List<SapTechnincal> technicals;
    private Set<SapExcel> sapTechExcels;
    private Set<SapPartner> sapPartners;

    private Logger log;

    public SapSync() {
        this.technicals = new ArrayList<>();
        sapTechExcels = new HashSet<>();
        sapPartners = new HashSet<>();
        this.log = Logger.getLogger(this.getClass().getName());
    }

    public Set<SapExcel> getSapTechExcels() {
        return sapTechExcels;
    }

    public void setSapTechExcels(Set<SapExcel> sapTechExcels) {
        this.sapTechExcels = sapTechExcels;
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
//        SapSync sync = new SapSync();
//
//        try {
//            File file3 = new File("temp.xls");
//            FileInputStream inputStream3 = new FileInputStream(file3);
//            Workbook workbook3 = WorkbookFactory.create(inputStream3);
//            SapExcel exPc1In = new SapExcel(workbook3);
//
//            File file4 = new File("sap.xls");
//            FileInputStream inputStream4 = new FileInputStream(file4);
//            Workbook workbook4 = WorkbookFactory.create(inputStream4);
//            SapExcel ex = new SapExcel(workbook4);
//            sync.getSapTechExcels().add(ex);
//            sync.getSapTechExcels().add(exPc1In);
//
//            long startTime = System.currentTimeMillis();
//            sync.processSapFiles();
//
//            long endTime = System.currentTimeMillis();
//            long totalTime = endTime - startTime;
//            System.out.println(totalTime);
//           
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }

    }

    public void processSapFiles() {
        SapExcel customer = null;
        for (SapExcel sapTechExel : sapTechExcels) {
            if (sapTechExel.getFileType() == SapExcelType.Customer) {
                customer = sapTechExel;
                continue;
            } else {
                procesTechFile(sapTechExel);
            }
        }
        if (customer != null) {
            processCustomerSapFile(customer);
        }
    }

    private void procesTechFile(SapExcel sapExcel) {
        Workbook workbook = sapExcel.getWorkbook();
        SapExcelType type = sapExcel.getFileType();
        short startingRow = sapExcel.getDataRowPostion();
        Map<String, Short> colMap = sapExcel.getColumHeaderPosition();
        Sheet datatypeSheet = workbook.getSheetAt(0);
        Iterator<Row> iterator = datatypeSheet.iterator();
        String value;

        List<Short> colIndex = colMap.values().stream().sorted().collect(Collectors.toList()); //sorting as partnerNum,type,messageType,mssageCode
        short partnerNumIndex = colIndex.get(0);
        short partnerTypeIndex = colIndex.get(1);
        short messageTypeIndex = colIndex.get(2);
        short messageCodeIndex = colIndex.get(3);
        log.config("starting Row: " + startingRow + " And last Row: " + datatypeSheet.getLastRowNum());
        for (int i = startingRow; i <= datatypeSheet.getLastRowNum(); i++) {
            Row row = datatypeSheet.getRow(i);
            if (row == null) {
                continue;
            }

            if (row.getCell(partnerTypeIndex) != null
                    && row.getCell(partnerTypeIndex).getCellTypeEnum() == CellType.STRING
                    && row.getCell(partnerTypeIndex).getStringCellValue().equals("KU")) {
                //process only KU type

                SapTechnincal tec = new SapTechnincal(sapExcel.getFileType());
                Cell cell;
                for (int j = row.getFirstCellNum(); j < row.getLastCellNum(); j++) {
                    cell = row.getCell(j);
                    if (j == partnerNumIndex && cell == null) { // dont read row if parnternum empty
                        break;
                    }

                    if (cell == null) {  //dont read empty cell
                        continue;
                    }

                    if (j == partnerNumIndex) {
                        if (cell.getCellTypeEnum() == CellType.STRING) {
                            tec.setPartnerNo(cell.getStringCellValue());
                        } else if (cell.getCellTypeEnum() == CellType.NUMERIC) {
                            tec.setPartnerNo(String.valueOf(cell.getNumericCellValue()).split("\\.")[0]);
                        } else {
                            break;
                        }
                    } else if (j == messageTypeIndex) {
                        if (cell.getCellTypeEnum() == CellType.STRING) {
                            tec.setMessageType(cell.getStringCellValue());
                        }
                    } else if (j == messageCodeIndex) {
                        if (cell.getCellTypeEnum() == CellType.STRING) {
                            tec.setMessageCode(cell.getStringCellValue());
                        } else if (cell.getCellTypeEnum() == CellType.NUMERIC) {
                            tec.setMessageCode(String.valueOf(cell.getNumericCellValue()).split("\\.")[0]);
                        }
                    }
                }

                log.fine("Reading finished at row " + (i) + " " + tec.toString());
                technicals.add(tec);
            }
        }

    }

    public Map<String, List<SapTechnincal>> getTechMap() {
        Map<String, List<SapTechnincal>> techMap = technicals.stream().collect(Collectors.groupingBy(t -> t.getPartnerNo(), Collectors.mapping(p -> p, Collectors.toList())));
        return techMap;
    }

    public void processCustomerSapFile(SapExcel sapExcel) {
        Workbook workbook = sapExcel.getWorkbook();
        SapExcelType type = sapExcel.getFileType();
        short startingRow = sapExcel.getDataRowPostion();
        Map<String, Short> colMap = sapExcel.getColumHeaderPosition();
        Sheet datatypeSheet = workbook.getSheetAt(0);
        Iterator<Row> iterator = datatypeSheet.iterator();
        String value;
        Map<String, List<SapTechnincal>> techMap = getTechMap();
        log.config("techMap Size: " + techMap.size());

        List<Short> colIndex = colMap.values().stream().sorted().collect(Collectors.toList()); //sorting as partnerNum,type,messageType,mssageCode
        short customerNumberIndex = colIndex.get(0);
        short name1Index = colIndex.get(1);
        short cityIndex = colIndex.get(2);
        short descriptionIndex = colIndex.get(3);
        Cell cell;
        for (int i = startingRow; i < datatypeSheet.getLastRowNum(); i++) {
            Row row = datatypeSheet.getRow(i);
            if (row == null) {
                continue;
            }
            value = null;

            if (row.getCell(customerNumberIndex) != null) {
                cell = row.getCell(customerNumberIndex);
                if (cell.getCellTypeEnum() == CellType.STRING) {
                    value = cell.getStringCellValue();
                } else if (cell.getCellTypeEnum() == CellType.NUMERIC) {
                    value = String.valueOf(cell.getNumericCellValue()).split("\\.")[0];
                    if (value.length() < 10) {
                        value = ("0000000000" + value).substring(value.length());
                    }
                }

                if (techMap.containsKey(value)) {
                    //  System.out.println("## " + value);
                    SapPartner sPartner = new SapPartner();
                    sPartner.setCustomerNumber(value);
                    for (int j = row.getFirstCellNum(); j < row.getLastCellNum(); j++) {
                        cell = row.getCell(j);
                        if (cell == null) {
                            continue;
                        }
                        if (j == name1Index && cell.getCellTypeEnum() == CellType.STRING) {
                            sPartner.setName(cell.getStringCellValue());
                        } else if (j == cityIndex && cell.getCellTypeEnum() == CellType.STRING) {
                            sPartner.setCity(cell.getStringCellValue());
                        } else if (j == descriptionIndex && cell.getCellTypeEnum() == CellType.STRING) {
                            sPartner.setDescription(cell.getStringCellValue());
                        }
                    }

                    if (sapPartners.add(sPartner)) {
                        sPartner.setTechnicals(techMap.get(value));
                    }

                }
            }

        }

    }

    public Set<SapPartner> getSapPartners() {
        return sapPartners;
    }

    public void setSapPartners(Set<SapPartner> sapPartners) {
        this.sapPartners = sapPartners;
    }

}
