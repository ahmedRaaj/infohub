/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.upload;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.excel.common.ExcelType;

/**
 *
 * @author Raaj
 */
public abstract class ScannedExcel<T> {

    protected Workbook workbook;
    protected String[] headerColumns;
    protected Sheet datatypeSheet;
    private static int MAXROWNUMBERTOSEARCH = 16;
    protected Map<String, Short> headerMap;
    protected short rowPositon = 0;
    protected List<Short> colIndex;
    protected ExcelType type;

    List<T> dataList;

    public ScannedExcel(Workbook workbook, String[] headerCol, int sheetPosition,ExcelType type) throws InvalidExcelException {
        this.workbook = workbook;
        this.headerColumns = headerCol;
        this.type=type;
        datatypeSheet = workbook.getSheetAt(sheetPosition);
        Objects.requireNonNull(datatypeSheet, "Sheet could not found");
        colIndex = getHeaderMap().values().stream().sorted().collect(Collectors.toList()); //sorting as partnerNum,type,messageType,mssageCode

    }

    public ScannedExcel(InputStream inputStream, String[] headerCol, int sheetPosition,ExcelType type) throws IOException, InvalidFormatException, InvalidExcelException {
        this(WorkbookFactory.create(inputStream), headerCol, sheetPosition,type);
    }



    public Map<String, Short> getHeaderMap() throws InvalidExcelException {
       
            if (headerMap == null) {
                headerMap = initHeaderColPosition();
            }
        
        return headerMap;
    }

    public void setHeaderMap(Map<String, Short> headerMap) {
        this.headerMap = headerMap;
    }

    public abstract T getData(Row row);

    public List<T> getDataList() throws InvalidExcelException {
        Objects.requireNonNull(getHeaderMap());
        if (dataList == null) {
            dataList = new ArrayList<>();

            for (int i = rowPositon + 1; i <= datatypeSheet.getLastRowNum(); i++) {
                Row row = datatypeSheet.getRow(i);
                if (row != null) {
                    T data = getData(row);
                    if (data != null) {
                        dataList.add(data);
                        System.out.println(rowPositon);
                    }
                }
            }

        }
        return dataList;

    }

    private Map<String, Short> initHeaderColPosition() throws InvalidExcelException {
        Objects.requireNonNull(headerColumns, "HeaderColumns is not set");
        Objects.requireNonNull(workbook, "workbook is not valid");

        Map<String, Short> hPos = new TreeMap<>();

        short columnPos = 0;
        Cell cell;
        boolean matched;

        for (String header : headerColumns) {
            matched = false;
            while (rowPositon < MAXROWNUMBERTOSEARCH && !matched) {
                System.out.println("checking for header:at  "+ rowPositon);
                Row row = datatypeSheet.getRow(rowPositon);

                if (row == null) {
                    rowPositon++; // nothing to process. 
                } else {
                    columnPos = hPos.isEmpty() ? row.getFirstCellNum() : columnPos; // restore the columnPos or initiate for first time. 
                    while (columnPos < row.getLastCellNum()) {
                        cell = row.getCell(columnPos);
                        System.out.println("in while: " + rowPositon);
                        if (cell == null || cell.getCellTypeEnum() != CellType.STRING || cell.getStringCellValue().equals("") || !cell.getStringCellValue().equalsIgnoreCase(header)) {
                            columnPos++;
                        } else if (cell.getStringCellValue().equalsIgnoreCase(header)) {
                            hPos.put(header, columnPos++);
                            matched = true;  //found the header. so break both loop. 
                            break;
                        } else {
                            columnPos++;
                        }
                    }
                    if (!matched) {
                        if (hPos.isEmpty()) {
                            rowPositon++; //still not found the first header. 
                        } else {
                            throw new InvalidExcelException("header not found"); //subsequent any header missing. 
                        }
                    }
                }

            }

        }
        if(hPos.isEmpty()) throw new InvalidExcelException("header missing");
        return hPos;
    }

    public short getRowPositon() {
        return rowPositon;
    }

    protected String getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        if (cell.getCellTypeEnum() == CellType.NUMERIC) {
            return String.valueOf(cell.getNumericCellValue()).split("\\.")[0];
        } else if (cell.getCellTypeEnum() == CellType.STRING) {
            return cell.getStringCellValue();
        }
        return null;
    }

    public ExcelType getType() {
        return type;
    }

    public void setType(ExcelType type) {
        this.type = type;
    }

}
