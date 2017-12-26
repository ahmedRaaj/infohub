/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.print;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;
import javax.inject.Named;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFFontFormatting;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.format.CellTextFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ConditionalFormattingRule;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.PatternFormatting;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.SheetConditionalFormatting;
import org.apache.poi.ss.util.CellRangeAddress;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;


/**
 *
 * @author Raaj
 */
public class ExcelPrint implements Serializable {

    private List<Partner> partners;
    private HSSFWorkbook workbook;
    public static final String contactSheetName = "Contact";
    public static final String technicalSheetName = "Technical";
    public static final String customerMessageSheetName = "Customer_Message";

    public ExcelPrint(List<Partner> partners, HSSFWorkbook workbook) {
        this.partners = partners;
        this.workbook = workbook;
    }

    public void print(Map<String, String> msgMap) {
        //workbook.removeSheetAt(0);
        String[] columnsContacts = {"PNUM", "PNAME", "PGRP", "PTYPE", "SALESORG", "REGION", "COUNTRY", "CITY", "B2BMANAGER", "CNAME", "CTYPE", "EMAIL", "TEL"};
        String[] columnsTech = {"PNUM", "PNAME", "PGRP", "PTYPE", "SALESORG", "REGION", "COUNTRY", "CITY", "B2BMANAGER", "CONNTYPE", "TECHID", "BUSPROC", "SOURCEMSG", "TARGETMSG", "DIRECTION", "STANDARD", "TNFROM", "TNTO", "CNAME", "CTYPE", "EMAIL", "TEL"};
        String[] columnsCustomerMessage = {"PNUM", "PNAME", "PGRP", "PTYPE", "SALESORG", "REGION", "COUNTRY", "CITY", "B2BMANAGER", "CONNTYPE", "TECHID", "BUSPROC", "SOURCEMSG", "TARGETMSG", "DIRECTION", "STANDARD", "TNFROM", "TNTO", "MSG", "EDI_MSG"};

        autofitContent(createCustomerMessageSheet(customerMessageSheetName, columnsCustomerMessage, msgMap));
        autofitContent(createSheet(contactSheetName, columnsContacts));
        autofitContent(createSheet(technicalSheetName, columnsTech));

        //createTechnicalSheet();
    }

    public Sheet createCustomerMessageSheet(String SheetName, String[] columns, Map<String, String> messageMap) {
        HSSFSheet sheet = workbook.createSheet(SheetName);
        createHeaderRow(sheet, columns);
        int rowIndex = 1;
        String key;

        for (Partner partner : partners) {
            if (partner.getPartnerType() == null) {
                continue;
            }
            if (partner.getPartnerType().equalsIgnoreCase("Customer") || partner.getPartnerType().equalsIgnoreCase("Distributor")) {
                for (Technical tec : partner.getTechnicls()) {
                    if (tec.getDirection() == null) {
                        continue;
                    }
                    HSSFRow row = sheet.createRow(rowIndex++);
                    

                    if (tec.getDirection().equals("Inbound")) {
                        row.createCell(18).setCellValue(tec.getTargetMessage());
                         key = tec.getTargetMessage();
                         if(key == null ) continue;
                        if (key.endsWith("-")) {
                            key = key.substring(0, key.length() - 1);
                        }
                        row.createCell(19).setCellValue(messageMap.get(key.trim()));
                    } else if (tec.getDirection().equals("Outbound")) {
                        row.createCell(18).setCellValue(tec.getSourceMessage());
                         key = tec.getSourceMessage();
                        if(key == null) continue;
                        if (key.endsWith("-")) {
                            key = key.substring(0, key.length() - 1);
                        }
                        row.createCell(19).setCellValue(messageMap.get(key.trim()));
                    }
                    
                    createPartnerRow(row, partner);
                    createTechnicalRow(9, row, tec);

                }
            }
        }

        return sheet;
    }

    private void createHeaderRow(Sheet sheet, String[] columns) {
        Row row = sheet.createRow(0);
        HSSFCellStyle cellStyle = workbook.createCellStyle();
        cellStyle.setFillForegroundColor(HSSFColor.GREEN.index);

        // Create a new font and alter it.
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 12);
        font.setFontName("Arial");
        cellStyle.setFont(font);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(cellStyle);
        }

    }

    private Sheet createSheet(String sheetName, String[] headerCols) {
        HSSFSheet sheet = workbook.createSheet(sheetName);

        createHeaderRow(sheet, headerCols);

        int rowIndex = 1;
        short techIndex = 0;
        int partnerCol = 8;

        for (Partner partner : partners) {
            List<Technical> tecs = null;
            if (sheetName.equals(technicalSheetName) && !partner.getTechnicls().isEmpty()) {
                tecs = new ArrayList<>(partner.getTechnicls());
            }
            for (Contact contact : partner.getContacts()) {
                HSSFRow row = sheet.createRow(rowIndex++);
                createPartnerRow(row, partner);
                if (sheetName.equals(technicalSheetName)) {
                    if (tecs != null && tecs.size() > techIndex) {
                        createTechnicalRow(9, row, tecs.get(techIndex++));
                    }
                    createContactRow(18, row, contact);

                } else {
                    createContactRow(9, row, contact);

                }
            }
            techIndex = 0;

        }

        return sheet;

    }

    private void createPartnerRow(HSSFRow row, Partner partner) {

        row.createCell(0).setCellValue(partner.getPartnerNumber());
        row.createCell(1).setCellValue(partner.getPartnerName());
        row.createCell(2).setCellValue(partner.getPartnerGroup());
        row.createCell(3).setCellValue(partner.getPartnerType());
        row.createCell(4).setCellValue(partner.getSalesOrg());
        row.createCell(5).setCellValue(partner.getRegion());
        row.createCell(6).setCellValue(partner.getCountry());
        row.createCell(7).setCellValue(partner.getCity());
        row.createCell(8).setCellValue(partner.getB2bManager());

    }

    private void createContactRow(int n, HSSFRow row, Contact contact) {
        row.createCell(n).setCellValue(contact.getContactName());
        row.createCell(n + 1).setCellValue(contact.getContactType());
        row.createCell(n + 2).setCellValue(contact.getEmail());
        row.createCell(n + 3).setCellValue(contact.getTelephone());
    }

    private void autofitContent(Sheet sheet) {

        short lastCol = sheet.getRow(0).getLastCellNum();
        for (int i = 0; i < lastCol; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createTechnicalRow(int n, HSSFRow row, Technical technicl) {
        row.createCell(n).setCellValue(technicl.getConnectionType());
        row.createCell(n + 1).setCellValue(technicl.getTechid());
        row.createCell(n + 2).setCellValue(technicl.getBusinessProcess());
        row.createCell(n + 3).setCellValue(technicl.getSourceMessage());
        row.createCell(n + 4).setCellValue(technicl.getTargetMessage());
        row.createCell(n + 5).setCellValue(technicl.getDirection());
        row.createCell(n + 6).setCellValue(technicl.getStandard());
        row.createCell(n + 7).setCellValue(technicl.getTnFrom());
        row.createCell(n + 8).setCellValue(technicl.getTnTo());

    }

}
