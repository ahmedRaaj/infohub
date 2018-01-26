/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.excel.export.print;

import java.util.Collection;

/**
 *
 * @author Raaj
 * @param <T> : printer type. ex. Excel,PDF etc
 */
public interface Printer<T> {
    public void print();
    public Collection getInputData();  
    public T getPrintedDoc();
}
