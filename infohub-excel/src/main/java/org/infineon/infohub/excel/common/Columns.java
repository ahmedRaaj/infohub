/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.common;

import java.util.Arrays;
import java.util.stream.Stream;

/**
 *
 * @author Raaj
 */
public  class Columns {
    public static final String[] PARTNER_PROPERTY = {"partnerNumber", "partnerName", "partnerGroup", "partnerType", "salesOrg", "region", "country", "city", "b2bManager"};
    public final static String[] CONTACT_PROPERTY = {"contactName", "contactType", "email", "telephone"};
    public static final String[] TECHNICAL_PROPERTY = {"connectionType", "techid", "businessProcess", "sourceMessage", "targetMessage", "direction", "standard", "tnFrom", "tnTo"};
    public static final String[] MESSAGE_PROPERTY = {"MSG", "EDI_MSG"};

    public static final String[] PARTNER_COLUMNS = PARTNER_PROPERTY;
    public static final String[] CONTACT_COLUMNS = Stream.concat(Arrays.stream(PARTNER_PROPERTY), Arrays.stream(CONTACT_PROPERTY)).toArray(String[]::new);
    public static final String[] TECHNICAL_COLUMNS = Stream.concat(Arrays.stream(PARTNER_PROPERTY), Arrays.stream(TECHNICAL_PROPERTY)).toArray(String[]::new);
    public static final String[] CUSTOMER_MESSAGE_COLUMNS = Stream.concat(Arrays.stream(TECHNICAL_COLUMNS), Arrays.stream(MESSAGE_PROPERTY)).toArray(String[]::new);
}
