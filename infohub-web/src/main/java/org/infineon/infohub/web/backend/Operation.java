/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

/**
 *
 * @author Raaj
 */
public enum Operation {

    CREATE("create"),
    UPDATE("update"),
    COPY("copy");
    
    
    private final String name;
    private Operation(String val){
        name = val;
    }
}
