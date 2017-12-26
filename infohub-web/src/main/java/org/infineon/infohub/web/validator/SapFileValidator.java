/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.validator;

import java.io.InputStream;
import javax.faces.application.FacesMessage;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.FacesValidator;
import javax.faces.validator.Validator;
import javax.faces.validator.ValidatorException;
import javax.servlet.http.Part;
import org.primefaces.model.UploadedFile;

/**
 *
 * @author Raaj
 */
@FacesValidator("SapFileValidator")
public class SapFileValidator implements Validator {

    @Override
    public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
        Part file = (Part) value;
       
        String text = "";
        try {
            InputStream is = file.getInputStream();

            System.out.println(file.getContentType());
            if (!file.getContentType().equalsIgnoreCase("application/vnd.ms-excel")) {
                throw new Exception();
            }
        } catch (Exception ex) {
            String msg = String.format("%s invalid", (file == null ? "" : file.getSubmittedFileName()));
            throw new ValidatorException(new FacesMessage(msg), ex);
        }
    }

}
