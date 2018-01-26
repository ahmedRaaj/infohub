/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.upload;

import java.io.IOException;
import java.io.InputStream;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.excel.common.ExcelType;

/**
 *
 * @author Raaj
 */
public class ScannedExcelPartner extends ScannedExcel<Partner> {

    public ScannedExcelPartner(Workbook workbook, String[] headerCol, int sheetPosition, ExcelType type) throws InvalidExcelException {
        super(workbook, headerCol, sheetPosition, type);
        if (type == ExcelType.Customer) {
            throw new IllegalArgumentException("CLM type will not accepted. use ScannedExcelCLMPartner instead");
        }
    }

    public ScannedExcelPartner(InputStream inputStream, String[] headerCol, int sheetPosition, ExcelType type) throws IOException, InvalidFormatException, InvalidExcelException {
        this(WorkbookFactory.create(inputStream), headerCol, sheetPosition, type);
    }

    @Override
    public Partner getData(Row row) {
        if (row == null) {
            return null;
        }
        Partner p = new Partner();
        String pNum = getCellValue(row.getCell(colIndex.get(0)));
        if (pNum == null) { // partner number not found. no data
            return null;
        }
        pNum = ("0000000000" + pNum).substring(pNum.length());
        p.setPartnerNumber(pNum);

        if (this.getType() == ExcelType.Contact) { // for upload by UI. 
            String name = getCellValue(row.getCell(colIndex.get(1)));
            if (name == null) {
                return null;
            }
            Contact c = new Contact();
            c.setContactName(name);
            c.setContactType(getCellValue(row.getCell(colIndex.get(2))));
            c.setEmail(getCellValue(row.getCell(colIndex.get(3))));
            c.setTelephone(getCellValue(row.getCell(colIndex.get(4))));
            if (c.getContactName() != null) {
                c.setPartner(p);
                p.getContacts().add(c);
            }
        } else if (this.getType() == ExcelType.TechInbound || this.getType() == ExcelType.TechOutbound) {
            if (!getCellValue(row.getCell(colIndex.get(1))).equalsIgnoreCase("KU")) {
                return null;
            }

            Technical t = new Technical();
            StringBuilder msg = new StringBuilder("IDOC-");
            String msgTyp = getCellValue(row.getCell(colIndex.get(2)));
            String msgCode = getCellValue(row.getCell(colIndex.get(3)));
            if (msgTyp != null) {
                msg.append(msgTyp);
            }
            if (msgCode != null) {
                msg.append("-").append(msgCode.length() < 3 ? ("000" + msgCode).substring(msgCode.length()) : msgCode);
            }
            if (this.getType() == ExcelType.TechInbound) {
                t.setDirection("Inbound");
                t.setTargetMessage(msg.toString());
            } else {
                t.setDirection("Outbound");
                t.setSourceMessage(msg.toString());
            }
            t.setPartner(p);
            p.getTechnicls().add(t);

        }
        return p;
    }
}
