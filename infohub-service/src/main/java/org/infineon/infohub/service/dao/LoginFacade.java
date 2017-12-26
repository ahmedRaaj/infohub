/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.service.dao;

import java.util.StringTokenizer;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.NamingEnumeration;
import javax.naming.directory.SearchControls;
import javax.naming.ldap.LdapContext;
import org.infineon.infohub.service.activedirectory.ActiveDirectory;
import org.infineon.infohub.service.activedirectory.ActiveDirectoryUser;

/**
 *
 * @author Raaj
 */
@Stateless
public class LoginFacade {

    @Inject
    private ActiveDirectoryUser user;

    public ActiveDirectoryUser getUser() {
        return user;
    }

    public boolean authenticate(String userName, String password, String domain) {

        try {

            String search;
            if (domain == null) {
                domain = "infineon.com";
                search = "DC=INFINEON,DC=COM";

            } else {
                domain = domain + ".infineon.com";
                search = String.format("DC=%s,DC=INFINEON,DC=COM", domain.substring(0, domain.indexOf(".")));
            }
            LdapContext ctx = ActiveDirectory.getConnection(userName, password, domain);
            ctx.getNameInNamespace();
            SearchControls constraints = new SearchControls();
            constraints.setSearchScope(SearchControls.SUBTREE_SCOPE);
            String[] attrIDs = {//"distinguishedName",
                "displayName",
                "mail",};
            constraints.setReturningAttributes(attrIDs);
            System.out.println("##User domain link: " + search);

            //First input parameter is search bas, it can be "CN=Users,DC=YourDomain,DC=com"
            //Second Attribute can be uid=username
            NamingEnumeration answer = ctx.search(search, "sAMAccountName="
                    + userName, constraints);
            //     System.out.println(answer.next());

            StringTokenizer token = new StringTokenizer(answer.next().toString(), ",");
            String paramMail = "mail=mail:";
            String paramGivenName = "displayname=displayName:";

            while (token.hasMoreTokens()) {
                String t = token.nextToken();
                if (t.contains(paramMail)) {
                    user.setEmail(t.substring(t.indexOf(paramMail) + paramMail.length()));
                } else if (t.contains(paramGivenName)) {
                    user.setGivenName(t.substring(t.indexOf(paramGivenName) + paramGivenName.length(), t.length() - 1));
                }
            }
            user.setUserName(userName);
            ctx.close();
            return true;

        } catch (Exception e) {
            //Failed to authenticate user!
            //   e.printStackTrace();

            System.out.println("Invalid user attemp:");
            return false;
        }

    }
}
