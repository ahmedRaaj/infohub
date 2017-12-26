/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.infineon.infohub.web.backend;

import java.io.IOException;
import javax.faces.FactoryFinder;
import javax.faces.component.UIViewRoot;
import javax.faces.context.FacesContext;
import javax.faces.context.FacesContextFactory;
import javax.faces.lifecycle.Lifecycle;
import javax.faces.lifecycle.LifecycleFactory;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebFilter(filterName = "AuthFilter", urlPatterns = {"*.xhtml"})
public class AuthorizationFilter implements Filter {

    public AuthorizationFilter() {
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
       
        try {

            HttpServletRequest reqt = (HttpServletRequest) request;
            HttpServletResponse resp = (HttpServletResponse) response;
            HttpSession ses = reqt.getSession(false);

            String reqURI = reqt.getRequestURI();
            if (reqURI.indexOf("/login.xhtml") >= 0
                    || (ses != null && ses.getAttribute("username") != null)
                    || reqURI.indexOf("/public/") >= 0
                    || reqURI.contains("javax.faces.resource")) {
                System.out.println("Processing Recieve For: " + reqURI);
               
                
                chain.doFilter(request, response);

            } else {
                System.out.println("Not authorize For: " + reqURI);

                if (isAJAXRequest(reqt)) {
                                    System.out.println("Not authorize For ajax: " + reqURI);

                   getFacesContext(reqt,resp).getExternalContext().redirect(reqt.getContextPath() + "/view/login.xhtml");
                    FacesContext.getCurrentInstance().responseComplete();
                } else {
                                    System.out.println("Not authorize For non ajax: " + reqURI);

                    resp.sendRedirect(reqt.getContextPath() + "/view/login.xhtml");
                }

            }
        } catch (Exception e) {
            System.out.println("AuthrizationFilter got exception: ");
            System.out.println(e);
        }
    }
    
     private boolean isAJAXRequest(HttpServletRequest request) {
      boolean check = false;
      String facesRequest = request.getHeader("Faces-Request");
      if (facesRequest != null && facesRequest.equals("partial/ajax")) {
        check = true;
      }
      return check; 
    }
     
      protected FacesContext getFacesContext(HttpServletRequest request, HttpServletResponse response) {
        FacesContext facesContext = FacesContext.getCurrentInstance();
        if (facesContext == null) {
 
            FacesContextFactory contextFactory  = (FacesContextFactory)FactoryFinder.getFactory(FactoryFinder.FACES_CONTEXT_FACTORY);
            LifecycleFactory lifecycleFactory = (LifecycleFactory)FactoryFinder.getFactory(FactoryFinder.LIFECYCLE_FACTORY);
            Lifecycle lifecycle = lifecycleFactory.getLifecycle(LifecycleFactory.DEFAULT_LIFECYCLE);
 
            facesContext = contextFactory.getFacesContext(request.getSession().getServletContext(), request, response, lifecycle);
 
            // Set using our inner class
 
            // set a new viewRoot, otherwise context.getViewRoot returns null
            UIViewRoot view = facesContext.getApplication().getViewHandler().createView(facesContext, "");
            facesContext.setViewRoot(view);               
        }
        return facesContext;
    }
     
    @Override
    public void destroy() {

    }
}
