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
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.excel.common.ExcelType;

/**
 *
 * @author Raaj
 */
public class ScannedExcelCLMPartner extends ScannedExcel<Partner> {

    private Set<String> partnerNumbers;

    public ScannedExcelCLMPartner(Workbook workbook, String[] headerCol, int sheetPosition, List<Partner> toCheckPartners) throws InvalidExcelException {
        super(workbook, headerCol, sheetPosition, ExcelType.Customer);
        partnerNumbers = toCheckPartners.parallelStream().filter(p -> p.getPartnerNumber() != null).map(p -> p.getPartnerNumber()).distinct().collect(Collectors.toSet());
       
    }

    public ScannedExcelCLMPartner(InputStream inputStream, String[] headerCol, int sheetPosition, List<Partner> toCheckPartners) throws IOException, InvalidFormatException, InvalidExcelException {
        this(WorkbookFactory.create(inputStream), headerCol, sheetPosition, toCheckPartners);
    }

    @Override
    public List<Partner> getDataList() throws InvalidExcelException {
        Objects.requireNonNull(getHeaderMap());
        if (dataList == null) {
            dataList = new ArrayList<>();

            for (int i = rowPositon + 1; i <= datatypeSheet.getLastRowNum(); i++) {
                Row row = datatypeSheet.getRow(i);
                if (row == null) {
                    continue;
                }

                String pNum = getCellValue(row.getCell(colIndex.get(0)));
                if (pNum == null) { // partner number not found. no data
                    continue;
                }
                pNum = ("0000000000" + pNum).substring(pNum.length());
                final String number = pNum;
                if (!partnerNumbers.parallelStream().anyMatch(s -> s.equals(number))) {
                    continue;
                }
                

                Partner data = getData(row);
                if (data != null) {
                    dataList.add(data);
                }

            }

        }
        return dataList;

    }

    @Override
    public Partner getData(Row row) {

        String pNum = getCellValue(row.getCell(colIndex.get(0)));

        pNum = ("0000000000" + pNum).substring(pNum.length());

        Partner p = new Partner();
        p.setPartnerNumber(pNum);

        p.setPartnerName(getCellValue(row.getCell(colIndex.get(1))));
        p.setCity(getCellValue(row.getCell(colIndex.get(2))));
        Contact clm = new Contact();
        clm.setContactName(getCellValue(row.getCell(colIndex.get(3))));
        clm.setContactType("IFX BIZ-CLM");
        clm.setStatus(true);
        if (clm.getContactName() != null && !clm.getContactName().equals("")) { //
            clm.setPartner(p);
            p.getContacts().add(clm);
        }
        return p;

    }

}
