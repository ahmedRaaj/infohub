/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.export.print;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import static org.infineon.infohub.excel.common.Columns.*;

/**
 *
 * @author Raaj
 */
public class ExcelPrinter implements Printer<HSSFWorkbook> {

    private final List<Partner> partners; //input data
    private final HSSFWorkbook workbook;  //input excel doc
    private final Map<String, String> messageMap;

    private final CellStyle cellStyle;
    private final CellStyle headerStyle;

    public static final String CONTACT_SHEET_NAME = "Contacts";
    public static final String TECHNICAL_SHEET_NAME = "Technicals";
    public static final String CUSTOMER_MESSAGE_SHEET_NAME = "Customer_Messages";
    public static final String PARTNER_SHEET_NAME = "Partners";

   

    private static final Logger LOGGER = Logger.getLogger(ExcelPrinter.class.getName());

    public ExcelPrinter(List<Partner> partners, HSSFWorkbook workbook, Map<String, String> messageMap) {
        LOGGER.setLevel(Level.ALL);
        this.partners = partners;
        this.workbook = workbook;
        this.messageMap = messageMap;

        //styling cell columns
        cellStyle = workbook.createCellStyle();
        //styling header columns
        headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        // Create a new font and alter it.
        Font headrFont = workbook.createFont();
        headrFont.setFontHeightInPoints((short) 10);
        headrFont.setFontName("Arial");
        headrFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headrFont);
        Font cellFont = workbook.createFont();
        cellFont.setFontHeightInPoints((short) 8);
        cellFont.setFontName("Arial");
        cellStyle.setFont(cellFont);
    }

    @Override
    public void print() {
        Objects.requireNonNull(partners);
        Objects.requireNonNull(workbook);

        createPartnerSheet();
        if (messageMap != null) {
            createCustomerMessageSheet();
        }
        createContactSheet();
        createTechnicalSheet();
        autofitContent();
    }

    private void autofitContent() {

        for (Sheet sheet : workbook) {
            short lastCol = sheet.getRow(0).getLastCellNum();
            for (int i = 0; i < lastCol; i++) {
                sheet.autoSizeColumn(i);
            }
        }

    }

    @Override
    public List<Partner> getInputData() {
        return this.partners;
    }

    @Override
    public HSSFWorkbook getPrintedDoc() {
        return this.workbook;
    }

    private void createCustomerMessageSheet() {
        HSSFSheet sheet = workbook.createSheet(CUSTOMER_MESSAGE_SHEET_NAME);
        createHeaderRow(sheet, CUSTOMER_MESSAGE_COLUMNS);
        int rowIndex = 1;
        String key;

        for (Partner partner : partners) {
            if (partner.getPartnerType() != null
                    && (partner.getPartnerType().equalsIgnoreCase("customer")
                    || partner.getPartnerType().equalsIgnoreCase("distributor"))) {

                for (Technical tec : partner.getTechnicls()) {
                    if (tec.getDirection() == null) {
                        //do nothing
                    } else {
                        HSSFRow row = sheet.createRow(rowIndex++);
                        addPartnerInRow(partner, row, 0); //inserting partner properties from 0th cell
                        addTechnicalInRow(tec, row, PARTNER_PROPERTY.length); // inserting technical properties after partner properties.
                        addMessageRefInRow((tec.getDirection().equalsIgnoreCase("Inbound") ? tec.getTargetMessage() : tec.getSourceMessage()), row, PARTNER_PROPERTY.length + TECHNICAL_PROPERTY.length);
                    }
                }

            }

        }

    }

    private void createContactSheet() {
        HSSFSheet sheet = workbook.createSheet(CONTACT_SHEET_NAME);
        createHeaderRow(sheet, CONTACT_COLUMNS);
        int rowIndex = 1;

        for (Partner partner : partners) {
            for (Contact contact : partner.getContacts()) {
                HSSFRow row = sheet.createRow(rowIndex++);
                addPartnerInRow(partner, row, 0); //inserting partner properties from 0th cell
                addContactInRow(contact, row, PARTNER_PROPERTY.length);
            }

        }
    }

    private void createTechnicalSheet() {
        HSSFSheet sheet = workbook.createSheet(TECHNICAL_SHEET_NAME);
        createHeaderRow(sheet, TECHNICAL_COLUMNS);
        int rowIndex = 1;

        for (Partner partner : partners) {
            for (Technical tec : partner.getTechnicls()) {
                HSSFRow row = sheet.createRow(rowIndex++);
                addPartnerInRow(partner, row, 0); //inserting partner properties from 0th cell
                addTechnicalInRow(tec, row, PARTNER_PROPERTY.length);
            }
        }
    }

    private void createHeaderRow(Sheet sheet, String[] columns) {
        Row row = sheet.createRow(0);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(columns[i].toUpperCase());
            cell.setCellStyle(headerStyle);
        }

    }

    private void addPartnerInRow(Partner partner, HSSFRow row, int startingIndex) {
        LOGGER.entering(this.getClass().getName(), "addPartnerInRow", new Object[]{partner, row});

        for (String prop : PARTNER_PROPERTY) {
            try {
                Field field = partner.getClass().getDeclaredField(prop);
                field.setAccessible(true);
                createDataCell(row, field.get(partner), startingIndex++);
            } catch (SecurityException | IllegalArgumentException ex) {
                LOGGER.log(Level.SEVERE, null, ex);
            } catch (NoSuchFieldException | IllegalAccessException ex) {
                Logger.getLogger(ExcelPrinter.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        LOGGER.log(Level.INFO, "partner property insertion finished at {0}", startingIndex - 1);

    }

    private void createDataCell(HSSFRow row, Object value, int position) {
        HSSFCell cell = row.createCell(position);
        cell.setCellValue(String.valueOf(value));
        cell.setCellStyle(cellStyle);
    }

    private void addContactInRow(Contact contact, HSSFRow row, int startingIndex) {
        LOGGER.entering(this.getClass().getName(), "addContactInRow", new Object[]{contact, row});

        for (String prop : CONTACT_PROPERTY) {
            try {
                Field field = contact.getClass().getDeclaredField(prop);
                field.setAccessible(true);
                createDataCell(row, field.get(contact), startingIndex++);
            } catch (SecurityException | IllegalArgumentException ex) {
                LOGGER.log(Level.SEVERE, ex.getMessage(), ex);
            } catch (NoSuchFieldException ex) {
                Logger.getLogger(ExcelPrinter.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IllegalAccessException ex) {
                Logger.getLogger(ExcelPrinter.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        LOGGER.log(Level.INFO, "contact property insertion finished at  {0}", startingIndex - 1);
    }

    private void addTechnicalInRow(Technical tecnical, HSSFRow row, int startingIndex) {
        LOGGER.entering(this.getClass().getName(), "addTechnicalInRow", new Object[]{tecnical, row});

        for (String prop : TECHNICAL_PROPERTY) {
            try {
                Field field = tecnical.getClass().getDeclaredField(prop);
                field.setAccessible(true);
                createDataCell(row, field.get(tecnical), startingIndex++);
            } catch (SecurityException | IllegalArgumentException ex) {
                LOGGER.log(Level.SEVERE, ex.getMessage(), ex);
            } catch (NoSuchFieldException ex) {
                Logger.getLogger(ExcelPrinter.class.getName()).log(Level.SEVERE, null, ex);
            } catch (IllegalAccessException ex) {
                Logger.getLogger(ExcelPrinter.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        LOGGER.log(Level.INFO, "Technical property insertion finished at  {0}", startingIndex - 1);
    }

    private void addMessageRefInRow(String message, HSSFRow row, int startingIndex) {
        if (message == null) {
            return;
        }
        createDataCell(row, message.trim(), startingIndex);
        createDataCell(row, messageMap.get(message.trim()), startingIndex + 1);

    }

    private void createPartnerSheet() {
        workbook.removeSheetAt(0);
        HSSFSheet sheet = workbook.createSheet(PARTNER_SHEET_NAME);
        createHeaderRow(sheet, PARTNER_COLUMNS);
        int rowIndex = 1;
        for (Partner partner : partners) {
            HSSFRow row = sheet.createRow(rowIndex++);
            addPartnerInRow(partner, row, 0);
        }
    }

}
