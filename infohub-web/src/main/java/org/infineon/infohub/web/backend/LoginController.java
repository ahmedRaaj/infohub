/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.enterprise.context.SessionScoped;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpSession;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;
import org.infineon.infohub.service.dao.LoginFacade;
import org.infineon.infohub.service.dao.UserFacade;
import org.infineon.infohub.web.util.JsfUtil;
import org.infineon.infohub.web.util.SessionUtils;
import org.infineon.infohub.entities.User;
import org.infineon.infohub.entities.UserRole;
/**
 *
 * @author Raaj
 */
@Named
@SessionScoped
public class LoginController implements Serializable {

    private static final long serialVersionUID = 1094801825228386363L;

    private String pwd;
    private String msg;
    private String user;
    private String domain;
    private List<String> domains = new ArrayList<>();

    @Inject
    LoginFacade loginFacade;
    @Inject
    ActiveDirectoryUser userAuthentic;
    @Inject
    UserFacade userFacade;

    public LoginController() {
        domains.add("");
        domains.add("ap");
        domains.add("eu");
    }

    public String getPwd() {
        return pwd;
    }

    public void setPwd(String pwd) {
        this.pwd = pwd;
    }

    public String getMsg() {
        return msg;
    }

    public LoginFacade getLoginFacade() {
        return loginFacade;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public List<String> getDomains() {
        return domains;
    }

    public void setDomains(List<String> domains) {
        this.domains = domains;
    }

    //validate login
    public String validateUsernamePassword() {
        boolean valid = loginFacade.authenticate(user, pwd, domain);
        if (valid) {
            HttpSession session = SessionUtils.getSession();
            if (userAuthentic != null) {
                session.setAttribute("username", user);
//                session.setAttribute("user", userAuthentic);
                User authUser = userFacade.findByEmail(userAuthentic.getEmail());
                /// if(authUser != null) userFacade.refresh(authUser);
                if (authUser != null && authUser.isStatus()) {
                    authUser.setNumberOfLogin(authUser.getNumberOfLogin() == null ? 1 : authUser.getNumberOfLogin() + 1);
                    authUser.setLastLoginDate(new Date());
                    userFacade.edit(authUser);
                    return "index?faces-redirect=true";
                } else {
                    if (authUser == null) {
                        User newUser = new User();
                        newUser.setEmail(userAuthentic.getEmail());
                        newUser.setName(userAuthentic.getGivenName());
                        newUser.setStatus(false);
                        newUser.setUserRole(UserRole.USER);
                        userFacade.create(newUser);

                    }
                    JsfUtil.addErrorMessage("User is not activated yet. Wait for activation");
                    SessionUtils.getSession().invalidate();
                    return "login";
                }
            }

        } else {
            JsfUtil.addErrorMessage("Incorrect User name and Password!");
            return "login";
        }
        return "login";
    }

    //logout event, invalidate session
    public String logout() {

        try {
            FacesContext.getCurrentInstance().getExternalContext().invalidateSession();
        } catch (Exception ex) {
            HttpSession session = SessionUtils.getSession();
            if (session != null) {
                session.invalidate();
            }

        }
        return "login";
    }
}
