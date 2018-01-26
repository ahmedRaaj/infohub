/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.upload;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.infineon.infohub.entities.Contact;
import org.infineon.infohub.entities.Partner;
import org.infineon.infohub.entities.Technical;
import org.infineon.infohub.excel.common.ExcelType;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.junit.Test;

/**
 *
 * @author Raaj
 */
public class ScannedExcelTest {

    ScannedExcelPartner ex;
    String[] columns = {"SNDPRN", "SNDPRT", "MESTYP", "MESCOD"};
    String[] columns2 = {"RCVPRN", "RCVPRT", "MESTYP", "MESCOD"}; //outboundPIF
    String[] columns3 = {"Customer", "Name 1", "City", "Description"};
    String[] contacts = {"Pnum", "cname", "ctype", "email", "tel"};

    public ScannedExcelTest() {
        try {
            FileInputStream fin = new FileInputStream("workbook.xls");
            ex = new ScannedExcelPartner(WorkbookFactory.create(fin), columns, 0,ExcelType.TechInbound);
        } catch (FileNotFoundException ex) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, "File not Found");
        } catch (IOException | InvalidFormatException ex) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InvalidExcelException ex) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex);
        }

    }
     public List<Partner> updateFromExcelCLM(List<Partner> toBeUpdateList, List<Partner> clmPartner){
        Partner clmFound = null;
        for (Partner partner : toBeUpdateList) {
             clmFound = clmPartner.parallelStream().filter(p->p.equalsByNumber(partner)).findFirst().orElse(null);
             if(clmFound != null) partner.update(clmFound);
             clmFound = null;
        }
        
        return toBeUpdateList;
    }
    

    public List<Partner> updateFromExcel(List<Partner> toBeUpdateList, List<Partner> updateFromList) {

        Partner source;
        for (Partner partner : updateFromList) {
            if (toBeUpdateList.isEmpty()) {
                toBeUpdateList.add(partner);
            } else {
                source = toBeUpdateList.stream().filter(p -> p.equalsByNumber(partner)).findFirst().orElse(null);
                if (source != null) {
                    source.update(partner);
                } else {    // if partner from updateFromList doesnt exit in source(toBeList) add it
                    toBeUpdateList.add(partner);
                }
            }

        }
        return toBeUpdateList;
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    @Test
    @Ignore
    public void testUpdate() {
        try {
            ScannedExcelPartner ex = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("outboundPIF.xlsx")), columns2, 0,ExcelType.TechOutbound);
            List<Partner> pList = ex.getDataList();
            List<Partner> updated = new ArrayList<>();
            this.updateFromExcel(updated, pList);
           
            
            
            ScannedExcelPartner ex2 = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("outboundPIF.xlsx")), columns2, 0,ExcelType.TechOutbound);
            List<Partner> pList2 = ex2.getDataList();
            
            this.updateFromExcel(updated, pList2);
            
            
            ScannedExcelCLMPartner ex3 = new ScannedExcelCLMPartner(WorkbookFactory.create(new FileInputStream("CLM.XLSX")), columns3, 0,updated);
            List<Partner> pList3 = ex3.getDataList();
            this.updateFromExcelCLM(updated, pList3);
            
            
            printTech(updated);
           

        } catch (Exception ex1) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex1);
            fail("file could'nt converted");
        }
    }

    @Test
    @Ignore

    public void testOutboundPIF() {
        try {
            ScannedExcelPartner ex = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("outboundPIF.xlsx")), columns2, 0,ExcelType.TechOutbound);
            List<Partner> pList = ex.getDataList();
            assertEquals(6, pList.size());
            printTech(pList);

        } catch (Exception ex1) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex1);
            fail("file could'nt converted");
        }
    }

    @Test
    @Ignore

    public void testInboundPC1() {
        try {
            ScannedExcelPartner ex = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("inboundPC1.xlsx")), columns, 0,ExcelType.TechInbound);
            List<Partner> pList = ex.getDataList();
            assertEquals(18, pList.size());
            printTech(pList);

        } catch (IOException | EncryptedDocumentException | InvalidFormatException | InvalidExcelException ex1) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex1);
            fail("file could'nt converted: " + ex1.getMessage());
        }
    }

    @Test
    @Ignore
    public void testCLM() {
        try {
            ScannedExcelPartner ex = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("CLM.xlsx")), columns3, 0,ExcelType.Customer);
            List<Partner> pList = ex.getDataList();
            assertEquals(18, pList.size());
            printTech(pList);

        } catch (IOException | EncryptedDocumentException | InvalidFormatException | InvalidExcelException ex1) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex1);
            fail("file could'nt converted: " + ex1.getMessage());
        }
    }

    @Test
    @Ignore
    public void testContact() {
        try {
            ScannedExcelPartner ex = new ScannedExcelPartner(WorkbookFactory.create(new FileInputStream("contact.xls")), contacts, 2,ExcelType.Contact);
            List<Partner> pList = ex.getDataList();
            assertEquals(130, pList.size());
            printTech(pList);

        } catch (Exception ex1) {
            Logger.getLogger(ScannedExcelTest.class.getName()).log(Level.SEVERE, null, ex1);
            fail("file could'nt converted");
        }
    }

    public void printTech(List<Partner> list) {
        for (Partner p : list) {
            System.out.println(p.getPartnerNumber());
            for (Technical t : p.getTechnicls()) {
                System.out.println(t.getDirection() + " sourceMesage: " + t.getSourceMessage() + " Target Msg: " + t.getTargetMessage());

            }
            for (Contact c : p.getContacts()) {
                System.out.println(c.getContactName() + " type: " + c.getContactType() + " email: " + c.getEmail() + " Phone: " + c.getTelephone());

            }
        }

    }

    /**
     * Test of isValid method, of class ScannedExcel.
     */
    /**
     * Test of initHeaderColPosition method, of class ScannedExcel.
     */
    @org.junit.Test()
    @Ignore
    public void testInitHeaderColPosition() throws Exception {
        assertNotNull(ex);
        Map<String, Short> cols = ex.getHeaderMap();
        for (Map.Entry<String, Short> entry : cols.entrySet()) {
            System.out.println(entry.getKey() + " :===== " + entry.getValue());

        }
        List<Partner> dataList = ex.getDataList();
        assertEquals(dataList.size(), 4);
        for (Partner partner : dataList) {
            System.out.println(partner.getPartnerNumber());
            for (Technical technicl : partner.getTechnicls()) {
                System.out.println(technicl.getDirection() + " " + technicl.getSourceMessage() + technicl.getTargetMessage());

            }

        }

    }

}
