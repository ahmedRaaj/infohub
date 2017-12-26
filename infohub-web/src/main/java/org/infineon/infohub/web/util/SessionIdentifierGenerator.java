/*
 * Copyright by Ahmed Alamin Raaj
 * email: ahmedraaj@gmail.com
 * National University of Singapore
 */
package org.infineon.infohub.web.util;

/**
 *
 * @author ahmedraaj
 */
import java.security.SecureRandom;
import java.math.BigInteger;

public  final class  SessionIdentifierGenerator {
  private static SecureRandom random;
  static{
      random = new SecureRandom();
  }

  public static String nextSessionId() {
    return new BigInteger(130, random).toString(32);
  }
  
  public static Long nextSessionLongId(){
     return Math.abs(random.nextLong());
  }
}