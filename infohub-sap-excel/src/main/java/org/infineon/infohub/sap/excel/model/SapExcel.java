/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.sap.excel.model;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

/**
 *
 * @author Raaj
 */
public class SapExcel implements Serializable{

    private SapExcelType fileType;
    private Workbook workbook;
    private Map<String, Short> columHeaderPosition;
    private Short dataRowPostion;
    private Logger log =Logger.getLogger(this.getClass().getName());;

    public SapExcel(Workbook workbook) {
        this.workbook = workbook;
        log.setLevel(Level.ALL);
      
    }

    public SapExcel(InputStream inputStream) throws IOException, InvalidFormatException {
        this.workbook = WorkbookFactory.create(inputStream);
        log.setLevel(Level.ALL);

    }

    public boolean isValid() {
        return getFileType() != SapExcelType.Invalid;
    }

    public SapExcelType getFileType() {
        if (fileType == null) {
            Map<String, Short> colHead = getColumHeaderPosition();
            if (colHead.size() < 4 || this.dataRowPostion == null) {
                fileType = SapExcelType.Invalid;
            } else {
                if (colHead.containsKey(PC1InColName.SNDPRN.toString())) {
                    fileType = SapExcelType.PC1In;
                } else if (colHead.containsKey(PC1OutColName.RCVPRN.toString())) {
                    fileType = SapExcelType.PC1Out;
                } else if (colHead.containsKey(PIFColName.PartnerNo.toString())) {
                    if (colHead.containsKey(PIFColName.OutPutMode.toString())) {
                        fileType = SapExcelType.PIFout;
                    } else if (colHead.containsKey(PIFColName.InputMode.toString())) {
                        fileType = SapExcelType.PIFin;
                    }
                } else if (colHead.containsKey(CustomerColName.Customer.toString())) {
                    fileType = SapExcelType.Customer;
                }

            }
            log.config("File Type: " + fileType);
        }

        return fileType;
    }

    public Workbook getWorkbook() {
        return workbook;
    }

    public Map<String, Short> getColumHeaderPosition() {
        if (columHeaderPosition == null) {
            columHeaderPosition = initColMap();
        }
        return columHeaderPosition;
    }

    public short getDataRowPostion() {
        return dataRowPostion;
    }

    private Map<String, Short> initColMap() {
        Map<String, Short> hPos = new TreeMap<>();
        Sheet datatypeSheet = workbook.getSheetAt(0);
        log.fine("Starting ColumnHeader Mapping for : " + datatypeSheet.getSheetName());
        Iterator<Row> iterator = datatypeSheet.iterator();
        String value;
        short indexRow = 0;
        while (iterator.hasNext()) {
            indexRow++;
            Row currentRow = iterator.next();
            if (currentRow == null) {
                log.warning("null row at : "+ indexRow);
                continue;
            }
            for (short i = currentRow.getFirstCellNum(); i < currentRow.getLastCellNum(); i++) {
                if (currentRow.getCell(i) == null || currentRow.getCell(i).getCellTypeEnum() != CellType.STRING || currentRow.getCell(i).getStringCellValue().equals("")) {
                    continue;
                }
                //only process string cell value to look for coulmn header;
                value = currentRow.getCell(i).getStringCellValue();

                if (value.equals(PC1InColName.SNDPRN.name())) {  //pc1In 
                    hPos.put(PC1InColName.SNDPRN.name(), i);
                    dataRowPostion = (short) (currentRow.getRowNum() + 1);
                } else if (value.equals(PC1InColName.SNDPRT.name())) { //pc1In
                    hPos.put(PC1InColName.SNDPRT.name(), i);

                } else if (value.equals(PC1OutColName.RCVPRN.name())) { //pc1Out
                    hPos.put(PC1OutColName.RCVPRN.name(), i);
                    dataRowPostion = (short) (currentRow.getRowNum() + 2);

                } else if (value.equals(PC1OutColName.RCVPRT.name())) { //pc1Out
                    hPos.put(PC1OutColName.RCVPRT.name(), i);

                } else if (value.equals(PC1InColName.MESTYP.name())) {  // pc1 and pif in out(4 excel have this col)
                    hPos.put(PC1InColName.MESTYP.name(), i);

                } else if (value.equals(PC1InColName.MESCOD.name())) {  // pc1 and pif in out(4 excel have this col)
                    hPos.put(PC1InColName.MESCOD.name(), i);

                } else if (value.equals(PIFColName.PartnerNo.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.PartnerNo.toString(), i);
                    dataRowPostion = (short) (currentRow.getRowNum() + 2);

                } else if (value.equals(PIFColName.PartnerType.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.PartnerType.toString(), i);

                } else if (value.equals(PIFColName.MESTYP.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.MESTYP.toString(), i);

                } else if (value.equals(PIFColName.MESCOD.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.MESCOD.toString(), i);

                } else if (value.equals(PIFColName.OutPutMode.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.OutPutMode.toString(), i);

                } else if (value.equals(PIFColName.InputMode.toString())) { //PifIn and PifOut
                    hPos.put(PIFColName.InputMode.toString(), i);

                } else if (value.equals(CustomerColName.Customer.toString())) {
                    hPos.put(CustomerColName.Customer.toString(), i);
                    dataRowPostion = (short) (currentRow.getRowNum() + 2);

                } else if (value.equals(CustomerColName.Name1.toString())) {
                    hPos.put(CustomerColName.Name1.toString(), i);

                } else if (value.equals(CustomerColName.City.toString())) {
                    hPos.put(CustomerColName.City.toString(), i);

                } else if (value.equals(CustomerColName.Description.toString())) {
                    hPos.put(CustomerColName.Description.toString(), i);
                }

            }
            if (indexRow > 10) {
                break;
            }
        }
        log.fine("Data Reading row index: " + dataRowPostion);
        hPos.forEach((e, v) -> log.config("Column Header: " + e + " : " + v));

        return hPos;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 79 * hash + Objects.hashCode(this.fileType);
        hash = 79 * hash + Objects.hashCode(this.dataRowPostion);
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
        final SapExcel other = (SapExcel) obj;
        if (this.fileType != other.fileType) {
            return false;
        }
        if (!Objects.equals(this.dataRowPostion, other.dataRowPostion)) {
            return false;
        }
        return true;
    }
    
    

}
