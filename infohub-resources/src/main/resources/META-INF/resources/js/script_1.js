if (!PrimeFaces.dialog) {
    PrimeFaces.dialog = {};
    PrimeFaces.dialog.DialogHandler = {
        openDialog: function (e) {
            var g = this.findRootWindow()
                    , j = e.sourceComponentId + "_dlg";
            if (g.document.getElementById(j)) {
                return
            }
            var i = e.sourceComponentId.replace(/:/g, "_") + "_dlgwidget"
                    , d = $('<div id="' + j + '" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-hidden-container ui-overlay-hidden" data-pfdlgcid="' + e.pfdlgcid + '" data-widgetvar="' + i + '"></div>').append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span></div>');
            var f = d.children(".ui-dialog-titlebar");
            if (e.options.closable !== false) {
                f.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a>')
            }
            if (e.options.minimizable) {
                f.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-minimize ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-minus"></span></a>')
            }
            if (e.options.maximizable) {
                f.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-maximize ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-extlink"></span></a>')
            }
            d.append('<div class="ui-dialog-content ui-widget-content ui-df-content" style="height: auto;"><iframe style="border:0 none" frameborder="0"/></div>');
            d.appendTo(g.document.body);
            var c = d.find("iframe")
                    , b = e.url.indexOf("?") === -1 ? "?" : "&"
                    , a = e.url.indexOf("pfdlgcid") === -1 ? e.url + b + "pfdlgcid=" + e.pfdlgcid : e.url
                    , h = e.options.contentWidth || 640;
            c.width(h);
            c.on("load", function () {
                var p = $(this)
                        , l = p.contents().find("title")
                        , o = false;
                if (e.options.headerElement) {
                    var n = PrimeFaces.escapeClientId(e.options.headerElement)
                            , k = c.contents().find(n);
                    if (k.length) {
                        l = k;
                        o = true
                    }
                }
                if (!p.data("initialized")) {
                    PrimeFaces.cw.call(g.PrimeFaces, "DynamicDialog", i, {
                        id: j,
                        position: "center",
                        sourceComponentId: e.sourceComponentId,
                        sourceWidgetVar: e.sourceWidgetVar,
                        onHide: function () {
                            var s = this
                                    , r = this.content.children("iframe");
                            if (r.get(0).contentWindow.PrimeFaces) {
                                this.destroyIntervalId = setInterval(function () {
                                    if (r.get(0).contentWindow.PrimeFaces.ajax.Queue.isEmpty()) {
                                        clearInterval(s.destroyIntervalId);
                                        r.attr("src", "about:blank");
                                        s.jq.remove()
                                    }
                                }, 10)
                            } else {
                                r.attr("src", "about:blank");
                                s.jq.remove()
                            }
                            g.PF[i] = undefined
                        },
                        modal: e.options.modal,
                        resizable: e.options.resizable,
                        hasIframe: true,
                        draggable: e.options.draggable,
                        width: e.options.width,
                        height: e.options.height,
                        minimizable: e.options.minimizable,
                        maximizable: e.options.maximizable,
                        headerElement: e.options.headerElement
                    })
                }
                var q = g.PF(i).titlebar.children("span.ui-dialog-title");
                if (l.length > 0) {
                    if (o) {
                        q.append(l);
                        l.show()
                    } else {
                        q.text(l.text())
                    }
                    c.attr("title", q.text())
                }
                c.data("initialized", true);
                g.PF(i).show();
                var m = null;
                if (e.options.contentHeight) {
                    m = e.options.contentHeight
                } else {
                    m = p.get(0).contentWindow.document.body.scrollHeight + (PrimeFaces.env.browser.webkit ? 5 : 25)
                }
                p.css("height", m)
            }).attr("src", a)
        },
        closeDialog: function (cfg) {
            var rootWindow = this.findRootWindow()
                    , dlgs = $(rootWindow.document.body).children('div.ui-dialog[data-pfdlgcid="' + cfg.pfdlgcid + '"]').not("[data-queuedforremoval]")
                    , dlgsLength = dlgs.length
                    , dlg = dlgs.eq(dlgsLength - 1)
                    , parentDlg = dlgsLength > 1 ? dlgs.eq(dlgsLength - 2) : null
                    , dlgWidget = rootWindow.PF(dlg.data("widgetvar"))
                    , sourceWidgetVar = dlgWidget.cfg.sourceWidgetVar
                    , sourceComponentId = dlgWidget.cfg.sourceComponentId
                    , dialogReturnBehavior = null
                    , windowContext = null;
            dlg.attr("data-queuedforremoval", true);
            if (parentDlg) {
                var parentDlgFrame = parentDlg.find("> .ui-dialog-content > iframe").get(0)
                        , windowContext = parentDlgFrame.contentWindow || parentDlgFrame;
                sourceWidget = windowContext.PF(sourceWidgetVar)
            } else {
                windowContext = rootWindow
            }
            if (sourceWidgetVar) {
                var sourceWidget = windowContext.PF(sourceWidgetVar);
                dialogReturnBehavior = sourceWidget.cfg.behaviors ? sourceWidget.cfg.behaviors.dialogReturn : null
            } else {
                if (sourceComponentId) {
                    var dialogReturnBehaviorStr = $(windowContext.document.getElementById(sourceComponentId)).data("dialogreturn");
                    if (dialogReturnBehaviorStr) {
                        dialogReturnBehavior = windowContext.eval("(function(ext){this." + dialogReturnBehaviorStr + "})")
                    }
                }
            }
            if (dialogReturnBehavior) {
                var ext = {
                    params: [{
                            name: sourceComponentId + "_pfdlgcid",
                            value: cfg.pfdlgcid
                        }]
                };
                dialogReturnBehavior.call(windowContext, ext)
            }
            dlgWidget.hide()
        },
        showMessageInDialog: function (b) {
            if (!this.messageDialog) {
                var a = $('<div id="primefacesmessagedlg" class="ui-message-dialog ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-hidden-container"/>').append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span><a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a></div><div class="ui-dialog-content ui-widget-content" style="height: auto;"></div>').appendTo(document.body);
                PrimeFaces.cw("Dialog", "primefacesmessagedialog", {
                    id: "primefacesmessagedlg",
                    modal: true,
                    draggable: false,
                    resizable: false,
                    showEffect: "fade",
                    hideEffect: "fade"
                });
                this.messageDialog = PF("primefacesmessagedialog");
                this.messageDialog.titleContainer = this.messageDialog.titlebar.children("span.ui-dialog-title")
            }
            this.messageDialog.titleContainer.text(b.summary);
            this.messageDialog.content.html("").append('<span class="ui-dialog-message ui-messages-' + b.severity.split(" ")[0].toLowerCase() + '-icon" />').append(b.detail);
            this.messageDialog.show()
        },
        confirm: function (a) {
            if (PrimeFaces.confirmDialog) {
                PrimeFaces.confirmSource = (typeof (a.source) === "string") ? $(PrimeFaces.escapeClientId(a.source)) : $(a.source);
                PrimeFaces.confirmDialog.showMessage(a)
            } else {
                PrimeFaces.warn("No global confirmation dialog available.")
            }
        },
        findRootWindow: function () {
            var a = window;
            while (a.frameElement) {
                a = a.parent
            }
            return a
        }
    }
}
;
PrimeFaces.widget.AccordionPanel = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.stateHolder = $(this.jqId + "_active");
        this.headers = this.jq.children(".ui-accordion-header");
        this.panels = this.jq.children(".ui-accordion-content");
        this.cfg.rtl = this.jq.hasClass("ui-accordion-rtl");
        this.cfg.expandedIcon = "ui-icon-triangle-1-s";
        this.cfg.collapsedIcon = this.cfg.rtl ? "ui-icon-triangle-1-w" : "ui-icon-triangle-1-e";
        this.initActive();
        this.bindEvents();
        if (this.cfg.dynamic && this.cfg.cache) {
            this.markLoadedPanels()
        }
    },
    initActive: function () {
        if (this.cfg.multiple) {
            this.cfg.active = [];
            if (this.stateHolder.val().length > 0) {
                var a = this.stateHolder.val().split(",");
                for (var b = 0; b < a.length; b++) {
                    this.cfg.active.push(parseInt(a[b]))
                }
            }
        } else {
            this.cfg.active = parseInt(this.stateHolder.val())
        }
    },
    bindEvents: function () {
        var a = this;
        this.headers.mouseover(function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active") && !b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-hover")
            }
        }).mouseout(function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active") && !b.hasClass("ui-state-disabled")) {
                b.removeClass("ui-state-hover")
            }
        }).click(function (d) {
            var c = $(this);
            if (!c.hasClass("ui-state-disabled")) {
                var b = c.index() / 2;
                if (c.hasClass("ui-state-active")) {
                    a.unselect(b)
                } else {
                    a.select(b);
                    $(this).trigger("focus.accordion")
                }
            }
            d.preventDefault()
        });
        this.bindKeyEvents()
    },
    bindKeyEvents: function () {
        this.headers.on("focus.accordion", function () {
            $(this).addClass("ui-tabs-outline")
        }).on("blur.accordion", function () {
            $(this).removeClass("ui-tabs-outline")
        }).on("keydown.accordion", function (c) {
            var b = $.ui.keyCode
                    , a = c.which;
            if (a === b.SPACE || a === b.ENTER || a === b.NUMPAD_ENTER) {
                $(this).trigger("click");
                c.preventDefault()
            }
        })
    },
    markLoadedPanels: function () {
        if (this.cfg.multiple) {
            for (var a = 0; a < this.cfg.active.length; a++) {
                if (this.cfg.active[a] >= 0) {
                    this.markAsLoaded(this.panels.eq(this.cfg.active[a]))
                }
            }
        } else {
            if (this.cfg.active >= 0) {
                this.markAsLoaded(this.panels.eq(this.cfg.active))
            }
        }
    },
    select: function (c) {
        var b = this.panels.eq(c);
        if (this.cfg.onTabChange) {
            var a = this.cfg.onTabChange.call(this, b);
            if (a === false) {
                return false
            }
        }
        var d = this.cfg.dynamic && !this.isLoaded(b);
        if (this.cfg.multiple) {
            this.addToSelection(c)
        } else {
            this.cfg.active = c
        }
        this.saveState();
        if (d) {
            this.loadDynamicTab(b)
        } else {
            if (this.cfg.controlled) {
                if (this.hasBehavior("tabChange")) {
                    this.fireTabChangeEvent(b)
                }
            } else {
                this.show(b);
                if (this.hasBehavior("tabChange")) {
                    this.fireTabChangeEvent(b)
                }
            }
        }
        return true
    },
    unselect: function (a) {
        if (this.cfg.controlled) {
            if (this.hasBehavior("tabClose")) {
                this.fireTabCloseEvent(a)
            }
        } else {
            this.hide(a);
            if (this.hasBehavior("tabClose")) {
                this.fireTabCloseEvent(a)
            }
        }
    },
    show: function (c) {
        var b = this;
        if (!this.cfg.multiple) {
            var d = this.headers.filter(".ui-state-active");
            d.children(".ui-icon").removeClass(this.cfg.expandedIcon).addClass(this.cfg.collapsedIcon);
            d.attr("aria-selected", false);
            d.attr("aria-expanded", false).removeClass("ui-state-active ui-corner-top").addClass("ui-corner-all").next().attr("aria-hidden", true).slideUp(function () {
                if (b.cfg.onTabClose) {
                    b.cfg.onTabClose.call(b, c)
                }
            })
        }
        var a = c.prev();
        a.attr("aria-selected", true);
        a.attr("aria-expanded", true).addClass("ui-state-active ui-corner-top").removeClass("ui-state-hover ui-corner-all").children(".ui-icon").removeClass(this.cfg.collapsedIcon).addClass(this.cfg.expandedIcon);
        c.attr("aria-hidden", false).slideDown("normal", function () {
            b.postTabShow(c)
        })
    },
    hide: function (c) {
        var a = this
                , b = this.panels.eq(c)
                , d = b.prev();
        d.attr("aria-selected", false);
        d.attr("aria-expanded", false).children(".ui-icon").removeClass(this.cfg.expandedIcon).addClass(this.cfg.collapsedIcon);
        d.removeClass("ui-state-active ui-corner-top").addClass("ui-corner-all");
        b.attr("aria-hidden", true).slideUp(function () {
            if (a.cfg.onTabClose) {
                a.cfg.onTabClose.call(a, b)
            }
        });
        this.removeFromSelection(c);
        this.saveState()
    },
    loadDynamicTab: function (a) {
        var c = this
                , b = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_contentLoad",
                            value: true
                        }, {
                            name: this.id + "_newTab",
                            value: a.attr("id")
                        }, {
                            name: this.id + "_tabindex",
                            value: parseInt(a.index() / 2)
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                a.html(h);
                                if (this.cfg.cache) {
                                    this.markAsLoaded(a)
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.show(a)
                    }
                };
        if (this.hasBehavior("tabChange")) {
            var d = this.cfg.behaviors.tabChange;
            d.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    fireTabChangeEvent: function (a) {
        var d = this.cfg.behaviors.tabChange
                , b = {
                    params: [{
                            name: this.id + "_newTab",
                            value: a.attr("id")
                        }, {
                            name: this.id + "_tabindex",
                            value: parseInt(a.index() / 2)
                        }]
                };
        if (this.cfg.controlled) {
            var c = this;
            b.oncomplete = function (g, e, f) {
                if (f.access && !f.validationFailed) {
                    c.show(a)
                }
            }
        }
        d.call(this, b)
    },
    fireTabCloseEvent: function (b) {
        var a = this.panels.eq(b)
                , d = this.cfg.behaviors.tabClose
                , c = {
                    params: [{
                            name: this.id + "_tabId",
                            value: a.attr("id")
                        }, {
                            name: this.id + "_tabindex",
                            value: parseInt(b / 2)
                        }]
                };
        if (this.cfg.controlled) {
            var e = this;
            c.oncomplete = function (h, f, g) {
                if (g.access && !g.validationFailed) {
                    e.hide(b)
                }
            }
        }
        d.call(this, c)
    },
    markAsLoaded: function (a) {
        a.data("loaded", true)
    },
    isLoaded: function (a) {
        return a.data("loaded") == true
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    addToSelection: function (a) {
        this.cfg.active.push(a)
    },
    removeFromSelection: function (a) {
        this.cfg.active = $.grep(this.cfg.active, function (b) {
            return b != a
        })
    },
    saveState: function () {
        if (this.cfg.multiple) {
            this.stateHolder.val(this.cfg.active.join(","))
        } else {
            this.stateHolder.val(this.cfg.active)
        }
    },
    postTabShow: function (a) {
        if (this.cfg.onTabShow) {
            this.cfg.onTabShow.call(this, a)
        }
        PrimeFaces.invokeDeferredRenders(this.id)
    }
});
PrimeFaces.widget.AutoComplete = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.panelId = this.jqId + "_panel";
        this.input = $(this.jqId + "_input");
        this.hinput = $(this.jqId + "_hinput");
        this.panel = this.jq.children(this.panelId);
        this.dropdown = this.jq.children(".ui-button");
        this.active = true;
        this.cfg.pojo = this.hinput.length == 1;
        this.cfg.minLength = this.cfg.minLength != undefined ? this.cfg.minLength : 1;
        this.cfg.cache = this.cfg.cache || false;
        this.cfg.resultsMessage = this.cfg.resultsMessage || " results are available, use up and down arrow keys to navigate";
        this.cfg.ariaEmptyMessage = this.cfg.emptyMessage || "No search results are available.";
        this.cfg.dropdownMode = this.cfg.dropdownMode || "blank";
        this.cfg.autoHighlight = (this.cfg.autoHighlight === undefined) ? true : this.cfg.autoHighlight;
        this.cfg.myPos = this.cfg.myPos || "left top";
        this.cfg.atPos = this.cfg.atPos || "left bottom";
        this.cfg.active = (this.cfg.active === false) ? false : true;
        this.suppressInput = true;
        this.touchToDropdownButton = false;
        if (this.cfg.cache) {
            this.initCache()
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.hinput.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        if (this.cfg.multiple) {
            this.setupMultipleMode();
            this.multiItemContainer.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            if (this.cfg.selectLimit >= 0 && this.multiItemContainer.children("li.ui-autocomplete-token").length === this.cfg.selectLimit) {
                this.input.hide();
                this.disableDropdown()
            }
        } else {
            PrimeFaces.skinInput(this.input);
            this.input.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            this.dropdown.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true)
        }
        this.bindStaticEvents();
        if (this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors)
        }
        if (this.cfg.forceSelection) {
            this.setupForceSelection()
        }
        this.appendPanel();
        if (this.cfg.itemtip) {
            this.itemtip = $('<div id="' + this.id + '_itemtip" class="ui-autocomplete-itemtip ui-state-highlight ui-widget ui-corner-all ui-shadow"></div>').appendTo(document.body);
            this.cfg.itemtipMyPosition = this.cfg.itemtipMyPosition || "left top";
            this.cfg.itemtipAtPosition = this.cfg.itemtipAtPosition || "right bottom";
            this.cfg.checkForScrollbar = (this.cfg.itemtipAtPosition.indexOf("right") !== -1)
        }
        this.input.attr("aria-autocomplete", "listbox");
        this.jq.attr("role", "application");
        this.jq.append('<span role="status" aria-live="polite" class="ui-autocomplete-status ui-helper-hidden-accessible"></span>');
        this.status = this.jq.children(".ui-autocomplete-status")
    },
    appendPanel: function () {
        var a = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!a.is(this.jq)) {
            a.children(this.panelId).remove();
            this.panel.appendTo(a)
        }
    },
    initCache: function () {
        this.cache = {};
        var a = this;
        this.cacheTimeout = setInterval(function () {
            a.clearCache()
        }, this.cfg.cacheTimeout)
    },
    clearCache: function () {
        this.cache = {}
    },
    setupMultipleMode: function () {
        var b = this;
        this.multiItemContainer = this.jq.children("ul");
        this.inputContainer = this.multiItemContainer.children(".ui-autocomplete-input-token");
        this.multiItemContainer.hover(function () {
            $(this).addClass("ui-state-hover")
        }, function () {
            $(this).removeClass("ui-state-hover")
        }).click(function () {
            b.input.focus()
        });
        this.input.focus(function () {
            b.multiItemContainer.addClass("ui-state-focus")
        }).blur(function (c) {
            b.multiItemContainer.removeClass("ui-state-focus")
        });
        var a = "> li.ui-autocomplete-token > .ui-autocomplete-token-icon";
        this.multiItemContainer.off("click", a).on("click", a, null, function (c) {
            if (b.multiItemContainer.children("li.ui-autocomplete-token").length === b.cfg.selectLimit) {
                if (PrimeFaces.isIE(8)) {
                    b.input.val("")
                }
                b.input.css("display", "inline");
                b.enableDropdown()
            }
            b.removeItem(c, $(this).parent())
        })
    },
    bindStaticEvents: function () {
        var a = this;
        this.bindKeyEvents();
        this.bindDropdownEvents();
        if (PrimeFaces.env.browser.mobile) {
            this.dropdown.bind("touchstart", function () {
                a.touchToDropdownButton = true
            })
        }
        this.hideNS = "mousedown." + this.id;
        $(document.body).off(this.hideNS).on(this.hideNS, function (b) {
            if (a.panel.is(":hidden")) {
                return
            }
            var c = a.panel.offset();
            if (b.target === a.input.get(0)) {
                return
            }
            if (b.pageX < c.left || b.pageX > c.left + a.panel.width() || b.pageY < c.top || b.pageY > c.top + a.panel.height()) {
                a.hide()
            }
        });
        this.resizeNS = "resize." + this.id;
        $(window).off(this.resizeNS).on(this.resizeNS, function (b) {
            if (a.panel.is(":visible")) {
                a.alignPanel()
            }
        })
    },
    bindDropdownEvents: function () {
        var a = this;
        this.dropdown.mouseover(function () {
            $(this).addClass("ui-state-hover")
        }).mouseout(function () {
            $(this).removeClass("ui-state-hover")
        }).mousedown(function () {
            if (a.active) {
                $(this).addClass("ui-state-active")
            }
        }).mouseup(function () {
            if (a.active) {
                $(this).removeClass("ui-state-active");
                a.searchWithDropdown();
                a.input.focus()
            }
        }).focus(function () {
            $(this).addClass("ui-state-focus")
        }).blur(function () {
            $(this).removeClass("ui-state-focus")
        }).keydown(function (d) {
            var c = $.ui.keyCode
                    , b = d.which;
            if (b === c.SPACE || b === c.ENTER || b === c.NUMPAD_ENTER) {
                $(this).addClass("ui-state-active")
            }
        }).keyup(function (d) {
            var c = $.ui.keyCode
                    , b = d.which;
            if (b === c.SPACE || b === c.ENTER || b === c.NUMPAD_ENTER) {
                $(this).removeClass("ui-state-active");
                a.searchWithDropdown();
                a.input.focus();
                d.preventDefault();
                d.stopPropagation()
            }
        })
    },
    disableDropdown: function () {
        if (this.dropdown.length) {
            this.dropdown.off().prop("disabled", true).addClass("ui-state-disabled")
        }
    },
    enableDropdown: function () {
        if (this.dropdown.length && this.dropdown.prop("disabled")) {
            this.bindDropdownEvents();
            this.dropdown.prop("disabled", false).removeClass("ui-state-disabled")
        }
    },
    bindKeyEvents: function () {
        var a = this;
        if (this.cfg.queryEvent !== "enter") {
            this.input.on("input propertychange", function (b) {
                a.processKeyEvent(b)
            })
        }
        this.input.on("keyup.autoComplete", function (f) {
            var d = $.ui.keyCode
                    , b = f.which;
            if (PrimeFaces.isIE(9) && b === d.BACKSPACE) {
                a.processKeyEvent(f)
            }
            if (a.cfg.queryEvent === "enter" && (b === d.ENTER || b === d.NUMPAD_ENTER)) {
                if (a.itemSelectedWithEnter) {
                    a.itemSelectedWithEnter = false
                } else {
                    a.search(a.input.val())
                }
            }
            if (a.panel.is(":visible")) {
                if (b === d.ESCAPE) {
                    a.hide()
                } else {
                    if (b === d.UP || b === d.DOWN) {
                        var c = a.items.filter(".ui-state-highlight");
                        if (c.length) {
                            a.displayAriaStatus(c.data("item-label"))
                        }
                    }
                }
            }
        }).on("keydown.autoComplete", function (g) {
            var f = $.ui.keyCode;
            a.suppressInput = false;
            if (a.panel.is(":visible")) {
                var d = a.items.filter(".ui-state-highlight");
                switch (g.which) {
                    case f.UP:
                        var c = d.length == 0 ? a.items.eq(0) : d.prevAll(".ui-autocomplete-item:first");
                        if (c.length == 1) {
                            d.removeClass("ui-state-highlight");
                            c.addClass("ui-state-highlight");
                            if (a.cfg.scrollHeight) {
                                PrimeFaces.scrollInView(a.panel, c)
                            }
                            if (a.cfg.itemtip) {
                                a.showItemtip(c)
                            }
                        }
                        g.preventDefault();
                        break;
                    case f.DOWN:
                        var b = d.length == 0 ? a.items.eq(0) : d.nextAll(".ui-autocomplete-item:first");
                        if (b.length == 1) {
                            d.removeClass("ui-state-highlight");
                            b.addClass("ui-state-highlight");
                            if (a.cfg.scrollHeight) {
                                PrimeFaces.scrollInView(a.panel, b)
                            }
                            if (a.cfg.itemtip) {
                                a.showItemtip(b)
                            }
                        }
                        g.preventDefault();
                        break;
                    case f.ENTER:
                    case f.NUMPAD_ENTER:
                        if (a.timeout) {
                            a.deleteTimeout()
                        }
                        d.click();
                        g.preventDefault();
                        g.stopPropagation();
                        a.itemSelectedWithEnter = true;
                        break;
                    case 18:
                    case 224:
                        break;
                    case f.TAB:
                        if (d.length) {
                            d.trigger("click")
                        }
                        a.hide();
                        break
                }
            } else {
                switch (g.which) {
                    case f.TAB:
                        if (a.timeout) {
                            a.deleteTimeout()
                        }
                        break;
                    case f.ENTER:
                    case f.NUMPAD_ENTER:
                        if (a.cfg.queryEvent === "enter" || (a.timeout > 0) || a.querying) {
                            g.preventDefault()
                        }
                        break;
                    case f.BACKSPACE:
                        if (a.cfg.multiple && !a.input.val().length) {
                            a.removeItem(g, $(this).parent().prev());
                            g.preventDefault()
                        }
                        break
                }
            }
        })
    },
    bindDynamicEvents: function () {
        var a = this;
        this.items.bind("mouseover", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                a.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
                b.addClass("ui-state-highlight");
                if (a.cfg.itemtip) {
                    a.showItemtip(b)
                }
            }
        }).bind("click", function (f) {
            var e = $(this)
                    , g = e.attr("data-item-value")
                    , b = e.hasClass("ui-autocomplete-moretext");
            if (PrimeFaces.isIE(8)) {
                a.itemClick = true
            }
            if (b) {
                a.input.focus();
                a.invokeMoreTextBehavior()
            } else {
                if (a.cfg.multiple) {
                    var c = '<li data-token-value="' + e.attr("data-item-value") + '"class="ui-autocomplete-token ui-state-active ui-corner-all ui-helper-hidden">';
                    c += '<span class="ui-autocomplete-token-icon ui-icon ui-icon-close" />';
                    c += '<span class="ui-autocomplete-token-label">' + e.attr("data-item-label") + "</span></li>";
                    a.inputContainer.before(c);
                    a.multiItemContainer.children(".ui-helper-hidden").fadeIn();
                    a.input.val("").focus();
                    a.hinput.append('<option value="' + g + '" selected="selected"></option>');
                    if (a.multiItemContainer.children("li.ui-autocomplete-token").length >= a.cfg.selectLimit) {
                        a.input.css("display", "none").blur();
                        a.disableDropdown()
                    }
                } else {
                    a.input.val(e.attr("data-item-label")).focus();
                    this.currentText = a.input.val();
                    this.previousText = a.input.val();
                    if (a.cfg.pojo) {
                        a.hinput.val(g)
                    }
                    if (PrimeFaces.env.isLtIE(10)) {
                        var d = a.input.val().length;
                        a.input.setSelection(d, d)
                    }
                }
                a.invokeItemSelectBehavior(f, g)
            }
            a.hide()
        });
        if (PrimeFaces.env.browser.mobile) {
            this.items.bind("touchstart", function () {
                if (!a.touchToDropdownButton) {
                    a.itemClick = true
                }
            })
        }
    },
    processKeyEvent: function (d) {
        var c = this;
        if (c.suppressInput) {
            d.preventDefault();
            return
        }
        if (PrimeFaces.env.browser.mobile) {
            c.touchToDropdownButton = false;
            if (c.itemClick) {
                c.itemClick = false;
                return
            }
        }
        if (PrimeFaces.isIE(8) && (c.itemClick || d.originalEvent.propertyName !== "value")) {
            c.itemClick = false;
            return
        }
        var b = c.input.val();
        if (c.cfg.pojo && !c.cfg.multiple) {
            c.hinput.val(b)
        }
        if (!b.length) {
            c.hide()
        }
        if (b.length >= c.cfg.minLength) {
            if (c.timeout) {
                c.deleteTimeout()
            }
            var a = c.cfg.delay;
            c.timeout = setTimeout(function () {
                c.timeout = null;
                c.search(b)
            }, a)
        }
    },
    showItemtip: function (c) {
        if (c.hasClass("ui-autocomplete-moretext")) {
            this.itemtip.hide()
        } else {
            var b;
            if (c.is("li")) {
                b = c.next(".ui-autocomplete-itemtip-content")
            } else {
                if (c.children("td:last").hasClass("ui-autocomplete-itemtip-content")) {
                    b = c.children("td:last")
                } else {
                    this.itemtip.hide();
                    return
                }
            }
            this.itemtip.html(b.html()).css({
                left: "",
                top: "",
                "z-index": ++PrimeFaces.zindex,
                width: b.outerWidth()
            }).position({
                my: this.cfg.itemtipMyPosition,
                at: this.cfg.itemtipAtPosition,
                of: c
            });
            if (this.cfg.checkForScrollbar) {
                if (this.panel.innerHeight() < this.panel.children(".ui-autocomplete-items").outerHeight(true)) {
                    var a = this.panel.offset();
                    this.itemtip.css("left", a.left + this.panel.outerWidth())
                }
            }
            this.itemtip.show()
        }
    },
    showSuggestions: function (c) {
        this.items = this.panel.find(".ui-autocomplete-item");
        this.items.attr("role", "option");
        if (this.cfg.grouping) {
            this.groupItems()
        }
        this.bindDynamicEvents();
        var e = this
                , b = this.panel.is(":hidden");
        if (b) {
            this.show()
        } else {
            this.alignPanel()
        }
        if (this.items.length > 0) {
            var d = this.items.eq(0);
            if (this.cfg.autoHighlight && d.length) {
                d.addClass("ui-state-highlight")
            }
            if (this.panel.children().is("ul") && c.length > 0) {
                this.items.filter(":not(.ui-autocomplete-moretext)").each(function () {
                    var g = $(this)
                            , i = g.html()
                            , f = new RegExp(PrimeFaces.escapeRegExp(c), "gi")
                            , h = i.replace(f, '<span class="ui-autocomplete-query">$&</span>');
                    g.html(h)
                })
            }
            if (this.cfg.forceSelection) {
                this.currentItems = [];
                this.items.each(function (f, g) {
                    e.currentItems.push($(g).attr("data-item-label"))
                })
            }
            if (this.cfg.autoHighlight && this.cfg.itemtip && d.length === 1) {
                this.showItemtip(d)
            }
            this.displayAriaStatus(this.items.length + this.cfg.resultsMessage)
        } else {
            if (this.cfg.emptyMessage) {
                var a = '<div class="ui-autocomplete-emptyMessage ui-widget">' + this.cfg.emptyMessage + "</div>";
                this.panel.html(a)
            } else {
                this.panel.hide()
            }
            this.displayAriaStatus(this.cfg.ariaEmptyMessage)
        }
    },
    searchWithDropdown: function () {
        if (this.cfg.dropdownMode === "current") {
            this.search(this.input.val())
        } else {
            this.search("")
        }
    },
    search: function (c) {
        if (!this.cfg.active || c === undefined || c === null) {
            return
        }
        if (this.cfg.cache && this.cache[c]) {
            this.panel.html(this.cache[c]);
            this.showSuggestions(c);
            return
        }
        if (!this.active) {
            return
        }
        this.querying = true;
        var d = this;
        if (this.cfg.itemtip) {
            this.itemtip.hide()
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            onsuccess: function (g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: d,
                    handle: function (h) {
                        this.panel.html(h);
                        if (this.cfg.cache) {
                            this.cache[c] = h
                        }
                        this.showSuggestions(c)
                    }
                });
                return true
            },
            oncomplete: function () {
                d.querying = false
            }
        };
        b.params = [{
                name: this.id + "_query",
                value: c
            }];
        if (this.hasBehavior("query")) {
            var a = this.cfg.behaviors.query;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    show: function () {
        this.alignPanel();
        if (this.cfg.effect) {
            this.panel.show(this.cfg.effect, {}, this.cfg.effectDuration)
        } else {
            this.panel.show()
        }
    },
    hide: function () {
        this.panel.hide();
        this.panel.css("height", "auto");
        if (this.cfg.itemtip) {
            this.itemtip.hide()
        }
    },
    invokeItemSelectBehavior: function (b, d) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.itemSelect;
            if (c) {
                var a = {
                    params: [{
                            name: this.id + "_itemSelect",
                            value: d
                        }]
                };
                c.call(this, a)
            }
        }
    },
    invokeItemUnselectBehavior: function (c, d) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.itemUnselect;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_itemUnselect",
                            value: d
                        }]
                };
                a.call(this, b)
            }
        }
    },
    invokeMoreTextBehavior: function () {
        if (this.cfg.behaviors) {
            var b = this.cfg.behaviors.moreText;
            if (b) {
                var a = {
                    params: [{
                            name: this.id + "_moreText",
                            value: true
                        }]
                };
                b.call(this, a)
            }
        }
    },
    removeItem: function (c, b) {
        var e = b.attr("data-token-value")
                , a = this.multiItemContainer.children("li.ui-autocomplete-token").index(b)
                , d = this;
        this.hinput.children("option").eq(a).remove();
        b.fadeOut("fast", function () {
            var f = $(this);
            f.remove();
            d.invokeItemUnselectBehavior(c, e)
        })
    },
    setupForceSelection: function () {
        this.currentItems = [this.input.val()];
        var a = this;
        this.input.blur(function () {
            var e = $(this).val()
                    , d = false;
            if (PrimeFaces.isIE(8)) {
                a.itemClick = true
            }
            for (var c = 0; c < a.currentItems.length; c++) {
                var b = a.currentItems[c].replace(/\r?\n/g, "");
                if (b === e) {
                    d = true;
                    break
                }
            }
            if (!d) {
                a.input.val("");
                if (!a.cfg.multiple) {
                    a.hinput.val("")
                }
            }
        })
    },
    disable: function () {
        this.input.addClass("ui-state-disabled").prop("disabled", true);
        if (this.dropdown.length) {
            this.dropdown.addClass("ui-state-disabled").prop("disabled", true)
        }
    },
    enable: function () {
        this.input.removeClass("ui-state-disabled").prop("disabled", false);
        if (this.dropdown.length) {
            this.dropdown.removeClass("ui-state-disabled").prop("disabled", false)
        }
    },
    close: function () {
        this.hide()
    },
    deactivate: function () {
        this.active = false
    },
    activate: function () {
        this.active = true
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    alignPanel: function () {
        var c = null;
        if (this.cfg.multiple) {
            c = this.multiItemContainer.innerWidth() - (this.input.position().left - this.multiItemContainer.position().left)
        } else {
            if (this.panel.is(":visible")) {
                c = this.panel.children(".ui-autocomplete-items").outerWidth()
            } else {
                this.panel.css({
                    visibility: "hidden",
                    display: "block"
                });
                c = this.panel.children(".ui-autocomplete-items").outerWidth();
                this.panel.css({
                    visibility: "visible",
                    display: "none"
                })
            }
            var b = this.input.outerWidth();
            if (c < b) {
                c = b
            }
        }
        if (this.cfg.scrollHeight) {
            var a = this.panel.is(":hidden") ? this.panel.height() : this.panel.children().height();
            if (a > this.cfg.scrollHeight) {
                this.panel.height(this.cfg.scrollHeight)
            } else {
                this.panel.css("height", "auto")
            }
        }
        this.panel.css({
            left: "",
            top: "",
            width: c,
            "z-index": ++PrimeFaces.zindex
        });
        if (this.panel.parent().is(this.jq)) {
            this.panel.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.panel.position({
                my: this.cfg.myPos,
                at: this.cfg.atPos,
                of: this.cfg.multiple ? this.jq : this.input,
                collision: "flipfit"
            })
        }
    },
    displayAriaStatus: function (a) {
        this.status.html("<div>" + a + "</div>")
    },
    groupItems: function () {
        var b = this;
        if (this.items.length) {
            this.itemContainer = this.panel.children(".ui-autocomplete-items");
            var a = this.items.eq(0);
            if (!a.hasClass("ui-autocomplete-moretext")) {
                this.currentGroup = a.data("item-group");
                var c = a.data("item-group-tooltip");
                a.before(this.getGroupItem(b.currentGroup, b.itemContainer, c))
            }
            this.items.filter(":not(.ui-autocomplete-moretext)").each(function (e) {
                var f = b.items.eq(e)
                        , g = f.data("item-group")
                        , d = f.data("item-group-tooltip");
                if (b.currentGroup !== g) {
                    b.currentGroup = g;
                    f.before(b.getGroupItem(g, b.itemContainer, d))
                }
            })
        }
    },
    getGroupItem: function (d, a, c) {
        var b = null;
        if (a.is(".ui-autocomplete-table")) {
            if (!this.colspan) {
                this.colspan = this.items.eq(0).children("td").length
            }
            b = $('<tr class="ui-autocomplete-group ui-widget-header"><td colspan="' + this.colspan + '">' + d + "</td></tr>")
        } else {
            b = $('<li class="ui-autocomplete-group ui-autocomplete-list-item ui-widget-header">' + d + "</li>")
        }
        if (b) {
            b.attr("title", c)
        }
        return b
    },
    deleteTimeout: function () {
        clearTimeout(this.timeout);
        this.timeout = null
    }
});
PrimeFaces.widget.BlockUI = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.block = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.block);
        this.content = $(this.jqId);
        this.cfg.animate = (this.cfg.animate === false) ? false : true;
        this.cfg.blocked = (this.cfg.blocked === true) ? true : false;
        this.render();
        if (this.cfg.triggers) {
            this.bindTriggers()
        }
        if (this.cfg.blocked) {
            this.show()
        }
        this.removeScriptElement(this.id)
    },
    refresh: function (a) {
        this.blocker.remove();
        this.block.children(".ui-blockui-content").remove();
        $(document).off("pfAjaxSend." + this.id + " pfAjaxComplete." + this.id);
        this._super(a)
    },
    bindTriggers: function () {
        var b = this
                , a = PrimeFaces.expressions.SearchExpressionFacade.resolveComponents(this.cfg.triggers);
        $(document).on("pfAjaxSend." + this.id, function (f, g, c) {
            var d = $.type(c.source) === "string" ? c.source : c.source.name;
            if ($.inArray(d, a) !== -1 && !b.cfg.blocked) {
                b.show()
            }
        });
        $(document).on("pfAjaxComplete." + this.id, function (f, g, c) {
            var d = $.type(c.source) === "string" ? c.source : c.source.name;
            if ($.inArray(d, a) !== -1 && !b.cfg.blocked) {
                b.hide()
            }
        })
    },
    show: function () {
        this.blocker.css("z-index", ++PrimeFaces.zindex);
        for (var b = 0; b < this.block.length; b++) {
            var a = $(this.blocker[b])
                    , c = $(this.content[b]);
            c.css({
                left: (a.width() - c.outerWidth()) / 2,
                top: (a.height() - c.outerHeight()) / 2,
                "z-index": ++PrimeFaces.zindex
            })
        }
        if (this.cfg.animate) {
            this.blocker.fadeIn()
        } else {
            this.blocker.show()
        }
        if (this.hasContent()) {
            if (this.cfg.animate) {
                this.content.fadeIn()
            } else {
                this.content.show()
            }
        }
        this.block.attr("aria-busy", true)
    },
    hide: function () {
        if (this.cfg.animate) {
            this.blocker.fadeOut()
        } else {
            this.blocker.hide()
        }
        if (this.hasContent()) {
            if (this.cfg.animate) {
                this.content.fadeOut()
            } else {
                this.content.hide()
            }
        }
        this.block.attr("aria-busy", false)
    },
    render: function () {
        this.blocker = $('<div id="' + this.id + '_blocker" class="ui-blockui ui-widget-overlay ui-helper-hidden"></div>');
        if (this.cfg.styleClass) {
            this.blocker.addClass(this.cfg.styleClass)
        }
        if (this.block.hasClass("ui-corner-all")) {
            this.blocker.addClass("ui-corner-all")
        }
        if (this.block.length > 1) {
            this.content = this.content.clone()
        }
        this.block.css("position", "relative").attr("aria-busy", this.cfg.blocked).append(this.blocker).append(this.content);
        if (this.block.length > 1) {
            this.blocker = $(PrimeFaces.escapeClientId(this.id + "_blocker"));
            this.content = this.block.children(".ui-blockui-content")
        }
    },
    hasContent: function () {
        return this.content.contents().length > 0
    }
});
PrimeFaces.widget.Calendar = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        this.input = $(this.jqId + "_input");
        this.jqEl = this.cfg.popup ? this.input : $(this.jqId + "_inline");
        var a = this;
        this.configureLocale();
        this.bindDateSelectListener();
        this.bindViewChangeListener();
        this.cfg.beforeShowDay = function (h) {
            if (a.cfg.preShowDay) {
                return a.cfg.preShowDay(h)
            } else {
                if (a.cfg.disabledWeekends) {
                    return $.datepicker.noWeekends(h)
                } else {
                    return [true, ""]
                }
            }
        }
        ;
        var f = this.hasTimePicker();
        if (f) {
            this.configureTimePicker()
        }
        if (this.cfg.popup) {
            PrimeFaces.skinInput(this.jqEl);
            if (this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.jqEl, this.cfg.behaviors)
            }
            this.cfg.beforeShow = function (h, j) {
                setTimeout(function () {
                    $("#ui-datepicker-div").css("z-index", ++PrimeFaces.zindex);
                    if (a.cfg.showTodayButton === false) {
                        $(h).datepicker("widget").find(".ui-datepicker-current").hide()
                    }
                }, 1);
                if (PrimeFaces.env.touch && !a.input.attr("readonly") && a.cfg.showOn && a.cfg.showOn === "button") {
                    $(this).prop("readonly", true)
                }
                var i = a.cfg.preShow;
                if (i) {
                    return a.cfg.preShow.call(a, h, j)
                }
            }
        }
        if (PrimeFaces.env.touch && !this.input.attr("readonly") && this.cfg.showOn && this.cfg.showOn === "button") {
            this.cfg.onClose = function (i, h) {
                $(this).attr("readonly", false)
            }
        }
        if (!this.cfg.disabled) {
            if (f) {
                if (this.cfg.timeOnly) {
                    this.jqEl.timepicker(this.cfg)
                } else {
                    this.jqEl.datetimepicker(this.cfg)
                }
            } else {
                this.jqEl.datepicker(this.cfg)
            }
        }
        if (this.cfg.popup && this.cfg.showOn) {
            var e = this.jqEl.siblings(".ui-datepicker-trigger:button");
            e.attr("aria-label", PrimeFaces.getAriaLabel("calendar.BUTTON")).attr("aria-haspopup", true).html("").addClass("ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only").append('<span class="ui-button-icon-left ui-icon ui-icon-calendar"></span><span class="ui-button-text">ui-button</span>');
            var g = this.jqEl.attr("title");
            if (g) {
                e.attr("title", g)
            }
            var d = this.cfg.buttonTabindex || this.jqEl.attr("tabindex");
            if (d) {
                e.attr("tabindex", d)
            }
            PrimeFaces.skinButton(e);
            $("#ui-datepicker-div").addClass("ui-shadow");
            this.jq.addClass("ui-trigger-calendar")
        }
        if (this.cfg.popup) {
            this.jq.data("primefaces-overlay-target", this.id).find("*").data("primefaces-overlay-target", this.id)
        }
        if (!this.cfg.popup && this.cfg.showTodayButton === false) {
            this.jqEl.parent().find(".ui-datepicker-current").hide()
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        if (this.cfg.mask) {
            var c = {
                placeholder: this.cfg.maskSlotChar || "_",
                autoclear: this.cfg.maskAutoClear
            };
            this.input.mask(this.cfg.mask, c)
        }
    },
    refresh: function (a) {
        if (a.popup && $.datepicker._lastInput && (a.id + "_input") === $.datepicker._lastInput.id) {
            $.datepicker._hideDatepicker()
        }
        this.init(a)
    },
    configureLocale: function () {
        var a = PrimeFaces.locales[this.cfg.locale];
        if (a) {
            for (var b in a) {
                this.cfg[b] = a[b]
            }
        }
    },
    bindDateSelectListener: function () {
        var a = this;
        this.cfg.onSelect = function () {
            if (a.cfg.popup) {
                a.fireDateSelectEvent()
            } else {
                var b = $.datepicker.formatDate(a.cfg.dateFormat, a.getDate());
                a.input.val(b);
                a.fireDateSelectEvent()
            }
        }
    },
    fireDateSelectEvent: function () {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.dateSelect;
            if (a) {
                a.call(this)
            }
        }
    },
    bindViewChangeListener: function () {
        if (this.hasBehavior("viewChange")) {
            var a = this;
            this.cfg.onChangeMonthYear = function (b, c) {
                a.fireViewChangeEvent(b, c)
            }
        }
    },
    fireViewChangeEvent: function (b, c) {
        if (this.cfg.behaviors) {
            var d = this.cfg.behaviors.viewChange;
            if (d) {
                var a = {
                    params: [{
                            name: this.id + "_month",
                            value: c
                        }, {
                            name: this.id + "_year",
                            value: b
                        }]
                };
                d.call(this, a)
            }
        }
    },
    configureTimePicker: function () {
        var b = this.cfg.dateFormat
                , a = b.toLowerCase().indexOf("h");
        this.cfg.dateFormat = b.substring(0, a - 1);
        this.cfg.timeFormat = b.substring(a, b.length);
        if (this.cfg.timeFormat.indexOf("TT") != -1) {
            this.cfg.ampm = true
        }
        if (this.cfg.minDate) {
            this.cfg.minDate = $.datepicker.parseDateTime(this.cfg.dateFormat, this.cfg.timeFormat, this.cfg.minDate, {}, {})
        }
        if (this.cfg.maxDate) {
            this.cfg.maxDate = $.datepicker.parseDateTime(this.cfg.dateFormat, this.cfg.timeFormat, this.cfg.maxDate, {}, {})
        }
        if (!this.cfg.showButtonPanel) {
            this.cfg.showButtonPanel = false
        }
        if (this.cfg.controlType == "custom" && this.cfg.timeControlObject) {
            this.cfg.controlType = this.cfg.timeControlObject
        }
        if (this.cfg.showHour) {
            this.cfg.showHour = (this.cfg.showHour == "true") ? true : false
        }
        if (this.cfg.showMinute) {
            this.cfg.showMinute = (this.cfg.showMinute == "true") ? true : false
        }
        if (this.cfg.showSecond) {
            this.cfg.showSecond = (this.cfg.showSecond == "true") ? true : false
        }
        if (this.cfg.showMillisec) {
            this.cfg.showMillisec = (this.cfg.showMillisec == "true") ? true : false
        }
    },
    hasTimePicker: function () {
        return this.cfg.dateFormat.toLowerCase().indexOf("h") != -1
    },
    setDate: function (a) {
        this.jqEl.datetimepicker("setDate", a)
    },
    getDate: function () {
        return this.jqEl.datetimepicker("getDate")
    },
    enable: function () {
        this.jqEl.datetimepicker("enable")
    },
    disable: function () {
        this.jqEl.datetimepicker("disable")
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    }
});
PrimeFaces.widget.Carousel = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        this.viewport = this.jq.children(".ui-carousel-viewport");
        this.itemsContainer = this.viewport.children(".ui-carousel-items");
        this.items = this.itemsContainer.children("li");
        this.itemsCount = this.items.length;
        this.header = this.jq.children(".ui-carousel-header");
        this.prevNav = this.header.children(".ui-carousel-prev-button");
        this.nextNav = this.header.children(".ui-carousel-next-button");
        this.pageLinks = this.header.find("> .ui-carousel-page-links > .ui-carousel-page-link");
        this.dropdown = this.header.children(".ui-carousel-dropdown");
        this.mobileDropdown = this.header.children(".ui-carousel-mobiledropdown");
        this.stateholder = $(this.jqId + "_page");
        this.cfg.numVisible = this.cfg.numVisible || 3;
        this.cfg.firstVisible = this.cfg.firstVisible || 0;
        this.columns = this.cfg.numVisible;
        this.first = this.cfg.firstVisible;
        this.cfg.effectDuration = this.cfg.effectDuration || 500;
        this.cfg.circular = this.cfg.circular || false;
        this.cfg.breakpoint = this.cfg.breakpoint || 640;
        this.page = parseInt(this.first / this.columns);
        this.totalPages = Math.ceil(this.itemsCount / this.cfg.numVisible);
        this.renderDeferred()
    },
    _render: function () {
        this.updateNavigators();
        this.bindEvents();
        if (this.cfg.responsive) {
            this.refreshDimensions()
        } else {
            this.calculateItemWidths(this.columns);
            this.jq.width(this.jq.width());
            this.updateNavigators()
        }
    },
    calculateItemWidths: function () {
        var b = this.items.eq(0);
        if (b.length) {
            var a = b.outerWidth(true) - b.width();
            this.items.width((this.viewport.innerWidth() - a * this.columns) / this.columns)
        }
    },
    refreshDimensions: function () {
        var a = $(window);
        if (a.width() <= this.cfg.breakpoint) {
            this.columns = 1;
            this.calculateItemWidths(this.columns);
            this.totalPages = this.itemsCount;
            this.mobileDropdown.show();
            this.pageLinks.hide()
        } else {
            this.columns = this.cfg.numVisible;
            this.calculateItemWidths();
            this.totalPages = Math.ceil(this.itemsCount / this.cfg.numVisible);
            this.mobileDropdown.hide();
            this.pageLinks.show()
        }
        this.page = parseInt(this.first / this.columns);
        this.updateNavigators();
        this.itemsContainer.css("left", (-1 * (this.viewport.innerWidth() * this.page)))
    },
    bindEvents: function () {
        var b = this;
        this.prevNav.on("click", function () {
            if (b.page !== 0) {
                b.setPage(b.page - 1)
            } else {
                if (b.cfg.circular) {
                    b.setPage(b.totalPages - 1)
                }
            }
        });
        this.nextNav.on("click", function () {
            var c = (b.page === (b.totalPages - 1));
            if (!c) {
                b.setPage(b.page + 1)
            } else {
                if (b.cfg.circular) {
                    b.setPage(0)
                }
            }
        });
        this.itemsContainer.swipe({
            swipe: function (c, d) {
                if (d === "left") {
                    if (b.page === (b.totalPages - 1)) {
                        if (b.cfg.circular) {
                            b.setPage(0)
                        }
                    } else {
                        b.setPage(b.page + 1)
                    }
                } else {
                    if (d === "right") {
                        if (b.page === 0) {
                            if (b.cfg.circular) {
                                b.setPage(b.totalPages - 1)
                            }
                        } else {
                            b.setPage(b.page - 1)
                        }
                    }
                }
            }
        });
        if (this.pageLinks.length) {
            this.pageLinks.on("click", function (c) {
                b.setPage($(this).index());
                c.preventDefault()
            })
        }
        this.header.children("select").on("change", function () {
            b.setPage(parseInt($(this).val()) - 1)
        });
        if (this.cfg.autoplayInterval) {
            this.cfg.circular = true;
            this.startAutoplay()
        }
        if (this.cfg.responsive) {
            var a = "resize." + this.id;
            $(window).off(a).on(a, function () {
                b.refreshDimensions()
            })
        }
    },
    updateNavigators: function () {
        if (!this.cfg.circular) {
            if (this.page === 0) {
                this.prevNav.addClass("ui-state-disabled");
                this.nextNav.removeClass("ui-state-disabled")
            } else {
                if (this.page === (this.totalPages - 1)) {
                    this.prevNav.removeClass("ui-state-disabled");
                    this.nextNav.addClass("ui-state-disabled")
                } else {
                    this.prevNav.removeClass("ui-state-disabled");
                    this.nextNav.removeClass("ui-state-disabled")
                }
            }
        }
        if (this.pageLinks.length) {
            this.pageLinks.filter(".ui-icon-radio-on").removeClass("ui-icon-radio-on");
            this.pageLinks.eq(this.page).addClass("ui-icon-radio-on")
        }
        if (this.dropdown.length) {
            this.dropdown.val(this.page + 1)
        }
        if (this.mobileDropdown.length) {
            this.mobileDropdown.val(this.page + 1)
        }
    },
    setPage: function (b) {
        if (b !== this.page && !this.itemsContainer.is(":animated")) {
            var a = this;
            this.itemsContainer.animate({
                left: -1 * (this.viewport.innerWidth() * b),
                easing: this.cfg.easing
            }, {
                duration: this.cfg.effectDuration,
                easing: this.cfg.easing,
                complete: function () {
                    a.page = b;
                    a.first = a.page * a.columns;
                    a.updateNavigators();
                    a.stateholder.val(a.page)
                }
            })
        }
    },
    startAutoplay: function () {
        var a = this;
        this.interval = setInterval(function () {
            if (a.page === (a.totalPages - 1)) {
                a.setPage(0)
            } else {
                a.setPage(a.page + 1)
            }
        }, this.cfg.autoplayInterval)
    },
    stopAutoplay: function () {
        clearInterval(this.interval)
    }
});
PrimeFaces.widget.ColumnToggler = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        this.table = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.datasource);
        this.trigger = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.trigger);
        this.tableId = this.table.attr("id");
        this.thead = $(PrimeFaces.escapeClientId(this.tableId) + "_head");
        this.tbody = $(PrimeFaces.escapeClientId(this.tableId) + "_data");
        this.tfoot = $(PrimeFaces.escapeClientId(this.tableId) + "_foot");
        this.visible = false;
        this.render();
        this.bindEvents()
    },
    render: function () {
        this.columns = this.thead.find("> tr > th:not(.ui-static-column)");
        this.panel = $("<div></div>").attr("id", this.cfg.id).attr("role", "dialog").addClass("ui-columntoggler ui-widget ui-widget-content ui-shadow ui-corner-all").append('<ul class="ui-columntoggler-items" role="group"></ul>').appendTo(document.body);
        this.itemContainer = this.panel.children("ul");
        for (var e = 0; e < this.columns.length; e++) {
            var b = this.columns.eq(e)
                    , f = b.hasClass("ui-helper-hidden")
                    , g = f ? "ui-chkbox-box ui-widget ui-corner-all ui-state-default" : "ui-chkbox-box ui-widget ui-corner-all ui-state-default ui-state-active"
                    , h = (f) ? "ui-chkbox-icon ui-icon ui-icon-blank" : "ui-chkbox-icon ui-icon ui-icon-check"
                    , k = b.children(".ui-column-title").text();
            this.hasPriorityColumns = b.is('[class*="ui-column-p-"]');
            var m = $('<li class="ui-columntoggler-item"><div class="ui-chkbox ui-widget"><div class="ui-helper-hidden-accessible"><input type="checkbox" role="checkbox"></div><div class="' + g + '"><span class="' + h + '"></span></div></div><label>' + k + "</label></li>").data("column", b.attr("id"));
            if (this.hasPriorityColumns) {
                var a = b.attr("class").split(" ");
                for (var d = 0; d < a.length; d++) {
                    var c = a[d]
                            , l = c.indexOf("ui-column-p-");
                    if (l !== -1) {
                        m.addClass(c.substring(l, l + 13))
                    }
                }
            }
            if (!f) {
                m.find("> .ui-chkbox > .ui-helper-hidden-accessible > input").prop("checked", true).attr("aria-checked", true)
            }
            m.appendTo(this.itemContainer)
        }
        this.closer = $('<a href="#" class="ui-columntoggler-close"><span class="ui-icon ui-icon-close"></span></a>').attr("aria-label", PrimeFaces.getAriaLabel("columntoggler.CLOSE")).prependTo(this.panel);
        if (this.panel.outerHeight() > 200) {
            this.panel.height(200)
        }
        this.hide()
    },
    bindEvents: function () {
        var c = this
                , b = "mousedown." + this.id
                , a = "resize." + this.id;
        this.trigger.off("click.ui-columntoggler").on("click.ui-columntoggler", function (d) {
            if (c.visible) {
                c.hide()
            } else {
                c.show()
            }
        });
        this.itemContainer.find("> .ui-columntoggler-item > .ui-chkbox > .ui-chkbox-box").on("mouseover.columnToggler", function () {
            var d = $(this);
            if (!d.hasClass("ui-state-active")) {
                d.addClass("ui-state-hover")
            }
        }).on("mouseout.columnToggler", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click.columnToggler", function (d) {
            c.toggle($(this));
            d.preventDefault()
        });
        this.itemContainer.find("> .ui-columntoggler-item > label").on("click.selectCheckboxMenu", function (d) {
            c.toggle($(this).prev().children(".ui-chkbox-box"));
            PrimeFaces.clearSelection();
            d.preventDefault()
        });
        this.closer.on("click", function (d) {
            c.hide();
            c.trigger.focus();
            d.preventDefault()
        });
        this.bindKeyEvents();
        $(document.body).off(b).on(b, function (f) {
            if (!c.visible) {
                return
            }
            var d = $(f.target);
            if (c.trigger.is(d) || c.trigger.has(d).length) {
                return
            }
            var g = c.panel.offset();
            if (f.pageX < g.left || f.pageX > g.left + c.panel.width() || f.pageY < g.top || f.pageY > g.top + c.panel.height()) {
                c.hide()
            }
        });
        $(window).off(a).on(a, function () {
            if (c.visible) {
                c.alignPanel()
            }
        })
    },
    bindKeyEvents: function () {
        var b = this
                , a = this.itemContainer.find("> li > div.ui-chkbox > div.ui-helper-hidden-accessible > input");
        this.trigger.on("focus.columnToggler", function () {
            $(this).addClass("ui-state-focus")
        }).on("blur.columnToggler", function () {
            $(this).removeClass("ui-state-focus")
        }).on("keydown.columnToggler", function (f) {
            var d = $.ui.keyCode
                    , c = f.which;
            switch (c) {
                case d.ENTER:
                case d.NUMPAD_ENTER:
                    if (b.visible) {
                        b.hide()
                    } else {
                        b.show()
                    }
                    f.preventDefault();
                    break;
                case d.TAB:
                    if (b.visible) {
                        b.itemContainer.children("li:not(.ui-state-disabled):first").find("div.ui-helper-hidden-accessible > input").trigger("focus");
                        f.preventDefault()
                    }
                    break
            }
        });
        a.on("focus.columnToggler", function () {
            var c = $(this)
                    , d = c.parent().next();
            if (c.prop("checked")) {
                d.removeClass("ui-state-active")
            }
            d.addClass("ui-state-focus")
        }).on("blur.columnToggler", function (f) {
            var c = $(this)
                    , d = c.parent().next();
            if (c.prop("checked")) {
                d.addClass("ui-state-active")
            }
            d.removeClass("ui-state-focus")
        }).on("keydown.columnToggler", function (d) {
            if (d.which === $.ui.keyCode.TAB) {
                var c = $(this).closest("li").index();
                if (d.shiftKey) {
                    if (c === 0) {
                        b.closer.focus()
                    } else {
                        a.eq(c - 1).focus()
                    }
                } else {
                    if (c === (b.columns.length - 1) && !d.shiftKey) {
                        b.closer.focus()
                    } else {
                        a.eq(c + 1).focus()
                    }
                }
                d.preventDefault()
            }
        }).on("change.columnToggler", function (f) {
            var c = $(this)
                    , d = c.parent().next();
            if (c.prop("checked")) {
                b.check(d);
                d.removeClass("ui-state-active")
            } else {
                b.uncheck(d)
            }
        });
        this.closer.on("keydown.columnToggler", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.hide();
                b.trigger.focus();
                f.preventDefault()
            } else {
                if (c === d.TAB) {
                    if (f.shiftKey) {
                        a.eq(b.columns.length - 1).focus()
                    } else {
                        a.eq(0).focus()
                    }
                    f.preventDefault()
                }
            }
        })
    },
    toggle: function (a) {
        if (a.hasClass("ui-state-active")) {
            this.uncheck(a)
        } else {
            this.check(a)
        }
    },
    check: function (c) {
        c.addClass("ui-state-active").removeClass("ui-state-hover").children(".ui-chkbox-icon").addClass("ui-icon-check").removeClass("ui-icon-blank");
        var b = $(document.getElementById(c.closest("li.ui-columntoggler-item").data("column"))).index() + 1
                , d = this.thead.children("tr").find("th:nth-child(" + b + ")")
                , a = c.prev().children("input");
        a.prop("checked", true).attr("aria-checked", true);
        d.removeClass("ui-helper-hidden");
        $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).removeClass("ui-helper-hidden");
        this.tbody.children("tr").find("td:nth-child(" + b + ")").removeClass("ui-helper-hidden");
        this.tfoot.children("tr").find("td:nth-child(" + b + ")").removeClass("ui-helper-hidden");
        this.fireToggleEvent(true, (b - 1));
        this.updateColspan()
    },
    uncheck: function (c) {
        c.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
        var b = $(document.getElementById(c.closest("li.ui-columntoggler-item").data("column"))).index() + 1
                , d = this.thead.children("tr").find("th:nth-child(" + b + ")")
                , a = c.prev().children("input");
        a.prop("checked", false).attr("aria-checked", false);
        d.addClass("ui-helper-hidden");
        $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).addClass("ui-helper-hidden");
        this.tbody.children("tr").find("td:nth-child(" + b + ")").addClass("ui-helper-hidden");
        this.tfoot.children("tr").find("td:nth-child(" + b + ")").addClass("ui-helper-hidden");
        this.fireToggleEvent(false, (b - 1));
        this.updateColspan()
    },
    alignPanel: function () {
        this.panel.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        }).position({
            my: "left top",
            at: "left bottom",
            of: this.trigger
        });
        if (this.hasPriorityColumns) {
            if (this.panel.outerWidth() <= this.trigger.outerWidth()) {
                this.panel.css("width", "auto")
            }
            this.widthAligned = false
        }
        if (!this.widthAligned && (this.panel.outerWidth() < this.trigger.outerWidth())) {
            this.panel.width(this.trigger.width());
            this.widthAligned = true
        }
    },
    show: function () {
        this.alignPanel();
        this.panel.show();
        this.visible = true;
        this.trigger.attr("aria-expanded", true);
        this.closer.trigger("focus")
    },
    hide: function () {
        this.panel.fadeOut("fast");
        this.visible = false;
        this.trigger.attr("aria-expanded", false)
    },
    fireToggleEvent: function (e, c) {
        if (this.cfg.behaviors) {
            var b = this.cfg.behaviors.toggle;
            if (b) {
                var a = e ? "VISIBLE" : "HIDDEN"
                        , d = {
                            params: [{
                                    name: this.id + "_visibility",
                                    value: a
                                }, {
                                    name: this.id + "_index",
                                    value: c
                                }]
                        };
                b.call(this, d)
            }
        }
    },
    updateColspan: function () {
        var a = this.tbody.children("tr:first");
        if (a && a.hasClass("ui-datatable-empty-message")) {
            var b = this.itemContainer.find("> .ui-columntoggler-item > .ui-chkbox > .ui-chkbox-box.ui-state-active");
            if (b.length) {
                a.children("td").removeClass("ui-helper-hidden").attr("colspan", b.length)
            } else {
                a.children("td").addClass("ui-helper-hidden")
            }
        }
    }
});
PrimeFaces.widget.Dashboard = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        this.cfg.connectWith = this.jqId + " .ui-dashboard-column";
        this.cfg.placeholder = "ui-state-hover";
        this.cfg.forcePlaceholderSize = true;
        this.cfg.revert = false;
        this.cfg.handle = ".ui-panel-titlebar";
        var a = this;
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.reorder;
            if (c) {
                this.cfg.update = function (h, g) {
                    if (this === g.item.parent()[0]) {
                        var f = g.item.parent().children().filter(":not(script):visible").index(g.item)
                                , i = g.item.parent().parent().children().index(g.item.parent());
                        var d = {
                            params: [{
                                    name: a.id + "_reordered",
                                    value: true
                                }, {
                                    name: a.id + "_widgetId",
                                    value: g.item.attr("id")
                                }, {
                                    name: a.id + "_itemIndex",
                                    value: f
                                }, {
                                    name: a.id + "_receiverColumnIndex",
                                    value: i
                                }]
                        };
                        if (g.sender) {
                            d.params.push({
                                name: a.id + "_senderColumnIndex",
                                value: g.sender.parent().children().index(g.sender)
                            })
                        }
                        c.call(a, d)
                    }
                }
            }
        }
        $(this.jqId + " .ui-dashboard-column").sortable(this.cfg)
    }
});
PrimeFaces.widget.DataGrid = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.cfg.formId = $(this.jqId).closest("form").attr("id");
        this.content = $(this.jqId + "_content");
        if (this.cfg.paginator) {
            this.setupPaginator()
        }
    },
    setupPaginator: function () {
        var a = this;
        this.cfg.paginator.paginate = function (b) {
            a.handlePagination(b)
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator)
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    },
    handlePagination: function (d) {
        var c = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: d.first
                        }, {
                            name: this.id + "_rows",
                            value: d.rows
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                this.content.html(h)
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.paginator.cfg.page = d.page;
                        c.paginator.updateUI()
                    }
                };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    getPaginator: function () {
        return this.paginator
    }
});
PrimeFaces.widget.DataList = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.cfg.formId = $(this.jqId).parents("form:first").attr("id");
        this.content = $(this.jqId + "_content");
        if (this.cfg.paginator) {
            this.setupPaginator()
        }
    },
    setupPaginator: function () {
        var a = this;
        this.cfg.paginator.paginate = function (b) {
            a.handlePagination(b)
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator)
    },
    handlePagination: function (d) {
        var c = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: d.first
                        }, {
                            name: this.id + "_rows",
                            value: d.rows
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                this.content.html(h)
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.paginator.cfg.page = d.page;
                        c.paginator.updateUI()
                    }
                };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    getPaginator: function () {
        return this.paginator
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    }
});
PrimeFaces.widget.DataScroller = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.content = this.jq.children("div.ui-datascroller-content");
        this.list = this.content.children("ul");
        this.loaderContainer = this.content.children("div.ui-datascroller-loader");
        this.loadStatus = $('<div class="ui-datascroller-loading"></div>');
        this.loading = false;
        this.allLoaded = false;
        this.cfg.offset = 0;
        this.cfg.mode = this.cfg.mode || "document";
        this.cfg.buffer = (100 - this.cfg.buffer) / 100;
        if (this.cfg.loadEvent === "scroll") {
            this.bindScrollListener()
        } else {
            this.loadTrigger = this.loaderContainer.children();
            this.bindManualLoader()
        }
    },
    bindScrollListener: function () {
        var d = this;
        if (this.cfg.mode === "document") {
            var c = $(window)
                    , b = $(document)
                    , d = this
                    , a = "scroll." + this.id;
            c.off(a).on(a, function () {
                if (c.scrollTop() >= ((b.height() * d.cfg.buffer) - c.height()) && d.shouldLoad()) {
                    d.load()
                }
            })
        } else {
            this.content.on("scroll", function () {
                var g = this.scrollTop
                        , f = this.scrollHeight
                        , e = this.clientHeight;
                if ((g >= ((f * d.cfg.buffer) - (e))) && d.shouldLoad()) {
                    d.load()
                }
            })
        }
    },
    bindManualLoader: function () {
        var a = this;
        this.loadTrigger.on("click.dataScroller", function (b) {
            a.load();
            b.preventDefault()
        })
    },
    load: function () {
        this.loading = true;
        this.cfg.offset += this.cfg.chunkSize;
        this.loadStatus.appendTo(this.loaderContainer);
        if (this.loadTrigger) {
            this.loadTrigger.hide()
        }
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    global: false,
                    params: [{
                            name: this.id + "_load",
                            value: true
                        }, {
                            name: this.id + "_offset",
                            value: this.cfg.offset
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                this.list.append(f)
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        b.loading = false;
                        b.allLoaded = (b.cfg.offset + b.cfg.chunkSize) >= b.cfg.totalSize;
                        b.loadStatus.remove();
                        if (b.loadTrigger && !b.allLoaded) {
                            b.loadTrigger.show()
                        }
                    }
                };
        PrimeFaces.ajax.AjaxRequest(a)
    },
    shouldLoad: function () {
        return (!this.loading && !this.allLoaded)
    }
});
PrimeFaces.widget.DataTable = PrimeFaces.widget.DeferredWidget.extend({
    SORT_ORDER: {
        ASCENDING: 1,
        DESCENDING: -1,
        UNSORTED: 0
    },
    init: function (a) {
        this._super(a);
        this.thead = this.getThead();
        this.tbody = this.getTbody();
        this.tfoot = this.getTfoot();
        if (this.cfg.paginator) {
            this.bindPaginator()
        }
        this.bindSortEvents();
        if (this.cfg.rowHover) {
            this.setupRowHover()
        }
        if (this.cfg.selectionMode) {
            this.setupSelection()
        }
        if (this.cfg.filter) {
            this.setupFiltering()
        }
        if (this.cfg.expansion) {
            this.expansionProcess = [];
            this.bindExpansionEvents()
        }
        if (this.cfg.editable) {
            this.bindEditEvents()
        }
        if (this.cfg.draggableRows) {
            this.makeRowsDraggable()
        }
        if (this.cfg.reflow) {
            this.initReflow()
        }
        if (this.cfg.groupColumnIndexes) {
            this.groupRows();
            this.bindToggleRowGroupEvents()
        }
        this.renderDeferred()
    },
    _render: function () {
        if (this.cfg.scrollable) {
            this.setupScrolling()
        }
        if (this.cfg.resizableColumns) {
            this.setupResizableColumns()
        }
        if (this.cfg.draggableColumns) {
            this.setupDraggableColumns()
        }
        if (this.cfg.stickyHeader) {
            this.setupStickyHeader()
        }
    },
    getThead: function () {
        return $(this.jqId + "_head")
    },
    getTbody: function () {
        return $(this.jqId + "_data")
    },
    getTfoot: function () {
        return $(this.jqId + "_foot")
    },
    updateData: function (c, a) {
        var b = (a === undefined) ? true : a;
        if (b) {
            this.tbody.html(c)
        } else {
            this.tbody.append(c)
        }
        this.postUpdateData()
    },
    postUpdateData: function () {
        if (this.cfg.draggableRows) {
            this.makeRowsDraggable()
        }
        if (this.cfg.reflow) {
            this.initReflow()
        }
        if (this.cfg.groupColumnIndexes) {
            this.groupRows();
            this.bindToggleRowGroupEvents()
        }
    },
    refresh: function (a) {
        this.columnWidthsFixed = false;
        this.init(a)
    },
    bindPaginator: function () {
        var a = this;
        this.cfg.paginator.paginate = function (c) {
            if (a.cfg.clientCache) {
                a.loadDataWithCache(c)
            } else {
                a.paginate(c)
            }
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator);
        if (this.cfg.clientCache) {
            this.cacheRows = this.paginator.getRows();
            var b = {
                first: this.paginator.getFirst(),
                rows: this.paginator.getRows(),
                page: this.paginator.getCurrentPage()
            };
            this.clearCacheMap();
            this.fetchNextPage(b)
        }
    },
    bindSortEvents: function () {
        var f = this
                , b = false;
        this.cfg.tabindex = this.cfg.tabindex || "0";
        this.sortableColumns = this.thead.find("> tr > th.ui-sortable-column");
        this.sortableColumns.attr("tabindex", this.cfg.tabindex);
        this.ascMessage = PrimeFaces.getAriaLabel("datatable.sort.ASC");
        this.descMessage = PrimeFaces.getAriaLabel("datatable.sort.DESC");
        this.reflowDD = $(this.jqId + "_reflowDD");
        if (this.cfg.multiSort) {
            this.sortMeta = []
        }
        for (var c = 0; c < this.sortableColumns.length; c++) {
            var e = this.sortableColumns.eq(c)
                    , g = e.children("span.ui-sortable-column-icon")
                    , d = null
                    , a = e.attr("aria-label");
            if (e.hasClass("ui-state-active")) {
                if (g.hasClass("ui-icon-triangle-1-n")) {
                    d = this.SORT_ORDER.ASCENDING;
                    e.attr("aria-label", this.getSortMessage(a, this.descMessage));
                    if (!b) {
                        e.attr("aria-sort", "ascending");
                        b = true
                    }
                } else {
                    d = this.SORT_ORDER.DESCENDING;
                    e.attr("aria-label", this.getSortMessage(a, this.ascMessage));
                    if (!b) {
                        e.attr("aria-sort", "descending");
                        b = true
                    }
                }
                if (f.cfg.multiSort) {
                    f.addSortMeta({
                        col: e.attr("id"),
                        order: d
                    })
                }
                f.updateReflowDD(e, d)
            } else {
                d = this.SORT_ORDER.UNSORTED;
                e.attr("aria-label", this.getSortMessage(a, this.ascMessage));
                if (!b && c == (this.sortableColumns.length - 1)) {
                    this.sortableColumns.eq(0).attr("aria-sort", "other");
                    b = true
                }
            }
            e.data("sortorder", d)
        }
        this.sortableColumns.on("mouseenter.dataTable", function () {
            var h = $(this);
            if (!h.hasClass("ui-state-active")) {
                h.addClass("ui-state-hover")
            }
        }).on("mouseleave.dataTable", function () {
            var h = $(this);
            if (!h.hasClass("ui-state-active")) {
                h.removeClass("ui-state-hover")
            }
        }).on("blur.dataTable", function () {
            $(this).removeClass("ui-state-focus")
        }).on("focus.dataTable", function () {
            $(this).addClass("ui-state-focus")
        }).on("keydown.dataTable", function (j) {
            var h = j.which
                    , i = $.ui.keyCode;
            if ((h === i.ENTER || h === i.NUMPAD_ENTER) && $(j.target).is(":not(:input)")) {
                $(this).trigger("click.dataTable", (j.metaKey || j.ctrlKey));
                j.preventDefault()
            }
        }).on("click.dataTable", function (l, j) {
            if (!f.shouldSort(l, this)) {
                return
            }
            PrimeFaces.clearSelection();
            var k = $(this)
                    , h = k.data("sortorder")
                    , i = (h === f.SORT_ORDER.UNSORTED) ? f.SORT_ORDER.ASCENDING : -1 * h
                    , m = l.metaKey || l.ctrlKey || j;
            if (f.cfg.multiSort) {
                if (m) {
                    f.addSortMeta({
                        col: k.attr("id"),
                        order: i
                    });
                    f.sort(k, i, true)
                } else {
                    f.sortMeta = [];
                    f.addSortMeta({
                        col: k.attr("id"),
                        order: i
                    });
                    f.sort(k, i)
                }
            } else {
                f.sort(k, i)
            }
            if (f.cfg.scrollable) {
                $(PrimeFaces.escapeClientId(k.attr("id") + "_clone")).trigger("focus")
            }
            f.updateReflowDD(k, i)
        });
        if (this.reflowDD && this.cfg.reflow) {
            PrimeFaces.skinSelect(this.reflowDD);
            this.reflowDD.change(function (j) {
                var k = $(this).val().split("_")
                        , i = f.sortableColumns.eq(parseInt(k[0]))
                        , h = parseInt(k[1]);
                i.data("sortorder", h);
                i.trigger("click.dataTable")
            })
        }
    },
    getSortMessage: function (a, c) {
        var b = a ? a.split(":")[0] : "";
        return b + ": " + c
    },
    shouldSort: function (b, a) {
        if (this.isEmpty()) {
            return false
        }
        var c = $(b.target);
        if (c.closest(".ui-column-customfilter", a).length) {
            return false
        }
        return c.is("th,span")
    },
    addSortMeta: function (a) {
        this.sortMeta = $.grep(this.sortMeta, function (b) {
            return b.col !== a.col
        });
        this.sortMeta.push(a)
    },
    setupFiltering: function () {
        var b = this
                , a = this.thead.find("> tr > th.ui-filter-column");
        this.cfg.filterEvent = this.cfg.filterEvent || "keyup";
        this.cfg.filterDelay = this.cfg.filterDelay || 300;
        a.children(".ui-column-filter").each(function () {
            var c = $(this);
            if (c.is("input:text")) {
                PrimeFaces.skinInput(c);
                b.bindTextFilter(c)
            } else {
                PrimeFaces.skinSelect(c);
                b.bindChangeFilter(c)
            }
        })
    },
    bindTextFilter: function (a) {
        if (this.cfg.filterEvent === "enter") {
            this.bindEnterKeyFilter(a)
        } else {
            this.bindFilterEvent(a)
        }
    },
    bindChangeFilter: function (a) {
        var b = this;
        a.change(function () {
            b.filter()
        })
    },
    bindEnterKeyFilter: function (a) {
        var b = this;
        a.bind("keydown", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                f.preventDefault()
            }
        }).bind("keyup", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.filter();
                f.preventDefault()
            }
        })
    },
    bindFilterEvent: function (a) {
        var b = this;
        a.on("keydown.dataTable-blockenter", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                f.preventDefault()
            }
        }).on(this.cfg.filterEvent + ".dataTable", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if (c === d.END || c === d.HOME || c === d.LEFT || c === d.RIGHT) {
                return
            }
            if (b.filterTimeout) {
                clearTimeout(b.filterTimeout)
            }
            b.filterTimeout = setTimeout(function () {
                b.filter();
                b.filterTimeout = null
            }, b.cfg.filterDelay)
        })
    },
    setupRowHover: function () {
        var a = "> tr.ui-widget-content";
        if (!this.cfg.selectionMode) {
            this.bindRowHover(a)
        }
    },
    setupSelection: function () {
        this.selectionHolder = this.jqId + "_selection";
        this.cfg.rowSelectMode = this.cfg.rowSelectMode || "new";
        this.rowSelector = "> tr.ui-widget-content.ui-datatable-selectable";
        this.cfg.disabledTextSelection = this.cfg.disabledTextSelection === false ? false : true;
        var a = $(this.selectionHolder).val();
        this.selection = (a === "") ? [] : a.split(",");
        this.originRowIndex = 0;
        this.cursorIndex = null;
        this.bindSelectionEvents()
    },
    bindSelectionEvents: function () {
        if (this.cfg.selectionMode === "radio") {
            this.bindRadioEvents()
        } else {
            if (this.cfg.selectionMode === "checkbox") {
                this.bindCheckboxEvents();
                this.updateHeaderCheckbox();
                if (this.cfg.rowSelectMode !== "checkbox") {
                    this.bindRowEvents()
                }
            } else {
                this.bindRowEvents()
            }
        }
    },
    bindRowEvents: function () {
        var a = this;
        this.bindRowHover(this.rowSelector);
        this.tbody.off("click.dataTable mousedown.dataTable", this.rowSelector).on("mousedown.dataTable", this.rowSelector, null, function (b) {
            a.mousedownOnRow = true
        }).on("click.dataTable", this.rowSelector, null, function (b) {
            a.onRowClick(b, this);
            a.mousedownOnRow = false
        });
        if (this.hasBehavior("rowDblselect")) {
            this.tbody.off("dblclick.dataTable", this.rowSelector).on("dblclick.dataTable", this.rowSelector, null, function (b) {
                a.onRowDblclick(b, $(this))
            })
        }
        this.bindSelectionKeyEvents()
    },
    bindSelectionKeyEvents: function () {
        var a = this;
        this.getFocusableTbody().on("focus", function (b) {
            if (!a.mousedownOnRow) {
                a.focusedRow = a.tbody.children("tr.ui-widget-content.ui-datatable-selectable.ui-state-highlight").eq(0);
                if (a.focusedRow.length == 0) {
                    a.focusedRow = a.tbody.children("tr.ui-widget-content.ui-datatable-selectable").eq(0)
                }
                a.highlightFocusedRow();
                if (a.cfg.scrollable) {
                    PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                }
            }
        }).on("blur", function () {
            if (a.focusedRow) {
                a.unhighlightFocusedRow();
                a.focusedRow = null
            }
        }).on("keydown", function (f) {
            var d = $.ui.keyCode
                    , b = f.which;
            if ($(f.target).is(":input") && a.cfg.editable) {
                return
            }
            if (a.focusedRow) {
                switch (b) {
                    case d.UP:
                        var g = a.focusedRow.prev("tr.ui-widget-content.ui-datatable-selectable");
                        if (g.length) {
                            a.unhighlightFocusedRow();
                            a.focusedRow = g;
                            a.highlightFocusedRow();
                            if (a.cfg.scrollable) {
                                PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                            }
                        }
                        f.preventDefault();
                        break;
                    case d.DOWN:
                        var c = a.focusedRow.next("tr.ui-widget-content.ui-datatable-selectable");
                        if (c.length) {
                            a.unhighlightFocusedRow();
                            a.focusedRow = c;
                            a.highlightFocusedRow();
                            if (a.cfg.scrollable) {
                                PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                            }
                        }
                        f.preventDefault();
                        break;
                    case d.ENTER:
                    case d.NUMPAD_ENTER:
                    case d.SPACE:
                        f.target = a.focusedRow.children().eq(0).get(0);
                        a.onRowClick(f, a.focusedRow.get(0));
                        f.preventDefault();
                        break;
                    default:
                        break
                }
            }
        })
    },
    highlightFocusedRow: function () {
        this.focusedRow.addClass("ui-state-hover")
    },
    unhighlightFocusedRow: function () {
        this.focusedRow.removeClass("ui-state-hover")
    },
    assignFocusedRow: function (a) {
        this.focusedRow = a
    },
    bindRowHover: function (a) {
        this.tbody.off("mouseenter.dataTable mouseleave.dataTable", a).on("mouseenter.dataTable", a, null, function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseleave.dataTable", a, null, function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.removeClass("ui-state-hover")
            }
        })
    },
    bindRadioEvents: function () {
        var c = this
                , b = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column :radio";
        if (this.cfg.nativeElements) {
            this.tbody.off("click.dataTable", b).on("click.dataTable", b, null, function (f) {
                var d = $(this);
                if (!d.prop("checked")) {
                    c.selectRowWithRadio(d)
                }
            })
        } else {
            var a = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column .ui-radiobutton .ui-radiobutton-box";
            this.tbody.off("click.dataTable mouseover.dataTable mouseout.dataTable", a).on("mouseover.dataTable", a, null, function () {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled") && !d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout.dataTable", a, null, function () {
                var d = $(this);
                d.removeClass("ui-state-hover")
            }).on("click.dataTable", a, null, function () {
                var d = $(this)
                        , f = d.hasClass("ui-state-active")
                        , e = d.hasClass("ui-state-disabled");
                if (!e && !f) {
                    c.selectRowWithRadio(d)
                }
            })
        }
        this.tbody.off("focus.dataTable blur.dataTable change.dataTable", b).on("focus.dataTable", b, null, function () {
            var d = $(this)
                    , e = d.parent().next();
            if (d.prop("checked")) {
                e.removeClass("ui-state-active")
            }
            e.addClass("ui-state-focus")
        }).on("blur.dataTable", b, null, function () {
            var d = $(this)
                    , e = d.parent().next();
            if (d.prop("checked")) {
                e.addClass("ui-state-active")
            }
            e.removeClass("ui-state-focus")
        }).on("change.dataTable", b, null, function () {
            var d = c.tbody.find(b).filter(":checked")
                    , e = d.parent().next();
            c.selectRowWithRadio(e)
        })
    },
    bindCheckboxEvents: function () {
        var b = this
                , c = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column :checkbox";
        if (this.cfg.nativeElements) {
            this.checkAllToggler = this.thead.find("> tr > th.ui-selection-column > :checkbox");
            this.checkAllTogglerInput = this.checkAllToggler;
            this.checkAllToggler.on("click", function () {
                b.toggleCheckAll()
            });
            this.tbody.off("click.dataTable", c).on("click.dataTable", c, null, function (f) {
                var d = $(this);
                if (d.prop("checked")) {
                    b.selectRowWithCheckbox(d)
                } else {
                    b.unselectRowWithCheckbox(d)
                }
            })
        } else {
            this.checkAllToggler = this.thead.find("> tr > th.ui-selection-column > .ui-chkbox.ui-chkbox-all > .ui-chkbox-box");
            this.checkAllTogglerInput = this.checkAllToggler.prev().children(":checkbox");
            this.checkAllToggler.on("mouseover", function () {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled") && !d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout", function () {
                $(this).removeClass("ui-state-hover")
            }).on("click", function () {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled")) {
                    b.toggleCheckAll()
                }
            });
            var a = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column .ui-chkbox .ui-chkbox-box";
            this.tbody.off("mouseover.dataTable mouseover.dataTable click.dataTable", a).on("mouseover.dataTable", a, null, function () {
                var d = $(this);
                if (!d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout.dataTable", a, null, function () {
                $(this).removeClass("ui-state-hover")
            }).on("click.dataTable", a, null, function () {
                var e = $(this)
                        , d = e.hasClass("ui-state-active");
                if (d) {
                    b.unselectRowWithCheckbox(e)
                } else {
                    b.selectRowWithCheckbox(e)
                }
            })
        }
        this.tbody.off("focus.dataTable blur.dataTable change.dataTable", c).on("focus.dataTable", c, null, function () {
            var d = $(this)
                    , e = d.parent().next();
            if (d.prop("checked")) {
                e.removeClass("ui-state-active")
            }
            e.addClass("ui-state-focus")
        }).on("blur.dataTable", c, null, function () {
            var d = $(this)
                    , e = d.parent().next();
            if (d.prop("checked")) {
                e.addClass("ui-state-active")
            }
            e.removeClass("ui-state-focus")
        }).on("change.dataTable", c, null, function (g) {
            var d = $(this)
                    , f = d.parent().next();
            if (d.prop("checked")) {
                b.selectRowWithCheckbox(f)
            } else {
                b.unselectRowWithCheckbox(f)
            }
        });
        this.checkAllTogglerInput.on("focus.dataTable", function (g) {
            var d = $(this)
                    , f = d.parent().next();
            if (!f.hasClass("ui-state-disabled")) {
                if (d.prop("checked")) {
                    f.removeClass("ui-state-active")
                }
                f.addClass("ui-state-focus")
            }
        }).on("blur.dataTable", function (g) {
            var d = $(this)
                    , f = d.parent().next();
            if (d.prop("checked")) {
                f.addClass("ui-state-active")
            }
            f.removeClass("ui-state-focus")
        }).on("change.dataTable", function (g) {
            var d = $(this)
                    , f = d.parent().next();
            if (!f.hasClass("ui-state-disabled")) {
                if (!d.prop("checked")) {
                    f.addClass("ui-state-active")
                }
                b.toggleCheckAll();
                if (d.prop("checked")) {
                    f.removeClass("ui-state-active").addClass("ui-state-focus")
                }
            }
        })
    },
    bindExpansionEvents: function () {
        var b = this
                , a = "> tr > td > div.ui-row-toggler";
        this.tbody.off("click.datatable-expansion", a).on("click.datatable-expansion", a, null, function () {
            b.toggleExpansion($(this))
        }).on("keydown.datatable-expansion", a, null, function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.toggleExpansion($(this));
                f.preventDefault()
            }
        })
    },
    bindContextMenu: function (e, f, b, a) {
        var d = b + " tbody.ui-datatable-data > tr.ui-widget-content";
        var c = a.event + ".datatable";
        $(document).off(c, d).on(c, d, null, function (i) {
            var j = $(this);
            if (f.cfg.selectionMode && j.hasClass("ui-datatable-selectable")) {
                f.onRowRightClick(i, this, a.selectionMode);
                e.show(i)
            } else {
                if (f.cfg.editMode === "cell") {
                    var h = $(i.target)
                            , g = h.is("td.ui-editable-column") ? h : h.parents("td.ui-editable-column:first");
                    if (f.contextMenuCell) {
                        f.contextMenuCell.removeClass("ui-state-highlight")
                    }
                    f.contextMenuClick = true;
                    f.contextMenuCell = g;
                    f.contextMenuCell.addClass("ui-state-highlight");
                    e.show(i)
                } else {
                    if (j.hasClass("ui-datatable-empty-message")) {
                        e.show(i)
                    }
                }
            }
        })
    },
    initReflow: function () {
        var a = this.thead.find("> tr > th");
        for (var b = 0; b < a.length; b++) {
            var c = a.eq(b)
                    , d = c.children(".ui-column-title").text();
            this.tbody.find("> tr:not(.ui-datatable-empty-message) > td:nth-child(" + (b + 1) + ")").prepend('<span class="ui-column-title">' + d + "</span>")
        }
    },
    setupScrolling: function () {
        this.scrollHeader = this.jq.children(".ui-datatable-scrollable-header");
        this.scrollBody = this.jq.children(".ui-datatable-scrollable-body");
        this.scrollFooter = this.jq.children(".ui-datatable-scrollable-footer");
        this.scrollStateHolder = $(this.jqId + "_scrollState");
        this.scrollHeaderBox = this.scrollHeader.children("div.ui-datatable-scrollable-header-box");
        this.scrollFooterBox = this.scrollFooter.children("div.ui-datatable-scrollable-footer-box");
        this.headerTable = this.scrollHeaderBox.children("table");
        this.bodyTable = this.cfg.virtualScroll ? this.scrollBody.children("div").children("table") : this.scrollBody.children("table");
        this.footerTable = this.scrollFooter.children("table");
        this.footerCols = this.scrollFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.percentageScrollHeight = this.cfg.scrollHeight && (this.cfg.scrollHeight.indexOf("%") !== -1);
        this.percentageScrollWidth = this.cfg.scrollWidth && (this.cfg.scrollWidth.indexOf("%") !== -1);
        var c = this
                , b = this.getScrollbarWidth() + "px";
        if (this.cfg.scrollHeight) {
            if (this.percentageScrollHeight) {
                this.adjustScrollHeight()
            }
            if (this.hasVerticalOverflow()) {
                this.scrollHeaderBox.css("margin-right", b);
                this.scrollFooterBox.css("margin-right", b)
            }
        }
        this.fixColumnWidths();
        if (this.cfg.scrollWidth) {
            if (this.percentageScrollWidth) {
                this.adjustScrollWidth()
            } else {
                this.setScrollWidth(parseInt(this.cfg.scrollWidth))
            }
        }
        this.cloneHead();
        this.restoreScrollState();
        if (this.cfg.liveScroll) {
            this.scrollOffset = 0;
            this.cfg.liveScrollBuffer = (100 - this.cfg.liveScrollBuffer) / 100;
            this.shouldLiveScroll = true;
            this.loadingLiveScroll = false;
            this.allLoadedLiveScroll = c.cfg.scrollStep >= c.cfg.scrollLimit
        }
        if (this.cfg.virtualScroll) {
            var d = this.bodyTable.children("tbody").children("tr.ui-widget-content");
            if (d) {
                this.rowHeight = d.outerHeight();
                this.scrollBody.children("div").css("height", parseFloat((this.cfg.scrollLimit * this.rowHeight) + "px"))
            }
        }
        this.scrollBody.on("scroll.dataTable", function () {
            var i = c.scrollBody.scrollLeft();
            c.scrollHeaderBox.css("margin-left", -i);
            c.scrollFooterBox.css("margin-left", -i);
            if (c.cfg.virtualScroll) {
                var f = this;
                clearTimeout(c.scrollTimeout);
                c.scrollTimeout = setTimeout(function () {
                    var l = c.scrollBody.outerHeight()
                            , k = c.bodyTable.outerHeight()
                            , n = c.rowHeight * c.cfg.scrollStep
                            , j = parseFloat((c.cfg.scrollLimit * c.rowHeight) + "px")
                            , m = (j / n) || 1;
                    if (f.scrollTop + l > parseFloat(c.bodyTable.css("top")) + k || f.scrollTop < parseFloat(c.bodyTable.css("top"))) {
                        var o = Math.floor((f.scrollTop * m) / (f.scrollHeight)) + 1;
                        c.loadRowsWithVirtualScroll(o);
                        c.bodyTable.css("top", ((o - 1) * n) + "px")
                    }
                }, 200)
            } else {
                if (c.shouldLiveScroll) {
                    var h = Math.ceil(this.scrollTop)
                            , g = this.scrollHeight
                            , e = this.clientHeight;
                    if ((h >= ((g * c.cfg.liveScrollBuffer) - (e))) && c.shouldLoadLiveScroll()) {
                        c.loadLiveRows()
                    }
                }
            }
            c.saveScrollState()
        });
        this.scrollHeader.on("scroll.dataTable", function () {
            c.scrollHeader.scrollLeft(0)
        });
        this.scrollFooter.on("scroll.dataTable", function () {
            c.scrollFooter.scrollLeft(0)
        });
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function () {
            if (c.jq.is(":visible")) {
                if (c.percentageScrollHeight) {
                    c.adjustScrollHeight()
                }
                if (c.percentageScrollWidth) {
                    c.adjustScrollWidth()
                }
            }
        })
    },
    shouldLoadLiveScroll: function () {
        return (!this.loadingLiveScroll && !this.allLoadedLiveScroll)
    },
    cloneHead: function () {
        this.theadClone = this.thead.clone();
        this.theadClone.find("th").each(function () {
            var b = $(this);
            b.attr("id", b.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.theadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.bodyTable);
        if (this.sortableColumns.length) {
            this.sortableColumns.removeAttr("tabindex").off("blur.dataTable focus.dataTable keydown.dataTable");
            var a = this.theadClone.find("> tr > th.ui-sortable-column");
            a.each(function () {
                $(this).data("original", $(this).attr("id").split("_clone")[0])
            });
            a.on("blur.dataTable", function () {
                $(PrimeFaces.escapeClientId($(this).data("original"))).removeClass("ui-state-focus")
            }).on("focus.dataTable", function () {
                $(PrimeFaces.escapeClientId($(this).data("original"))).addClass("ui-state-focus")
            }).on("keydown.dataTable", function (d) {
                var b = d.which
                        , c = $.ui.keyCode;
                if ((b === c.ENTER || b === c.NUMPAD_ENTER) && $(d.target).is(":not(:input)")) {
                    $(PrimeFaces.escapeClientId($(this).data("original"))).trigger("click.dataTable", (d.metaKey || d.ctrlKey));
                    d.preventDefault()
                }
            })
        }
    },
    adjustScrollHeight: function () {
        var d = this.jq.parent().innerHeight() * (parseInt(this.cfg.scrollHeight) / 100)
                , f = this.jq.children(".ui-datatable-header").outerHeight(true)
                , b = this.jq.children(".ui-datatable-footer").outerHeight(true)
                , c = (this.scrollHeader.outerHeight(true) + this.scrollFooter.outerHeight(true))
                , e = this.paginator ? this.paginator.getContainerHeight(true) : 0
                , a = (d - (c + e + f + b));
        if (this.cfg.virtualScroll) {
            this.scrollBody.css("max-height", a)
        } else {
            this.scrollBody.height(a)
        }
    },
    adjustScrollWidth: function () {
        var a = parseInt((this.jq.parent().innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
        this.setScrollWidth(a)
    },
    setOuterWidth: function (a, b) {
        var c = a.outerWidth() - a.width();
        a.width(b - c)
    },
    setScrollWidth: function (a) {
        var b = this;
        this.jq.children(".ui-widget-header").each(function () {
            b.setOuterWidth($(this), a)
        });
        this.scrollHeader.width(a);
        this.scrollBody.css("margin-right", 0).width(a);
        this.scrollFooter.width(a)
    },
    alignScrollBody: function () {
        var a = this.hasVerticalOverflow() ? this.getScrollbarWidth() + "px" : "0px";
        this.scrollHeaderBox.css("margin-right", a);
        this.scrollFooterBox.css("margin-right", a)
    },
    getScrollbarWidth: function () {
        if (!this.scrollbarWidth) {
            this.scrollbarWidth = PrimeFaces.env.browser.webkit ? "15" : PrimeFaces.calculateScrollbarWidth()
        }
        return this.scrollbarWidth
    },
    hasVerticalOverflow: function () {
        return (this.cfg.scrollHeight && this.bodyTable.outerHeight() > this.scrollBody.outerHeight())
    },
    restoreScrollState: function () {
        var a = this.scrollStateHolder.val()
                , b = a.split(",");
        this.scrollBody.scrollLeft(b[0]);
        this.scrollBody.scrollTop(b[1])
    },
    saveScrollState: function () {
        var a = this.scrollBody.scrollLeft() + "," + this.scrollBody.scrollTop();
        this.scrollStateHolder.val(a)
    },
    clearScrollState: function () {
        this.scrollStateHolder.val("0,0")
    },
    fixColumnWidths: function () {
        var d = this;
        if (!this.columnWidthsFixed) {
            if (PrimeFaces.isIE(7)) {
                this.bodyTable.css("width", "auto")
            }
            if (this.cfg.scrollable) {
                this.scrollHeader.find("> .ui-datatable-scrollable-header-box > table > thead > tr > th").each(function () {
                    var h = $(this)
                            , e = h.index()
                            , f = h.width();
                    h.width(f);
                    if (d.footerCols.length > 0) {
                        var g = d.footerCols.eq(e);
                        g.width(f)
                    }
                })
            } else {
                var b = this.jq.find("> .ui-datatable-tablewrapper > table > thead > tr > th")
                        , a = b.filter(":visible")
                        , c = b.filter(":hidden");
                this.setColumnsWidth(a);
                this.setColumnsWidth(c)
            }
            this.columnWidthsFixed = true
        }
    },
    setColumnsWidth: function (a) {
        if (a.length) {
            a.each(function () {
                var b = $(this);
                b.width(b.width())
            })
        }
    },
    loadLiveRows: function () {
        if (this.liveScrollActive || (this.scrollOffset + this.cfg.scrollStep > this.cfg.scrollLimit)) {
            return
        }
        this.liveScrollActive = true;
        this.scrollOffset += this.cfg.scrollStep;
        if (this.scrollOffset === this.cfg.scrollLimit) {
            this.shouldLiveScroll = false
        }
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_scrolling",
                            value: true
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_scrollOffset",
                            value: this.scrollOffset
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                this.updateData(f, false);
                                this.liveScrollActive = false
                            }
                        });
                        return true
                    },
                    oncomplete: function (e, c, d) {
                        if (typeof d.totalRecords !== "undefined") {
                            b.cfg.scrollLimit = d.totalRecords
                        }
                        b.loadingLiveScroll = false;
                        b.allLoadedLiveScroll = (b.scrollOffset + b.cfg.scrollStep) >= b.cfg.scrollLimit
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    loadRowsWithVirtualScroll: function (b) {
        if (this.virtualScrollActive) {
            return
        }
        this.virtualScrollActive = true;
        var c = this
                , d = (b - 1) * this.cfg.scrollStep
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_scrolling",
                            value: true
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: d
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                this.updateData(h);
                                this.virtualScrollActive = false
                            }
                        });
                        return true
                    },
                    oncomplete: function (g, e, f) {
                        if (typeof f.totalRecords !== "undefined") {
                            c.cfg.scrollLimit = f.totalRecords
                        }
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    paginate: function (d) {
        var c = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: d.first
                        }, {
                            name: this.id + "_rows",
                            value: d.rows
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                this.updateData(h);
                                if (this.checkAllToggler) {
                                    this.updateHeaderCheckbox()
                                }
                                if (this.cfg.scrollable) {
                                    this.alignScrollBody()
                                }
                                if (this.cfg.clientCache) {
                                    this.cacheMap[d.first] = h
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function (g, e, f) {
                        c.paginator.cfg.page = d.page;
                        if (f && typeof f.totalRecords !== "undefined") {
                            c.paginator.updateTotalRecords(f.totalRecords)
                        } else {
                            c.paginator.updateUI()
                        }
                    }
                };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    fetchNextPage: function (d) {
        var b = d.rows
                , e = d.first
                , c = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    global: false,
                    params: [{
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: e
                        }, {
                            name: this.id + "_rows",
                            value: b
                        }, {
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_clientCache",
                            value: true
                        }],
                    onsuccess: function (h, f, g) {
                        PrimeFaces.ajax.Response.handle(h, f, g, {
                            widget: c,
                            handle: function (j) {
                                if (j.length) {
                                    var i = e + b;
                                    c.cacheMap[i] = j
                                }
                            }
                        });
                        return true
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    updatePageState: function (c) {
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    global: false,
                    params: [{
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }, {
                            name: this.id + "_pageState",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: c.first
                        }, {
                            name: this.id + "_rows",
                            value: c.rows
                        }],
                    onsuccess: function (f, d, e) {
                        PrimeFaces.ajax.Response.handle(f, d, e, {
                            widget: b,
                            handle: function (g) {}
                        });
                        return true
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    sort: function (d, a, f) {
        var e = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    params: [{
                            name: this.id + "_sorting",
                            value: true
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (i, g, h) {
                        PrimeFaces.ajax.Response.handle(i, g, h, {
                            widget: e,
                            handle: function (j) {
                                this.updateData(j)
                            }
                        });
                        return true
                    },
                    oncomplete: function (q, j, m) {
                        var p = e.getPaginator();
                        if (p && m && p.cfg.rowCount !== m.totalRecords) {
                            p.setTotalRecords(m.totalRecords)
                        }
                        if (!m.validationFailed) {
                            if (p) {
                                p.setPage(0, true)
                            }
                            var g = e.sortableColumns.filter(".ui-state-active");
                            if (g.length) {
                                g.removeAttr("aria-sort")
                            } else {
                                e.sortableColumns.eq(0).removeAttr("aria-sort")
                            }
                            if (!f) {
                                for (var k = 0; k < g.length; k++) {
                                    var h = $(g.get(k))
                                            , n = h.attr("aria-label");
                                    h.attr("aria-label", e.getSortMessage(n, e.ascMessage));
                                    $(PrimeFaces.escapeClientId(h.attr("id") + "_clone")).removeAttr("aria-sort").attr("aria-label", e.getSortMessage(n, e.ascMessage))
                                }
                                g.data("sortorder", e.SORT_ORDER.UNSORTED).removeClass("ui-state-active").find(".ui-sortable-column-icon").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s")
                            }
                            d.data("sortorder", a).removeClass("ui-state-hover").addClass("ui-state-active");
                            var l = d.find(".ui-sortable-column-icon")
                                    , o = d.attr("aria-label");
                            if (a === e.SORT_ORDER.DESCENDING) {
                                l.removeClass("ui-icon-triangle-1-n").addClass("ui-icon-triangle-1-s");
                                d.attr("aria-sort", "descending").attr("aria-label", e.getSortMessage(o, e.ascMessage));
                                $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).attr("aria-sort", "descending").attr("aria-label", e.getSortMessage(o, e.ascMessage))
                            } else {
                                if (a === e.SORT_ORDER.ASCENDING) {
                                    l.removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-n");
                                    d.attr("aria-sort", "ascending").attr("aria-label", e.getSortMessage(o, e.descMessage));
                                    $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).attr("aria-sort", "ascending").attr("aria-label", e.getSortMessage(o, e.descMessage))
                                }
                            }
                        }
                        if (e.cfg.clientCache) {
                            e.clearCacheMap()
                        }
                    }
                };
        if (f) {
            b.params.push({
                name: this.id + "_multiSorting",
                value: true
            });
            b.params.push({
                name: this.id + "_sortKey",
                value: e.joinSortMetaOption("col")
            });
            b.params.push({
                name: this.id + "_sortDir",
                value: e.joinSortMetaOption("order")
            })
        } else {
            b.params.push({
                name: this.id + "_sortKey",
                value: d.attr("id")
            });
            b.params.push({
                name: this.id + "_sortDir",
                value: a
            })
        }
        if (this.hasBehavior("sort")) {
            var c = this.cfg.behaviors.sort;
            c.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    joinSortMetaOption: function (b) {
        var c = "";
        for (var a = 0; a < this.sortMeta.length; a++) {
            c += this.sortMeta[a][b];
            if (a !== (this.sortMeta.length - 1)) {
                c += ","
            }
        }
        return c
    },
    filter: function () {
        var c = this
                , a = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_filtering",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (f, d, e) {
                        PrimeFaces.ajax.Response.handle(f, d, e, {
                            widget: c,
                            handle: function (g) {
                                this.updateData(g);
                                if (this.cfg.scrollable) {
                                    this.alignScrollBody()
                                }
                                if (this.isCheckboxSelectionEnabled()) {
                                    this.updateHeaderCheckbox()
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function (g, d, e) {
                        var h = c.getPaginator();
                        if (e && typeof e.totalRecords !== "undefined") {
                            c.cfg.scrollLimit = e.totalRecords;
                            if (h) {
                                h.setTotalRecords(e.totalRecords)
                            }
                        }
                        if (c.cfg.clientCache) {
                            c.clearCacheMap()
                        }
                        if (c.cfg.virtualScroll) {
                            var f = c.bodyTable.children("tbody").children("tr.ui-widget-content");
                            if (f) {
                                c.rowHeight = f.outerHeight();
                                c.scrollBody.children("div").css({
                                    height: parseFloat((c.cfg.scrollLimit * c.rowHeight + 1) + "px")
                                })
                            }
                        } else {
                            if (c.cfg.liveScroll) {
                                c.scrollOffset = 0;
                                c.liveScrollActive = false;
                                c.shouldLiveScroll = true;
                                c.loadingLiveScroll = false;
                                c.allLoadedLiveScroll = c.cfg.scrollStep >= c.cfg.scrollLimit
                            }
                        }
                    }
                };
        if (this.hasBehavior("filter")) {
            var b = this.cfg.behaviors.filter;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.AjaxRequest(a)
        }
    },
    onRowClick: function (e, d, a) {
        if ($(e.target).is("td:not(.ui-column-unselectable),span:not(.ui-c)")) {
            var g = $(d)
                    , c = g.hasClass("ui-state-highlight")
                    , f = e.metaKey || e.ctrlKey
                    , b = e.shiftKey;
            this.assignFocusedRow(g);
            if (c && f) {
                this.unselectRow(g, a)
            } else {
                if (this.isSingleSelection() || (this.isMultipleSelection() && e && !f && !b && this.cfg.rowSelectMode === "new")) {
                    this.unselectAllRows()
                }
                if (this.isMultipleSelection() && e && e.shiftKey) {
                    this.selectRowsInRange(g)
                } else {
                    this.originRowIndex = g.index();
                    this.cursorIndex = null;
                    this.selectRow(g, a)
                }
            }
            if (this.cfg.disabledTextSelection) {
                PrimeFaces.clearSelection()
            }
        }
    },
    onRowDblclick: function (a, c) {
        if (this.cfg.disabledTextSelection) {
            PrimeFaces.clearSelection()
        }
        if ($(a.target).is("td,span:not(.ui-c)")) {
            var b = this.getRowMeta(c);
            this.fireRowSelectEvent(b.key, "rowDblselect")
        }
    },
    onRowRightClick: function (c, b, f) {
        var e = $(b)
                , d = this.getRowMeta(e)
                , a = e.hasClass("ui-state-highlight");
        if (f === "single" || !a) {
            this.unselectAllRows()
        }
        this.selectRow(e, true);
        this.fireRowSelectEvent(d.key, "contextMenu");
        if (this.cfg.disabledTextSelection) {
            PrimeFaces.clearSelection()
        }
    },
    findRow: function (a) {
        var b = a;
        if (PrimeFaces.isNumber(a)) {
            b = this.tbody.children("tr:eq(" + a + ")")
        }
        return b
    },
    selectRowsInRange: function (f) {
        var c = this.tbody.children()
                , e = this.getRowMeta(f)
                , d = this;
        if (this.cursorIndex !== null) {
            var g = this.cursorIndex
                    , a = g > this.originRowIndex ? c.slice(this.originRowIndex, g + 1) : c.slice(g, this.originRowIndex + 1);
            a.each(function (h, j) {
                d.unselectRow($(j), true)
            })
        }
        this.cursorIndex = f.index();
        var b = this.cursorIndex > this.originRowIndex ? c.slice(this.originRowIndex, this.cursorIndex + 1) : c.slice(this.cursorIndex, this.originRowIndex + 1);
        b.each(function (h, j) {
            d.selectRow($(j), true)
        });
        this.fireRowSelectEvent(e.key, "rowSelect")
    },
    selectRow: function (b, a) {
        var d = this.findRow(b)
                , c = this.getRowMeta(d);
        this.highlightRow(d);
        if (this.isCheckboxSelectionEnabled()) {
            if (this.cfg.nativeElements) {
                d.children("td.ui-selection-column").find(":checkbox").prop("checked", true)
            } else {
                this.selectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
            }
            this.updateHeaderCheckbox()
        }
        this.addSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.fireRowSelectEvent(c.key, "rowSelect")
        }
    },
    unselectRow: function (b, a) {
        var d = this.findRow(b)
                , c = this.getRowMeta(d);
        this.unhighlightRow(d);
        if (this.isCheckboxSelectionEnabled()) {
            if (this.cfg.nativeElements) {
                d.children("td.ui-selection-column").find(":checkbox").prop("checked", false)
            } else {
                this.unselectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
            }
            this.updateHeaderCheckbox()
        }
        this.removeSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.fireRowUnselectEvent(c.key, "rowUnselect")
        }
    },
    highlightRow: function (a) {
        a.removeClass("ui-state-hover").addClass("ui-state-highlight").attr("aria-selected", true)
    },
    unhighlightRow: function (a) {
        a.removeClass("ui-state-highlight").attr("aria-selected", false)
    },
    fireRowSelectEvent: function (d, a) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors[a];
            if (c) {
                var b = {
                    params: [{
                            name: this.id + "_instantSelectedRowKey",
                            value: d
                        }]
                };
                c.call(this, b)
            }
        }
    },
    fireRowUnselectEvent: function (d, b) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors[b];
            if (a) {
                var c = {
                    params: [{
                            name: this.id + "_instantUnselectedRowKey",
                            value: d
                        }]
                };
                a.call(this, c)
            }
        }
    },
    selectRowWithRadio: function (a) {
        var c = a.closest("tr")
                , b = this.getRowMeta(c);
        this.unselectAllRows();
        if (!this.cfg.nativeElements) {
            this.selectRadio(a)
        }
        this.highlightRow(c);
        this.addSelection(b.key);
        this.writeSelections();
        this.fireRowSelectEvent(b.key, "rowSelectRadio")
    },
    selectRowWithCheckbox: function (b, a) {
        var d = b.closest("tr")
                , c = this.getRowMeta(d);
        this.highlightRow(d);
        if (!this.cfg.nativeElements) {
            this.selectCheckbox(b)
        }
        this.addSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.updateHeaderCheckbox();
            this.fireRowSelectEvent(c.key, "rowSelectCheckbox")
        }
    },
    unselectRowWithCheckbox: function (b, a) {
        var d = b.closest("tr")
                , c = this.getRowMeta(d);
        this.unhighlightRow(d);
        if (!this.cfg.nativeElements) {
            this.unselectCheckbox(b)
        }
        this.removeSelection(c.key);
        this.uncheckHeaderCheckbox();
        this.writeSelections();
        if (!a) {
            this.fireRowUnselectEvent(c.key, "rowUnselectCheckbox")
        }
    },
    unselectAllRows: function () {
        var c = this.tbody.children("tr.ui-state-highlight")
                , a = this.isCheckboxSelectionEnabled()
                , e = this.isRadioSelectionEnabled();
        for (var b = 0; b < c.length; b++) {
            var d = c.eq(b);
            this.unhighlightRow(d);
            if (a) {
                if (this.cfg.nativeElements) {
                    d.children("td.ui-selection-column").find(":checkbox").prop("checked", false)
                } else {
                    this.unselectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
                }
            } else {
                if (e) {
                    if (this.cfg.nativeElements) {
                        d.children("td.ui-selection-column").find(":radio").prop("checked", false)
                    } else {
                        this.unselectRadio(d.children("td.ui-selection-column").find("> div.ui-radiobutton > div.ui-radiobutton-box"))
                    }
                }
            }
        }
        if (a) {
            this.uncheckHeaderCheckbox()
        }
        this.selection = [];
        this.writeSelections()
    },
    selectAllRowsOnPage: function () {
        var b = this.tbody.children("tr");
        for (var a = 0; a < b.length; a++) {
            var c = b.eq(a);
            this.selectRow(c, true)
        }
    },
    unselectAllRowsOnPage: function () {
        var b = this.tbody.children("tr");
        for (var a = 0; a < b.length; a++) {
            var c = b.eq(a);
            this.unselectRow(c, true)
        }
    },
    selectAllRows: function () {
        this.selectAllRowsOnPage();
        this.selection = new Array("@all");
        this.writeSelections()
    },
    toggleCheckAll: function () {
        if (this.cfg.nativeElements) {
            var d = this.tbody.find("> tr.ui-datatable-selectable > td.ui-selection-column > :checkbox")
                    , c = this.checkAllToggler.prop("checked")
                    , e = this;
            d.each(function () {
                if (c) {
                    var f = $(this);
                    f.prop("checked", true);
                    e.selectRowWithCheckbox(f, true)
                } else {
                    var f = $(this);
                    f.prop("checked", false);
                    e.unselectRowWithCheckbox(f, true)
                }
            })
        } else {
            var d = this.tbody.find("> tr.ui-datatable-selectable > td.ui-selection-column .ui-chkbox-box")
                    , c = this.checkAllToggler.hasClass("ui-state-active")
                    , e = this;
            if (c) {
                this.checkAllToggler.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
                this.checkAllTogglerInput.prop("checked", false).attr("aria-checked", false);
                d.each(function () {
                    e.unselectRowWithCheckbox($(this), true)
                })
            } else {
                this.checkAllToggler.addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
                this.checkAllTogglerInput.prop("checked", true).attr("aria-checked", true);
                d.each(function () {
                    e.selectRowWithCheckbox($(this), true)
                })
            }
        }
        this.writeSelections();
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.toggleSelect;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_checked",
                            value: !c
                        }]
                };
                a.call(this, b)
            }
        }
    },
    selectCheckbox: function (a) {
        if (!a.hasClass("ui-state-focus")) {
            a.addClass("ui-state-active")
        }
        a.children("span.ui-chkbox-icon:first").removeClass("ui-icon-blank").addClass(" ui-icon-check");
        a.prev().children("input").prop("checked", true).attr("aria-checked", true)
    },
    unselectCheckbox: function (a) {
        a.removeClass("ui-state-active");
        a.children("span.ui-chkbox-icon:first").addClass("ui-icon-blank").removeClass("ui-icon-check");
        a.prev().children("input").prop("checked", false).attr("aria-checked", false)
    },
    selectRadio: function (a) {
        a.removeClass("ui-state-hover");
        if (!a.hasClass("ui-state-focus")) {
            a.addClass("ui-state-active")
        }
        a.children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank");
        a.prev().children("input").prop("checked", true)
    },
    unselectRadio: function (a) {
        a.removeClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-blank").removeClass("ui-icon-bullet");
        a.prev().children("input").prop("checked", false)
    },
    toggleExpansion: function (b) {
        var d = b.closest("tr")
                , g = this.getRowMeta(d).index
                , f = b.hasClass("ui-icon")
                , e = b.children("span")
                , a = f ? b.hasClass("ui-icon-circle-triangle-s") : b.children("span").eq(0).hasClass("ui-helper-hidden")
                , c = this;
        if ($.inArray(g, this.expansionProcess) === -1) {
            this.expansionProcess.push(g);
            if (a) {
                if (f) {
                    b.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s").attr("aria-expanded", false)
                } else {
                    e.eq(0).removeClass("ui-helper-hidden");
                    e.eq(1).addClass("ui-helper-hidden")
                }
                this.collapseRow(d);
                c.expansionProcess = $.grep(c.expansionProcess, function (h) {
                    return (h !== g)
                });
                this.fireRowCollapseEvent(d)
            } else {
                if (this.cfg.rowExpandMode === "single") {
                    this.collapseAllRows()
                }
                if (f) {
                    b.addClass("ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-e").attr("aria-expanded", true)
                } else {
                    e.eq(0).addClass("ui-helper-hidden");
                    e.eq(1).removeClass("ui-helper-hidden")
                }
                this.loadExpandedRowContent(d)
            }
        }
    },
    loadExpandedRowContent: function (d) {
        var c = this
                , e = this.getRowMeta(d).index
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_rowExpansion",
                            value: true
                        }, {
                            name: this.id + "_expandedRowIndex",
                            value: e
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }],
                    onsuccess: function (h, f, g) {
                        PrimeFaces.ajax.Response.handle(h, f, g, {
                            widget: c,
                            handle: function (i) {
                                if (i && $.trim(i).length) {
                                    d.addClass("ui-expanded-row");
                                    this.displayExpandedRow(d, i)
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.expansionProcess = $.grep(c.expansionProcess, function (f) {
                            return f !== e
                        })
                    }
                };
        if (this.hasBehavior("rowToggle")) {
            var b = this.cfg.behaviors.rowToggle;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.AjaxRequest(a)
        }
    },
    displayExpandedRow: function (b, a) {
        b.after(a)
    },
    fireRowCollapseEvent: function (c) {
        var d = this.getRowMeta(c).index;
        if (this.hasBehavior("rowToggle")) {
            var a = {
                params: [{
                        name: this.id + "_collapsedRowIndex",
                        value: d
                    }]
            };
            var b = this.cfg.behaviors.rowToggle;
            b.call(this, a)
        }
    },
    collapseRow: function (a) {
        a.removeClass("ui-expanded-row").next(".ui-expanded-row-content").remove()
    },
    collapseAllRows: function () {
        var a = this;
        this.getExpandedRows().each(function () {
            var f = $(this);
            a.collapseRow(f);
            var c = f.children("td");
            for (var b = 0; b < c.length; b++) {
                var d = c.eq(b)
                        , e = d.children(".ui-row-toggler");
                if (e.length > 0) {
                    if (e.hasClass("ui-icon")) {
                        e.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s")
                    } else {
                        var g = e.children("span");
                        g.eq(0).removeClass("ui-helper-hidden");
                        g.eq(1).addClass("ui-helper-hidden")
                    }
                    break
                }
            }
        })
    },
    getExpandedRows: function () {
        return this.tbody.children(".ui-expanded-row")
    },
    bindEditEvents: function () {
        var c = this;
        this.cfg.cellSeparator = this.cfg.cellSeparator || " ";
        this.cfg.saveOnCellBlur = (this.cfg.saveOnCellBlur === false) ? false : true;
        if (this.cfg.editMode === "row") {
            var a = "> tr > td > div.ui-row-editor > a";
            this.tbody.off("click.datatable focus.datatable blur.datatable", a).on("click.datatable", a, null, function (f) {
                var d = $(this)
                        , g = d.closest("tr");
                if (d.hasClass("ui-row-editor-pencil")) {
                    c.switchToRowEdit(g);
                    d.hide().siblings().show()
                } else {
                    if (d.hasClass("ui-row-editor-check")) {
                        c.saveRowEdit(g)
                    } else {
                        if (d.hasClass("ui-row-editor-close")) {
                            c.cancelRowEdit(g)
                        }
                    }
                }
                f.preventDefault()
            }).on("focus.datatable", a, null, function (d) {
                $(this).addClass("ui-row-editor-outline")
            }).on("blur.datatable", a, null, function (d) {
                $(this).removeClass("ui-row-editor-outline")
            })
        } else {
            if (this.cfg.editMode === "cell") {
                var b = "> tr > td.ui-editable-column";
                this.tbody.off("click.datatable-cell", b).on("click.datatable-cell", b, null, function (f) {
                    c.incellClick = true;
                    var d = $(this);
                    if (!d.hasClass("ui-cell-editing")) {
                        c.showCellEditor($(this))
                    }
                });
                $(document).off("click.datatable-cell-blur" + this.id).on("click.datatable-cell-blur" + this.id, function (d) {
                    if (!c.incellClick && c.currentCell && !c.contextMenuClick && !$.datepicker._datepickerShowing) {
                        if (c.cfg.saveOnCellBlur) {
                            c.saveCell(c.currentCell)
                        } else {
                            c.doCellEditCancelRequest(c.currentCell)
                        }
                    }
                    c.incellClick = false;
                    c.contextMenuClick = false
                })
            }
        }
    },
    switchToRowEdit: function (c) {
        this.showRowEditors(c);
        if (this.hasBehavior("rowEditInit")) {
            var b = this.cfg.behaviors.rowEditInit
                    , d = this.getRowMeta(c).index;
            var a = {
                params: [{
                        name: this.id + "_rowEditIndex",
                        value: d
                    }]
            };
            b.call(this, a)
        }
    },
    showRowEditors: function (a) {
        a.addClass("ui-state-highlight ui-row-editing").children("td.ui-editable-column").each(function () {
            var b = $(this);
            b.find(".ui-cell-editor-output").hide();
            b.find(".ui-cell-editor-input").show()
        })
    },
    cellEditInit: function (a) {
        var g = this.getRowMeta(a.closest("tr"))
                , e = a.children(".ui-cell-editor")
                , d = a.index()
                , f = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + f.cfg.frozenColumns) : d
        }
        var c = g.index + "," + d;
        if (g.key) {
            c = c + "," + g.key
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                    name: this.id + "_encodeFeature",
                    value: true
                }, {
                    name: this.id + "_cellEditInit",
                    value: true
                }, {
                    name: this.id + "_cellInfo",
                    value: c
                }],
            onsuccess: function (j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: f,
                    handle: function (k) {
                        e.children(".ui-cell-editor-input").html(k)
                    }
                });
                return true
            },
            oncomplete: function (j, h, i) {
                f.showCurrentCell(a)
            }
        };
        if (this.hasBehavior("cellEditInit")) {
            this.cfg.behaviors.cellEditInit.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    showCellEditor: function (d) {
        this.incellClick = true;
        var a = null;
        if (d) {
            a = d;
            if (this.contextMenuCell) {
                this.contextMenuCell.parent().removeClass("ui-state-highlight")
            }
        } else {
            a = this.contextMenuCell
        }
        var b = a.find("> .ui-cell-editor > .ui-cell-editor-input");
        if (b.length !== 0 && b.children().length === 0 && this.cfg.editMode === "cell") {
            this.cellEditInit(a)
        } else {
            this.showCurrentCell(a)
        }
    },
    showCurrentCell: function (h) {
        var f = this;
        if (this.currentCell) {
            if (this.cfg.saveOnCellBlur) {
                this.saveCell(this.currentCell)
            } else {
                if (!this.currentCell.is(h)) {
                    this.doCellEditCancelRequest(this.currentCell)
                }
            }
        }
        this.currentCell = h;
        var b = h.children("div.ui-cell-editor")
                , a = b.children("div.ui-cell-editor-output")
                , j = b.children("div.ui-cell-editor-input")
                , d = j.find(":input:enabled")
                , e = d.length > 1;
        h.addClass("ui-state-highlight ui-cell-editing");
        a.hide();
        j.show();
        d.eq(0).focus().select();
        if (e) {
            var g = [];
            for (var c = 0; c < d.length; c++) {
                g.push(d.eq(c).val())
            }
            h.data("multi-edit", true);
            h.data("old-value", g)
        } else {
            h.data("multi-edit", false);
            h.data("old-value", d.eq(0).val())
        }
        if (!h.data("edit-events-bound")) {
            h.data("edit-events-bound", true);
            d.on("keydown.datatable-cell", function (n) {
                var m = $.ui.keyCode
                        , l = n.shiftKey
                        , k = n.which
                        , i = $(this);
                if (k === m.ENTER || k == m.NUMPAD_ENTER) {
                    f.saveCell(h);
                    n.preventDefault()
                } else {
                    if (k === m.TAB) {
                        if (e) {
                            var o = l ? i.index() - 1 : i.index() + 1;
                            if (o < 0 || (o === d.length) || i.parent().hasClass("ui-inputnumber")) {
                                f.tabCell(h, !l)
                            } else {
                                d.eq(o).focus()
                            }
                        } else {
                            f.tabCell(h, !l)
                        }
                        n.preventDefault()
                    } else {
                        if (k === m.ESCAPE) {
                            f.doCellEditCancelRequest(h);
                            f.currentCell = null;
                            n.preventDefault()
                        }
                    }
                }
            }).on("focus.datatable-cell click.datatable-cell", function (i) {
                f.currentCell = h
            })
        }
    },
    tabCell: function (a, d) {
        var b = d ? a.next() : a.prev();
        if (b.length == 0) {
            var c = d ? a.parent().next() : a.parent().prev();
            b = d ? c.children("td.ui-editable-column:first") : c.children("td.ui-editable-column:last")
        }
        this.showCellEditor(b)
    },
    saveCell: function (a) {
        var c = a.find("div.ui-cell-editor-input :input:enabled")
                , f = false
                , e = this;
        if (a.data("multi-edit")) {
            var b = a.data("old-value");
            for (var d = 0; d < c.length; d++) {
                if (c.eq(d).val() != b[d]) {
                    f = true;
                    break
                }
            }
        } else {
            f = (c.eq(0).val() != a.data("old-value"))
        }
        if (f) {
            e.doCellEditRequest(a)
        } else {
            e.viewMode(a)
        }
        this.currentCell = null
    },
    viewMode: function (a) {
        var b = a.children("div.ui-cell-editor")
                , d = b.children("div.ui-cell-editor-input")
                , c = b.children("div.ui-cell-editor-output");
        a.removeClass("ui-cell-editing ui-state-error ui-state-highlight");
        c.show();
        d.hide();
        a.removeData("old-value").removeData("multi-edit");
        if (this.cfg.cellEditMode === "lazy") {
            d.children().remove()
        }
    },
    doCellEditRequest: function (a) {
        var h = this.getRowMeta(a.closest("tr"))
                , e = a.children(".ui-cell-editor")
                , f = e.attr("id")
                , d = a.index()
                , g = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + g.cfg.frozenColumns) : d
        }
        var c = h.index + "," + d;
        if (h.key) {
            c = c + "," + h.key
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                    name: this.id + "_encodeFeature",
                    value: true
                }, {
                    name: this.id + "_cellInfo",
                    value: c
                }, {
                    name: f,
                    value: f
                }],
            onsuccess: function (k, i, j) {
                PrimeFaces.ajax.Response.handle(k, i, j, {
                    widget: g,
                    handle: function (l) {
                        e.children(".ui-cell-editor-output").html(l)
                    }
                });
                return true
            },
            oncomplete: function (k, i, j) {
                if (j.validationFailed) {
                    a.addClass("ui-state-error")
                } else {
                    g.viewMode(a)
                }
                if (g.cfg.clientCache) {
                    g.clearCacheMap()
                }
            }
        };
        if (this.hasBehavior("cellEdit")) {
            this.cfg.behaviors.cellEdit.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    doCellEditCancelRequest: function (a) {
        var g = this.getRowMeta(a.closest("tr"))
                , e = a.children(".ui-cell-editor")
                , d = a.index()
                , f = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + f.cfg.frozenColumns) : d
        }
        var c = g.index + "," + d;
        if (g.key) {
            c = c + "," + g.key
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                    name: this.id + "_encodeFeature",
                    value: true
                }, {
                    name: this.id + "_cellEditCancel",
                    value: true
                }, {
                    name: this.id + "_cellInfo",
                    value: c
                }],
            onsuccess: function (j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: f,
                    handle: function (k) {
                        e.children(".ui-cell-editor-input").html(k)
                    }
                });
                return true
            },
            oncomplete: function (j, h, i) {
                f.viewMode(a);
                a.data("edit-events-bound", false);
                if (f.cfg.clientCache) {
                    f.clearCacheMap()
                }
            }
        };
        if (this.hasBehavior("cellEditCancel")) {
            this.cfg.behaviors.cellEditCancel.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    saveRowEdit: function (a) {
        this.doRowEditRequest(a, "save")
    },
    cancelRowEdit: function (a) {
        this.doRowEditRequest(a, "cancel")
    },
    doRowEditRequest: function (a, d) {
        var f = a.closest("tr")
                , g = this.getRowMeta(f).index
                , b = f.hasClass("ui-expanded-row")
                , e = this
                , c = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_rowEditIndex",
                            value: this.getRowMeta(f).index
                        }, {
                            name: this.id + "_rowEditAction",
                            value: d
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (j, h, i) {
                        PrimeFaces.ajax.Response.handle(j, h, i, {
                            widget: e,
                            handle: function (k) {
                                if (b) {
                                    this.collapseRow(f)
                                }
                                this.updateRow(f, k)
                            }
                        });
                        return true
                    },
                    oncomplete: function (j, h, i) {
                        if (i && i.validationFailed) {
                            e.invalidateRow(g)
                        }
                        if (e.cfg.clientCache) {
                            e.clearCacheMap()
                        }
                    }
                };
        if (d === "save") {
            this.getRowEditors(f).each(function () {
                c.params.push({
                    name: this.id,
                    value: this.id
                })
            })
        }
        if (d === "save" && this.hasBehavior("rowEdit")) {
            this.cfg.behaviors.rowEdit.call(this, c)
        } else {
            if (d === "cancel" && this.hasBehavior("rowEditCancel")) {
                this.cfg.behaviors.rowEditCancel.call(this, c)
            } else {
                PrimeFaces.ajax.Request.handle(c)
            }
        }
    },
    updateRow: function (b, a) {
        b.replaceWith(a)
    },
    invalidateRow: function (a) {
        var b = (this.paginator) ? (a % this.paginator.getRows()) : a;
        this.tbody.children("tr").eq(b).addClass("ui-widget-content ui-row-editing ui-state-error")
    },
    getRowEditors: function (a) {
        return a.find("div.ui-cell-editor")
    },
    getPaginator: function () {
        return this.paginator
    },
    writeSelections: function () {
        $(this.selectionHolder).val(this.selection.join(","))
    },
    isSingleSelection: function () {
        return this.cfg.selectionMode == "single"
    },
    isMultipleSelection: function () {
        return this.cfg.selectionMode == "multiple" || this.isCheckboxSelectionEnabled()
    },
    clearSelection: function () {
        this.selection = [];
        $(this.selectionHolder).val("")
    },
    isSelectionEnabled: function () {
        return this.cfg.selectionMode != undefined || this.cfg.columnSelectionMode != undefined
    },
    isCheckboxSelectionEnabled: function () {
        return this.cfg.selectionMode === "checkbox"
    },
    isRadioSelectionEnabled: function () {
        return this.cfg.selectionMode === "radio"
    },
    clearFilters: function () {
        var a = this.thead.find("> tr > th.ui-filter-column > .ui-column-filter");
        if (a.length == 0) {
            return
        }
        a.val("");
        $(this.jqId + "\\:globalFilter").val("");
        this.filter()
    },
    setupResizableColumns: function () {
        this.cfg.resizeMode = this.cfg.resizeMode || "fit";
        this.hasColumnGroup = this.hasColGroup();
        if (this.hasColumnGroup) {
            this.addGhostRow()
        }
        this.fixColumnWidths();
        if (!this.cfg.liveResize) {
            this.resizerHelper = $('<div class="ui-column-resizer-helper ui-state-highlight"></div>').appendTo(this.jq)
        }
        this.addResizers();
        var a = this.thead.find("> tr > th > span.ui-column-resizer")
                , b = this;
        a.draggable({
            axis: "x",
            start: function (d, e) {
                e.helper.data("originalposition", e.helper.offset());
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "col-resize")
                } else {
                    var f = b.cfg.stickyHeader ? b.clone : b.thead
                            , c = b.cfg.scrollable ? b.scrollBody.height() : f.parent().height() - f.height() - 1;
                    if (b.cfg.stickyHeader) {
                        c = c - b.relativeHeight
                    }
                    b.resizerHelper.height(c);
                    b.resizerHelper.show()
                }
            },
            drag: function (c, d) {
                if (b.cfg.liveResize) {
                    b.resize(c, d)
                } else {
                    b.resizerHelper.offset({
                        left: d.helper.offset().left + d.helper.width() / 2,
                        top: b.thead.offset().top + b.thead.height()
                    })
                }
            },
            stop: function (c, d) {
                d.helper.css({
                    left: "",
                    top: "0px"
                });
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "default")
                } else {
                    b.resize(c, d);
                    b.resizerHelper.hide()
                }
                if (b.cfg.resizeMode === "expand") {
                    setTimeout(function () {
                        b.fireColumnResizeEvent(d.helper.parent())
                    }, 5)
                } else {
                    b.fireColumnResizeEvent(d.helper.parent())
                }
                if (b.cfg.stickyHeader) {
                    b.reclone()
                }
            },
            containment: this.cfg.resizeMode === "expand" ? "document" : this.jq
        })
    },
    fireColumnResizeEvent: function (b) {
        if (this.hasBehavior("colResize")) {
            var a = {
                source: this.id,
                process: this.id,
                params: [{
                        name: this.id + "_colResize",
                        value: true
                    }, {
                        name: this.id + "_columnId",
                        value: b.attr("id")
                    }, {
                        name: this.id + "_width",
                        value: b.width()
                    }, {
                        name: this.id + "_height",
                        value: b.height()
                    }]
            };
            this.cfg.behaviors.colResize.call(this, a)
        }
    },
    hasColGroup: function () {
        return this.thead.children("tr").length > 1
    },
    addGhostRow: function () {
        var a = this.tbody.find("tr:first").children("td").length
                , c = "";
        for (var b = 0; b < a; b++) {
            c += '<th style="height:0px;border-bottom-width: 0px;border-top-width: 0px;padding-top: 0px;padding-bottom: 0px;outline: 0 none;" class="ui-resizable-column"></th>'
        }
        this.thead.prepend("<tr>" + c + "</tr>");
        if (this.cfg.scrollable) {
            this.theadClone.prepend("<tr>" + c + "</tr>");
            this.footerTable.children("tfoot").prepend("<tr>" + c + "</tr>")
        }
    },
    findGroupResizer: function (b) {
        for (var a = 0; a < this.groupResizers.length; a++) {
            var c = this.groupResizers.eq(a);
            if (c.offset().left === b.helper.data("originalposition").left) {
                return c
            }
        }
        return null
    },
    addResizers: function () {
        var a = this.thead.find("> tr > th.ui-resizable-column");
        a.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        if (this.cfg.resizeMode === "fit") {
            a.filter(":last-child").children("span.ui-column-resizer").hide()
        }
        if (this.hasColumnGroup) {
            this.groupResizers = this.thead.find("> tr:first > th > .ui-column-resizer")
        }
    },
    resize: function (b, l) {
        var d, f, k = null, e = null, g = null, o = (this.cfg.resizeMode === "expand"), p = this.thead.parent();
        if (this.hasColumnGroup) {
            var q = this.findGroupResizer(l);
            if (!q) {
                return
            }
            d = q.parent()
        } else {
            d = l.helper.parent()
        }
        var m = d.children(".ui-column-title");
        if (PrimeFaces.env.isIE()) {
            m.css("display", "none")
        }
        var f = d.nextAll(":visible:first");
        if (this.cfg.liveResize) {
            k = d.outerWidth() - (b.pageX - d.offset().left),
                    e = (d.width() - k),
                    g = (f.width() + k)
        } else {
            k = (l.position.left - l.originalPosition.left),
                    e = (d.width() + k),
                    g = (f.width() - k)
        }
        var a = parseInt(d.css("min-width"));
        a = (a == 0) ? 15 : a;
        if (PrimeFaces.env.isIE()) {
            m.css("display", "")
        }
        if ((e > a && g > a) || (o && e > a)) {
            if (o) {
                p.width(p.width() + k);
                setTimeout(function () {
                    d.width(e)
                }, 1)
            } else {
                d.width(e);
                f.width(g)
            }
            if (this.cfg.scrollable) {
                var j = this.theadClone.parent()
                        , n = d.index();
                if (o) {
                    var i = this;
                    j.width(j.width() + k);
                    this.footerTable.width(this.footerTable.width() + k);
                    setTimeout(function () {
                        if (i.hasColumnGroup) {
                            i.theadClone.find("> tr:first").children("th").eq(n).width(e);
                            i.footerTable.find("> tfoot > tr:first").children("th").eq(n).width(e)
                        } else {
                            i.theadClone.find(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).width(e);
                            i.footerCols.eq(n).width(e)
                        }
                    }, 1)
                } else {
                    if (this.hasColumnGroup) {
                        this.theadClone.find("> tr:first").children("th").eq(n).width(e);
                        this.theadClone.find("> tr:first").children("th").eq(n + 1).width(g);
                        this.footerTable.find("> tfoot > tr:first").children("th").eq(n).width(e);
                        this.footerTable.find("> tfoot > tr:first").children("th").eq(n + 1).width(g)
                    } else {
                        this.theadClone.find(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).width(e);
                        this.theadClone.find(PrimeFaces.escapeClientId(f.attr("id") + "_clone")).width(g);
                        if (this.footerCols.length > 0) {
                            var h = this.footerCols.eq(n)
                                    , c = h.next();
                            h.width(e);
                            c.width(g)
                        }
                    }
                }
            }
        }
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    removeSelection: function (a) {
        this.selection = $.grep(this.selection, function (b) {
            return b != a
        })
    },
    addSelection: function (a) {
        if (!this.isSelected(a)) {
            this.selection.push(a)
        }
    },
    isSelected: function (a) {
        return PrimeFaces.inArray(this.selection, a)
    },
    getRowMeta: function (b) {
        var a = {
            index: b.data("ri"),
            key: b.attr("data-rk")
        };
        return a
    },
    setupDraggableColumns: function () {
        this.orderStateHolder = $(this.jqId + "_columnOrder");
        this.saveColumnOrder();
        this.dragIndicatorTop = $('<span class="ui-icon ui-icon-arrowthick-1-s" style="position:absolute"/></span>').hide().appendTo(this.jq);
        this.dragIndicatorBottom = $('<span class="ui-icon ui-icon-arrowthick-1-n" style="position:absolute"/></span>').hide().appendTo(this.jq);
        var a = this;
        $(this.jqId + " thead th").draggable({
            appendTo: "body",
            opacity: 0.75,
            cursor: "move",
            scope: this.id,
            cancel: ":input,.ui-column-resizer",
            start: function (b, c) {
                c.helper.css("z-index", ++PrimeFaces.zindex)
            },
            drag: function (e, g) {
                var i = g.helper.data("droppable-column");
                if (i) {
                    var d = i.offset()
                            , b = d.top - 10
                            , c = d.top + i.height() + 8
                            , f = null;
                    if (e.originalEvent.pageX >= d.left + (i.width() / 2)) {
                        var h = i.next();
                        if (h.length == 1) {
                            f = h.offset().left - 9
                        } else {
                            f = i.offset().left + i.innerWidth() - 9
                        }
                        g.helper.data("drop-location", 1)
                    } else {
                        f = d.left - 9;
                        g.helper.data("drop-location", -1)
                    }
                    a.dragIndicatorTop.offset({
                        left: f,
                        top: b - 3
                    }).show();
                    a.dragIndicatorBottom.offset({
                        left: f,
                        top: c - 3
                    }).show()
                }
            },
            stop: function (b, c) {
                a.dragIndicatorTop.css({
                    left: 0,
                    top: 0
                }).hide();
                a.dragIndicatorBottom.css({
                    left: 0,
                    top: 0
                }).hide()
            },
            helper: function () {
                var c = $(this)
                        , b = $('<div class="ui-widget ui-state-default" style="padding:4px 10px;text-align:center;"></div>');
                b.width(c.width());
                b.height(c.height());
                b.html(c.html());
                return b.get(0)
            }
        }).droppable({
            hoverClass: "ui-state-highlight",
            tolerance: "pointer",
            scope: this.id,
            over: function (b, c) {
                c.helper.data("droppable-column", $(this))
            },
            drop: function (c, j) {
                var n = j.draggable
                        , f = j.helper.data("drop-location")
                        , g = $(this)
                        , e = null
                        , l = null;
                var k = a.tbody.find("> tr:not(.ui-expanded-row-content) > td:nth-child(" + (n.index() + 1) + ")")
                        , m = a.tbody.find("> tr:not(.ui-expanded-row-content) > td:nth-child(" + (g.index() + 1) + ")");
                if (a.tfoot.length) {
                    var b = a.tfoot.find("> tr > td")
                            , e = b.eq(n.index())
                            , l = b.eq(g.index())
                }
                if (f > 0) {
                    if (a.cfg.resizableColumns) {
                        if (g.next().length) {
                            g.children("span.ui-column-resizer").show();
                            n.children("span.ui-column-resizer").hide()
                        }
                    }
                    n.insertAfter(g);
                    k.each(function (o, p) {
                        $(this).insertAfter(m.eq(o))
                    });
                    if (e && l) {
                        e.insertAfter(l)
                    }
                    if (a.cfg.scrollable) {
                        var h = $(document.getElementById(n.attr("id") + "_clone"))
                                , d = $(document.getElementById(g.attr("id") + "_clone"));
                        h.insertAfter(d)
                    }
                } else {
                    n.insertBefore(g);
                    k.each(function (o, p) {
                        $(this).insertBefore(m.eq(o))
                    });
                    if (e && l) {
                        e.insertBefore(l)
                    }
                    if (a.cfg.scrollable) {
                        var h = $(document.getElementById(n.attr("id") + "_clone"))
                                , d = $(document.getElementById(g.attr("id") + "_clone"));
                        h.insertBefore(d)
                    }
                }
                a.saveColumnOrder();
                if (a.cfg.behaviors) {
                    var i = a.cfg.behaviors.colReorder;
                    if (i) {
                        i.call(a)
                    }
                }
            }
        })
    },
    saveColumnOrder: function () {
        var a = []
                , b = $(this.jqId + " thead:first th");
        b.each(function (c, d) {
            a.push($(d).attr("id"))
        });
        this.orderStateHolder.val(a.join(","))
    },
    makeRowsDraggable: function () {
        var a = this;
        this.tbody.sortable({
            placeholder: "ui-datatable-rowordering ui-state-active",
            cursor: "move",
            handle: "td,span:not(.ui-c)",
            appendTo: document.body,
            start: function (b, c) {
                c.helper.css("z-index", ++PrimeFaces.zindex)
            },
            helper: function (g, h) {
                var d = h.children()
                        , f = $('<div class="ui-datatable ui-widget"><table><tbody></tbody></table></div>')
                        , c = h.clone()
                        , b = c.children();
                for (var e = 0; e < b.length; e++) {
                    b.eq(e).width(d.eq(e).width())
                }
                c.appendTo(f.find("tbody"));
                return f
            },
            update: function (d, e) {
                var c = e.item.data("ri")
                        , f = a.paginator ? a.paginator.getFirst() + e.item.index() : e.item.index();
                a.syncRowParity();
                var b = {
                    source: a.id,
                    process: a.id,
                    params: [{
                            name: a.id + "_rowreorder",
                            value: true
                        }, {
                            name: a.id + "_fromIndex",
                            value: c
                        }, {
                            name: a.id + "_toIndex",
                            value: f
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }]
                };
                if (a.hasBehavior("rowReorder")) {
                    a.cfg.behaviors.rowReorder.call(a, b)
                } else {
                    PrimeFaces.ajax.Request.handle(b)
                }
            },
            change: function (b, c) {
                if (a.cfg.scrollable) {
                    PrimeFaces.scrollInView(a.scrollBody, c.placeholder)
                }
            }
        })
    },
    syncRowParity: function () {
        var b = this.tbody.children("tr.ui-widget-content")
                , d = this.paginator ? this.paginator.getFirst() : 0;
        for (var a = d; a < b.length; a++) {
            var c = b.eq(a);
            c.data("ri", a).removeClass("ui-datatable-even ui-datatable-odd");
            if (a % 2 === 0) {
                c.addClass("ui-datatable-even")
            } else {
                c.addClass("ui-datatable-odd")
            }
        }
    },
    isEmpty: function () {
        return this.tbody.children("tr.ui-datatable-empty-message").length === 1
    },
    getSelectedRowsCount: function () {
        return this.isSelectionEnabled() ? this.selection.length : 0
    },
    updateHeaderCheckbox: function () {
        if (this.isEmpty()) {
            this.uncheckHeaderCheckbox();
            this.disableHeaderCheckbox()
        } else {
            var b, d, c, a;
            if (this.cfg.nativeElements) {
                b = this.tbody.find("> tr > td.ui-selection-column > :checkbox");
                c = b.filter(":enabled");
                a = b.filter(":disabled");
                d = c.filter(":checked")
            } else {
                b = this.tbody.find("> tr > td.ui-selection-column .ui-chkbox-box");
                c = b.filter(":not(.ui-state-disabled)");
                a = b.filter(".ui-state-disabled");
                d = c.prev().children(":checked")
            }
            if (c.length && c.length === d.length) {
                this.checkHeaderCheckbox()
            } else {
                this.uncheckHeaderCheckbox()
            }
            if (b.length === a.length) {
                this.disableHeaderCheckbox()
            } else {
                this.enableHeaderCheckbox()
            }
        }
    },
    checkHeaderCheckbox: function () {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("checked", true)
        } else {
            this.checkAllToggler.addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
            this.checkAllTogglerInput.prop("checked", true).attr("aria-checked", true)
        }
    },
    uncheckHeaderCheckbox: function () {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("checked", false)
        } else {
            this.checkAllToggler.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
            this.checkAllTogglerInput.prop("checked", false).attr("aria-checked", false)
        }
    },
    disableHeaderCheckbox: function () {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("disabled", true)
        } else {
            this.checkAllToggler.addClass("ui-state-disabled")
        }
    },
    enableHeaderCheckbox: function () {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("disabled", false)
        } else {
            this.checkAllToggler.removeClass("ui-state-disabled")
        }
    },
    setupStickyHeader: function () {
        var b = this.thead.parent()
                , f = b.offset()
                , d = $(window)
                , c = this
                , e = "scroll." + this.id
                , a = "resize.sticky-" + this.id;
        this.stickyContainer = $('<div class="ui-datatable ui-datatable-sticky ui-widget"><table></table></div>');
        this.clone = this.thead.clone(false);
        this.stickyContainer.children("table").append(this.thead);
        b.prepend(this.clone);
        this.stickyContainer.css({
            position: "absolute",
            width: b.outerWidth(),
            top: f.top,
            left: f.left,
            "z-index": ++PrimeFaces.zindex
        });
        this.jq.prepend(this.stickyContainer);
        if (this.cfg.resizableColumns) {
            this.relativeHeight = 0
        }
        d.off(e).on(e, function () {
            var h = d.scrollTop()
                    , g = b.offset();
            if (h > g.top) {
                c.stickyContainer.css({
                    position: "fixed",
                    top: "0px"
                }).addClass("ui-shadow ui-sticky");
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = h - g.top
                }
                if (h >= (g.top + c.tbody.height())) {
                    c.stickyContainer.hide()
                } else {
                    c.stickyContainer.show()
                }
            } else {
                c.stickyContainer.css({
                    position: "absolute",
                    top: g.top
                }).removeClass("ui-shadow ui-sticky");
                if (c.stickyContainer.is(":hidden")) {
                    c.stickyContainer.show()
                }
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = 0
                }
            }
        }).off(a).on(a, function () {
            c.stickyContainer.width(b.outerWidth())
        });
        this.clone.find(".ui-column-filter").prop("disabled", true)
    },
    getFocusableTbody: function () {
        return this.tbody
    },
    reclone: function () {
        this.clone.remove();
        this.clone = this.thead.clone(false);
        this.jq.find(".ui-datatable-tablewrapper > table").prepend(this.clone)
    },
    addRow: function () {
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_addrow",
                            value: true
                        }, {
                            name: this.id + "_skipChildren",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                this.tbody.append(f)
                            }
                        });
                        return true
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    clearCacheMap: function () {
        this.cacheMap = {}
    },
    loadDataWithCache: function (e) {
        var a = false;
        if (this.cacheRows != e.rows) {
            this.clearCacheMap();
            this.cacheRows = e.rows;
            a = true
        }
        var d = e.first
                , c = e.rows + d
                , b = this.cfg.paginator.pageCount * e.rows
                , f = (!this.cacheMap[c]) && c < b;
        if (this.cacheMap[d] && !a) {
            this.updateData(this.cacheMap[d]);
            this.paginator.cfg.page = e.page;
            this.paginator.updateUI();
            if (!f) {
                this.updatePageState(e)
            }
        } else {
            this.paginate(e)
        }
        if (f) {
            this.fetchNextPage(e)
        }
    },
    updateReflowDD: function (d, c) {
        if (this.reflowDD && this.cfg.reflow) {
            var a = this.reflowDD.children("option")
                    , b = c > 0 ? 0 : 1;
            a.filter(":selected").prop("selected", false);
            a.filter('[value="' + d.index() + "_" + b + '"]').prop("selected", true)
        }
    },
    groupRows: function () {
        for (var a = 0; a < this.cfg.groupColumnIndexes.length; a++) {
            this.groupRow(this.cfg.groupColumnIndexes[a])
        }
    },
    groupRow: function (f) {
        var j = this.tbody.children("tr");
        var g = null
                , b = null
                , c = null;
        for (var d = 0; d < j.length; d++) {
            var h = j.eq(d);
            var a = h.children("td").eq(f);
            var e = a.text();
            if (b != e) {
                g = d;
                b = e;
                c = 1
            } else {
                a.remove();
                c++
            }
            if (g != null && c > 1) {
                j.eq(g).children("td").eq(f).attr("rowspan", c)
            }
        }
    },
    bindToggleRowGroupEvents: function () {
        var b = this.tbody.children("tr.ui-rowgroup-header")
                , a = b.find("> td:first > a.ui-rowgroup-toggler");
        a.off("click.dataTable-rowgrouptoggler").on("click.dataTable-rowgrouptoggler", function (g) {
            var d = $(this)
                    , c = d.children(".ui-rowgroup-toggler-icon")
                    , f = d.closest("tr.ui-rowgroup-header");
            if (c.hasClass("ui-icon-circle-triangle-s")) {
                d.attr("aria-expanded", false);
                c.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s");
                f.nextUntil("tr.ui-rowgroup-header").hide()
            } else {
                d.attr("aria-expanded", true);
                c.addClass("ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-e");
                f.nextUntil("tr.ui-rowgroup-header").show()
            }
            g.preventDefault()
        })
    }
});
PrimeFaces.widget.FrozenDataTable = PrimeFaces.widget.DataTable.extend({
    setupScrolling: function () {
        this.scrollLayout = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right");
        this.frozenLayout = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left");
        this.scrollContainer = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right > .ui-datatable-scrollable-container");
        this.frozenContainer = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left > .ui-datatable-frozen-container");
        this.scrollHeader = this.scrollContainer.children(".ui-datatable-scrollable-header");
        this.scrollHeaderBox = this.scrollHeader.children("div.ui-datatable-scrollable-header-box");
        this.scrollBody = this.scrollContainer.children(".ui-datatable-scrollable-body");
        this.scrollFooter = this.scrollContainer.children(".ui-datatable-scrollable-footer");
        this.scrollFooterBox = this.scrollFooter.children("div.ui-datatable-scrollable-footer-box");
        this.scrollStateHolder = $(this.jqId + "_scrollState");
        this.scrollHeaderTable = this.scrollHeaderBox.children("table");
        this.scrollBodyTable = this.cfg.virtualScroll ? this.scrollBody.children("div").children("table") : this.scrollBody.children("table");
        this.scrollThead = this.thead.eq(1);
        this.scrollTbody = this.tbody.eq(1);
        this.scrollFooterTable = this.scrollFooterBox.children("table");
        this.scrollFooterCols = this.scrollFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.frozenHeader = this.frozenContainer.children(".ui-datatable-scrollable-header");
        this.frozenBody = this.frozenContainer.children(".ui-datatable-scrollable-body");
        this.frozenBodyTable = this.cfg.virtualScroll ? this.frozenBody.children("div").children("table") : this.frozenBody.children("table");
        this.frozenThead = this.thead.eq(0);
        this.frozenTbody = this.tbody.eq(0);
        this.frozenFooter = this.frozenContainer.children(".ui-datatable-scrollable-footer");
        this.frozenFooterTable = this.frozenFooter.find("> .ui-datatable-scrollable-footer-box > table");
        this.frozenFooterCols = this.frozenFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.percentageScrollHeight = this.cfg.scrollHeight && (this.cfg.scrollHeight.indexOf("%") !== -1);
        this.percentageScrollWidth = this.cfg.scrollWidth && (this.cfg.scrollWidth.indexOf("%") !== -1);
        this.frozenThead.find("> tr > th").addClass("ui-frozen-column");
        var c = this
                , b = this.getScrollbarWidth() + "px";
        if (this.cfg.scrollHeight) {
            if (this.percentageScrollHeight) {
                this.adjustScrollHeight()
            }
            if (this.hasVerticalOverflow()) {
                this.scrollHeaderBox.css("margin-right", b);
                this.scrollFooterBox.css("margin-right", b)
            }
        }
        if (this.cfg.selectionMode) {
            this.scrollTbody.removeAttr("tabindex")
        }
        this.fixColumnWidths();
        if (this.cfg.scrollWidth) {
            if (this.percentageScrollWidth) {
                this.adjustScrollWidth()
            } else {
                this.setScrollWidth(parseInt(this.cfg.scrollWidth))
            }
            if (this.hasVerticalOverflow()) {
                if (PrimeFaces.env.browser.webkit === true) {
                    this.frozenBody.append('<div style="height:' + b + ';border:1px solid transparent"></div>')
                } else {
                    if (PrimeFaces.isIE(8)) {
                        this.frozenBody.append('<div style="height:' + b + '"></div>')
                    } else {
                        this.frozenBodyTable.css("margin-bottom", b)
                    }
                }
            }
        }
        this.cloneHead();
        this.restoreScrollState();
        if (this.cfg.liveScroll) {
            this.scrollOffset = 0;
            this.cfg.liveScrollBuffer = (100 - this.cfg.liveScrollBuffer) / 100;
            this.shouldLiveScroll = true;
            this.loadingLiveScroll = false;
            this.allLoadedLiveScroll = c.cfg.scrollStep >= c.cfg.scrollLimit
        }
        if (this.cfg.virtualScroll) {
            var d = this.scrollTbody.children("tr.ui-widget-content");
            if (d) {
                this.rowHeight = d.outerHeight();
                this.scrollBody.children("div").css("height", parseFloat((this.cfg.scrollLimit * this.rowHeight) + "px"));
                this.frozenBody.children("div").css("height", parseFloat((this.cfg.scrollLimit * this.rowHeight) + "px"))
            }
        }
        this.scrollBody.scroll(function () {
            var i = c.scrollBody.scrollLeft()
                    , h = c.scrollBody.scrollTop();
            c.scrollHeaderBox.css("margin-left", -i);
            c.scrollFooterBox.css("margin-left", -i);
            c.frozenBody.scrollTop(h);
            if (c.cfg.virtualScroll) {
                var f = this;
                clearTimeout(c.scrollTimeout);
                c.scrollTimeout = setTimeout(function () {
                    var l = c.scrollBody.outerHeight()
                            , k = c.scrollBodyTable.outerHeight()
                            , n = c.rowHeight * c.cfg.scrollStep
                            , j = parseFloat((c.cfg.scrollLimit * c.rowHeight) + "px")
                            , m = (j / n) || 1;
                    if (f.scrollTop + l > parseFloat(c.scrollBodyTable.css("top")) + k || f.scrollTop < parseFloat(c.scrollBodyTable.css("top"))) {
                        var o = Math.floor((f.scrollTop * m) / (f.scrollHeight)) + 1;
                        c.loadRowsWithVirtualScroll(o);
                        c.scrollBodyTable.css("top", ((o - 1) * n) + "px");
                        c.frozenBodyTable.css("top", ((o - 1) * n) + "px")
                    }
                }, 200)
            } else {
                if (c.shouldLiveScroll) {
                    var h = Math.ceil(this.scrollTop)
                            , g = this.scrollHeight
                            , e = this.clientHeight;
                    if ((h >= ((g * c.cfg.liveScrollBuffer) - (e))) && c.shouldLoadLiveScroll()) {
                        c.loadLiveRows()
                    }
                }
            }
            c.saveScrollState()
        });
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function () {
            if (c.jq.is(":visible")) {
                if (c.percentageScrollHeight) {
                    c.adjustScrollHeight()
                }
                if (c.percentageScrollWidth) {
                    c.adjustScrollWidth()
                }
            }
        })
    },
    cloneHead: function () {
        this.frozenTheadClone = this.frozenThead.clone();
        this.frozenTheadClone.find("th").each(function () {
            var a = $(this);
            a.attr("id", a.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.frozenTheadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.frozenBodyTable);
        this.scrollTheadClone = this.scrollThead.clone();
        this.scrollTheadClone.find("th").each(function () {
            var a = $(this);
            a.attr("id", a.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.scrollTheadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.scrollBodyTable)
    },
    hasVerticalOverflow: function () {
        return this.scrollBodyTable.outerHeight() > this.scrollBody.outerHeight()
    },
    adjustScrollHeight: function () {
        var d = this.jq.parent().innerHeight() * (parseInt(this.cfg.scrollHeight) / 100)
                , f = this.jq.children(".ui-datatable-header").outerHeight(true)
                , b = this.jq.children(".ui-datatable-footer").outerHeight(true)
                , c = (this.scrollHeader.innerHeight() + this.scrollFooter.innerHeight())
                , e = this.paginator ? this.paginator.getContainerHeight(true) : 0
                , a = (d - (c + e + f + b));
        if (this.cfg.virtualScroll) {
            this.scrollBody.css("max-height", a);
            this.frozenBody.css("max-height", a)
        } else {
            this.scrollBody.height(a);
            this.frozenBody.height(a)
        }
    },
    adjustScrollWidth: function () {
        var a = parseInt((this.scrollLayout.innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
        this.setScrollWidth(a)
    },
    setScrollWidth: function (b) {
        var c = this
                , a = b + this.frozenLayout.width();
        this.jq.children(".ui-widget-header").each(function () {
            c.setOuterWidth($(this), a)
        });
        this.scrollHeader.width(b);
        this.scrollBody.css("margin-right", 0).width(b);
        this.scrollFooter.width(b)
    },
    fixColumnWidths: function () {
        if (!this.columnWidthsFixed) {
            if (PrimeFaces.isIE(7)) {
                this.bodyTable.css("width", "auto")
            }
            if (this.cfg.scrollable) {
                this._fixColumnWidths(this.scrollHeader, this.scrollFooterCols, this.scrollColgroup);
                this._fixColumnWidths(this.frozenHeader, this.frozenFooterCols, this.frozenColgroup)
            } else {
                this.jq.find("> .ui-datatable-tablewrapper > table > thead > tr > th").each(function () {
                    var a = $(this);
                    a.width(a.width())
                })
            }
            this.columnWidthsFixed = true
        }
    },
    _fixColumnWidths: function (b, a) {
        b.find("> .ui-datatable-scrollable-header-box > table > thead > tr > th").each(function () {
            var f = $(this)
                    , c = f.index()
                    , d = f.width();
            f.width(d);
            if (a.length > 0) {
                var e = a.eq(c);
                e.width(d)
            }
        })
    },
    updateData: function (c, e) {
        var k = $("<table><tbody>" + c + "</tbody></table>")
                , m = k.find("> tbody > tr")
                , g = (e === undefined) ? true : e;
        if (g) {
            this.frozenTbody.children().remove();
            this.scrollTbody.children().remove()
        }
        var b = this.frozenTbody.children("tr:first")
                , h = b.length ? b.children("td").length : this.cfg.frozenColumns;
        for (var d = 0; d < m.length; d++) {
            var l = m.eq(d)
                    , a = l.children("td")
                    , j = this.copyRow(l)
                    , f = this.copyRow(l);
            j.append(a.slice(0, h));
            f.append(a.slice(h));
            this.frozenTbody.append(j);
            this.scrollTbody.append(f)
        }
        this.postUpdateData()
    },
    copyRow: function (a) {
        return $("<tr></tr>").data("ri", a.data("ri")).attr("data-rk", a.data("rk")).addClass(a.attr("class")).attr("role", "row")
    },
    getThead: function () {
        return $(this.jqId + "_frozenThead," + this.jqId + "_scrollableThead")
    },
    getTbody: function () {
        return $(this.jqId + "_frozenTbody," + this.jqId + "_scrollableTbody")
    },
    getTfoot: function () {
        return $(this.jqId + "_frozenTfoot," + this.jqId + "_scrollableTfoot")
    },
    bindRowHover: function (a) {
        var b = this;
        this.tbody.off("mouseover.datatable mouseout.datatable", a).on("mouseover.datatable", a, null, function () {
            var c = $(this)
                    , d = b.getTwinRow(c);
            if (!c.hasClass("ui-state-highlight")) {
                c.addClass("ui-state-hover");
                d.addClass("ui-state-hover")
            }
        }).on("mouseout.datatable", a, null, function () {
            var c = $(this)
                    , d = b.getTwinRow(c);
            if (!c.hasClass("ui-state-highlight")) {
                c.removeClass("ui-state-hover");
                d.removeClass("ui-state-hover")
            }
        })
    },
    getTwinRow: function (b) {
        var a = (this.tbody.index(b.parent()) === 0) ? this.tbody.eq(1) : this.tbody.eq(0);
        return a.children().eq(b.index())
    },
    highlightRow: function (a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    unhighlightRow: function (a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    displayExpandedRow: function (b, a) {
        var d = this.getTwinRow(b);
        b.after(a);
        var c = b.next();
        c.show();
        d.after('<tr class="ui-expanded-row-content ui-widget-content"><td></td></tr>');
        d.next().children("td").attr("colspan", d.children("td").length).height(c.children("td").height())
    },
    collapseRow: function (a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    getExpandedRows: function () {
        return this.frozenTbody.children(".ui-expanded-row")
    },
    showRowEditors: function (a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    updateRow: function (g, e) {
        var d = $("<table><tbody>" + e + "</tbody></table>")
                , b = d.find("> tbody > tr")
                , c = b.children("td")
                , a = this.copyRow(b)
                , f = this.copyRow(b)
                , h = this.getTwinRow(g);
        a.append(c.slice(0, this.cfg.frozenColumns));
        f.append(c.slice(this.cfg.frozenColumns));
        g.replaceWith(a);
        h.replaceWith(f)
    },
    invalidateRow: function (a) {
        this.frozenTbody.children("tr").eq(a).addClass("ui-widget-content ui-row-editing ui-state-error");
        this.scrollTbody.children("tr").eq(a).addClass("ui-widget-content ui-row-editing ui-state-error")
    },
    getRowEditors: function (a) {
        return a.find("div.ui-cell-editor").add(this.getTwinRow(a).find("div.ui-cell-editor"))
    },
    findGroupResizer: function (a) {
        var b = this._findGroupResizer(a, this.frozenGroupResizers);
        if (b) {
            return b
        } else {
            return this._findGroupResizer(a, this.scrollGroupResizers)
        }
    },
    _findGroupResizer: function (c, a) {
        for (var b = 0; b < a.length; b++) {
            var d = a.eq(b);
            if (d.offset().left === c.helper.data("originalposition").left) {
                return d
            }
        }
        return null
    },
    addResizers: function () {
        var b = this.frozenThead.find("> tr > th.ui-resizable-column")
                , a = this.scrollThead.find("> tr > th.ui-resizable-column");
        b.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        a.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        if (this.cfg.resizeMode === "fit") {
            b.filter(":last-child").addClass("ui-frozen-column-last");
            a.filter(":last-child").children("span.ui-column-resizer").hide()
        }
        if (this.hasColumnGroup) {
            this.frozenGroupResizers = this.frozenThead.find("> tr:first > th > .ui-column-resizer");
            this.scrollGroupResizers = this.scrollThead.find("> tr:first > th > .ui-column-resizer")
        }
    },
    resize: function (q, n) {
        var s = null
                , i = null
                , j = null
                , o = null
                , c = (this.cfg.resizeMode === "expand");
        if (this.hasColumnGroup) {
            var p = this.findGroupResizer(n);
            if (!p) {
                return
            }
            s = p.parent()
        } else {
            s = n.helper.parent()
        }
        var g = s.next();
        var m = s.index()
                , b = s.hasClass("ui-frozen-column-last");
        if (this.cfg.liveResize) {
            i = s.outerWidth() - (q.pageX - s.offset().left),
                    j = (s.width() - i),
                    o = (g.width() + i)
        } else {
            i = (n.position.left - n.originalPosition.left),
                    j = (s.width() + i),
                    o = (g.width() - i)
        }
        var l = parseInt(s.css("min-width"));
        l = (l == 0) ? 15 : l;
        var e = (c && j > l) || (b ? (j > l) : (j > l && o > l));
        if (e) {
            var h = s.hasClass("ui-frozen-column")
                    , k = h ? this.frozenTheadClone : this.scrollTheadClone
                    , a = h ? this.frozenThead.parent() : this.scrollThead.parent()
                    , d = k.parent()
                    , v = h ? this.frozenFooterCols : this.scrollFooterCols
                    , u = h ? this.frozenFooterTable : this.scrollFooterTable
                    , f = this;
            if (c) {
                if (b) {
                    this.frozenLayout.width(this.frozenLayout.width() + i)
                }
                a.width(a.width() + i);
                d.width(d.width() + i);
                u.width(u.width() + i);
                setTimeout(function () {
                    s.width(j);
                    if (f.hasColumnGroup) {
                        k.find("> tr:first").children("th").eq(m).width(j);
                        u.find("> tfoot > tr:first").children("th").eq(m).width(j)
                    } else {
                        k.find(PrimeFaces.escapeClientId(s.attr("id") + "_clone")).width(j);
                        v.eq(m).width(j)
                    }
                }, 1)
            } else {
                if (b) {
                    this.frozenLayout.width(this.frozenLayout.width() + i)
                }
                s.width(j);
                g.width(o);
                if (this.hasColumnGroup) {
                    k.find("> tr:first").children("th").eq(m).width(j);
                    k.find("> tr:first").children("th").eq(m + 1).width(o);
                    u.find("> tfoot > tr:first").children("th").eq(m).width(j);
                    u.find("> tfoot > tr:first").children("th").eq(m + 1).width(o)
                } else {
                    k.find(PrimeFaces.escapeClientId(s.attr("id") + "_clone")).width(j);
                    k.find(PrimeFaces.escapeClientId(g.attr("id") + "_clone")).width(o);
                    if (v.length > 0) {
                        var t = v.eq(m)
                                , r = t.next();
                        t.width(j);
                        r.width(o)
                    }
                }
            }
        }
    },
    hasColGroup: function () {
        return this.frozenThead.children("tr").length > 1 || this.scrollThead.children("tr").length > 1
    },
    addGhostRow: function () {
        this._addGhostRow(this.frozenTbody, this.frozenThead, this.frozenTheadClone, this.frozenFooter.find("table"), "ui-frozen-column");
        this._addGhostRow(this.scrollTbody, this.scrollThead, this.scrollTheadClone, this.scrollFooterTable)
    },
    _addGhostRow: function (g, e, f, h, c) {
        var b = g.find("tr:first").children("td")
                , a = b.length
                , j = ""
                , k = c ? "ui-resizable-column " + c : "ui-resizable-column";
        for (var d = 0; d < a; d++) {
            j += '<th style="height:0px;border-bottom-width: 0px;border-top-width: 0px;padding-top: 0px;padding-bottom: 0px;outline: 0 none;width:' + b.eq(d).width() + 'px" class="' + k + '"></th>'
        }
        e.prepend("<tr>" + j + "</tr>");
        if (this.cfg.scrollable) {
            f.prepend("<tr>" + j + "</tr>");
            h.children("tfoot").prepend("<tr>" + j + "</tr>")
        }
    },
    getFocusableTbody: function () {
        return this.tbody.eq(0)
    },
    highlightFocusedRow: function () {
        this._super();
        this.getTwinRow(this.focusedRow).addClass("ui-state-hover")
    },
    unhighlightFocusedRow: function () {
        this._super();
        this.getTwinRow(this.focusedRow).removeClass("ui-state-hover")
    },
    assignFocusedRow: function (a) {
        this._super(a);
        if (!a.parent().attr("tabindex")) {
            this.frozenTbody.trigger("focus")
        }
    }
});
PrimeFaces.widget.Dialog = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.content = this.jq.children(".ui-dialog-content");
        this.titlebar = this.jq.children(".ui-dialog-titlebar");
        this.footer = this.jq.find(".ui-dialog-footer");
        this.icons = this.titlebar.children(".ui-dialog-titlebar-icon");
        this.closeIcon = this.titlebar.children(".ui-dialog-titlebar-close");
        this.minimizeIcon = this.titlebar.children(".ui-dialog-titlebar-minimize");
        this.maximizeIcon = this.titlebar.children(".ui-dialog-titlebar-maximize");
        this.blockEvents = "focus." + this.id + " mousedown." + this.id + " mouseup." + this.id;
        this.resizeNS = "resize." + this.id;
        this.cfg.absolutePositioned = this.jq.hasClass("ui-dialog-absolute");
        this.cfg.width = this.cfg.width || "auto";
        this.cfg.height = this.cfg.height || "auto";
        this.cfg.draggable = this.cfg.draggable === false ? false : true;
        this.cfg.resizable = this.cfg.resizable === false ? false : true;
        this.cfg.minWidth = this.cfg.minWidth || 150;
        this.cfg.minHeight = this.cfg.minHeight || this.titlebar.outerHeight();
        this.cfg.position = this.cfg.position || "center";
        this.parent = this.jq.parent();
        this.initSize();
        this.bindEvents();
        if (this.cfg.draggable) {
            this.setupDraggable()
        }
        if (this.cfg.resizable) {
            this.setupResizable()
        }
        if (this.cfg.appendTo) {
            this.parent = this.jq.parent();
            this.targetParent = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo);
            if (!this.parent.is(this.targetParent)) {
                this.jq.appendTo(this.targetParent)
            }
        }
        if ($(document.body).children(".ui-dialog-docking-zone").length === 0) {
            $(document.body).append('<div class="ui-dialog-docking-zone"></div>')
        }
        var b = $(this.jqId + "_modal");
        if (b.length > 0) {
            b.remove()
        }
        this.applyARIA();
        if (this.cfg.visible) {
            this.show()
        }
    },
    refresh: function (a) {
        this.positionInitialized = false;
        this.loaded = false;
        $(document).off("keydown.dialog_" + a.id);
        if (a.appendTo) {
            var b = $("[id=" + a.id.replace(/:/g, "\\:") + "]");
            if (b.length > 1) {
                PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(a.appendTo).children(this.jqId).remove()
            }
        }
        this.init(a)
    },
    initSize: function () {
        this.jq.css({
            width: this.cfg.width,
            height: "auto"
        });
        this.content.height(this.cfg.height);
        if (this.cfg.fitViewport) {
            this.fitViewport()
        }
        if (this.cfg.width === "auto" && PrimeFaces.isIE(7)) {
            this.jq.width(this.content.outerWidth())
        }
    },
    fitViewport: function () {
        var b = $(window).height()
                , a = this.content.innerHeight() - this.content.height();
        if (this.jq.innerHeight() > b) {
            this.content.height(b - this.titlebar.innerHeight() - a)
        }
    },
    enableModality: function () {
        var b = this
                , a = $(document);
        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay ui-dialog-mask"></div>').children(this.jqId + "_modal").css("z-index", this.jq.css("z-index") - 1);
        a.on("keydown." + this.id, function (e) {
            var f = $(e.target);
            if (e.which === $.ui.keyCode.TAB) {
                var d = b.jq.find(":tabbable").add(b.footer.find(":tabbable"));
                if (d.length) {
                    var g = d.filter(":first")
                            , c = d.filter(":last")
                            , h = null;
                    if (g.is(":radio")) {
                        h = d.filter('[name="' + g.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            g = h
                        }
                    }
                    if (c.is(":radio")) {
                        h = d.filter('[name="' + c.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            c = h
                        }
                    }
                    if (f.is(document.body)) {
                        g.focus(1);
                        e.preventDefault()
                    } else {
                        if (e.target === c[0] && !e.shiftKey) {
                            g.focus(1);
                            e.preventDefault()
                        } else {
                            if (e.target === g[0] && e.shiftKey) {
                                c.focus(1);
                                e.preventDefault()
                            }
                        }
                    }
                }
            } else {
                if (!f.is(document.body) && (f.zIndex() < b.jq.zIndex())) {
                    e.preventDefault()
                }
            }
        }).on(this.blockEvents, function (c) {
            if ($(c.target).zIndex() < b.jq.zIndex()) {
                c.preventDefault()
            }
        })
    },
    disableModality: function () {
        $(document.body).children(this.jqId + "_modal").remove();
        $(document).off(this.blockEvents).off("keydown." + this.id)
    },
    show: function () {
        if (this.isVisible()) {
            return
        }
        if (!this.loaded && this.cfg.dynamic) {
            this.loadContents()
        } else {
            if (!this.positionInitialized) {
                this.initPosition()
            }
            this._show()
        }
    },
    _show: function () {
        this.moveToTop();
        if (this.cfg.absolutePositioned) {
            var a = $(window).scrollTop();
            this.jq.css("top", parseFloat(this.jq.css("top")) + (a - this.lastScrollTop) + "px");
            this.lastScrollTop = a
        }
        if (this.cfg.showEffect) {
            var b = this;
            this.jq.show(this.cfg.showEffect, null, "normal", function () {
                b.postShow()
            })
        } else {
            this.jq.show();
            this.postShow()
        }
        if (this.cfg.modal) {
            this.enableModality()
        }
    },
    postShow: function () {
        this.fireBehaviorEvent("open");
        PrimeFaces.invokeDeferredRenders(this.id);
        if (this.cfg.onShow) {
            this.cfg.onShow.call(this)
        }
        this.jq.attr({
            "aria-hidden": false,
            "aria-live": "polite"
        });
        this.applyFocus();
        if (this.cfg.responsive) {
            this.bindResizeListener()
        }
    },
    hide: function () {
        if (!this.isVisible()) {
            return
        }
        if (this.cfg.hideEffect) {
            var a = this;
            this.jq.hide(this.cfg.hideEffect, null, "normal", function () {
                if (a.cfg.modal) {
                    a.disableModality()
                }
                a.onHide()
            })
        } else {
            this.jq.hide();
            if (this.cfg.modal) {
                this.disableModality()
            }
            this.onHide()
        }
    },
    applyFocus: function () {
        if (this.cfg.focus) {
            PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.focus).focus()
        } else {
            this.jq.find(":not(:submit):not(:button):not(:radio):not(:checkbox):input:visible:enabled:first").focus()
        }
    },
    bindEvents: function () {
        var a = this;
        this.jq.mousedown(function (b) {
            if (!$(b.target).data("primefaces-overlay-target")) {
                a.moveToTop()
            }
        });
        this.icons.on("mouseover", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseout", function () {
            $(this).removeClass("ui-state-hover")
        }).on("focus", function () {
            $(this).addClass("ui-state-focus")
        }).on("blur", function () {
            $(this).removeClass("ui-state-focus")
        });
        this.closeIcon.on("click", function (b) {
            a.hide();
            b.preventDefault()
        });
        this.maximizeIcon.click(function (b) {
            a.toggleMaximize();
            b.preventDefault()
        });
        this.minimizeIcon.click(function (b) {
            a.toggleMinimize();
            b.preventDefault()
        });
        if (this.cfg.closeOnEscape) {
            $(document).on("keydown.dialog_" + this.id, function (d) {
                var c = $.ui.keyCode
                        , b = parseInt(a.jq.css("z-index")) === PrimeFaces.zindex;
                if (d.which === c.ESCAPE && a.isVisible() && b) {
                    a.hide()
                }
            })
        }
    },
    setupDraggable: function () {
        var a = this;
        this.jq.draggable({
            cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
            handle: ".ui-dialog-titlebar",
            containment: a.cfg.absolutePositioned ? "document" : "window",
            stop: function (d, e) {
                if (a.hasBehavior("move")) {
                    var b = a.cfg.behaviors.move;
                    var c = {
                        params: [{
                                name: a.id + "_top",
                                value: e.offset.top
                            }, {
                                name: a.id + "_left",
                                value: e.offset.left
                            }]
                    };
                    b.call(a, c)
                }
            }
        })
    },
    setupResizable: function () {
        var a = this;
        this.jq.resizable({
            handles: "n,s,e,w,ne,nw,se,sw",
            minWidth: this.cfg.minWidth,
            minHeight: this.cfg.minHeight,
            alsoResize: this.content,
            containment: "document",
            start: function (b, c) {
                a.jq.data("offset", a.jq.offset());
                if (a.cfg.hasIframe) {
                    a.iframeFix = $('<div style="position:absolute;background-color:transparent;width:100%;height:100%;top:0;left:0;"></div>').appendTo(a.content)
                }
            },
            stop: function (b, c) {
                var d = a.jq.data("offset");
                a.jq.css("position", "fixed");
                a.jq.offset(d);
                if (a.cfg.hasIframe) {
                    a.iframeFix.remove()
                }
            }
        });
        this.resizers = this.jq.children(".ui-resizable-handle")
    },
    initPosition: function () {
        var c = this;
        this.jq.css({
            left: 0,
            top: 0
        });
        if (/(center|left|top|right|bottom)/.test(this.cfg.position)) {
            this.cfg.position = this.cfg.position.replace(",", " ");
            this.jq.position({
                my: "center",
                at: this.cfg.position,
                collision: "fit",
                of: window,
                using: function (h) {
                    var e = h.left < 0 ? 0 : h.left
                            , f = h.top < 0 ? 0 : h.top
                            , g = $(window).scrollTop();
                    if (c.cfg.absolutePositioned) {
                        f += g;
                        c.lastScrollTop = g
                    }
                    $(this).css({
                        left: e,
                        top: f
                    })
                }
            })
        } else {
            var b = this.cfg.position.split(",")
                    , a = $.trim(b[0])
                    , d = $.trim(b[1]);
            this.jq.offset({
                left: a,
                top: d
            })
        }
        this.positionInitialized = true
    },
    onHide: function (a, b) {
        this.fireBehaviorEvent("close");
        this.jq.attr({
            "aria-hidden": true,
            "aria-live": "off"
        });
        if (this.cfg.onHide) {
            this.cfg.onHide.call(this, a, b)
        }
        if (this.cfg.responsive) {
            this.unbindResizeListener()
        }
    },
    moveToTop: function () {
        this.jq.css("z-index", ++PrimeFaces.zindex)
    },
    toggleMaximize: function () {
        if (this.minimized) {
            this.toggleMinimize()
        }
        if (this.maximized) {
            this.jq.removeClass("ui-dialog-maximized");
            this.restoreState();
            this.maximizeIcon.children(".ui-icon").removeClass("ui-icon-newwin").addClass("ui-icon-extlink");
            this.maximized = false;
            this.fireBehaviorEvent("restoreMaximize")
        } else {
            this.saveState();
            var b = $(window);
            this.jq.addClass("ui-dialog-maximized").css({
                width: b.width() - 6,
                height: b.height()
            }).offset({
                top: b.scrollTop(),
                left: b.scrollLeft()
            });
            var a = this.content.innerHeight() - this.content.height();
            this.content.css({
                width: "auto",
                height: this.jq.height() - this.titlebar.outerHeight() - a
            });
            this.maximizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-extlink").addClass("ui-icon-newwin");
            this.maximized = true;
            this.fireBehaviorEvent("maximize")
        }
    },
    toggleMinimize: function () {
        var a = true
                , c = $(document.body).children(".ui-dialog-docking-zone");
        if (this.maximized) {
            this.toggleMaximize();
            a = false
        }
        var b = this;
        if (this.minimized) {
            this.jq.appendTo(this.parent).removeClass("ui-dialog-minimized").css({
                position: "fixed",
                "float": "none"
            });
            this.restoreState();
            this.content.show();
            this.minimizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-minus");
            this.minimized = false;
            if (this.cfg.resizable) {
                this.resizers.show()
            }
            this.fireBehaviorEvent("restoreMinimize")
        } else {
            this.saveState();
            if (a) {
                this.jq.effect("transfer", {
                    to: c,
                    className: "ui-dialog-minimizing"
                }, 500, function () {
                    b.dock(c);
                    b.jq.addClass("ui-dialog-minimized")
                })
            } else {
                this.dock(c)
            }
        }
    },
    dock: function (a) {
        a.css("z-index", this.jq.css("z-index"));
        this.jq.appendTo(a).css("position", "static");
        this.jq.css({
            height: "auto",
            width: "auto",
            "float": "left"
        });
        this.content.hide();
        this.minimizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-minus").addClass("ui-icon-plus");
        this.minimized = true;
        if (this.cfg.resizable) {
            this.resizers.hide()
        }
        this.fireBehaviorEvent("minimize")
    },
    saveState: function () {
        this.state = {
            width: this.jq.width(),
            height: this.jq.height(),
            contentWidth: this.content.width(),
            contentHeight: this.content.height()
        };
        var a = $(window);
        this.state.offset = this.jq.offset();
        this.state.windowScrollLeft = a.scrollLeft();
        this.state.windowScrollTop = a.scrollTop()
    },
    restoreState: function () {
        this.jq.width(this.state.width).height(this.state.height);
        this.content.width(this.state.contentWidth).height(this.state.contentHeight);
        var a = $(window);
        this.jq.offset({
            top: this.state.offset.top + (a.scrollTop() - this.state.windowScrollTop),
            left: this.state.offset.left + (a.scrollLeft() - this.state.windowScrollLeft)
        })
    },
    loadContents: function () {
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_contentLoad",
                            value: true
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                this.content.html(f)
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        b.loaded = true;
                        b.show()
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    applyARIA: function () {
        this.jq.attr({
            role: "dialog",
            "aria-labelledby": this.id + "_title",
            "aria-hidden": !this.cfg.visible
        });
        this.titlebar.children("a.ui-dialog-titlebar-icon").attr("role", "button")
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    },
    isVisible: function () {
        return this.jq.is(":visible")
    },
    bindResizeListener: function () {
        var a = this;
        $(window).on(this.resizeNS, function () {
            a.initPosition()
        })
    },
    unbindResizeListener: function () {
        $(window).off(this.resizeNS)
    },
    fireBehaviorEvent: function (b) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors[b];
            if (a) {
                a.call(this)
            }
        }
    }
});
PrimeFaces.widget.ConfirmDialog = PrimeFaces.widget.Dialog.extend({
    init: function (a) {
        a.draggable = false;
        a.resizable = false;
        a.modal = true;
        if (!a.appendTo && a.global) {
            a.appendTo = "@(body)"
        }
        this._super(a);
        this.title = this.titlebar.children(".ui-dialog-title");
        this.message = this.content.children(".ui-confirm-dialog-message");
        this.icon = this.content.children(".ui-confirm-dialog-severity");
        if (this.cfg.global) {
            PrimeFaces.confirmDialog = this;
            this.jq.find(".ui-confirmdialog-yes").on("click.ui-confirmdialog", function (c) {
                if (PrimeFaces.confirmSource) {
                    var b = new Function("event", PrimeFaces.confirmSource.data("pfconfirmcommand"));
                    b.call(PrimeFaces.confirmSource.get(0), c);
                    PrimeFaces.confirmDialog.hide();
                    PrimeFaces.confirmSource = null
                }
                c.preventDefault()
            });
            this.jq.find(".ui-confirmdialog-no").on("click.ui-confirmdialog", function (b) {
                PrimeFaces.confirmDialog.hide();
                PrimeFaces.confirmSource = null;
                b.preventDefault()
            })
        }
    },
    applyFocus: function () {
        this.jq.find(":button,:submit").filter(":visible:enabled").eq(0).focus()
    },
    showMessage: function (b) {
        var a = (b.icon === "null") ? "ui-icon-alert" : b.icon;
        this.icon.removeClass().addClass("ui-icon ui-confirm-dialog-severity " + a);
        if (b.header) {
            this.title.text(b.header)
        }
        if (b.message) {
            this.message.text(b.message)
        }
        this.show()
    }
});
PrimeFaces.widget.DynamicDialog = PrimeFaces.widget.Dialog.extend({
    show: function () {
        if (this.jq.hasClass("ui-overlay-visible")) {
            return
        }
        if (!this.positionInitialized) {
            this.initPosition()
        }
        this._show()
    },
    _show: function () {
        this.jq.removeClass("ui-overlay-hidden").addClass("ui-overlay-visible").css({
            display: "none",
            visibility: "visible"
        });
        this.moveToTop();
        this.jq.show();
        this.postShow();
        if (this.cfg.modal) {
            this.enableModality()
        }
    }
});
PrimeFaces.widget.Draggable = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));
        if (this.cfg.appendTo) {
            this.cfg.appendTo = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo)
        }
        this.jq.draggable(this.cfg);
        this.removeScriptElement(this.id)
    }
});
PrimeFaces.widget.Droppable = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));
        this.bindDropListener();
        this.jq.droppable(this.cfg);
        this.removeScriptElement(this.id)
    },
    bindDropListener: function () {
        var a = this;
        this.cfg.drop = function (c, d) {
            if (a.cfg.onDrop) {
                a.cfg.onDrop.call(a, c, d)
            }
            if (a.cfg.behaviors) {
                var e = a.cfg.behaviors.drop;
                if (e) {
                    var b = {
                        params: [{
                                name: a.id + "_dragId",
                                value: d.draggable.attr("id")
                            }, {
                                name: a.id + "_dropId",
                                value: a.cfg.target
                            }]
                    };
                    e.call(a, b)
                }
            }
        }
    }
});
PrimeFaces.widget.Effect = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this.cfg = b;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.source = $(PrimeFaces.escapeClientId(this.cfg.source));
        var a = this;
        this.runner = function () {
            if (a.timeoutId) {
                clearTimeout(a.timeoutId)
            }
            a.timeoutId = setTimeout(a.cfg.fn, a.cfg.delay)
        }
        ;
        if (this.cfg.event == "load") {
            this.runner.call()
        } else {
            this.source.bind(this.cfg.event, this.runner)
        }
        this.removeScriptElement(this.id)
    }
});
PrimeFaces.widget.Fieldset = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.legend = this.jq.children(".ui-fieldset-legend");
        var b = this;
        if (this.cfg.toggleable) {
            this.content = this.jq.children(".ui-fieldset-content");
            this.toggler = this.legend.children(".ui-fieldset-toggler");
            this.stateHolder = $(this.jqId + "_collapsed");
            this.legend.on("click", function (c) {
                b.toggle(c)
            }).on("mouseover", function () {
                b.legend.toggleClass("ui-state-hover")
            }).on("mouseout", function () {
                b.legend.toggleClass("ui-state-hover")
            }).on("mousedown", function () {
                b.legend.toggleClass("ui-state-active")
            }).on("mouseup", function () {
                b.legend.toggleClass("ui-state-active")
            }).on("focus", function () {
                b.legend.toggleClass("ui-state-focus")
            }).on("blur", function () {
                b.legend.toggleClass("ui-state-focus")
            }).on("keydown", function (f) {
                var c = f.which
                        , d = $.ui.keyCode;
                if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                    b.toggle(f);
                    f.preventDefault()
                }
            })
        }
    },
    toggle: function (b) {
        this.updateToggleState(this.cfg.collapsed);
        var a = this;
        this.content.slideToggle(this.cfg.toggleSpeed, "easeInOutCirc", function () {
            if (a.cfg.behaviors) {
                var c = a.cfg.behaviors.toggle;
                if (c) {
                    c.call(a)
                }
            }
        });
        PrimeFaces.invokeDeferredRenders(this.id)
    },
    updateToggleState: function (a) {
        if (a) {
            this.toggler.removeClass("ui-icon-plusthick").addClass("ui-icon-minusthick")
        } else {
            this.toggler.removeClass("ui-icon-minusthick").addClass("ui-icon-plusthick")
        }
        this.cfg.collapsed = !a;
        this.stateHolder.val(!a)
    }
});
PrimeFaces.widget.InputText = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        PrimeFaces.skinInput(this.jq)
    },
    disable: function () {
        this.jq.prop("disabled", true).addClass("ui-state-disabled")
    },
    enable: function () {
        this.jq.prop("disabled", false).removeClass("ui-state-disabled")
    }
});
PrimeFaces.widget.InputTextarea = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        if (this.cfg.autoResize) {
            this.renderDeferred()
        } else {
            this._render()
        }
    },
    _render: function () {
        PrimeFaces.skinInput(this.jq);
        if (this.cfg.autoComplete) {
            this.setupAutoComplete()
        }
        if (this.cfg.counter) {
            this.counter = this.cfg.counter ? $(PrimeFaces.escapeClientId(this.cfg.counter)) : null;
            this.cfg.counterTemplate = this.cfg.counterTemplate || "{0}";
            this.updateCounter()
        }
        if (this.cfg.maxlength) {
            this.applyMaxlength()
        }
        if (this.cfg.autoResize) {
            this.setupAutoResize()
        }
    },
    refresh: function (a) {
        if (a.autoComplete) {
            $(PrimeFaces.escapeClientId(a.id + "_panel")).remove()
        }
        this.init(a)
    },
    setupAutoResize: function () {
        autosize(this.jq)
    },
    applyMaxlength: function () {
        var a = this;
        this.jq.on("keyup.inputtextarea-maxlength", function (d) {
            var c = a.normalizeNewlines(a.jq.val())
                    , b = c.length;
            if (b > a.cfg.maxlength) {
                a.jq.val(c.substr(0, a.cfg.maxlength))
            }
        });
        if (a.counter) {
            this.jq.on("keyup.inputtextarea-counter", function (b) {
                a.updateCounter()
            })
        }
    },
    updateCounter: function () {
        var d = this.normalizeNewlines(this.jq.val())
                , c = d.length;
        if (this.counter) {
            var b = this.cfg.maxlength - c;
            if (b < 0) {
                b = 0
            }
            var a = this.cfg.counterTemplate.replace("{0}", b);
            this.counter.html(a)
        }
    },
    normalizeNewlines: function (a) {
        return a.replace(/(\r\n|\r|\n)/g, "\r\n")
    },
    setupAutoComplete: function () {
        var c = '<div id="' + this.id + '_panel" class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow"></div>'
                , a = this;
        this.panel = $(c).appendTo(document.body);
        this.jq.keyup(function (g) {
            var f = $.ui.keyCode;
            switch (g.which) {
                case f.UP:
                case f.LEFT:
                case f.DOWN:
                case f.RIGHT:
                case f.ENTER:
                case f.NUMPAD_ENTER:
                case f.TAB:
                case f.SPACE:
                case 17:
                case 18:
                case f.ESCAPE:
                case 224:
                    break;
                default:
                    var d = a.extractQuery();
                    if (d && d.length >= a.cfg.minQueryLength) {
                        if (a.timeout) {
                            a.clearTimeout(a.timeout)
                        }
                        a.timeout = setTimeout(function () {
                            a.search(d)
                        }, a.cfg.queryDelay)
                    }
                    break
            }
        }).keydown(function (j) {
            var d = a.panel.is(":visible")
                    , i = $.ui.keyCode;
            switch (j.which) {
                case i.UP:
                case i.LEFT:
                    if (d) {
                        var h = a.items.filter(".ui-state-highlight")
                                , g = h.length == 0 ? a.items.eq(0) : h.prev();
                        if (g.length == 1) {
                            h.removeClass("ui-state-highlight");
                            g.addClass("ui-state-highlight");
                            if (a.cfg.scrollHeight) {
                                PrimeFaces.scrollInView(a.panel, g)
                            }
                        }
                        j.preventDefault()
                    } else {
                        a.clearTimeout()
                    }
                    break;
                case i.DOWN:
                case i.RIGHT:
                    if (d) {
                        var h = a.items.filter(".ui-state-highlight")
                                , f = h.length == 0 ? a.items.eq(0) : h.next();
                        if (f.length == 1) {
                            h.removeClass("ui-state-highlight");
                            f.addClass("ui-state-highlight");
                            if (a.cfg.scrollHeight) {
                                PrimeFaces.scrollInView(a.panel, f)
                            }
                        }
                        j.preventDefault()
                    } else {
                        a.clearTimeout()
                    }
                    break;
                case i.ENTER:
                case i.NUMPAD_ENTER:
                    if (d) {
                        a.items.filter(".ui-state-highlight").trigger("click");
                        j.preventDefault()
                    } else {
                        a.clearTimeout()
                    }
                    break;
                case i.SPACE:
                case 17:
                case 18:
                case i.BACKSPACE:
                case i.ESCAPE:
                case 224:
                    a.clearTimeout();
                    if (d) {
                        a.hide()
                    }
                    break;
                case i.TAB:
                    a.clearTimeout();
                    if (d) {
                        a.items.filter(".ui-state-highlight").trigger("click");
                        a.hide()
                    }
                    break
            }
        });
        $(document.body).bind("mousedown.ui-inputtextarea", function (d) {
            if (a.panel.is(":hidden")) {
                return
            }
            var f = a.panel.offset();
            if (d.target === a.jq.get(0)) {
                return
            }
            if (d.pageX < f.left || d.pageX > f.left + a.panel.width() || d.pageY < f.top || d.pageY > f.top + a.panel.height()) {
                a.hide()
            }
        });
        var b = "resize." + this.id;
        $(window).unbind(b).bind(b, function () {
            if (a.panel.is(":visible")) {
                a.hide()
            }
        });
        this.setupDialogSupport()
    },
    bindDynamicEvents: function () {
        var a = this;
        this.items.bind("mouseover", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                a.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
                b.addClass("ui-state-highlight")
            }
        }).bind("click", function (d) {
            var c = $(this)
                    , e = c.attr("data-item-value")
                    , b = e.substring(a.query.length);
            a.jq.focus();
            a.jq.insertText(b, a.jq.getSelection().start, true);
            a.invokeItemSelectBehavior(d, e);
            a.hide()
        })
    },
    invokeItemSelectBehavior: function (b, d) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.itemSelect;
            if (c) {
                var a = {
                    params: [{
                            name: this.id + "_itemSelect",
                            value: d
                        }]
                };
                c.call(this, a)
            }
        }
    },
    clearTimeout: function () {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        this.timeout = null
    },
    extractQuery: function () {
        var b = this.jq.getSelection().end
                , a = /\S+$/.exec(this.jq.get(0).value.slice(0, b))
                , c = a ? a[0] : null;
        return c
    },
    search: function (b) {
        this.query = b;
        var c = this
                , a = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    params: [{
                            name: this.id + "_query",
                            value: b
                        }],
                    onsuccess: function (f, d, e) {
                        PrimeFaces.ajax.Response.handle(f, d, e, {
                            widget: c,
                            handle: function (g) {
                                this.panel.html(g);
                                this.items = c.panel.find(".ui-autocomplete-item");
                                this.bindDynamicEvents();
                                if (this.items.length > 0) {
                                    this.items.eq(0).addClass("ui-state-highlight");
                                    if (this.cfg.scrollHeight && this.panel.height() > this.cfg.scrollHeight) {
                                        this.panel.height(this.cfg.scrollHeight)
                                    }
                                    if (this.panel.is(":hidden")) {
                                        this.show()
                                    } else {
                                        this.alignPanel()
                                    }
                                } else {
                                    this.panel.hide()
                                }
                            }
                        });
                        return true
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    alignPanel: function () {
        var b = this.jq.getCaretPosition()
                , a = this.jq.offset();
        this.panel.css({
            left: a.left + b.left,
            top: a.top + b.top,
            width: this.jq.innerWidth(),
            "z-index": ++PrimeFaces.zindex
        })
    },
    show: function () {
        this.alignPanel();
        this.panel.show()
    },
    hide: function () {
        this.panel.hide()
    },
    setupDialogSupport: function () {
        var a = this.jq.parents(".ui-dialog:first");
        if (a.length == 1) {
            this.panel.css("position", "fixed")
        }
    }
});
PrimeFaces.widget.SelectOneMenu = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        this.panelId = this.jqId + "_panel";
        this.input = $(this.jqId + "_input");
        this.focusInput = $(this.jqId + "_focus");
        this.label = this.jq.find(".ui-selectonemenu-label");
        this.menuIcon = this.jq.children(".ui-selectonemenu-trigger");
        this.panel = this.jq.children(this.panelId);
        this.disabled = this.jq.hasClass("ui-state-disabled");
        this.itemsWrapper = this.panel.children(".ui-selectonemenu-items-wrapper");
        this.itemsContainer = this.itemsWrapper.children(".ui-selectonemenu-items");
        this.items = this.itemsContainer.find(".ui-selectonemenu-item");
        this.options = this.input.children("option");
        this.cfg.effect = this.cfg.effect || "fade";
        this.cfg.effectSpeed = this.cfg.effectSpeed || "normal";
        this.optGroupsSize = this.itemsContainer.children("li.ui-selectonemenu-item-group").length;
        this.cfg.autoWidth = this.cfg.autoWidth === false ? false : true;
        var g = this
                , e = this.options.filter(":selected")
                , f = this.items.eq(e.index());
        this.options.filter(":disabled").each(function () {
            g.items.eq($(this).index()).addClass("ui-state-disabled")
        });
        this.triggers = this.cfg.editable ? this.jq.find(".ui-selectonemenu-trigger") : this.jq.find(".ui-selectonemenu-trigger, .ui-selectonemenu-label");
        if (this.cfg.editable) {
            var c = this.label.val();
            if (c === e.text()) {
                this.highlightItem(f)
            } else {
                this.items.eq(0).addClass("ui-state-highlight");
                this.customInput = true;
                this.customInputVal = c
            }
        } else {
            this.highlightItem(f)
        }
        if (this.cfg.syncTooltip) {
            this.syncTitle(e)
        }
        this.triggers.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
        if (!this.disabled) {
            this.bindEvents();
            this.bindConstantEvents();
            this.appendPanel()
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        if (PrimeFaces.env.touch) {
            this.focusInput.attr("readonly", true)
        }
        for (var d = 0; d < this.items.length; d++) {
            this.items.eq(d).attr("id", this.id + "_" + d)
        }
        var b = f.attr("id");
        this.focusInput.attr("aria-autocomplete", "list").attr("aria-owns", this.itemsContainer.attr("id")).attr("aria-activedescendant", b).attr("aria-describedby", b).attr("aria-disabled", this.disabled);
        this.itemsContainer.attr("aria-activedescendant", b);
        this.renderDeferred()
    },
    _render: function () {
        var a = this.jq.attr("style")
                , b = a && a.indexOf("width") != -1;
        if (this.cfg.autoWidth && !b) {
            this.jq.css("min-width", this.input.outerWidth())
        }
    },
    refresh: function (a) {
        this.panelWidthAdjusted = false;
        this._super(a)
    },
    appendPanel: function () {
        var a = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!a.is(this.jq)) {
            a.children(this.panelId).remove();
            this.panel.appendTo(a)
        }
    },
    alignPanelWidth: function () {
        if (!this.panelWidthAdjusted) {
            var a = this.jq.outerWidth();
            if (this.panel.outerWidth() < a) {
                this.panel.width(a)
            }
            this.panelWidthAdjusted = true
        }
    },
    bindEvents: function () {
        var a = this;
        if (PrimeFaces.env.browser.webkit) {
            this.input.on("focus", function () {
                setTimeout(function () {
                    a.focusInput.trigger("focus.ui-selectonemenu")
                }, 2)
            })
        }
        this.items.filter(":not(.ui-state-disabled)").on("mouseover.selectonemenu", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).addClass("ui-state-hover")
            }
        }).on("mouseout.selectonemenu", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click.selectonemenu", function () {
            a.selectItem($(this));
            a.changeAriaValue($(this))
        });
        this.triggers.mouseenter(function () {
            if (!a.jq.hasClass("ui-state-focus")) {
                a.jq.addClass("ui-state-hover");
                a.menuIcon.addClass("ui-state-hover")
            }
        }).mouseleave(function () {
            a.jq.removeClass("ui-state-hover");
            a.menuIcon.removeClass("ui-state-hover")
        }).click(function (b) {
            if (a.panel.is(":hidden")) {
                a.show()
            } else {
                a.hide();
                a.revert();
                a.changeAriaValue(a.getActiveItem())
            }
            a.jq.removeClass("ui-state-hover");
            a.menuIcon.removeClass("ui-state-hover");
            a.focusInput.trigger("focus.ui-selectonemenu");
            b.preventDefault()
        });
        this.focusInput.on("focus.ui-selectonemenu", function () {
            a.jq.addClass("ui-state-focus");
            a.menuIcon.addClass("ui-state-focus")
        }).on("blur.ui-selectonemenu", function () {
            a.jq.removeClass("ui-state-focus");
            a.menuIcon.removeClass("ui-state-focus")
        });
        if (this.cfg.editable) {
            this.label.change(function () {
                a.triggerChange(true);
                a.customInput = true;
                a.customInputVal = $(this).val();
                a.items.filter(".ui-state-active").removeClass("ui-state-active");
                a.items.eq(0).addClass("ui-state-active")
            })
        }
        this.bindKeyEvents();
        if (this.cfg.filter) {
            this.cfg.initialHeight = this.itemsWrapper.height();
            this.setupFilterMatcher();
            this.filterInput = this.panel.find("> div.ui-selectonemenu-filter-container > input.ui-selectonemenu-filter");
            PrimeFaces.skinInput(this.filterInput);
            this.bindFilterEvents()
        }
    },
    bindConstantEvents: function () {
        var b = this
                , a = "mousedown." + this.id;
        $(document).off(a).on(a, function (c) {
            if (b.panel.is(":hidden")) {
                return
            }
            var d = b.panel.offset();
            if (c.target === b.label.get(0) || c.target === b.menuIcon.get(0) || c.target === b.menuIcon.children().get(0)) {
                return
            }
            if (c.pageX < d.left || c.pageX > d.left + b.panel.width() || c.pageY < d.top || c.pageY > d.top + b.panel.height()) {
                b.hide();
                setTimeout(function () {
                    b.revert();
                    b.changeAriaValue(b.getActiveItem())
                }, 2)
            }
        });
        this.resizeNS = "resize." + this.id;
        this.unbindResize();
        this.bindResize()
    },
    bindResize: function () {
        var a = this;
        $(window).bind(this.resizeNS, function (b) {
            if (a.panel.is(":visible")) {
                a.alignPanel()
            }
        })
    },
    unbindResize: function () {
        $(window).unbind(this.resizeNS)
    },
    unbindEvents: function () {
        this.items.off();
        this.triggers.off();
        this.input.off();
        this.focusInput.off();
        this.label.off()
    },
    revert: function () {
        if (this.cfg.editable && this.customInput) {
            this.setLabel(this.customInputVal);
            this.items.filter(".ui-state-active").removeClass("ui-state-active");
            this.items.eq(0).addClass("ui-state-active")
        } else {
            this.highlightItem(this.items.eq(this.preShowValue.index()))
        }
    },
    highlightItem: function (a) {
        this.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
        if (a.length > 0) {
            a.addClass("ui-state-highlight");
            this.setLabel(a.data("label"))
        }
    },
    triggerChange: function (a) {
        this.changed = false;
        this.input.trigger("change");
        if (!a) {
            this.value = this.options.filter(":selected").val()
        }
    },
    triggerItemSelect: function () {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.itemSelect;
            if (a) {
                a.call(this)
            }
        }
    },
    selectItem: function (f, b) {
        var e = this.options.eq(this.resolveItemIndex(f))
                , d = this.options.filter(":selected")
                , a = e.val() == d.val()
                , c = null;
        if (this.cfg.editable) {
            c = (!a) || (e.text() != this.label.val())
        } else {
            c = !a
        }
        if (c) {
            this.highlightItem(f);
            this.input.val(e.val());
            this.triggerChange();
            if (this.cfg.editable) {
                this.customInput = false
            }
            if (this.cfg.syncTooltip) {
                this.syncTitle(e)
            }
        }
        if (!b) {
            this.focusInput.focus();
            this.triggerItemSelect()
        }
        if (this.panel.is(":visible")) {
            this.hide()
        }
    },
    syncTitle: function (b) {
        var a = this.items.eq(b.index()).attr("title");
        if (a) {
            this.jq.attr("title", this.items.eq(b.index()).attr("title"))
        } else {
            this.jq.removeAttr("title")
        }
    },
    resolveItemIndex: function (a) {
        if (this.optGroupsSize === 0) {
            return a.index()
        } else {
            return a.index() - a.prevAll("li.ui-selectonemenu-item-group").length
        }
    },
    bindKeyEvents: function () {
        var a = this;
        this.focusInput.on("keydown.ui-selectonemenu", function (d) {
            var c = $.ui.keyCode
                    , b = d.which;
            switch (b) {
                case c.UP:
                case c.LEFT:
                    a.highlightPrev(d);
                    break;
                case c.DOWN:
                case c.RIGHT:
                    a.highlightNext(d);
                    break;
                case c.ENTER:
                case c.NUMPAD_ENTER:
                    a.handleEnterKey(d);
                    break;
                case c.TAB:
                    a.handleTabKey();
                    break;
                case c.ESCAPE:
                    a.handleEscapeKey(d);
                    break;
                case c.SPACE:
                    a.handleSpaceKey(d);
                    break
            }
        }).on("keyup.ui-selectonemenu", function (g) {
            var f = $.ui.keyCode
                    , d = g.which;
            switch (d) {
                case f.UP:
                case f.LEFT:
                case f.DOWN:
                case f.RIGHT:
                case f.ENTER:
                case f.NUMPAD_ENTER:
                case f.TAB:
                case f.ESCAPE:
                case f.SPACE:
                case f.HOME:
                case f.PAGE_DOWN:
                case f.PAGE_UP:
                case f.END:
                case f.DELETE:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 44:
                case 45:
                case 91:
                case 92:
                case 93:
                case 144:
                case 145:
                    break;
                default:
                    if (d >= 112 && d <= 123) {
                        break
                    }
                    var i = $(this).val()
                            , c = null
                            , h = g.metaKey || g.ctrlKey || g.shiftKey;
                    if (!h) {
                        clearTimeout(a.searchTimer);
                        c = a.options.filter(function () {
                            var e = $(this);
                            return (e.is(":not(:disabled)") && (e.text().toLowerCase().indexOf(i.toLowerCase()) === 0))
                        });
                        if (c.length) {
                            var b = a.items.eq(c.index());
                            if (a.panel.is(":hidden")) {
                                a.selectItem(b)
                            } else {
                                a.highlightItem(b);
                                PrimeFaces.scrollInView(a.itemsWrapper, b)
                            }
                        }
                        a.searchTimer = setTimeout(function () {
                            a.focusInput.val("")
                        }, 1000)
                    }
                    break
            }
        })
    },
    bindFilterEvents: function () {
        var a = this;
        this.filterInput.on("keyup.ui-selectonemenu", function (d) {
            var c = $.ui.keyCode
                    , b = d.which;
            switch (b) {
                case c.UP:
                case c.LEFT:
                case c.DOWN:
                case c.RIGHT:
                case c.ENTER:
                case c.NUMPAD_ENTER:
                case c.TAB:
                case c.ESCAPE:
                case c.SPACE:
                case c.HOME:
                case c.PAGE_DOWN:
                case c.PAGE_UP:
                case c.END:
                case c.DELETE:
                case 16:
                case 17:
                case 18:
                case 91:
                case 92:
                case 93:
                case 20:
                    break;
                default:
                    if (b >= 112 && b <= 123) {
                        break
                    }
                    var f = d.metaKey || d.ctrlKey;
                    if (!f) {
                        a.filter($(this).val())
                    }
                    break
            }
        }).on("keydown.ui-selectonemenu", function (d) {
            var c = $.ui.keyCode
                    , b = d.which;
            switch (b) {
                case c.UP:
                    a.highlightPrev(d);
                    break;
                case c.DOWN:
                    a.highlightNext(d);
                    break;
                case c.ENTER:
                case c.NUMPAD_ENTER:
                    a.handleEnterKey(d);
                    d.stopPropagation();
                    break;
                case c.TAB:
                    a.handleTabKey();
                    break;
                case c.ESCAPE:
                    a.handleEscapeKey(d);
                    break;
                case c.SPACE:
                    a.handleSpaceKey(d);
                    break;
                default:
                    break
            }
        })
    },
    highlightNext: function (b) {
        var c = this.getActiveItem()
                , a = this.panel.is(":hidden") ? c.nextAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):first") : c.nextAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):visible:first");
        if (b.altKey) {
            this.show()
        } else {
            if (a.length === 1) {
                if (this.panel.is(":hidden")) {
                    this.selectItem(a)
                } else {
                    this.highlightItem(a);
                    PrimeFaces.scrollInView(this.itemsWrapper, a)
                }
                this.changeAriaValue(a)
            }
        }
        b.preventDefault()
    },
    highlightPrev: function (b) {
        var c = this.getActiveItem()
                , a = this.panel.is(":hidden") ? c.prevAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):first") : c.prevAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):visible:first");
        if (a.length === 1) {
            if (this.panel.is(":hidden")) {
                this.selectItem(a)
            } else {
                this.highlightItem(a);
                PrimeFaces.scrollInView(this.itemsWrapper, a)
            }
            this.changeAriaValue(a)
        }
        b.preventDefault()
    },
    handleEnterKey: function (a) {
        if (this.panel.is(":visible")) {
            this.selectItem(this.getActiveItem())
        }
        a.preventDefault()
    },
    handleSpaceKey: function (a) {
        var b = $(a.target);
        if (b.is("input") && b.hasClass("ui-selectonemenu-filter")) {
            return
        }
        if (this.panel.is(":hidden")) {
            this.show()
        } else {
            this.hide();
            this.revert();
            this.changeAriaValue(this.getActiveItem())
        }
        a.preventDefault()
    },
    handleEscapeKey: function (a) {
        if (this.panel.is(":visible")) {
            this.revert();
            this.hide()
        }
        a.preventDefault()
    },
    handleTabKey: function () {
        if (this.panel.is(":visible")) {
            this.selectItem(this.getActiveItem())
        }
    },
    show: function () {
        var a = this;
        this.alignPanel();
        this.panel.css("z-index", ++PrimeFaces.zindex);
        if ($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css("z-index", PrimeFaces.zindex - 1)
        }
        if (this.cfg.effect !== "none") {
            this.panel.show(this.cfg.effect, {}, this.cfg.effectSpeed, function () {
                PrimeFaces.scrollInView(a.itemsWrapper, a.getActiveItem());
                if (a.cfg.filter) {
                    a.focusFilter()
                }
            })
        } else {
            this.panel.show();
            PrimeFaces.scrollInView(this.itemsWrapper, this.getActiveItem());
            if (a.cfg.filter) {
                this.focusFilter(10)
            }
        }
        this.preShowValue = this.options.filter(":selected");
        this.focusInput.attr("aria-expanded", true)
    },
    hide: function () {
        if ($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css("z-index", "")
        }
        this.panel.css("z-index", "").hide();
        this.focusInput.attr("aria-expanded", false)
    },
    focus: function () {
        this.focusInput.focus()
    },
    focusFilter: function (a) {
        if (a) {
            var b = this;
            setTimeout(function () {
                b.focusFilter()
            }, a)
        } else {
            this.filterInput.focus()
        }
    },
    blur: function () {
        this.focusInput.blur()
    },
    disable: function () {
        if (!this.disabled) {
            this.disabled = true;
            this.jq.addClass("ui-state-disabled");
            this.input.attr("disabled", "disabled");
            if (this.cfg.editable) {
                this.label.attr("disabled", "disabled")
            }
            this.unbindEvents()
        }
    },
    enable: function () {
        if (this.disabled) {
            this.disabled = false;
            this.jq.removeClass("ui-state-disabled");
            this.input.removeAttr("disabled");
            if (this.cfg.editable) {
                this.label.removeAttr("disabled")
            }
            this.bindEvents()
        }
    },
    alignPanel: function () {
        this.alignPanelWidth();
        if (this.panel.parent().is(this.jq)) {
            this.panel.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.panel.css({
                left: "",
                top: ""
            }).position({
                my: "left top",
                at: "left bottom",
                of: this.jq,
                collision: "flipfit"
            })
        }
    },
    setLabel: function (c) {
        var b = this.getLabelToDisplay(c);
        if (this.cfg.editable) {
            if (c === "&nbsp;") {
                this.label.val("")
            } else {
                this.label.val(b)
            }
        } else {
            var a = this.label.data("placeholder");
            if (a == null) {
                a = "&nbsp;"
            }
            if (c === "&nbsp;") {
                this.label.addClass("ui-state-disabled");
                this.label.html(a)
            } else {
                this.label.removeClass("ui-state-disabled");
                this.label.text(b)
            }
        }
    },
    selectValue: function (b) {
        var a = this.options.filter('[value="' + b + '"]');
        this.selectItem(this.items.eq(a.index()), true)
    },
    getActiveItem: function () {
        return this.items.filter(".ui-state-highlight")
    },
    setupFilterMatcher: function () {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    startsWithFilter: function (b, a) {
        return b.indexOf(a) === 0
    },
    containsFilter: function (b, a) {
        return b.indexOf(a) !== -1
    },
    endsWithFilter: function (b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    filter: function (j) {
        this.cfg.initialHeight = this.cfg.initialHeight || this.itemsWrapper.height();
        var h = this.cfg.caseSensitive ? $.trim(j) : $.trim(j).toLowerCase();
        if (h === "") {
            this.items.filter(":hidden").show();
            this.itemsContainer.children(".ui-selectonemenu-item-group").show()
        } else {
            for (var c = 0; c < this.options.length; c++) {
                var d = this.options.eq(c)
                        , b = this.cfg.caseSensitive ? d.text() : d.text().toLowerCase()
                        , l = this.items.eq(c);
                if (l.hasClass("ui-noselection-option")) {
                    l.hide()
                } else {
                    if (this.filterMatcher(b, h)) {
                        l.show()
                    } else {
                        l.hide()
                    }
                }
            }
            var a = this.itemsContainer.children(".ui-selectonemenu-item-group");
            for (var e = 0; e < a.length; e++) {
                var k = a.eq(e);
                if (e === (a.length - 1)) {
                    if (k.nextAll().filter(":visible").length === 0) {
                        k.hide()
                    } else {
                        k.show()
                    }
                } else {
                    if (k.nextUntil(".ui-selectonemenu-item-group").filter(":visible").length === 0) {
                        k.hide()
                    } else {
                        k.show()
                    }
                }
            }
        }
        var f = this.items.filter(":visible:not(.ui-state-disabled):first");
        if (f.length) {
            this.highlightItem(f)
        }
        if (this.itemsContainer.height() < this.cfg.initialHeight) {
            this.itemsWrapper.css("height", "auto")
        } else {
            this.itemsWrapper.height(this.cfg.initialHeight)
        }
        this.alignPanel()
    },
    getSelectedValue: function () {
        return this.input.val()
    },
    getSelectedLabel: function () {
        return this.options.filter(":selected").text()
    },
    getLabelToDisplay: function (a) {
        if (this.cfg.labelTemplate && a !== "&nbsp;") {
            return this.cfg.labelTemplate.replace("{0}", a)
        }
        return a
    },
    changeAriaValue: function (a) {
        var b = a.attr("id");
        this.focusInput.attr("aria-activedescendant", b).attr("aria-describedby", b);
        this.itemsContainer.attr("aria-activedescendant", b)
    }
});
PrimeFaces.widget.SelectOneRadio = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        if (this.cfg.custom) {
            this.originalInputs = this.jq.find(":radio");
            this.inputs = $('input:radio[name="' + this.id + '"].ui-radio-clone');
            this.outputs = this.inputs.parent().next(".ui-radiobutton-box");
            this.labels = $();
            for (var e = 0; e < this.outputs.length; e++) {
                this.labels = this.labels.add('label[for="' + this.outputs.eq(e).parent().attr("id") + '"]')
            }
            for (var e = 0; e < this.inputs.length; e++) {
                var c = this.inputs.eq(e)
                        , a = c.data("itemindex")
                        , d = this.originalInputs.eq(a);
                c.val(d.val());
                if (d.is(":checked")) {
                    c.prop("checked", true).parent().next().addClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank")
                }
            }
        } else {
            this.outputs = this.jq.find(".ui-radiobutton-box");
            this.inputs = this.jq.find(":radio");
            this.labels = this.jq.find("label")
        }
        this.enabledInputs = this.inputs.filter(":not(:disabled)");
        this.checkedRadio = this.outputs.filter(".ui-state-active");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function () {
        var a = this;
        this.outputs.filter(":not(.ui-state-disabled)").on("mouseover.selectOneRadio", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseout.selectOneRadio", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click.selectOneRadio", function () {
            var c = $(this)
                    , b = c.prev().children(":radio");
            if (!c.hasClass("ui-state-active")) {
                a.unselect(a.checkedRadio);
                a.select(c);
                b.trigger("click");
                b.trigger("change")
            } else {
                b.trigger("click")
            }
        });
        this.labels.filter(":not(.ui-state-disabled)").on("click.selectOneRadio", function (d) {
            var c = $(PrimeFaces.escapeClientId($(this).attr("for")))
                    , b = null;
            if (c.is(":input")) {
                b = c.parent().next()
            } else {
                b = c.children(".ui-radiobutton-box")
            }
            b.trigger("click.selectOneRadio");
            d.preventDefault()
        });
        this.enabledInputs.on("focus.selectOneRadio", function () {
            var b = $(this)
                    , c = b.parent().next();
            if (b.prop("checked")) {
                c.removeClass("ui-state-active")
            }
            c.addClass("ui-state-focus")
        }).on("blur.selectOneRadio", function () {
            var b = $(this)
                    , c = b.parent().next();
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            }
            c.removeClass("ui-state-focus")
        }).on("keydown.selectOneRadio", function (h) {
            var i = $(this)
                    , f = i.parent().next()
                    , g = a.enabledInputs.index(i)
                    , m = a.enabledInputs.length
                    , l = $.ui.keyCode
                    , j = h.which;
            switch (j) {
                case l.UP:
                case l.LEFT:
                    var c = (g === 0) ? a.enabledInputs.eq((m - 1)) : a.enabledInputs.eq(--g)
                            , k = c.parent().next();
                    i.blur();
                    a.unselect(f);
                    a.select(k);
                    c.trigger("focus").trigger("change");
                    h.preventDefault();
                    break;
                case l.DOWN:
                case l.RIGHT:
                    var d = (g === (m - 1)) ? a.enabledInputs.eq(0) : a.enabledInputs.eq(++g)
                            , b = d.parent().next();
                    i.blur();
                    a.unselect(f);
                    a.select(b);
                    d.trigger("focus").trigger("change");
                    h.preventDefault();
                    break;
                case l.SPACE:
                    if (!i.prop("checked")) {
                        a.select(f);
                        i.trigger("focus").trigger("change")
                    }
                    h.preventDefault();
                    break
            }
        })
    },
    unselect: function (a) {
        a.prev().children(":radio").prop("checked", false);
        a.removeClass("ui-state-active").children(".ui-radiobutton-icon").removeClass("ui-icon-bullet").addClass("ui-icon-blank")
    },
    select: function (a) {
        this.checkedRadio = a;
        a.addClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank");
        a.prev().children(":radio").prop("checked", true)
    },
    unbindEvents: function (a) {
        if (a) {
            a.off();
            a.parent().nextAll(".ui-radiobutton-box").off();
            this.labels.filter("label[for='" + a.attr("id") + "']").off()
        } else {
            this.inputs.off();
            this.labels.off();
            this.outputs.off()
        }
    },
    disable: function (c) {
        if (c == null) {
            this.inputs.attr("disabled", "disabled");
            this.labels.addClass("ui-state-disabled");
            this.outputs.addClass("ui-state-disabled");
            this.unbindEvents()
        } else {
            var a = this.inputs.eq(c)
                    , b = this.labels.filter("label[for='" + a.attr("id") + "']");
            a.attr("disabled", "disabled").parent().nextAll(".ui-radiobutton-box").addClass("ui-state-disabled");
            b.addClass("ui-state-disabled");
            this.unbindEvents(a)
        }
    },
    enable: function (c) {
        if (c == null) {
            this.inputs.removeAttr("disabled");
            this.labels.removeClass("ui-state-disabled");
            this.outputs.removeClass("ui-state-disabled")
        } else {
            var a = this.inputs.eq(c)
                    , b = this.labels.filter("label[for='" + a.attr("id") + "']");
            a.removeAttr("disabled").parent().nextAll(".ui-radiobutton-box").removeClass("ui-state-disabled");
            b.removeClass("ui-state-disabled")
        }
        this.bindEvents()
    }
});
PrimeFaces.widget.SelectBooleanCheckbox = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.input = $(this.jqId + "_input");
        this.box = this.jq.find(".ui-chkbox-box");
        this.icon = this.box.children(".ui-chkbox-icon");
        this.itemLabel = this.jq.find(".ui-chkbox-label");
        this.disabled = this.input.is(":disabled");
        var b = this;
        if (!this.disabled) {
            this.box.on("mouseover.selectBooleanCheckbox", function () {
                b.box.addClass("ui-state-hover")
            }).on("mouseout.selectBooleanCheckbox", function () {
                b.box.removeClass("ui-state-hover")
            }).on("click.selectBooleanCheckbox", function () {
                b.input.trigger("click");
                if (PrimeFaces.env.browser.msie && PrimeFaces.env.isLtIE(9)) {
                    b.input.trigger("change")
                }
            });
            this.input.on("focus.selectBooleanCheckbox", function () {
                if ($(this).prop("checked")) {
                    b.box.removeClass("ui-state-active")
                }
                b.box.addClass("ui-state-focus")
            }).on("blur.selectBooleanCheckbox", function () {
                if ($(this).prop("checked")) {
                    b.box.addClass("ui-state-active")
                }
                b.box.removeClass("ui-state-focus")
            }).on("change.selectBooleanCheckbox", function (c) {
                if (b.isChecked()) {
                    b.box.addClass("ui-state-active").children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
                } else {
                    b.box.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
                }
            });
            this.itemLabel.click(function () {
                b.toggle();
                b.input.trigger("focus")
            })
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    toggle: function () {
        if (this.isChecked()) {
            this.uncheck()
        } else {
            this.check()
        }
    },
    isChecked: function () {
        return this.input.prop("checked")
    },
    check: function () {
        if (!this.isChecked()) {
            this.input.prop("checked", true).trigger("change");
            this.input.attr("aria-checked", true);
            this.box.addClass("ui-state-active").children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
        }
    },
    uncheck: function () {
        if (this.isChecked()) {
            this.input.prop("checked", false).trigger("change");
            this.input.attr("aria-checked", false);
            this.box.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
        }
    }
});
PrimeFaces.widget.SelectManyCheckbox = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        if (this.cfg.custom) {
            this.originalInputs = this.jq.find(":checkbox");
            this.inputs = $('input:checkbox[name="' + this.id + '"].ui-chkbox-clone');
            this.outputs = this.inputs.parent().next(".ui-chkbox-box");
            for (var e = 0; e < this.inputs.length; e++) {
                var c = this.inputs.eq(e)
                        , a = c.data("itemindex")
                        , d = this.originalInputs.eq(a);
                c.val(d.val());
                if (d.is(":checked")) {
                    c.prop("checked", true).parent().next().addClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-check").removeClass("ui-icon-blank")
                }
            }
        } else {
            this.outputs = this.jq.find(".ui-chkbox-box:not(.ui-state-disabled)");
            this.inputs = this.jq.find(":checkbox:not(:disabled)")
        }
        this.enabledInputs = this.inputs.filter(":not(:disabled)");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function () {
        this.outputs.filter(":not(.ui-state-disabled)").on("mouseover", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseout", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click", function () {
            var b = $(this)
                    , a = b.prev().children(":checkbox");
            a.trigger("click");
            if ($.browser.msie && parseInt($.browser.version) < 9) {
                a.trigger("change")
            }
        });
        this.enabledInputs.on("focus", function () {
            var a = $(this)
                    , b = a.parent().next();
            if (a.prop("checked")) {
                b.removeClass("ui-state-active")
            }
            b.addClass("ui-state-focus")
        }).on("blur", function () {
            var a = $(this)
                    , b = a.parent().next();
            if (a.prop("checked")) {
                b.addClass("ui-state-active")
            }
            b.removeClass("ui-state-focus")
        }).on("change", function (d) {
            var a = $(this)
                    , c = a.parent().next()
                    , f = a.is(":focus")
                    , b = a.is(":disabled");
            if (b) {
                return
            }
            if (a.is(":checked")) {
                c.children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
                if (!f) {
                    c.addClass("ui-state-active")
                }
            } else {
                c.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
            }
        })
    }
});
PrimeFaces.widget.SelectListbox = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.input = $(this.jqId + "_input"),
                this.listContainer = this.jq.children(".ui-selectlistbox-listcontainer");
        this.listElement = this.listContainer.children(".ui-selectlistbox-list");
        this.options = $(this.input).children("option");
        this.allItems = this.listElement.find(".ui-selectlistbox-item");
        this.items = this.allItems.filter(":not(.ui-state-disabled)");
        var b = this.options.filter(":selected:not(:disabled)");
        if (b.length) {
            PrimeFaces.scrollInView(this.listContainer, this.items.eq(b.eq(0).index()))
        }
        this.bindEvents();
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function () {
        var a = this;
        this.items.on("mouseover.selectListbox", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout.selectListbox", function () {
            $(this).removeClass("ui-state-hover")
        }).on("dblclick.selectListbox", function (b) {
            a.input.trigger("dblclick");
            PrimeFaces.clearSelection();
            b.preventDefault()
        });
        this.input.on("focus.selectListbox", function () {
            a.jq.addClass("ui-state-focus")
        }).on("blur.selectListbox", function () {
            a.jq.removeClass("ui-state-focus")
        });
        if (this.cfg.filter) {
            this.filterInput = this.jq.find("> div.ui-selectlistbox-filter-container > input.ui-selectlistbox-filter");
            PrimeFaces.skinInput(this.filterInput);
            this.filterInput.on("keyup.selectListbox", function (b) {
                a.filter(this.value)
            });
            this.setupFilterMatcher()
        }
    },
    unselectAll: function () {
        this.items.removeClass("ui-state-highlight ui-state-hover");
        this.options.filter(":selected").prop("selected", false)
    },
    selectItem: function (a) {
        a.addClass("ui-state-highlight").removeClass("ui-state-hover");
        this.options.eq(a.index()).prop("selected", true)
    },
    unselectItem: function (a) {
        a.removeClass("ui-state-highlight");
        this.options.eq(a.index()).prop("selected", false)
    },
    setupFilterMatcher: function () {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    startsWithFilter: function (b, a) {
        return b.indexOf(a) === 0
    },
    containsFilter: function (b, a) {
        return b.indexOf(a) !== -1
    },
    endsWithFilter: function (b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    filter: function (e) {
        var f = this.cfg.caseSensitive ? $.trim(e) : $.trim(e).toLowerCase();
        if (f === "") {
            this.items.filter(":hidden").show()
        } else {
            for (var a = 0; a < this.options.length; a++) {
                var c = this.options.eq(a)
                        , b = this.cfg.caseSensitive ? c.text() : c.text().toLowerCase()
                        , d = this.items.eq(a);
                if (this.filterMatcher(b, f)) {
                    d.show()
                } else {
                    d.hide()
                }
            }
        }
    }
});
PrimeFaces.widget.SelectOneListbox = PrimeFaces.widget.SelectListbox.extend({
    bindEvents: function () {
        this._super();
        var a = this;
        if (!this.cfg.disabled) {
            this.items.on("click.selectListbox", function (d) {
                var b = $(this)
                        , c = a.items.filter(".ui-state-highlight");
                if (b.index() !== c.index()) {
                    if (c.length) {
                        a.unselectItem(c)
                    }
                    a.selectItem(b);
                    a.input.trigger("change")
                }
                a.input.trigger("click");
                PrimeFaces.clearSelection();
                d.preventDefault()
            })
        }
    }
});
PrimeFaces.widget.SelectManyMenu = PrimeFaces.widget.SelectListbox.extend({
    init: function (a) {
        this._super(a);
        this.allItems.filter(".ui-state-highlight").find("> .ui-chkbox > .ui-chkbox-box").addClass("ui-state-active")
    },
    bindEvents: function () {
        this._super();
        var a = this;
        if (!this.cfg.disabled) {
            this.items.on("click.selectListbox", function (h) {
                if (a.checkboxClick) {
                    a.checkboxClick = false;
                    return
                }
                var m = $(this)
                        , c = a.items.filter(".ui-state-highlight")
                        , j = (h.metaKey || h.ctrlKey)
                        , b = (!j && c.length === 1 && c.index() === m.index());
                if (!h.shiftKey) {
                    if (!j) {
                        a.unselectAll()
                    }
                    if (j && m.hasClass("ui-state-highlight")) {
                        a.unselectItem(m)
                    } else {
                        a.selectItem(m);
                        a.cursorItem = m
                    }
                } else {
                    if (a.cursorItem) {
                        a.unselectAll();
                        var k = m.index()
                                , n = a.cursorItem.index()
                                , l = (k > n) ? n : k
                                , g = (k > n) ? (k + 1) : (n + 1);
                        for (var f = l; f < g; f++) {
                            var d = a.allItems.eq(f);
                            if (d.is(":visible") && !d.hasClass("ui-state-disabled")) {
                                a.selectItem(d)
                            }
                        }
                    } else {
                        a.selectItem(m);
                        a.cursorItem = m
                    }
                }
                if (!b) {
                    a.input.trigger("change")
                }
                a.input.trigger("click");
                PrimeFaces.clearSelection();
                h.preventDefault()
            });
            if (this.cfg.showCheckbox) {
                this.checkboxes = this.jq.find(".ui-selectlistbox-item:not(.ui-state-disabled) div.ui-chkbox > div.ui-chkbox-box");
                this.checkboxes.on("mouseover.selectManyMenu", function (c) {
                    var b = $(this);
                    if (!b.hasClass("ui-state-active")) {
                        b.addClass("ui-state-hover")
                    }
                }).on("mouseout.selectManyMenu", function (b) {
                    $(this).removeClass("ui-state-hover")
                }).on("click.selectManyMenu", function (c) {
                    a.checkboxClick = true;
                    var b = $(this).closest(".ui-selectlistbox-item");
                    if (b.hasClass("ui-state-highlight")) {
                        a.unselectItem(b)
                    } else {
                        a.selectItem(b)
                    }
                    a.input.trigger("change")
                })
            }
        }
    },
    unselectAll: function () {
        for (var a = 0; a < this.items.length; a++) {
            this.unselectItem(this.items.eq(a))
        }
    },
    selectItem: function (a) {
        this._super(a);
        if (this.cfg.showCheckbox) {
            this.selectCheckbox(a.find("div.ui-chkbox-box"))
        }
    },
    unselectItem: function (a) {
        this._super(a);
        if (this.cfg.showCheckbox) {
            this.unselectCheckbox(a.find("div.ui-chkbox-box"))
        }
    },
    selectCheckbox: function (a) {
        a.removeClass("ui-state-hover").addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
    },
    unselectCheckbox: function (a) {
        a.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
    }
});
PrimeFaces.widget.CommandButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        PrimeFaces.skinButton(this.jq)
    },
    disable: function () {
        this.jq.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("disabled", "disabled")
    },
    enable: function () {
        this.jq.removeClass("ui-state-disabled").removeAttr("disabled")
    }
});
PrimeFaces.widget.Button = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        PrimeFaces.skinButton(this.jq)
    },
    disable: function () {
        this.jq.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("disabled", "disabled")
    },
    enable: function () {
        this.jq.removeClass("ui-state-disabled").removeAttr("disabled")
    }
});
PrimeFaces.widget.SelectManyButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.buttons = this.jq.children("div:not(.ui-state-disabled)");
        this.inputs = this.jq.find(":checkbox:not(:disabled)");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function () {
        var a = this;
        this.buttons.on("mouseover", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click", function (d) {
            var c = $(this)
                    , b = c.children(":checkbox");
            if (c.hasClass("ui-state-active")) {
                c.addClass("ui-state-hover")
            } else {
                c.removeClass("ui-state-hover")
            }
            b.trigger("click");
            if (PrimeFaces.env.browser.msie && PrimeFaces.env.isLtIE(9)) {
                b.trigger("change")
            }
        });
        this.inputs.on("focus", function () {
            var b = $(this)
                    , c = b.parent();
            if (b.prop("checked")) {
                c.removeClass("ui-state-active")
            }
            c.addClass("ui-state-focus")
        }).on("blur", function () {
            var b = $(this)
                    , c = b.parent();
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            }
            c.removeClass("ui-state-focus")
        }).on("change", function () {
            var b = $(this)
                    , c = b.parent();
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            } else {
                c.removeClass("ui-state-active")
            }
        }).on("click", function (b) {
            b.stopPropagation()
        })
    },
    select: function (a) {
        a.children(":checkbox").prop("checked", true).change()
    },
    unselect: function (a) {
        a.children(":checkbox").prop("checked", false).change()
    }
});
PrimeFaces.widget.SelectOneButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.buttons = this.jq.children("div:not(.ui-state-disabled)");
        this.inputs = this.jq.find(":radio:not(:disabled)");
        this.cfg.unselectable = this.cfg.unselectable === false ? false : true;
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function () {
        var a = this;
        this.buttons.on("mouseover", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click", function () {
            var c = $(this)
                    , b = c.children(":radio");
            if (c.hasClass("ui-state-active") || b.prop("checked")) {
                a.unselect(c)
            } else {
                a.select(c)
            }
        });
        this.buttons.on("focus.selectOneButton", function () {
            var c = $(this)
                    , b = c.children(":radio");
            if (b.prop("checked")) {
                c.removeClass("ui-state-active")
            }
            c.addClass("ui-state-focus")
        }).on("blur.selectOneButton", function () {
            var c = $(this)
                    , b = c.children(":radio");
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            }
            c.removeClass("ui-state-focus")
        }).on("keydown.selectOneButton", function (g) {
            var f = $.ui.keyCode
                    , d = g.which;
            if (d === f.SPACE || d === f.ENTER || d === f.NUMPAD_ENTER) {
                var c = $(this)
                        , b = c.children(":radio");
                if (b.prop("checked")) {
                    a.unselect(c)
                } else {
                    a.select(c)
                }
                g.preventDefault()
            }
        })
    },
    select: function (a) {
        this.buttons.filter(".ui-state-active").removeClass("ui-state-active ui-state-hover").children(":radio").prop("checked", false);
        a.addClass("ui-state-active").children(":radio").prop("checked", true);
        this.triggerChange()
    },
    unselect: function (a) {
        if (this.cfg.unselectable) {
            a.removeClass("ui-state-active ui-state-hover ui-state-focus").children(":radio").prop("checked", false).change()
        }
    },
    triggerChange: function () {
        if (this.cfg.change) {
            this.cfg.change.call(this)
        }
        if (this.hasBehavior("change")) {
            var a = this.cfg.behaviors.change;
            if (a) {
                a.call(this)
            }
        }
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    }
});
PrimeFaces.widget.SelectBooleanButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.input = $(this.jqId + "_input");
        this.disabled = this.input.is(":disabled");
        this.icon = this.jq.children(".ui-button-icon-left");
        var b = this;
        if (!this.disabled) {
            this.jq.on("mouseover", function () {
                if (!b.jq.hasClass("ui-state-active")) {
                    b.jq.addClass("ui-state-hover")
                }
            }).on("mouseout", function () {
                b.jq.removeClass("ui-state-hover")
            }).on("click", function () {
                b.toggle();
                b.input.trigger("focus")
            })
        }
        this.input.on("focus", function () {
            b.jq.addClass("ui-state-focus")
        }).on("blur", function () {
            b.jq.removeClass("ui-state-focus")
        }).on("keydown", function (d) {
            var c = $.ui.keyCode;
            if (d.which === c.SPACE) {
                d.preventDefault()
            }
        }).on("keyup", function (d) {
            var c = $.ui.keyCode;
            if (d.which === c.SPACE) {
                b.toggle();
                d.preventDefault()
            }
        });
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    toggle: function () {
        if (!this.disabled) {
            if (this.input.prop("checked")) {
                this.uncheck()
            } else {
                this.check()
            }
        }
    },
    check: function () {
        if (!this.disabled) {
            this.input.prop("checked", true);
            this.jq.addClass("ui-state-active").children(".ui-button-text").html(this.cfg.onLabel);
            if (this.icon.length > 0) {
                this.icon.removeClass(this.cfg.offIcon).addClass(this.cfg.onIcon)
            }
            this.input.trigger("change")
        }
    },
    uncheck: function () {
        if (!this.disabled) {
            this.input.prop("checked", false);
            this.jq.removeClass("ui-state-active").children(".ui-button-text").html(this.cfg.offLabel);
            if (this.icon.length > 0) {
                this.icon.removeClass(this.cfg.onIcon).addClass(this.cfg.offIcon)
            }
            this.input.trigger("change")
        }
    }
});
PrimeFaces.widget.SelectCheckboxMenu = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.labelContainer = this.jq.find(".ui-selectcheckboxmenu-label-container");
        this.label = this.jq.find(".ui-selectcheckboxmenu-label");
        this.menuIcon = this.jq.children(".ui-selectcheckboxmenu-trigger");
        this.triggers = this.jq.find(".ui-selectcheckboxmenu-trigger, .ui-selectcheckboxmenu-label");
        this.disabled = this.jq.hasClass("ui-state-disabled");
        this.inputs = this.jq.find(":checkbox");
        this.panelId = this.id + "_panel";
        this.labelId = this.id + "_label";
        this.keyboardTarget = $(this.jqId + "_focus");
        this.tabindex = this.keyboardTarget.attr("tabindex");
        this.cfg.showHeader = (this.cfg.showHeader === undefined) ? true : this.cfg.showHeader;
        if (!this.disabled) {
            if (this.cfg.multiple) {
                this.triggers = this.jq.find(".ui-selectcheckboxmenu-trigger, .ui-selectcheckboxmenu-multiple-container")
            }
            this.renderPanel();
            if (this.tabindex) {
                this.panel.find("a, input").attr("tabindex", this.tabindex)
            }
            this.checkboxes = this.itemContainer.find(".ui-chkbox-box:not(.ui-state-disabled)");
            this.labels = this.itemContainer.find("label");
            this.bindEvents();
            this.triggers.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            if (!this.cfg.multiple) {
                if (this.cfg.updateLabel) {
                    this.defaultLabel = this.label.text();
                    this.label.css({
                        "text-overflow": "ellipsis",
                        overflow: "hidden"
                    });
                    this.updateLabel()
                }
                this.label.attr("id", this.labelId);
                this.keyboardTarget.attr("aria-expanded", false).attr("aria-labelledby", this.labelId)
            }
        }
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    refresh: function (a) {
        $(PrimeFaces.escapeClientId(this.panelId)).remove();
        this.init(a)
    },
    renderPanel: function () {
        this.panel = $('<div id="' + this.panelId + '" class="ui-selectcheckboxmenu-panel ui-widget ui-widget-content ui-corner-all ui-helper-hidden" role="dialog"></div>');
        this.appendPanel();
        if (this.cfg.panelStyle) {
            this.panel.attr("style", this.cfg.panelStyle)
        }
        if (this.cfg.panelStyleClass) {
            this.panel.addClass(this.cfg.panelStyleClass)
        }
        this.renderHeader();
        this.renderItems();
        if (this.cfg.scrollHeight) {
            this.itemContainerWrapper.height(this.cfg.scrollHeight)
        } else {
            if (this.inputs.length > 10) {
                this.itemContainerWrapper.height(200)
            }
        }
    },
    renderHeader: function () {
        this.header = $('<div class="ui-widget-header ui-corner-all ui-selectcheckboxmenu-header ui-helper-clearfix"></div>').appendTo(this.panel);
        if (!this.cfg.showHeader) {
            this.header.removeClass("ui-helper-clearfix").addClass("ui-helper-hidden")
        }
        this.toggler = $('<div class="ui-chkbox ui-widget"><div class="ui-helper-hidden-accessible"><input type="checkbox" role="checkbox" aria-label="Select All" readonly="readonly"/></div><div class="ui-chkbox-box ui-widget ui-corner-all ui-state-default"><span class="ui-chkbox-icon ui-icon ui-icon-blank"></span></div></div>').appendTo(this.header);
        this.togglerBox = this.toggler.children(".ui-chkbox-box");
        if (this.inputs.filter(":not(:checked)").length === 0) {
            this.check(this.togglerBox)
        }
        if (this.cfg.filter) {
            this.filterInputWrapper = $('<div class="ui-selectcheckboxmenu-filter-container"></div>').appendTo(this.header);
            this.filterInput = $('<input type="text" aria-multiline="false" aria-readonly="false" aria-disabled="false" aria-label="Filter Input" role="textbox" class="ui-inputfield ui-inputtext ui-widget ui-state-default ui-corner-all">').appendTo(this.filterInputWrapper);
            this.filterInputWrapper.append("<span class='ui-icon ui-icon-search'></span>")
        }
        this.closer = $('<a class="ui-selectcheckboxmenu-close ui-corner-all" href="#"><span class="ui-icon ui-icon-circle-close"></span></a>').attr("aria-label", "Close").appendTo(this.header)
    },
    renderItems: function () {
        var g = this;
        this.itemContainerWrapper = $('<div class="ui-selectcheckboxmenu-items-wrapper"><ul class="ui-selectcheckboxmenu-items ui-selectcheckboxmenu-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul></div>').appendTo(this.panel);
        this.itemContainer = this.itemContainerWrapper.children("ul.ui-selectcheckboxmenu-items");
        for (var d = 0; d < this.inputs.length; d++) {
            var m = this.inputs.eq(d)
                    , l = m.next()
                    , c = m.is(":disabled")
                    , o = m.is(":checked")
                    , k = m.attr("title")
                    , f = "ui-chkbox-box ui-widget ui-corner-all ui-state-default"
                    , j = "ui-selectcheckboxmenu-item ui-selectcheckboxmenu-list-item ui-corner-all"
                    , a = m.data("escaped");
            if (c) {
                f += " ui-state-disabled"
            }
            if (o) {
                f += " ui-state-active"
            }
            var h = o ? "ui-chkbox-icon ui-icon ui-icon-check" : "ui-chkbox-icon ui-icon ui-icon-blank"
                    , j = o ? j + " ui-selectcheckboxmenu-checked" : j + " ui-selectcheckboxmenu-unchecked";
            var p = $('<li class="' + j + '"></li>');
            p.append('<div class="ui-chkbox ui-widget"><div class="ui-helper-hidden-accessible"><input type="checkbox" role="checkbox" readonly="readonly"></input></div><div class="' + f + '"><span class="' + h + '"></span></div></div>');
            var b = $("<label></label>")
                    , n = l.html().trim()
                    , e = n.length;
            if (e > 0 && n !== "&nbsp;") {
                if (a) {
                    b.text(l.text())
                } else {
                    b.html(l.html())
                }
            } else {
                b.text(m.val())
            }
            b.appendTo(p);
            if (k) {
                p.attr("title", k)
            }
            if (g.cfg.multiple) {
                p.attr("data-item-value", m.val())
            }
            p.find("> .ui-chkbox > .ui-helper-hidden-accessible > input").prop("checked", o).attr("aria-checked", o);
            g.itemContainer.attr("role", "group");
            g.itemContainer.append(p)
        }
        this.items = this.itemContainer.children("li.ui-selectcheckboxmenu-item")
    },
    appendPanel: function () {
        if (this.cfg.appendTo) {
            this.panel.appendTo(PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo))
        } else {
            this.panel.appendTo(document.body)
        }
    },
    bindEvents: function () {
        var c = this
                , b = "mousedown." + this.id
                , a = "resize." + this.id;
        this.bindCheckboxHover(this.checkboxes);
        this.checkboxes.on("click.selectCheckboxMenu", function () {
            c.toggleItem($(this))
        });
        this.bindCheckboxHover(this.togglerBox);
        this.togglerBox.on("click.selectCheckboxMenu", function () {
            var d = $(this);
            if (d.hasClass("ui-state-active")) {
                c.uncheckAll();
                d.addClass("ui-state-hover")
            } else {
                c.checkAll();
                d.removeClass("ui-state-hover")
            }
        });
        if (this.cfg.filter) {
            this.setupFilterMatcher();
            PrimeFaces.skinInput(this.filterInput);
            this.filterInput.on("keyup.selectCheckboxMenu", function () {
                c.filter($(this).val())
            }).on("keydown.selectCheckboxMenu", function (d) {
                if (d.which === $.ui.keyCode.ESCAPE) {
                    c.hide()
                }
            })
        }
        this.closer.on("mouseenter.selectCheckboxMenu", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseleave.selectCheckboxMenu", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click.selectCheckboxMenu", function (d) {
            c.hide(true);
            d.preventDefault()
        });
        this.labels.on("click.selectCheckboxMenu", function () {
            var d = $(this).prev().children(".ui-chkbox-box");
            c.toggleItem(d);
            d.removeClass("ui-state-hover");
            PrimeFaces.clearSelection()
        });
        this.triggers.on("mouseover.selectCheckboxMenu", function () {
            if (!c.disabled && !c.triggers.hasClass("ui-state-focus")) {
                c.triggers.addClass("ui-state-hover")
            }
        }).on("mouseout.selectCheckboxMenu", function () {
            if (!c.disabled) {
                c.triggers.removeClass("ui-state-hover")
            }
        }).on("mousedown.selectCheckboxMenu", function (d) {
            if (!c.disabled) {
                if (c.cfg.multiple && $(d.target).is(".ui-selectcheckboxmenu-token-icon")) {
                    return
                }
                if (c.panel.is(":hidden")) {
                    c.show()
                } else {
                    c.hide(true)
                }
            }
        }).on("click.selectCheckboxMenu", function (d) {
            c.keyboardTarget.trigger("focus");
            d.preventDefault()
        });
        if (this.cfg.multiple) {
            this.bindMultipleModeEvents()
        }
        this.bindKeyEvents();
        $(document.body).off(b).on(b, function (f) {
            if (c.panel.is(":hidden")) {
                return
            }
            var d = $(f.target);
            if (c.triggers.is(d) || c.triggers.has(d).length > 0) {
                return
            }
            var g = c.panel.offset();
            if (f.pageX < g.left || f.pageX > g.left + c.panel.width() || f.pageY < g.top || f.pageY > g.top + c.panel.height()) {
                c.hide(true)
            }
        });
        $(window).off(a).on(a, function () {
            if (c.panel.is(":visible")) {
                c.alignPanel()
            }
        });
        if (this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.inputs, this.cfg.behaviors)
        }
    },
    bindKeyEvents: function () {
        var c = this;
        this.keyboardTarget.on("focus.selectCheckboxMenu", function () {
            c.jq.addClass("ui-state-focus");
            c.menuIcon.addClass("ui-state-focus")
        }).on("blur.selectCheckboxMenu", function () {
            c.jq.removeClass("ui-state-focus");
            c.menuIcon.removeClass("ui-state-focus")
        }).on("keydown.selectCheckboxMenu", function (g) {
            var f = $.ui.keyCode
                    , d = g.which;
            switch (d) {
                case f.ENTER:
                case f.NUMPAD_ENTER:
                    if (c.panel.is(":hidden")) {
                        c.show()
                    } else {
                        c.hide(true)
                    }
                    g.preventDefault();
                    break;
                case f.TAB:
                    if (c.panel.is(":visible")) {
                        if (!c.cfg.showHeader) {
                            c.itemContainer.children("li:not(.ui-state-disabled):first").find("div.ui-helper-hidden-accessible > input").trigger("focus")
                        } else {
                            c.toggler.find("> div.ui-helper-hidden-accessible > input").trigger("focus")
                        }
                        g.preventDefault()
                    }
                    break;
                case f.ESCAPE:
                    c.hide();
                    break
            }
        });
        this.closer.on("focus.selectCheckboxMenu", function (d) {
            c.closer.addClass("ui-state-focus")
        }).on("blur.selectCheckboxMenu", function (d) {
            c.closer.removeClass("ui-state-focus")
        }).on("keydown.selectCheckboxMenu", function (g) {
            var f = $.ui.keyCode
                    , d = g.which;
            switch (d) {
                case f.ENTER:
                case f.NUMPAD_ENTER:
                    c.hide(true);
                    g.preventDefault();
                    break;
                case f.ESCAPE:
                    c.hide();
                    break
            }
        });
        var b = this.toggler.find("> div.ui-helper-hidden-accessible > input");
        this.bindCheckboxKeyEvents(b);
        b.on("keyup.selectCheckboxMenu", function (f) {
            if (f.which === $.ui.keyCode.SPACE) {
                var d = $(this);
                if (d.prop("checked")) {
                    c.uncheckAll()
                } else {
                    c.checkAll()
                }
                f.preventDefault()
            }
        }).on("change.selectCheckboxMenu", function (f) {
            var d = $(this);
            if (d.prop("checked")) {
                c.checkAll()
            } else {
                c.uncheckAll()
            }
        });
        var a = this.itemContainer.find("> li > div.ui-chkbox > div.ui-helper-hidden-accessible > input");
        this.bindCheckboxKeyEvents(a);
        a.on("keyup.selectCheckboxMenu", function (g) {
            if (g.which === $.ui.keyCode.SPACE) {
                var d = $(this)
                        , f = d.parent().next();
                if (d.prop("checked")) {
                    c.uncheck(f, true)
                } else {
                    c.check(f, true)
                }
                g.preventDefault()
            }
        }).on("change.selectCheckboxMenu", function (g) {
            var d = $(this)
                    , f = d.parent().next();
            if (d.prop("checked")) {
                c.check(f, true)
            } else {
                c.uncheck(f, true)
            }
        })
    },
    bindMultipleModeEvents: function () {
        var b = this;
        this.multiItemContainer = this.jq.children(".ui-selectcheckboxmenu-multiple-container");
        var a = "> li.ui-selectcheckboxmenu-token > .ui-selectcheckboxmenu-token-icon";
        this.multiItemContainer.off("click", a).on("click", a, null, function (d) {
            var c = b.items.filter('[data-item-value="' + $(this).parent().data("item-value") + '"]');
            if (c && c.length) {
                b.uncheck(c.children(".ui-chkbox").children(".ui-chkbox-box"), true)
            }
        })
    },
    bindCheckboxHover: function (a) {
        a.on("mouseenter.selectCheckboxMenu", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active") && !b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseleave.selectCheckboxMenu", function () {
            $(this).removeClass("ui-state-hover")
        })
    },
    filter: function (e) {
        var f = this.cfg.caseSensitive ? $.trim(e) : $.trim(e).toLowerCase();
        if (f === "") {
            this.itemContainer.children("li.ui-selectcheckboxmenu-item").filter(":hidden").show()
        } else {
            for (var b = 0; b < this.labels.length; b++) {
                var a = this.labels.eq(b)
                        , d = a.parent()
                        , c = this.cfg.caseSensitive ? a.text() : a.text().toLowerCase();
                if (this.filterMatcher(c, f)) {
                    d.show()
                } else {
                    d.hide()
                }
            }
        }
        if (this.cfg.scrollHeight) {
            if (this.itemContainer.height() < this.cfg.initialHeight) {
                this.itemContainerWrapper.css("height", "auto")
            } else {
                this.itemContainerWrapper.height(this.cfg.initialHeight)
            }
        }
        this.updateToggler()
    },
    setupFilterMatcher: function () {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    startsWithFilter: function (b, a) {
        return b.indexOf(a) === 0
    },
    containsFilter: function (b, a) {
        return b.indexOf(a) !== -1
    },
    endsWithFilter: function (b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    checkAll: function () {
        for (var a = 0; a < this.items.length; a++) {
            var b = this.items.eq(a);
            if (b.is(":visible")) {
                this.inputs.eq(a).prop("checked", true).attr("aria-checked", true);
                this.check(b.children(".ui-chkbox").children(".ui-chkbox-box"));
                if (this.cfg.multiple) {
                    this.createMultipleItem(b)
                }
            }
        }
        this.check(this.togglerBox);
        if (!this.togglerBox.hasClass("ui-state-disabled")) {
            this.togglerBox.prev().children("input").trigger("focus.selectCheckboxMenu");
            this.togglerBox.addClass("ui-state-active")
        }
        if (this.cfg.multiple) {
            this.alignPanel()
        }
        this.fireToggleSelectEvent(true)
    },
    uncheckAll: function () {
        for (var a = 0; a < this.items.length; a++) {
            var b = this.items.eq(a);
            if (b.is(":visible")) {
                this.inputs.eq(a).prop("checked", false).attr("aria-checked", false);
                this.uncheck(b.children(".ui-chkbox").children(".ui-chkbox-box"));
                if (this.cfg.multiple) {
                    this.multiItemContainer.children().remove()
                }
            }
        }
        this.uncheck(this.togglerBox);
        if (!this.togglerBox.hasClass("ui-state-disabled")) {
            this.togglerBox.prev().children("input").trigger("focus.selectCheckboxMenu")
        }
        if (this.cfg.multiple) {
            this.alignPanel()
        }
        this.fireToggleSelectEvent(false)
    },
    fireToggleSelectEvent: function (c) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.toggleSelect;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_checked",
                            value: c
                        }]
                };
                a.call(this, b)
            }
        }
    },
    check: function (e, d) {
        if (!e.hasClass("ui-state-disabled")) {
            var a = e.prev().children("input")
                    , c = e.closest("li.ui-selectcheckboxmenu-item");
            a.prop("checked", true).attr("aria-checked", true);
            if (d) {
                a.trigger("focus.selectCheckboxMenu")
            }
            e.addClass("ui-state-active").children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
            c.removeClass("ui-selectcheckboxmenu-unchecked").addClass("ui-selectcheckboxmenu-checked");
            if (d) {
                var b = this.inputs.eq(c.index());
                b.prop("checked", true).attr("aria-checked", true).change();
                this.updateToggler();
                if (this.cfg.multiple) {
                    this.createMultipleItem(c);
                    this.alignPanel()
                }
            }
            if (this.cfg.updateLabel) {
                this.updateLabel()
            }
        }
    },
    uncheck: function (e, d) {
        if (!e.hasClass("ui-state-disabled")) {
            var b = e.prev().children("input")
                    , c = e.closest("li.ui-selectcheckboxmenu-item");
            e.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
            e.closest("li.ui-selectcheckboxmenu-item").addClass("ui-selectcheckboxmenu-unchecked").removeClass("ui-selectcheckboxmenu-checked");
            b.prop("checked", false).attr("aria-checked", false);
            if (d) {
                var a = this.inputs.eq(c.index());
                a.prop("checked", false).attr("aria-checked", false).change();
                b.trigger("focus.selectCheckboxMenu");
                this.updateToggler();
                if (this.cfg.multiple) {
                    this.removeMultipleItem(c);
                    this.alignPanel()
                }
            }
            if (this.cfg.updateLabel) {
                this.updateLabel()
            }
        }
    },
    show: function () {
        this.alignPanel();
        this.keyboardTarget.attr("aria-expanded", true);
        this.panel.show();
        this.postShow()
    },
    hide: function (a) {
        var b = this;
        this.keyboardTarget.attr("aria-expanded", false);
        if (a) {
            this.panel.fadeOut("fast", function () {
                b.postHide()
            })
        } else {
            this.panel.hide();
            this.postHide()
        }
    },
    postShow: function () {
        if (this.cfg.onShow) {
            this.cfg.onShow.call(this)
        }
    },
    postHide: function () {
        if (this.cfg.onHide) {
            this.cfg.onHide.call(this)
        }
    },
    alignPanel: function () {
        var b = this.panel.css("position") == "fixed"
                , c = $(window)
                , a = b ? "-" + c.scrollLeft() + " -" + c.scrollTop() : null
                , d = this.panel.attr("style");
        this.panel.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        });
        if (this.panel.parent().attr("id") === this.id) {
            this.panel.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.panel.position({
                my: "left top",
                at: "left bottom",
                of: this.jq,
                offset: a
            })
        }
        if (!this.widthAligned && (this.panel.width() < this.jq.width()) && (!d || d.toLowerCase().indexOf("width") === -1)) {
            this.panel.width(this.jq.width());
            this.widthAligned = true
        }
    },
    toggleItem: function (a) {
        if (!a.hasClass("ui-state-disabled")) {
            if (a.hasClass("ui-state-active")) {
                this.uncheck(a, true);
                a.addClass("ui-state-hover")
            } else {
                this.check(a, true);
                a.removeClass("ui-state-hover")
            }
        }
    },
    updateToggler: function () {
        var a = this.itemContainer.children("li.ui-selectcheckboxmenu-item:visible");
        if (a.length && a.filter(".ui-selectcheckboxmenu-unchecked").length === 0) {
            this.check(this.togglerBox)
        } else {
            this.uncheck(this.togglerBox)
        }
    },
    bindCheckboxKeyEvents: function (a) {
        var b = this;
        a.on("focus.selectCheckboxMenu", function (f) {
            var c = $(this)
                    , d = c.parent().next();
            if (c.prop("checked")) {
                d.removeClass("ui-state-active")
            }
            d.addClass("ui-state-focus");
            PrimeFaces.scrollInView(b.itemContainerWrapper, d)
        }).on("blur.selectCheckboxMenu", function (f) {
            var c = $(this)
                    , d = c.parent().next();
            if (c.prop("checked")) {
                d.addClass("ui-state-active")
            }
            d.removeClass("ui-state-focus")
        }).on("keydown.selectCheckboxMenu", function (f) {
            var d = $.ui.keyCode
                    , c = f.which;
            if (c === d.SPACE) {
                f.preventDefault()
            } else {
                if (c === d.ESCAPE) {
                    b.hide()
                }
            }
        })
    },
    updateLabel: function () {
        var a = this.jq.find(":checked")
                , c = "";
        if (a && a.length) {
            for (var b = 0; b < a.length; b++) {
                if (b != 0) {
                    c = c + ","
                }
                c = c + $(a[b]).next().text()
            }
        } else {
            c = this.defaultLabel
        }
        this.label.text(c);
        this.labelContainer.attr("title", c)
    },
    createMultipleItem: function (g) {
        var c = this.multiItemContainer.children();
        if (c.length && c.filter('[data-item-value="' + g.data("item-value") + '"]').length > 0) {
            return
        }
        var b = this.inputs.eq(g.index())
                , h = b.data("escaped")
                , a = b.next().html().trim()
                , f = a.length
                , e = f > 0 && a !== "&nbsp;" ? (h ? b.next().text() : b.next().html()) : b.val()
                , d = '<li class="ui-selectcheckboxmenu-token ui-state-active ui-corner-all" data-item-value="' + b.val() + '">';
        d += '<span class="ui-selectcheckboxmenu-token-icon ui-icon ui-icon-close" />';
        d += '<span class="ui-selectcheckboxmenu-token-label">' + e + "</span></li>";
        this.multiItemContainer.append(d)
    },
    removeMultipleItem: function (b) {
        var a = this.multiItemContainer.children();
        if (a.length) {
            a.filter('[data-item-value="' + b.data("item-value") + '"]').remove()
        }
    }
});
PrimeFaces.widget.InputMask = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        if (this.cfg.mask) {
            this.jq.mask(this.cfg.mask, this.cfg)
        }
        PrimeFaces.skinInput(this.jq)
    },
    setValue: function (a) {
        this.jq.val(a);
        this.jq.unmask().mask(this.cfg.mask, this.cfg)
    },
    getValue: function () {
        return this.jq.val()
    }
});
PrimeFaces.widget.Password = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        if (!this.jq.is(":disabled")) {
            if (this.cfg.feedback) {
                this.setupFeedback()
            }
            PrimeFaces.skinInput(this.jq)
        }
    },
    setupFeedback: function () {
        var a = this;
        var d = $(this.jqId + "_panel");
        if (d.length == 1) {
            d.remove()
        }
        this.cfg.promptLabel = this.cfg.promptLabel || "Please enter a password";
        this.cfg.weakLabel = this.cfg.weakLabel || "Weak";
        this.cfg.goodLabel = this.cfg.goodLabel || "Medium";
        this.cfg.strongLabel = this.cfg.strongLabel || "Strong";
        var e = this.cfg.inline ? "ui-password-panel-inline" : "ui-password-panel-overlay";
        var c = '<div id="' + this.id + '_panel" class="ui-password-panel ui-widget ui-state-highlight ui-corner-all ui-helper-hidden ' + e + '">';
        c += '<div class="ui-password-meter" style="background-position:0pt 0pt">&nbsp;</div>';
        c += '<div class="ui-password-info">' + this.cfg.promptLabel + "</div>";
        c += "</div>";
        this.panel = $(c).insertAfter(this.jq);
        this.meter = this.panel.children("div.ui-password-meter");
        this.infoText = this.panel.children("div.ui-password-info");
        if (!this.cfg.inline) {
            this.panel.addClass("ui-shadow")
        }
        this.jq.focus(function () {
            a.show()
        }).blur(function () {
            a.hide()
        }).keyup(function () {
            var h = a.jq.val()
                    , f = null
                    , g = null;
            if (h.length == 0) {
                f = a.cfg.promptLabel;
                g = "0px 0px"
            } else {
                var i = a.testStrength(a.jq.val());
                if (i < 30) {
                    f = a.cfg.weakLabel;
                    g = "0px -10px"
                } else {
                    if (i >= 30 && i < 80) {
                        f = a.cfg.goodLabel;
                        g = "0px -20px"
                    } else {
                        if (i >= 80) {
                            f = a.cfg.strongLabel;
                            g = "0px -30px"
                        }
                    }
                }
            }
            a.meter.css("background-position", g);
            a.infoText.text(f)
        });
        if (!this.cfg.inline) {
            this.panel.appendTo("body");
            var b = "resize." + this.id;
            $(window).unbind(b).bind(b, function () {
                if (a.panel.is(":visible")) {
                    a.align()
                }
            })
        }
    },
    testStrength: function (d) {
        var b = 0
                , c = 0
                , a = this;
        c = d.match("[0-9]");
        b += a.normalize(c ? c.length : 1 / 4, 1) * 25;
        c = d.match("[a-zA-Z]");
        b += a.normalize(c ? c.length : 1 / 2, 3) * 10;
        c = d.match("[!@#$%^&*?_~.,;=]");
        b += a.normalize(c ? c.length : 1 / 6, 1) * 35;
        c = d.match("[A-Z]");
        b += a.normalize(c ? c.length : 1 / 6, 1) * 30;
        b *= d.length / 8;
        return b > 100 ? 100 : b
    },
    normalize: function (a, c) {
        var b = a - c;
        if (b <= 0) {
            return a / c
        } else {
            return 1 + 0.5 * (a / (a + c / 4))
        }
    },
    align: function () {
        this.panel.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        }).position({
            my: "left top",
            at: "right top",
            of: this.jq
        })
    },
    show: function () {
        if (!this.cfg.inline) {
            this.align();
            this.panel.fadeIn()
        } else {
            this.panel.slideDown()
        }
    },
    hide: function () {
        if (this.cfg.inline) {
            this.panel.slideUp()
        } else {
            this.panel.fadeOut()
        }
    }
});
PrimeFaces.widget.DefaultCommand = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jqTarget = $(PrimeFaces.escapeClientId(this.cfg.target));
        this.scope = this.cfg.scope ? $(PrimeFaces.escapeClientId(this.cfg.scope)) : null;
        var b = this;
        if (this.jqTarget.is(":not(:button):not(:input):not(a)")) {
            this.jqTarget = this.jqTarget.find("button,a").filter(":visible").first()
        }
        this.jqTarget.closest("form").off("keydown." + this.id).on("keydown." + this.id, function (d) {
            var c = $.ui.keyCode;
            if (d.which == c.ENTER || d.which == c.NUMPAD_ENTER) {
                if ((b.scope && b.scope.find(d.target).length == 0) || $(d.target).is('textarea,button,input[type="submit"],a')) {
                    return true
                }
                b.jqTarget.click();
                d.preventDefault()
            }
        });
        this.removeScriptElement(this.id)
    }
});
PrimeFaces.widget.SplitButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.button = $(this.jqId + "_button");
        this.menuButton = $(this.jqId + "_menuButton");
        this.menuId = this.jqId + "_menu";
        this.menu = $(this.menuId);
        this.menuitems = this.menu.find(".ui-menuitem:not(.ui-state-disabled)");
        this.cfg.disabled = this.button.is(":disabled");
        if (!this.cfg.disabled) {
            this.bindEvents();
            this.appendPanel()
        }
        this.button.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.menuButton.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    refresh: function (a) {
        this.menu.remove();
        this.init(a)
    },
    destroy: function () {
        this._super();
        this.menu.remove()
    },
    bindEvents: function () {
        var c = this;
        PrimeFaces.skinButton(this.button).skinButton(this.menuButton);
        this.button.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
        this.menuButton.click(function () {
            if (c.menu.is(":hidden")) {
                c.show()
            } else {
                c.hide()
            }
        });
        this.menuitems.mouseover(function (g) {
            var f = $(this)
                    , d = f.children(".ui-menuitem-link");
            if (!d.hasClass("ui-state-disabled")) {
                f.addClass("ui-state-hover")
            }
        }).mouseout(function (d) {
            $(this).removeClass("ui-state-hover")
        }).click(function () {
            c.hide()
        });
        this.menuButton.keydown(function (h) {
            var g = $.ui.keyCode;
            switch (h.which) {
                case g.UP:
                    var f = c.menuitems.filter(".ui-state-hover")
                            , d = f.length ? f.prevAll(":not(.ui-separator)") : null;
                    if (d && d.length) {
                        f.removeClass("ui-state-hover");
                        d.eq(0).addClass("ui-state-hover")
                    }
                    h.preventDefault();
                    break;
                case g.DOWN:
                    var f = c.menuitems.filter(".ui-state-hover")
                            , i = f.length ? f.nextAll(":not(.ui-separator)") : c.menuitems.eq(0);
                    if (i.length) {
                        f.removeClass("ui-state-hover");
                        i.eq(0).addClass("ui-state-hover")
                    }
                    h.preventDefault();
                    break;
                case g.ENTER:
                case g.NUMPAD_ENTER:
                case g.SPACE:
                    if (c.menu.is(":visible")) {
                        c.menuitems.filter(".ui-state-hover").children("a").trigger("click")
                    } else {
                        c.show()
                    }
                    h.preventDefault();
                    break;
                case g.ESCAPE:
                case g.TAB:
                    c.hide();
                    break
            }
        });
        var b = "mousedown." + this.id;
        $(document.body).off(b).on(b, function (f) {
            if (c.menu.is(":hidden")) {
                return
            }
            var d = $(f.target);
            if (d.is(c.button) || c.button.has(d).length > 0) {
                return
            }
            var g = c.menu.offset();
            if (f.pageX < g.left || f.pageX > g.left + c.menu.width() || f.pageY < g.top || f.pageY > g.top + c.menu.height()) {
                c.button.removeClass("ui-state-focus ui-state-hover");
                c.hide()
            }
        });
        var a = "resize." + this.id;
        $(window).off(a).on(a, function () {
            if (c.menu.is(":visible")) {
                c.alignPanel()
            }
        })
    },
    appendPanel: function () {
        var a = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!a.is(this.jq)) {
            a.children(this.menuId).remove();
            this.menu.appendTo(a)
        }
    },
    show: function () {
        this.alignPanel();
        this.menuButton.focus();
        this.menu.show()
    },
    hide: function () {
        this.menuitems.filter(".ui-state-hover").removeClass("ui-state-hover");
        this.menuButton.removeClass("ui-state-focus");
        this.menu.fadeOut("fast")
    },
    alignPanel: function () {
        this.menu.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        });
        if (this.menu.parent().is(this.jq)) {
            this.menu.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.menu.position({
                my: "left top",
                at: "left bottom",
                of: this.button
            })
        }
    }
});
PrimeFaces.widget.ThemeSwitcher = PrimeFaces.widget.SelectOneMenu.extend({
    init: function (a) {
        this._super(a);
        var b = this;
        this.input.on("change", function () {
            PrimeFaces.changeTheme(b.getSelectedValue())
        })
    }
});
PrimeFaces.widget.MultiSelectListbox = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.root = this.jq.children("div.ui-multiselectlistbox-listcontainer");
        this.items = this.jq.find("li.ui-multiselectlistbox-item");
        this.input = $(this.jqId + "_input");
        this.cfg.disabled = this.jq.hasClass("ui-state-disabled");
        if (!this.cfg.disabled) {
            this.bindEvents()
        }
        var b = this.input.val();
        if (b !== "") {
            this.preselect(b)
        }
    },
    bindEvents: function () {
        var a = this;
        this.items.on("mouseover.multiSelectListbox", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).addClass("ui-state-hover")
            }
        }).on("mouseout.multiSelectListbox", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).removeClass("ui-state-hover")
            }
        }).on("click.multiSelectListbox", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                a.showOptionGroup(b)
            }
        })
    },
    unbindEvents: function () {
        this.items.off("mouseover.multiSelectListbox mouseout.multiSelectListbox click.multiSelectListbox")
    },
    showOptionGroup: function (b) {
        b.addClass("ui-state-highlight").removeClass("ui-state-hover").siblings().filter(".ui-state-highlight").removeClass("ui-state-highlight");
        b.closest(".ui-multiselectlistbox-listcontainer").nextAll().remove();
        this.input.val(b.attr("data-value"));
        var a = b.children("ul");
        if (a.length) {
            var c = $('<div class="ui-multiselectlistbox-listcontainer" style="display:none"></div>');
            a.clone(true).appendTo(c).addClass("ui-multiselectlistbox-list ui-inputfield ui-widget-content").removeClass("ui-helper-hidden");
            if (this.cfg.showHeaders) {
                c.prepend('<div class="ui-multiselectlistbox-header ui-widget-header ui-corner-top">' + b.children("span").text() + "</div>").children(".ui-multiselectlistbox-list").addClass("ui-corner-bottom")
            } else {
                c.children().addClass("ui-corner-all")
            }
            this.jq.append(c);
            if (this.cfg.effect) {
                c.show(this.cfg.effect)
            } else {
                c.show()
            }
        }
    },
    enable: function () {
        if (this.cfg.disabled) {
            this.cfg.disabled = false;
            this.jq.removeClass("ui-state-disabled");
            this.bindEvents()
        }
    },
    disable: function () {
        if (!this.cfg.disabled) {
            this.cfg.disabled = true;
            this.jq.addClass("ui-state-disabled");
            this.unbindEvents();
            this.root.nextAll().remove()
        }
    },
    preselect: function (g) {
        var d = this
                , j = this.items.filter('[data-value="' + g + '"]');
        if (j.length === 0) {
            return
        }
        var k = j.parentsUntil(".ui-multiselectlistbox-list")
                , f = [];
        for (var a = (k.length - 1); a >= 0; a--) {
            var b = k.eq(a);
            if (b.is("li")) {
                f.push(b.index())
            } else {
                if (b.is("ul")) {
                    var e = $('<div class="ui-multiselectlistbox-listcontainer" style="display:none"></div>');
                    b.clone(true).appendTo(e).addClass("ui-multiselectlistbox-list ui-inputfield ui-widget-content ui-corner-all").removeClass("ui-helper-hidden");
                    if (this.cfg.showHeaders) {
                        e.prepend('<div class="ui-multiselectlistbox-header ui-widget-header ui-corner-top">' + b.prev("span").text() + "</div>").children(".ui-multiselectlistbox-list").addClass("ui-corner-bottom").removeClass("ui-corner-all")
                    }
                    d.jq.append(e)
                }
            }
        }
        var h = this.jq.children("div.ui-multiselectlistbox-listcontainer")
                , c = h.find(" > ul.ui-multiselectlistbox-list > li.ui-multiselectlistbox-item").filter('[data-value="' + g + '"]');
        c.addClass("ui-state-highlight");
        for (var a = 0; a < f.length; a++) {
            h.eq(a).find("> .ui-multiselectlistbox-list > li.ui-multiselectlistbox-item").eq(f[a]).addClass("ui-state-highlight")
        }
        d.jq.children("div.ui-multiselectlistbox-listcontainer:hidden").show()
    }
});
PrimeFaces.widget.Growl = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.render();
        this.removeScriptElement(this.id)
    },
    refresh: function (a) {
        this.cfg = a;
        this.show(a.msgs);
        this.removeScriptElement(this.id)
    },
    show: function (b) {
        var a = this;
        this.jq.css("z-index", ++PrimeFaces.zindex);
        this.removeAll();
        $.each(b, function (c, d) {
            a.renderMessage(d)
        })
    },
    removeAll: function () {
        this.jq.children("div.ui-growl-item-container").remove()
    },
    render: function () {
        this.jq = $('<div id="' + this.id + '_container" class="ui-growl ui-widget"></div>');
        this.jq.appendTo($(document.body));
        this.show(this.cfg.msgs)
    },
    renderMessage: function (e) {
        var a = '<div class="ui-growl-item-container ui-state-highlight ui-corner-all ui-helper-hidden ui-shadow ui-growl-' + e.severity + '" aria-live="polite">';
        a += '<div class="ui-growl-item">';
        a += '<div class="ui-growl-icon-close ui-icon ui-icon-closethick" style="display:none"></div>';
        a += '<span class="ui-growl-image ui-growl-image-' + e.severity + '" />';
        a += '<div class="ui-growl-message">';
        a += '<span class="ui-growl-title"></span>';
        a += "<p></p>";
        a += '</div><div style="clear: both;"></div></div></div>';
        var c = $(a)
                , b = c.find("span.ui-growl-title")
                , d = b.next();
        if (this.cfg.escape) {
            b.text(e.summary);
            d.text(e.detail)
        } else {
            b.html(e.summary);
            d.html(e.detail)
        }
        this.bindEvents(c);
        c.appendTo(this.jq).fadeIn()
    },
    bindEvents: function (b) {
        var a = this
                , c = this.cfg.sticky;
        b.mouseover(function () {
            var d = $(this);
            if (!d.is(":animated")) {
                d.find("div.ui-growl-icon-close:first").show()
            }
        }).mouseout(function () {
            $(this).find("div.ui-growl-icon-close:first").hide()
        });
        b.find("div.ui-growl-icon-close").click(function () {
            a.removeMessage(b);
            if (!c) {
                clearTimeout(b.data("timeout"))
            }
        });
        if (!c) {
            this.setRemovalTimeout(b)
        }
    },
    removeMessage: function (a) {
        a.fadeTo("normal", 0, function () {
            a.slideUp("normal", "easeInOutCirc", function () {
                a.remove()
            })
        })
    },
    setRemovalTimeout: function (b) {
        var a = this;
        var c = setTimeout(function () {
            a.removeMessage(b)
        }, this.cfg.life);
        b.data("timeout", c)
    }
});
PrimeFaces.widget.Inplace = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.display = $(this.jqId + "_display");
        this.content = $(this.jqId + "_content");
        this.cfg.formId = this.jq.parents("form:first").attr("id");
        var c = this;
        if (!this.cfg.disabled) {
            if (this.cfg.toggleable) {
                this.display.bind(this.cfg.event, function () {
                    c.show()
                });
                this.display.mouseover(function () {
                    $(this).toggleClass("ui-state-highlight")
                }).mouseout(function () {
                    $(this).toggleClass("ui-state-highlight")
                })
            } else {
                this.display.css("cursor", "default")
            }
            if (this.cfg.editor) {
                this.cfg.formId = $(this.jqId).parents("form:first").attr("id");
                this.editor = $(this.jqId + "_editor");
                var b = this.editor.children(".ui-inplace-save")
                        , d = this.editor.children(".ui-inplace-cancel");
                PrimeFaces.skinButton(b).skinButton(d);
                b.click(function (f) {
                    c.save(f)
                });
                d.click(function (f) {
                    c.cancel(f)
                })
            }
            this.content.find("input:text,textarea").on("keydown.inplace-text", function (g) {
                var f = $.ui.keyCode;
                if (g.which === f.SPACE) {
                    g.stopPropagation()
                }
            })
        }
    },
    show: function () {
        this.toggle(this.content, this.display)
    },
    hide: function () {
        this.toggle(this.display, this.content)
    },
    toggle: function (a, b) {
        var c = this;
        if (this.cfg.effect === "fade") {
            b.fadeOut(this.cfg.effectSpeed, function () {
                a.fadeIn(c.cfg.effectSpeed);
                c.postShow()
            })
        } else {
            if (this.cfg.effect === "slide") {
                b.slideUp(this.cfg.effectSpeed, function () {
                    a.slideDown(c.cfg.effectSpeed);
                    c.postShow()
                })
            } else {
                if (this.cfg.effect === "none") {
                    b.hide();
                    a.show();
                    c.postShow()
                }
            }
        }
    },
    postShow: function () {
        this.content.find("input:text,textarea").filter(":visible:enabled:first").focus().select();
        PrimeFaces.invokeDeferredRenders(this.id)
    },
    getDisplay: function () {
        return this.display
    },
    getContent: function () {
        return this.content
    },
    save: function (c) {
        var a = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };
        if (this.hasBehavior("save")) {
            var b = this.cfg.behaviors.save;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.AjaxRequest(a)
        }
    },
    cancel: function (c) {
        var a = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId
        };
        a.params = [{
                name: this.id + "_cancel",
                value: true
            }];
        if (this.hasBehavior("cancel")) {
            var b = this.cfg.behaviors.cancel;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.AjaxRequest(a)
        }
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    }
});
PrimeFaces.widget.LightBox = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.links = this.jq.children(":not(.ui-lightbox-inline)");
        this.createPanel();
        if (this.cfg.mode === "image") {
            this.setupImaging()
        } else {
            if (this.cfg.mode === "inline") {
                this.setupInline()
            } else {
                if (this.cfg.mode === "iframe") {
                    this.setupIframe()
                }
            }
        }
        this.bindCommonEvents();
        if (this.cfg.visible) {
            this.links.eq(0).click()
        }
        this.panel.data("widget", this);
        this.links.data("primefaces-lightbox-trigger", true).find("*").data("primefaces-lightbox-trigger", true)
    },
    refresh: function (a) {
        $(PrimeFaces.escapeClientId(a.id) + "_panel").remove();
        this.init(a)
    },
    destroy: function () {
        this.panel.remove()
    },
    createPanel: function () {
        var a = '<div id="' + this.id + '_panel" class="ui-lightbox ui-widget ui-helper-hidden ui-corner-all ui-shadow">';
        a += '<div class="ui-lightbox-content-wrapper">';
        a += '<a class="ui-state-default ui-lightbox-nav-left ui-corner-right ui-helper-hidden"><span class="ui-icon ui-icon-carat-1-w">go</span></a>';
        a += '<div class="ui-lightbox-content ui-corner-all"></div>';
        a += '<a class="ui-state-default ui-lightbox-nav-right ui-corner-left ui-helper-hidden"><span class="ui-icon ui-icon-carat-1-e">go</span></a>';
        a += "</div>";
        a += '<div class="ui-lightbox-caption ui-widget-header"><span class="ui-lightbox-caption-text"></span>';
        a += '<a class="ui-lightbox-close ui-corner-all" href="#"><span class="ui-icon ui-icon-closethick"></span></a><div style="clear:both" /></div>';
        a += "</div>";
        $(document.body).append(a);
        this.panel = $(this.jqId + "_panel");
        this.contentWrapper = this.panel.children(".ui-lightbox-content-wrapper");
        this.content = this.contentWrapper.children(".ui-lightbox-content");
        this.caption = this.panel.children(".ui-lightbox-caption");
        this.captionText = this.caption.children(".ui-lightbox-caption-text");
        this.closeIcon = this.caption.children(".ui-lightbox-close");
        this.closeIcon.data("primefaces-lightbox-trigger", true).find("*").data("primefaces-lightbox-trigger", true)
    },
    setupImaging: function () {
        var a = this;
        this.content.append('<img class="ui-helper-hidden"></img>');
        this.imageDisplay = this.content.children("img");
        this.navigators = this.contentWrapper.children("a");
        this.imageDisplay.load(function () {
            var d = $(this);
            a.scaleImage(d);
            var c = (a.panel.width() - d.width()) / 2
                    , b = (a.panel.height() - d.height()) / 2;
            a.content.removeClass("ui-lightbox-loading").animate({
                width: d.width(),
                height: d.height()
            }, 500, function () {
                d.fadeIn();
                a.showNavigators();
                a.caption.slideDown()
            });
            a.panel.animate({
                left: "+=" + c,
                top: "+=" + b
            }, 500)
        });
        this.navigators.mouseover(function () {
            $(this).addClass("ui-state-hover")
        }).mouseout(function () {
            $(this).removeClass("ui-state-hover")
        }).click(function (c) {
            var d = $(this);
            a.hideNavigators();
            if (d.hasClass("ui-lightbox-nav-left")) {
                var b = a.current == 0 ? a.links.length - 1 : a.current - 1;
                a.links.eq(b).trigger("click")
            } else {
                var b = a.current == a.links.length - 1 ? 0 : a.current + 1;
                a.links.eq(b).trigger("click")
            }
            c.preventDefault()
        });
        this.links.click(function (c) {
            var b = $(this);
            if (a.isHidden()) {
                a.content.addClass("ui-lightbox-loading").width(32).height(32);
                a.show()
            } else {
                a.imageDisplay.fadeOut(function () {
                    $(this).css({
                        width: "auto",
                        height: "auto"
                    });
                    a.content.addClass("ui-lightbox-loading")
                });
                a.caption.slideUp()
            }
            setTimeout(function () {
                a.imageDisplay.attr("src", b.attr("href"));
                a.current = b.index();
                var d = b.attr("title");
                if (d) {
                    a.captionText.html(d)
                }
            }, 1000);
            c.preventDefault()
        })
    },
    scaleImage: function (g) {
        var f = $(window)
                , c = f.width()
                , b = f.height()
                , d = g.width()
                , a = g.height()
                , e = a / d;
        if (d >= c && e <= 1) {
            d = c * 0.75;
            a = d * e
        } else {
            if (a >= b) {
                a = b * 0.75;
                d = a / e
            }
        }
        g.css({
            width: d + "px",
            height: a + "px"
        })
    },
    setupInline: function () {
        this.inline = this.jq.children(".ui-lightbox-inline");
        this.inline.appendTo(this.content).show();
        var a = this;
        this.links.click(function (b) {
            a.show();
            var c = $(this).attr("title");
            if (c) {
                a.captionText.html(c);
                a.caption.slideDown()
            }
            b.preventDefault()
        })
    },
    setupIframe: function () {
        var a = this;
        this.iframeLoaded = false;
        this.cfg.width = this.cfg.width || "640px";
        this.cfg.height = this.cfg.height || "480px";
        this.iframe = $('<iframe frameborder="0" style="width:' + this.cfg.width + ";height:" + this.cfg.height + ';border:0 none; display: block;"></iframe>').appendTo(this.content);
        if (this.cfg.iframeTitle) {
            this.iframe.attr("title", this.cfg.iframeTitle)
        }
        this.links.click(function (b) {
            if (!a.iframeLoaded) {
                a.content.addClass("ui-lightbox-loading").css({
                    width: a.cfg.width,
                    height: a.cfg.height
                });
                a.show();
                a.iframe.on("load", function () {
                    a.iframeLoaded = true;
                    a.content.removeClass("ui-lightbox-loading")
                }).attr("src", a.links.eq(0).attr("href"))
            } else {
                a.show()
            }
            var c = a.links.eq(0).attr("title");
            if (c) {
                a.captionText.text(c);
                a.caption.slideDown()
            }
            b.preventDefault()
        })
    },
    bindCommonEvents: function () {
        var c = this
                , b = PrimeFaces.env.ios ? "touchstart." + this.id : "click." + this.id
                , a = "resize." + this.id;
        this.closeIcon.mouseover(function () {
            $(this).addClass("ui-state-hover")
        }).mouseout(function () {
            $(this).removeClass("ui-state-hover")
        });
        this.closeIcon.click(function (d) {
            c.hide();
            d.preventDefault()
        });
        $(document.body).off(b).on(b, function (h) {
            if (c.isHidden()) {
                return
            }
            var g = $(h.target);
            if (g.data("primefaces-lightbox-trigger")) {
                return
            }
            var i = c.panel.offset(), f, d;
            if (h.originalEvent && h.originalEvent.touches) {
                f = h.originalEvent.touches[0].pageX;
                d = h.originalEvent.touches[0].pageY
            } else {
                f = h.pageX;
                d = h.pageY
            }
            if (f < i.left || f > i.left + c.panel.width() || d < i.top || d > i.top + c.panel.height()) {
                h.preventDefault();
                c.hide()
            }
        });
        $(window).off(a).on(a, function () {
            if (!c.isHidden()) {
                $(document.body).children(".ui-widget-overlay").css({
                    width: $(document).width(),
                    height: $(document).height()
                })
            }
        })
    },
    show: function () {
        this.center();
        this.panel.css("z-index", ++PrimeFaces.zindex).show();
        if (!this.isModalActive()) {
            this.enableModality()
        }
        if (this.cfg.onShow) {
            this.cfg.onShow.call(this)
        }
    },
    hide: function () {
        this.panel.fadeOut();
        this.disableModality();
        this.caption.hide();
        if (this.cfg.mode == "image") {
            this.imageDisplay.hide().attr("src", "").removeAttr("style");
            this.hideNavigators()
        }
        if (this.cfg.onHide) {
            this.cfg.onHide.call(this)
        }
    },
    center: function () {
        var c = $(window)
                , b = (c.width() / 2) - (this.panel.width() / 2)
                , a = (c.height() / 2) - (this.panel.height() / 2);
        this.panel.css({
            left: b,
            top: a
        })
    },
    enableModality: function () {
        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay"></div>').children(this.jqId + "_modal").css({
            width: $(document).width(),
            height: $(document).height(),
            "z-index": this.panel.css("z-index") - 1
        })
    },
    disableModality: function () {
        $(document.body).children(this.jqId + "_modal").remove()
    },
    isModalActive: function () {
        return $(document.body).children(this.jqId + "_modal").length === 1
    },
    showNavigators: function () {
        this.navigators.zIndex(this.imageDisplay.zIndex() + 1).show()
    },
    hideNavigators: function () {
        this.navigators.hide()
    },
    addOnshowHandler: function (a) {
        this.onshowHandlers.push(a)
    },
    isHidden: function () {
        return this.panel.is(":hidden")
    },
    showURL: function (a) {
        if (a.width) {
            this.iframe.attr("width", a.width)
        }
        if (a.height) {
            this.iframe.attr("height", a.height)
        }
        this.iframe.attr("src", a.src);
        this.captionText.text(a.title || "");
        this.caption.slideDown();
        this.show()
    }
});
PrimeFaces.widget.Menu = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        if (this.cfg.overlay) {
            this.initOverlay()
        }
        this.keyboardTarget = this.jq.children(".ui-helper-hidden-accessible")
    },
    initOverlay: function () {
        var d = this;
        this.trigger = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.trigger);
        this.trigger.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
        if (this.jq.length > 1) {
            $(document.body).children(this.jqId).remove();
            this.jq = $(this.jqId);
            this.jq.appendTo(document.body)
        } else {
            if (this.jq.parent().is(":not(body)")) {
                this.jq.appendTo(document.body)
            }
        }
        this.cfg.pos = {
            my: this.cfg.my,
            at: this.cfg.at,
            of: this.trigger
        };
        this.trigger.bind(this.cfg.triggerEvent + ".ui-menu", function (g) {
            var f = $(this);
            if (d.jq.is(":visible")) {
                d.hide()
            } else {
                d.show();
                if (f.is(":button")) {
                    f.addClass("ui-state-focus")
                }
                g.preventDefault()
            }
        });
        this.itemMouseDown = false;
        var c = "mousedown." + this.id;
        $(document.body).off(c).on(c, function (g) {
            if (d.jq.is(":hidden")) {
                return
            }
            var f = $(g.target);
            if (f.is(d.trigger.get(0)) || d.trigger.has(f).length > 0) {
                return
            }
            var h = d.jq.offset();
            if (g.pageX < h.left || g.pageX > h.left + d.jq.width() || g.pageY < h.top || g.pageY > h.top + d.jq.height()) {
                if (f.is(".ui-menuitem-link") || f.closest(".ui-menuitem-link").length) {
                    d.itemMouseDown = true
                } else {
                    d.hide(g)
                }
            }
        });
        var a = "mouseup." + this.id;
        $(document.body).off(a).on(a, function (f) {
            if (d.itemMouseDown) {
                d.hide(f);
                d.itemMouseDown = false
            }
        });
        var b = "resize." + this.id;
        $(window).off(b).on(b, function () {
            if (d.jq.is(":visible")) {
                d.align()
            }
        });
        this.setupDialogSupport()
    },
    setupDialogSupport: function () {
        var a = this.trigger.parents(".ui-dialog:first");
        if (a.length == 1) {
            this.jq.css("position", "fixed")
        }
    },
    show: function () {
        this.align();
        this.jq.css("z-index", ++PrimeFaces.zindex).show()
    },
    hide: function () {
        this.jq.fadeOut("fast");
        if (this.trigger && this.trigger.is(":button")) {
            this.trigger.removeClass("ui-state-focus")
        }
    },
    align: function () {
        var b = this.jq.css("position") == "fixed"
                , c = $(window)
                , a = b ? "-" + c.scrollLeft() + " -" + c.scrollTop() : null;
        this.cfg.pos.offset = a;
        this.jq.css({
            left: "",
            top: ""
        }).position(this.cfg.pos)
    }
});
PrimeFaces.widget.TieredMenu = PrimeFaces.widget.Menu.extend({
    init: function (a) {
        this._super(a);
        this.cfg.toggleEvent = this.cfg.toggleEvent || "hover";
        this.links = this.jq.find("a.ui-menuitem-link:not(.ui-state-disabled)");
        this.rootLinks = this.jq.find("> ul.ui-menu-list > .ui-menuitem > .ui-menuitem-link");
        this.bindEvents()
    },
    bindEvents: function () {
        this.bindItemEvents();
        this.bindKeyEvents();
        this.bindDocumentHandler()
    },
    bindItemEvents: function () {
        if (this.cfg.toggleEvent === "hover") {
            this.bindHoverModeEvents()
        } else {
            if (this.cfg.toggleEvent === "click") {
                this.bindClickModeEvents()
            }
        }
    },
    bindHoverModeEvents: function () {
        var a = this;
        this.links.mouseenter(function () {
            var b = $(this)
                    , c = b.parent();
            var d = c.siblings(".ui-menuitem-active");
            if (d.length === 1) {
                d.find("li.ui-menuitem-active").each(function () {
                    a.deactivate($(this))
                });
                a.deactivate(d)
            }
            if (a.cfg.autoDisplay || a.active) {
                if (c.hasClass("ui-menuitem-active")) {
                    a.reactivate(c)
                } else {
                    a.activate(c)
                }
            } else {
                a.highlight(c)
            }
        });
        this.rootLinks.click(function (f) {
            var c = $(this)
                    , d = c.parent()
                    , b = d.children("ul.ui-menu-child");
            a.itemClick = true;
            if (b.length === 1) {
                if (b.is(":visible")) {
                    a.active = false;
                    a.deactivate(d)
                } else {
                    a.active = true;
                    a.highlight(d);
                    a.showSubmenu(d, b)
                }
            }
        });
        this.links.filter(".ui-submenu-link").click(function (b) {
            a.itemClick = true;
            b.preventDefault()
        });
        this.jq.find("ul.ui-menu-list").mouseleave(function (b) {
            if (a.activeitem) {
                a.deactivate(a.activeitem)
            }
            b.stopPropagation()
        })
    },
    bindClickModeEvents: function () {
        var a = this;
        this.links.mouseenter(function () {
            var b = $(this).parent();
            if (!b.hasClass("ui-menuitem-active")) {
                b.addClass("ui-menuitem-highlight").children("a.ui-menuitem-link").addClass("ui-state-hover")
            }
        }).mouseleave(function () {
            var b = $(this).parent();
            if (!b.hasClass("ui-menuitem-active")) {
                b.removeClass("ui-menuitem-highlight").children("a.ui-menuitem-link").removeClass("ui-state-hover")
            }
        });
        this.links.filter(".ui-submenu-link").on("click.tieredMenu", function (f) {
            var c = $(this)
                    , d = c.parent()
                    , b = d.children("ul.ui-menu-child");
            a.itemClick = true;
            var g = d.siblings(".ui-menuitem-active");
            if (g.length) {
                g.find("li.ui-menuitem-active").each(function () {
                    a.deactivate($(this))
                });
                a.deactivate(g)
            }
            if (b.length) {
                if (b.is(":visible")) {
                    a.deactivate(d);
                    d.addClass("ui-menuitem-highlight").children("a.ui-menuitem-link").addClass("ui-state-hover")
                } else {
                    d.addClass("ui-menuitem-active").children("a.ui-menuitem-link").removeClass("ui-state-hover").addClass("ui-state-active");
                    a.showSubmenu(d, b)
                }
            }
            f.preventDefault()
        })
    },
    bindKeyEvents: function () {},
    bindDocumentHandler: function () {
        var b = this
                , a = "click." + this.id;
        $(document.body).off(a).on(a, function (c) {
            if (b.itemClick) {
                b.itemClick = false;
                return
            }
            b.reset()
        })
    },
    deactivate: function (b, a) {
        this.activeitem = null;
        b.children("a.ui-menuitem-link").removeClass("ui-state-hover ui-state-active");
        b.removeClass("ui-menuitem-active ui-menuitem-highlight");
        if (a) {
            b.children("ul.ui-menu-child").fadeOut("fast")
        } else {
            b.children("ul.ui-menu-child").hide()
        }
    },
    activate: function (b) {
        this.highlight(b);
        var a = b.children("ul.ui-menu-child");
        if (a.length == 1) {
            this.showSubmenu(b, a)
        }
    },
    reactivate: function (d) {
        this.activeitem = d;
        var c = d.children("ul.ui-menu-child")
                , b = c.children("li.ui-menuitem-active:first")
                , a = this;
        if (b.length == 1) {
            a.deactivate(b)
        }
    },
    highlight: function (a) {
        this.activeitem = a;
        a.children("a.ui-menuitem-link").addClass("ui-state-hover");
        a.addClass("ui-menuitem-active")
    },
    showSubmenu: function (b, a) {
        var c = {
            my: "left top",
            at: "right top",
            of: b,
            collision: "flipfit"
        };
        a.css("z-index", ++PrimeFaces.zindex).show().position(c)
    },
    reset: function () {
        var a = this;
        this.active = false;
        this.jq.find("li.ui-menuitem-active").each(function () {
            a.deactivate($(this), true)
        })
    }
});
PrimeFaces.widget.Menubar = PrimeFaces.widget.TieredMenu.extend({
    showSubmenu: function (b, a) {
        var c = null;
        if (b.parent().hasClass("ui-menu-child")) {
            c = {
                my: "left top",
                at: "right top",
                of: b,
                collision: "flipfit"
            }
        } else {
            c = {
                my: "left top",
                at: "left bottom",
                of: b,
                collision: "flipfit"
            }
        }
        a.css("z-index", ++PrimeFaces.zindex).show().position(c)
    },
    bindKeyEvents: function () {
        var a = this;
        this.keyboardTarget.on("focus.menubar", function (b) {
            a.highlight(a.links.eq(0).parent())
        }).on("blur.menubar", function () {
            a.reset()
        }).on("keydown.menu", function (j) {
            var h = a.activeitem;
            if (!h) {
                return
            }
            var g = !h.closest("ul").hasClass("ui-menu-child")
                    , l = $.ui.keyCode;
            switch (j.which) {
                case l.LEFT:
                    if (g) {
                        var k = h.prevAll(".ui-menuitem:not(.ui-menubar-options):first");
                        if (k.length) {
                            a.deactivate(h);
                            a.highlight(k)
                        }
                        j.preventDefault()
                    } else {
                        if (h.hasClass("ui-menu-parent") && h.children(".ui-menu-child").is(":visible")) {
                            a.deactivate(h);
                            a.highlight(h)
                        } else {
                            var f = h.parent().parent();
                            a.deactivate(h);
                            a.deactivate(f);
                            a.highlight(f)
                        }
                    }
                    break;
                case l.RIGHT:
                    if (g) {
                        var c = h.nextAll(".ui-menuitem:not(.ui-menubar-options):first");
                        if (c.length) {
                            a.deactivate(h);
                            a.highlight(c)
                        }
                        j.preventDefault()
                    } else {
                        if (h.hasClass("ui-menu-parent")) {
                            var b = h.children(".ui-menu-child");
                            if (b.is(":visible")) {
                                a.highlight(b.children(".ui-menuitem:first"))
                            } else {
                                a.activate(h)
                            }
                        }
                    }
                    break;
                case l.UP:
                    if (!g) {
                        var k = h.prev(".ui-menuitem");
                        if (k.length) {
                            a.deactivate(h);
                            a.highlight(k)
                        }
                    }
                    j.preventDefault();
                    break;
                case l.DOWN:
                    if (g) {
                        var b = h.children("ul.ui-menu-child");
                        if (b.is(":visible")) {
                            a.highlight(b.children(".ui-menuitem:first"))
                        } else {
                            a.activate(h)
                        }
                    } else {
                        var c = h.next(".ui-menuitem");
                        if (c.length) {
                            a.deactivate(h);
                            a.highlight(c)
                        }
                    }
                    j.preventDefault();
                    break;
                case l.ENTER:
                case l.NUMPAD_ENTER:
                    var i = h.children(".ui-menuitem-link");
                    i.trigger("click");
                    a.jq.blur();
                    var d = i.attr("href");
                    if (d && d !== "#") {
                        window.location.href = d
                    }
                    j.preventDefault();
                    break
            }
        })
    }
});
PrimeFaces.widget.SlideMenu = PrimeFaces.widget.Menu.extend({
    init: function (b) {
        this._super(b);
        this.submenus = this.jq.find("ul.ui-menu-list");
        this.wrapper = this.jq.children("div.ui-slidemenu-wrapper");
        this.content = this.wrapper.children("div.ui-slidemenu-content");
        this.rootList = this.content.children("ul.ui-menu-list");
        this.links = this.jq.find("a.ui-menuitem-link:not(.ui-state-disabled)");
        this.backward = this.wrapper.children("div.ui-slidemenu-backward");
        this.rendered = false;
        this.stack = [];
        this.jqWidth = this.jq.width();
        if (!this.jq.hasClass("ui-menu-dynamic")) {
            if (this.jq.is(":not(:visible)")) {
                var a = this.jq.closest(".ui-hidden-container")
                        , c = this;
                if (a.length) {
                    PrimeFaces.addDeferredRender(this.id, a.attr("id"), function () {
                        return c.render()
                    })
                }
            } else {
                this.render()
            }
        }
        this.bindEvents()
    },
    bindEvents: function () {
        var a = this;
        this.links.mouseenter(function () {
            $(this).addClass("ui-state-hover")
        }).mouseleave(function () {
            $(this).removeClass("ui-state-hover")
        }).click(function (d) {
            var c = $(this)
                    , b = c.next();
            if (b.length) {
                a.forward(b);
                d.preventDefault()
            }
        });
        this.backward.click(function () {
            a.back()
        })
    },
    forward: function (c) {
        var a = this;
        this.push(c);
        var b = -1 * (this.depth() * this.jqWidth);
        c.show().css({
            left: this.jqWidth
        });
        this.rootList.animate({
            left: b
        }, 500, "easeInOutCirc", function () {
            if (a.backward.is(":hidden")) {
                a.backward.fadeIn("fast")
            }
        })
    },
    back: function () {
        if (!this.rootList.is(":animated")) {
            var a = this
                    , c = this.pop()
                    , d = this.depth();
            var b = -1 * (d * this.jqWidth);
            this.rootList.animate({
                left: b
            }, 500, "easeInOutCirc", function () {
                if (c) {
                    c.hide()
                }
                if (d == 0) {
                    a.backward.fadeOut("fast")
                }
            })
        }
    },
    push: function (a) {
        this.stack.push(a)
    },
    pop: function () {
        return this.stack.length !== 0 ? this.stack.pop() : null
    },
    last: function () {
        return this.stack[this.stack.length - 1]
    },
    depth: function () {
        return this.stack.length
    },
    render: function () {
        this.submenus.width(this.jq.width());
        this.wrapper.height(this.rootList.outerHeight(true) + this.backward.outerHeight(true));
        this.content.height(this.rootList.outerHeight(true));
        this.rendered = true
    },
    show: function () {
        this.align();
        this.jq.css("z-index", ++PrimeFaces.zindex).show();
        if (!this.rendered) {
            this.render()
        }
    }
});
PrimeFaces.widget.PlainMenu = PrimeFaces.widget.Menu.extend({
    init: function (a) {
        this._super(a);
        this.menuitemLinks = this.jq.find(".ui-menuitem-link:not(.ui-state-disabled)");
        this.bindEvents();
        if (this.cfg.toggleable) {
            this.collapsedIds = [];
            this.stateKey = "menu-" + this.id;
            this.restoreState()
        }
    },
    bindEvents: function () {
        var a = this;
        this.menuitemLinks.mouseenter(function (b) {
            if (a.jq.is(":focus")) {
                a.jq.blur()
            }
            $(this).addClass("ui-state-hover")
        }).mouseleave(function (b) {
            $(this).removeClass("ui-state-hover")
        });
        if (this.cfg.overlay) {
            this.menuitemLinks.click(function () {
                a.hide()
            });
            this.trigger.on("keydown.ui-menu", function (c) {
                var b = $.ui.keyCode;
                switch (c.which) {
                    case b.DOWN:
                        a.keyboardTarget.trigger("focus.menu");
                        c.preventDefault();
                        break;
                    case b.TAB:
                        if (a.jq.is(":visible")) {
                            a.hide()
                        }
                        break
                }
            })
        }
        if (this.cfg.toggleable) {
            this.jq.find("> .ui-menu-list > .ui-widget-header").on("mouseover.menu", function () {
                $(this).addClass("ui-state-hover")
            }).on("mouseout.menu", function () {
                $(this).removeClass("ui-state-hover")
            }).on("click.menu", function (b) {
                var c = $(this);
                if (c.find("> h3 > .ui-icon").hasClass("ui-icon-triangle-1-s")) {
                    a.collapseSubmenu(c, true)
                } else {
                    a.expandSubmenu(c, true)
                }
                PrimeFaces.clearSelection();
                b.preventDefault()
            })
        }
        this.keyboardTarget.on("focus.menu", function () {
            a.menuitemLinks.eq(0).addClass("ui-state-hover")
        }).on("blur.menu", function () {
            a.menuitemLinks.filter(".ui-state-hover").removeClass("ui-state-hover")
        }).on("keydown.menu", function (h) {
            var f = a.menuitemLinks.filter(".ui-state-hover")
                    , g = $.ui.keyCode;
            switch (h.which) {
                case g.UP:
                    var c = f.parent().prevAll(".ui-menuitem:first");
                    if (c.length) {
                        f.removeClass("ui-state-hover");
                        c.children(".ui-menuitem-link").addClass("ui-state-hover")
                    }
                    h.preventDefault();
                    break;
                case g.DOWN:
                    var b = f.parent().nextAll(".ui-menuitem:first");
                    if (b.length) {
                        f.removeClass("ui-state-hover");
                        b.children(".ui-menuitem-link").addClass("ui-state-hover")
                    }
                    h.preventDefault();
                    break;
                case g.ENTER:
                case g.NUMPAD_ENTER:
                    f.trigger("click");
                    a.jq.blur();
                    var d = f.attr("href");
                    if (d && d !== "#") {
                        window.location.href = d
                    }
                    h.preventDefault();
                    break;
                case g.ESCAPE:
                    a.hide();
                    if (a.cfg.overlay) {
                        a.trigger.focus()
                    }
                    break
            }
        })
    },
    collapseSubmenu: function (c, b) {
        var a = c.nextUntil("li.ui-widget-header");
        c.attr("aria-expanded", false).find("> h3 > .ui-icon").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
        a.filter(".ui-submenu-child").hide();
        if (b) {
            this.collapsedIds.push(c.attr("id"));
            this.saveState()
        }
    },
    expandSubmenu: function (d, b) {
        var a = d.nextUntil("li.ui-widget-header");
        d.attr("aria-expanded", false).find("> h3 > .ui-icon").removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-s");
        a.filter(".ui-submenu-child").show();
        if (b) {
            var c = d.attr("id");
            this.collapsedIds = $.grep(this.collapsedIds, function (e) {
                return (e !== c)
            });
            this.saveState()
        }
    },
    saveState: function () {
        PrimeFaces.setCookie(this.stateKey, this.collapsedIds.join(","))
    },
    restoreState: function () {
        var b = PrimeFaces.getCookie(this.stateKey);
        if (b) {
            this.collapsedIds = b.split(",");
            for (var a = 0; a < this.collapsedIds.length; a++) {
                this.collapseSubmenu($(PrimeFaces.escapeClientId(this.collapsedIds[a])), false)
            }
        }
    },
    clearState: function () {
        PrimeFaces.setCookie(this.stateKey, null)
    }
});
PrimeFaces.widget.MenuButton = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.menuId = this.jqId + "_menu";
        this.button = this.jq.children("button");
        this.menu = this.jq.children(".ui-menu");
        this.menuitems = this.jq.find(".ui-menuitem");
        this.cfg.disabled = this.button.is(":disabled");
        if (!this.cfg.disabled) {
            this.bindEvents();
            this.appendPanel()
        }
    },
    bindEvents: function () {
        var c = this;
        this.button.mouseover(function () {
            if (!c.button.hasClass("ui-state-focus")) {
                c.button.addClass("ui-state-hover")
            }
        }).mouseout(function () {
            if (!c.button.hasClass("ui-state-focus")) {
                c.button.removeClass("ui-state-hover ui-state-active")
            }
        }).mousedown(function () {
            $(this).removeClass("ui-state-focus ui-state-hover").addClass("ui-state-active")
        }).mouseup(function () {
            var d = $(this);
            d.removeClass("ui-state-active");
            if (c.menu.is(":visible")) {
                d.addClass("ui-state-hover");
                c.hide()
            } else {
                d.addClass("ui-state-focus");
                c.show()
            }
        }).focus(function () {
            $(this).addClass("ui-state-focus")
        }).blur(function () {
            $(this).removeClass("ui-state-focus")
        });
        this.button.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
        this.menuitems.mouseover(function (f) {
            var d = $(this);
            if (!d.hasClass("ui-state-disabled")) {
                d.addClass("ui-state-hover")
            }
        }).mouseout(function (d) {
            $(this).removeClass("ui-state-hover")
        }).click(function () {
            c.button.removeClass("ui-state-focus");
            c.hide()
        });
        this.button.keydown(function (h) {
            var g = $.ui.keyCode;
            switch (h.which) {
                case g.UP:
                    if (c.menu.is(":visible")) {
                        var f = c.menuitems.filter(".ui-state-hover")
                                , d = f.length ? f.prevAll(":not(.ui-separator)") : null;
                        if (d && d.length) {
                            f.removeClass("ui-state-hover");
                            d.eq(0).addClass("ui-state-hover")
                        }
                    }
                    h.preventDefault();
                    break;
                case g.DOWN:
                    if (c.menu.is(":visible")) {
                        var f = c.menuitems.filter(".ui-state-hover")
                                , i = f.length ? f.nextAll(":not(.ui-separator)") : c.menuitems.eq(0);
                        if (i.length) {
                            f.removeClass("ui-state-hover");
                            i.eq(0).addClass("ui-state-hover")
                        }
                    }
                    h.preventDefault();
                    break;
                case g.ENTER:
                case g.NUMPAD_ENTER:
                case g.SPACE:
                    if (c.menu.is(":visible")) {
                        c.menuitems.filter(".ui-state-hover").children("a").trigger("click")
                    } else {
                        c.show()
                    }
                    h.preventDefault();
                    break;
                case g.ESCAPE:
                case g.TAB:
                    c.hide();
                    break
            }
        });
        var b = "mousedown." + this.id;
        $(document.body).off(b).on(b, function (f) {
            if (c.menu.is(":hidden") || c.cfg.disabled) {
                return
            }
            var d = $(f.target);
            if (d.is(c.button) || c.button.has(d).length > 0) {
                return
            }
            var g = c.menu.offset();
            if (f.pageX < g.left || f.pageX > g.left + c.menu.width() || f.pageY < g.top || f.pageY > g.top + c.menu.height()) {
                c.button.removeClass("ui-state-focus ui-state-hover");
                c.hide()
            }
        });
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function () {
            if (c.menu.is(":visible")) {
                c.alignPanel()
            }
        });
        this.button.attr("role", "button").attr("aria-disabled", this.button.is(":disabled"))
    },
    appendPanel: function () {
        var a = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!a.is(this.jq)) {
            a.children(this.menuId).remove();
            this.menu.appendTo(a)
        }
    },
    show: function () {
        this.alignPanel();
        this.menu.show()
    },
    hide: function () {
        this.menuitems.filter(".ui-state-hover").removeClass("ui-state-hover");
        this.menu.fadeOut("fast")
    },
    alignPanel: function () {
        this.menu.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        });
        if (this.menu.parent().is(this.jq)) {
            this.menu.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.menu.position({
                my: "left top",
                at: "left bottom",
                of: this.button
            })
        }
    }
});
PrimeFaces.widget.ContextMenu = PrimeFaces.widget.TieredMenu.extend({
    init: function (b) {
        b.autoDisplay = true;
        this._super(b);
        this.cfg.selectionMode = this.cfg.selectionMode || "multiple";
        var a = this
                , d = (this.cfg.target === undefined);
        this.cfg.event = this.cfg.event || "contextmenu";
        this.jqTargetId = d ? document : PrimeFaces.escapeClientId(this.cfg.target);
        this.jqTarget = $(this.jqTargetId);
        if (!this.jq.parent().is(document.body)) {
            this.jq.appendTo("body")
        }
        if (d) {
            $(document).off("contextmenu.ui-contextmenu").on("contextmenu.ui-contextmenu", function (g) {
                a.show(g)
            })
        } else {
            var c = false;
            if (this.cfg.targetWidgetVar) {
                var f = PrimeFaces.widgets[this.cfg.targetWidgetVar];
                if (f) {
                    if (typeof f.bindContextMenu === "function") {
                        f.bindContextMenu(this, f, this.jqTargetId, this.cfg);
                        c = true
                    }
                } else {
                    PrimeFaces.warn("ContextMenu targets a widget which is not available yet. Please place the contextMenu after the target component. targetWidgetVar: " + this.cfg.targetWidgetVar)
                }
            }
            if (c === false) {
                var e = this.cfg.event + ".ui-contextmenu";
                $(document).off(e, this.jqTargetId).on(e, this.jqTargetId, null, function (g) {
                    a.show(g)
                })
            }
        }
    },
    refresh: function (b) {
        var a = PrimeFaces.escapeClientId(b.id)
                , c = $(a);
        if (c.length > 1) {
            $(document.body).children(a).remove()
        }
        this.init(b)
    },
    bindItemEvents: function () {
        this._super();
        var a = this;
        this.links.bind("click", function (c) {
            var b = $(c.target)
                    , d = b.hasClass("ui-submenu-link") ? b : b.closest(".ui-submenu-link");
            if (d.length) {
                return
            }
            a.hide()
        })
    },
    bindDocumentHandler: function () {
        var b = this
                , a = "click." + this.id;
        $(document.body).off(a).on(a, function (f) {
            var d = $(f.target)
                    , c = d.hasClass("ui-menuitem-link") ? d : d.closest(".ui-menuitem-link");
            if (b.jq.is(":hidden") || c.is(".ui-menuitem-link,.ui-state-disabled")) {
                return
            }
            b.hide()
        })
    },
    show: function (h) {
        if (this.cfg.targetFilter && $(h.target).is(":not(" + this.cfg.targetFilter + ")")) {
            return
        }
        $(document.body).children(".ui-contextmenu:visible").hide();
        if (this.cfg.beforeShow) {
            var g = this.cfg.beforeShow.call(this, h);
            if (g === false) {
                return
            }
        }
        var f = $(window)
                , d = h.pageX
                , c = h.pageY
                , b = this.jq.outerWidth()
                , a = this.jq.outerHeight();
        if ((d + b) > (f.width()) + f.scrollLeft()) {
            d = d - b
        }
        if ((c + a) > (f.height() + f.scrollTop())) {
            c = c - a
        }
        this.jq.css({
            left: d,
            top: c,
            "z-index": ++PrimeFaces.zindex
        }).show();
        h.preventDefault();
        h.stopPropagation()
    },
    hide: function () {
        var a = this;
        this.jq.find("li.ui-menuitem-active").each(function () {
            a.deactivate($(this), true)
        });
        this.jq.fadeOut("fast")
    },
    isVisible: function () {
        return this.jq.is(":visible")
    },
    getTarget: function () {
        return this.jqTarget
    }
});
PrimeFaces.widget.MegaMenu = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.cfg.vertical = this.jq.hasClass("ui-megamenu-vertical");
        this.rootList = this.jq.children("ul.ui-menu-list");
        this.rootLinks = this.rootList.find("> li.ui-menuitem > a.ui-menuitem-link:not(.ui-state-disabled)");
        this.subLinks = this.jq.find(".ui-menu-child a.ui-menuitem-link:not(.ui-state-disabled)");
        this.keyboardTarget = this.jq.children(".ui-helper-hidden-accessible");
        if (this.cfg.activeIndex !== undefined) {
            this.rootLinks.eq(this.cfg.activeIndex).addClass("ui-state-hover").closest("li.ui-menuitem").addClass("ui-menuitem-active")
        }
        this.bindEvents();
        this.bindKeyEvents()
    },
    bindEvents: function () {
        var a = this;
        this.rootLinks.mouseenter(function (f) {
            var b = $(this)
                    , d = b.parent();
            var c = d.siblings(".ui-menuitem-active");
            if (c.length > 0) {
                c.find("li.ui-menuitem-active").each(function () {
                    a.deactivate($(this))
                });
                a.deactivate(c, false)
            }
            if (a.cfg.autoDisplay || a.active) {
                a.activate(d)
            } else {
                a.highlight(d)
            }
        });
        if (this.cfg.autoDisplay === false) {
            this.rootLinks.data("primefaces-megamenu", this.id).find("*").data("primefaces-megamenu", this.id);
            this.rootLinks.click(function (g) {
                var d = $(this)
                        , f = d.parent()
                        , c = d.next();
                if (c.length === 1) {
                    if (c.is(":visible")) {
                        a.active = false;
                        a.deactivate(f, true)
                    } else {
                        a.active = true;
                        a.activate(f)
                    }
                } else {
                    var b = d.attr("href");
                    if (b && b !== "#") {
                        window.location.href = b
                    }
                }
                g.preventDefault()
            })
        } else {
            this.rootLinks.filter(".ui-submenu-link").click(function (b) {
                b.preventDefault()
            })
        }
        this.subLinks.mouseenter(function () {
            if (a.activeitem && !a.isRootLink(a.activeitem)) {
                a.deactivate(a.activeitem)
            }
            a.highlight($(this).parent())
        }).mouseleave(function () {
            if (a.activeitem && !a.isRootLink(a.activeitem)) {
                a.deactivate(a.activeitem)
            }
            $(this).removeClass("ui-state-hover")
        });
        this.rootList.mouseleave(function (c) {
            var b = a.rootList.children(".ui-menuitem-active");
            if (b.length === 1) {
                a.deactivate(b, false)
            }
        });
        this.rootList.find("> li.ui-menuitem > ul.ui-menu-child").mouseleave(function (b) {
            b.stopPropagation()
        });
        $(document.body).click(function (c) {
            var b = $(c.target);
            if (b.data("primefaces-megamenu") === a.id) {
                return
            }
            a.active = false;
            a.deactivate(a.rootList.children("li.ui-menuitem-active"), true)
        })
    },
    bindKeyEvents: function () {
        var a = this;
        this.keyboardTarget.on("focus.megamenu", function (b) {
            a.highlight(a.rootLinks.eq(0).parent())
        }).on("blur.megamenu", function () {
            a.reset()
        }).on("keydown.megamenu", function (j) {
            var h = a.activeitem;
            if (!h) {
                return
            }
            var g = a.isRootLink(h)
                    , m = $.ui.keyCode;
            switch (j.which) {
                case m.LEFT:
                    if (g && !a.cfg.vertical) {
                        var k = h.prevAll(".ui-menuitem:first");
                        if (k.length) {
                            a.deactivate(h);
                            a.highlight(k)
                        }
                        j.preventDefault()
                    } else {
                        if (h.hasClass("ui-menu-parent") && h.children(".ui-menu-child").is(":visible")) {
                            a.deactivate(h);
                            a.highlight(h)
                        } else {
                            var f = h.closest("ul.ui-menu-child").parent();
                            if (f.length) {
                                a.deactivate(h);
                                a.deactivate(f);
                                a.highlight(f)
                            }
                        }
                    }
                    break;
                case m.RIGHT:
                    if (g && !a.cfg.vertical) {
                        var c = h.nextAll(".ui-menuitem:visible:first");
                        if (c.length) {
                            a.deactivate(h);
                            a.highlight(c)
                        }
                        j.preventDefault()
                    } else {
                        if (h.hasClass("ui-menu-parent")) {
                            var b = h.children(".ui-menu-child");
                            if (b.is(":visible")) {
                                a.highlight(b.find("ul.ui-menu-list:visible > .ui-menuitem:visible:first"))
                            } else {
                                a.activate(h)
                            }
                        }
                    }
                    break;
                case m.UP:
                    if (!g || a.cfg.vertical) {
                        var k = a.findPrevItem(h);
                        if (k.length) {
                            a.deactivate(h);
                            a.highlight(k)
                        }
                    }
                    j.preventDefault();
                    break;
                case m.DOWN:
                    if (g && !a.cfg.vertical) {
                        var b = h.children("ul.ui-menu-child");
                        if (b.is(":visible")) {
                            var l = a.getFirstMenuList(b);
                            a.highlight(l.children(".ui-menuitem:visible:first"))
                        } else {
                            a.activate(h)
                        }
                    } else {
                        var c = a.findNextItem(h);
                        if (c.length) {
                            a.deactivate(h);
                            a.highlight(c)
                        }
                    }
                    j.preventDefault();
                    break;
                case m.ENTER:
                case m.NUMPAD_ENTER:
                    var i = h.children(".ui-menuitem-link");
                    i.trigger("click");
                    a.jq.blur();
                    var d = i.attr("href");
                    if (d && d !== "#") {
                        window.location.href = d
                    }
                    a.deactivate(h);
                    j.preventDefault();
                    break;
                case m.ESCAPE:
                    if (h.hasClass("ui-menu-parent")) {
                        var b = h.children("ul.ui-menu-list:visible");
                        if (b.length > 0) {
                            b.hide()
                        }
                    } else {
                        var f = h.closest("ul.ui-menu-child").parent();
                        if (f.length) {
                            a.deactivate(h);
                            a.deactivate(f);
                            a.highlight(f)
                        }
                    }
                    j.preventDefault();
                    break
            }
        })
    },
    findPrevItem: function (c) {
        var b = c.prev(".ui-menuitem");
        if (!b.length) {
            var a = c.closest("ul.ui-menu-list").prev(".ui-menu-list");
            if (!a.length) {
                a = c.closest("td").prev("td").children(".ui-menu-list:visible:last")
            }
            if (a.length) {
                b = a.find("li.ui-menuitem:visible:last")
            }
        }
        return b
    },
    findNextItem: function (c) {
        var a = c.next(".ui-menuitem");
        if (!a.length) {
            var b = c.closest("ul.ui-menu-list").next(".ui-menu-list");
            if (!b.length) {
                b = c.closest("td").next("td").children(".ui-menu-list:visible:first")
            }
            if (b.length) {
                a = b.find("li.ui-menuitem:visible:first")
            }
        }
        return a
    },
    getFirstMenuList: function (a) {
        return a.find(".ui-menu-list:not(.ui-state-disabled):first")
    },
    isRootLink: function (b) {
        var a = b.closest("ul");
        return a.parent().hasClass("ui-menu")
    },
    reset: function () {
        var a = this;
        this.active = false;
        this.jq.find("li.ui-menuitem-active").each(function () {
            a.deactivate($(this), true)
        })
    },
    deactivate: function (d, a) {
        var c = d.children("a.ui-menuitem-link")
                , b = c.next();
        d.removeClass("ui-menuitem-active");
        c.removeClass("ui-state-hover");
        this.activeitem = null;
        if (b.length > 0) {
            if (a) {
                b.fadeOut("fast")
            } else {
                b.hide()
            }
        }
    },
    highlight: function (b) {
        var a = b.children("a.ui-menuitem-link");
        b.addClass("ui-menuitem-active");
        a.addClass("ui-state-hover");
        this.activeitem = b
    },
    activate: function (c) {
        var a = c.children(".ui-menu-child")
                , b = this;
        b.highlight(c);
        if (a.length > 0) {
            b.showSubmenu(c, a)
        }
    },
    showSubmenu: function (b, a) {
        var c = null;
        if (this.cfg.vertical) {
            c = {
                my: "left top",
                at: "right top",
                of: b,
                collision: "flipfit"
            }
        } else {
            c = {
                my: "left top",
                at: "left bottom",
                of: b,
                collision: "flipfit"
            }
        }
        a.css("z-index", ++PrimeFaces.zindex).show().position(c)
    }
});
PrimeFaces.widget.PanelMenu = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.headers = this.jq.find("> .ui-panelmenu-panel > h3.ui-panelmenu-header:not(.ui-state-disabled)");
        this.menuContent = this.jq.find("> .ui-panelmenu-panel > .ui-panelmenu-content");
        this.menuitemLinks = this.menuContent.find(".ui-menuitem-link:not(.ui-state-disabled)");
        this.menuText = this.menuitemLinks.find(".ui-menuitem-text");
        this.treeLinks = this.menuContent.find(".ui-menu-parent > .ui-menuitem-link:not(.ui-state-disabled)");
        this.focusedItem = null;
        this.menuText.attr("tabindex", -1);
        this.menuText.attr("role", "menuitem");
        this.treeLinks.find("> .ui-menuitem-text").attr("aria-expanded", false);
        this.bindEvents();
        if (this.cfg.stateful) {
            this.stateKey = "panelMenu-" + this.id
        }
        this.restoreState()
    },
    bindEvents: function () {
        var a = this;
        this.headers.mouseover(function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.addClass("ui-state-hover")
            }
        }).mouseout(function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.removeClass("ui-state-hover")
            }
        }).click(function (b) {
            var c = $(this);
            if (c.hasClass("ui-state-active")) {
                a.collapseRootSubmenu($(this))
            } else {
                a.expandRootSubmenu($(this), false)
            }
            a.removeFocusedItem();
            c.focus();
            b.preventDefault()
        });
        this.menuitemLinks.mouseover(function () {
            $(this).addClass("ui-state-hover")
        }).mouseout(function () {
            $(this).removeClass("ui-state-hover")
        }).click(function (d) {
            var c = $(this);
            a.focusItem(c.closest(".ui-menuitem"));
            var b = c.attr("href");
            if (b && b !== "#") {
                window.location.href = b
            }
            d.preventDefault()
        });
        this.treeLinks.click(function (f) {
            var d = $(this)
                    , c = d.parent()
                    , b = d.next();
            if (b.is(":visible")) {
                a.collapseTreeItem(c)
            } else {
                a.expandTreeItem(c, false)
            }
            f.preventDefault()
        });
        this.bindKeyEvents()
    },
    bindKeyEvents: function () {
        var b = this;
        if (PrimeFaces.env.isIE()) {
            this.focusCheck = false
        }
        this.headers.on("focus.panelmenu", function () {
            $(this).addClass("ui-menuitem-outline")
        }).on("blur.panelmenu", function () {
            $(this).removeClass("ui-menuitem-outline ui-state-hover")
        }).on("keydown.panelmenu", function (f) {
            var d = $.ui.keyCode
                    , c = f.which;
            if (c === d.SPACE || c === d.ENTER || c === d.NUMPAD_ENTER) {
                $(this).trigger("click");
                f.preventDefault()
            }
        });
        this.menuContent.on("mousedown.panelmenu", function (c) {
            if ($(c.target).is(":not(:input:enabled)")) {
                c.preventDefault()
            }
        }).on("focus.panelmenu", function () {
            if (!b.focusedItem) {
                b.focusItem(b.getFirstItemOfContent($(this)));
                if (PrimeFaces.env.isIE()) {
                    b.focusCheck = false
                }
            }
        });
        this.menuContent.off("keydown.panelmenu blur.panelmenu").on("keydown.panelmenu", function (k) {
            if (!b.focusedItem) {
                return
            }
            var j = $.ui.keyCode;
            switch (k.which) {
                case j.LEFT:
                    if (b.isExpanded(b.focusedItem)) {
                        b.focusedItem.children(".ui-menuitem-link").trigger("click")
                    } else {
                        var f = b.focusedItem.closest("ul.ui-menu-list");
                        if (f.parent().is(":not(.ui-panelmenu-content)")) {
                            b.focusItem(f.closest("li.ui-menuitem"))
                        }
                    }
                    k.preventDefault();
                    break;
                case j.RIGHT:
                    if (b.focusedItem.hasClass("ui-menu-parent") && !b.isExpanded(b.focusedItem)) {
                        b.focusedItem.children(".ui-menuitem-link").trigger("click")
                    }
                    k.preventDefault();
                    break;
                case j.UP:
                    var i = null
                            , c = b.focusedItem.prev();
                    if (c.length) {
                        i = c.find("li.ui-menuitem:visible:last");
                        if (!i.length) {
                            i = c
                        }
                    } else {
                        i = b.focusedItem.closest("ul").parent("li")
                    }
                    if (i.length) {
                        b.focusItem(i)
                    }
                    k.preventDefault();
                    break;
                case j.DOWN:
                    var i = null
                            , h = b.focusedItem.find("> ul > li:visible:first");
                    if (h.length) {
                        i = h
                    } else {
                        if (b.focusedItem.next().length) {
                            i = b.focusedItem.next()
                        } else {
                            if (b.focusedItem.next().length === 0) {
                                i = b.searchDown(b.focusedItem)
                            }
                        }
                    }
                    if (i && i.length) {
                        b.focusItem(i)
                    }
                    k.preventDefault();
                    break;
                case j.ENTER:
                case j.NUMPAD_ENTER:
                case j.SPACE:
                    var g = b.focusedItem.children(".ui-menuitem-link");
                    setTimeout(function () {
                        g.trigger("click")
                    }, 1);
                    b.jq.blur();
                    var d = g.attr("href");
                    if (d && d !== "#") {
                        window.location.href = d
                    }
                    k.preventDefault();
                    break;
                case j.TAB:
                    if (b.focusedItem) {
                        if (PrimeFaces.env.isIE()) {
                            b.focusCheck = true
                        }
                        $(this).focus()
                    }
                    break
            }
        }).on("blur.panelmenu", function (c) {
            if (PrimeFaces.env.isIE() && !b.focusCheck) {
                return
            }
            b.removeFocusedItem()
        });
        var a = "click." + this.id;
        $(document.body).off(a).on(a, function (c) {
            if (!$(c.target).closest(".ui-panelmenu").length) {
                b.removeFocusedItem()
            }
        })
    },
    searchDown: function (b) {
        var a = b.closest("ul").parent("li").next()
                , c = null;
        if (a.length) {
            c = a
        } else {
            if (b.closest("ul").parent("li").length === 0) {
                c = b
            } else {
                c = this.searchDown(b.closest("ul").parent("li"))
            }
        }
        return c
    },
    getFirstItemOfContent: function (a) {
        return a.find("> .ui-menu-list > .ui-menuitem:visible:first-child")
    },
    getItemText: function (a) {
        return a.find("> .ui-menuitem-link > span.ui-menuitem-text")
    },
    focusItem: function (a) {
        this.removeFocusedItem();
        this.getItemText(a).addClass("ui-menuitem-outline").focus();
        this.focusedItem = a
    },
    removeFocusedItem: function () {
        if (this.focusedItem) {
            this.getItemText(this.focusedItem).removeClass("ui-menuitem-outline");
            this.focusedItem = null
        }
    },
    isExpanded: function (a) {
        return a.children("ul.ui-menu-list").is(":visible")
    },
    collapseRootSubmenu: function (b) {
        var a = b.next();
        b.attr("aria-expanded", false).removeClass("ui-state-active ui-corner-top").addClass("ui-state-hover ui-corner-all").children(".ui-icon").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e");
        a.attr("aria-hidden", true).slideUp("normal", "easeInOutCirc");
        this.removeAsExpanded(a)
    },
    expandRootSubmenu: function (c, b) {
        var a = c.next();
        c.attr("aria-expanded", true).addClass("ui-state-active ui-corner-top").removeClass("ui-state-hover ui-corner-all").children(".ui-icon").removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-s");
        if (b) {
            a.attr("aria-hidden", false).show()
        } else {
            a.attr("aria-hidden", false).slideDown("normal", "easeInOutCirc");
            this.addAsExpanded(a)
        }
    },
    expandTreeItem: function (a, b) {
        var c = a.find("> .ui-menuitem-link");
        c.find("> .ui-menuitem-text").attr("aria-expanded", true);
        c.find("> .ui-panelmenu-icon").addClass("ui-icon-triangle-1-s");
        a.children(".ui-menu-list").show();
        if (!b) {
            this.addAsExpanded(a)
        }
    },
    collapseTreeItem: function (a) {
        var b = a.find("> .ui-menuitem-link");
        b.find("> .ui-menuitem-text").attr("aria-expanded", false);
        b.find("> .ui-panelmenu-icon").removeClass("ui-icon-triangle-1-s");
        a.children(".ui-menu-list").hide();
        this.removeAsExpanded(a)
    },
    saveState: function () {
        if (this.cfg.stateful) {
            var a = this.expandedNodes.join(",");
            PrimeFaces.setCookie(this.stateKey, a, {
                path: "/"
            })
        }
    },
    restoreState: function () {
        var d = null;
        if (this.cfg.stateful) {
            d = PrimeFaces.getCookie(this.stateKey)
        }
        if (d) {
            this.collapseAll();
            this.expandedNodes = d.split(",");
            for (var c = 0; c < this.expandedNodes.length; c++) {
                var b = $(PrimeFaces.escapeClientId(this.expandedNodes[c]));
                if (b.is("div.ui-panelmenu-content")) {
                    this.expandRootSubmenu(b.prev(), true)
                } else {
                    if (b.is("li.ui-menu-parent")) {
                        this.expandTreeItem(b, true)
                    }
                }
            }
        } else {
            this.expandedNodes = [];
            var a = this.headers.filter(".ui-state-active")
                    , e = this.jq.find(".ui-menu-parent > .ui-menu-list:not(.ui-helper-hidden)");
            for (var c = 0; c < a.length; c++) {
                this.expandedNodes.push(a.eq(c).next().attr("id"))
            }
            for (var c = 0; c < e.length; c++) {
                this.expandedNodes.push(e.eq(c).parent().attr("id"))
            }
        }
    },
    removeAsExpanded: function (a) {
        var b = a.attr("id");
        this.expandedNodes = $.grep(this.expandedNodes, function (c) {
            return c != b
        });
        this.saveState()
    },
    addAsExpanded: function (a) {
        this.expandedNodes.push(a.attr("id"));
        this.saveState()
    },
    clearState: function () {
        if (this.cfg.stateful) {
            PrimeFaces.deleteCookie(this.stateKey, {
                path: "/"
            })
        }
    },
    collapseAll: function () {
        this.headers.filter(".ui-state-active").each(function () {
            var a = $(this);
            a.removeClass("ui-state-active").children(".ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-s");
            a.next().addClass("ui-helper-hidden")
        });
        this.jq.find(".ui-menu-parent > .ui-menu-list:not(.ui-helper-hidden)").each(function () {
            $(this).addClass("ui-helper-hidden").prev().children(".ui-panelmenu-icon").removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-e")
        })
    }
});
PrimeFaces.widget.TabMenu = PrimeFaces.widget.Menu.extend({
    init: function (a) {
        this._super(a);
        this.items = this.jq.find("> .ui-tabmenu-nav > li:not(.ui-state-disabled)");
        this.bindEvents();
        this.bindKeyEvents()
    },
    bindEvents: function () {
        this.items.on("mouseover.tabmenu", function (b) {
            var a = $(this);
            if (!a.hasClass("ui-state-active")) {
                a.addClass("ui-state-hover")
            }
        }).on("mouseout.tabmenu", function (a) {
            $(this).removeClass("ui-state-hover")
        })
    },
    bindKeyEvents: function () {
        this.items.attr("tabindex", 0);
        this.items.on("focus.tabmenu", function (a) {
            $(this).addClass("ui-menuitem-outline")
        }).on("blur.tabmenu", function () {
            $(this).removeClass("ui-menuitem-outline")
        }).on("keydown.tabmenu", function (f) {
            var d = $.ui.keyCode
                    , c = f.which;
            if (c === d.SPACE || c === d.ENTER || c === d.NUMPAD_ENTER) {
                var b = $(this).children("a");
                b.trigger("click");
                var a = b.attr("href");
                if (a && a !== "#") {
                    window.location.href = a
                }
                f.preventDefault()
            }
        })
    }
});
PrimeFaces.widget.Message = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        var b = this.jq.children(".ui-message-error-detail").text();
        if (b) {
            $(PrimeFaces.escapeClientId(this.cfg.target)).data("tooltip", b)
        }
    }
});
PrimeFaces.widget.NotificationBar = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        var a = this;
        this.jq.css(this.cfg.position, "0").appendTo($("body"));
        if (this.cfg.autoDisplay) {
            $(this.jq).css("display", "block")
        }
        this.jq.children(".ui-notificationbar-close").click(function () {
            a.hide()
        })
    },
    show: function (b, a, c) {
        if (this.cfg.effect === "slide") {
            $(this.jq).slideDown(b, a, c)
        } else {
            if (this.cfg.effect === "fade") {
                $(this.jq).fadeIn(b, a, c)
            } else {
                if (this.cfg.effect === "none") {
                    $(this.jq).show(b, a, c)
                }
            }
        }
    },
    hide: function () {
        if (this.cfg.effect === "slide") {
            $(this.jq).slideUp(this.cfg.effect)
        } else {
            if (this.cfg.effect === "fade") {
                $(this.jq).fadeOut(this.cfg.effect)
            } else {
                if (this.cfg.effect === "none") {
                    $(this.jq).hide()
                }
            }
        }
    },
    isVisible: function () {
        return this.jq.is(":visible")
    },
    toggle: function () {
        if (this.isVisible()) {
            this.hide()
        } else {
            this.show()
        }
    }
});
PrimeFaces.widget.Panel = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.header = this.jq.children("div.ui-panel-titlebar");
        this.title = this.header.children("span.ui-panel-title");
        this.content = $(this.jqId + "_content");
        this.bindEvents()
    },
    bindEvents: function () {
        if (this.cfg.toggleable) {
            this.bindToggler()
        }
        if (this.cfg.closable) {
            this.bindCloser()
        }
        if (this.cfg.hasMenu) {
            $(this.jqId + "_menu").on("click.panel", function (a) {
                a.preventDefault()
            })
        }
        this.header.find(".ui-panel-titlebar-icon").on("mouseover.panel", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseout.panel", function () {
            $(this).removeClass("ui-state-hover")
        }).on("click.panel", function (b) {
            var a = $(this).attr("href");
            if (!a || a == "#") {
                b.preventDefault()
            }
        })
    },
    toggle: function () {
        if (this.cfg.collapsed) {
            this.expand();
            PrimeFaces.invokeDeferredRenders(this.id)
        } else {
            this.collapse()
        }
    },
    expand: function () {
        this.toggleState(false, "ui-icon-plusthick", "ui-icon-minusthick");
        if (this.cfg.toggleOrientation === "vertical") {
            this.slideDown()
        } else {
            if (this.cfg.toggleOrientation === "horizontal") {
                this.slideRight()
            }
        }
    },
    collapse: function () {
        this.toggleState(true, "ui-icon-minusthick", "ui-icon-plusthick");
        if (this.cfg.toggleOrientation === "vertical") {
            this.slideUp()
        } else {
            if (this.cfg.toggleOrientation === "horizontal") {
                this.slideLeft()
            }
        }
    },
    slideUp: function () {
        this.content.slideUp(this.cfg.toggleSpeed, "easeInOutCirc")
    },
    slideDown: function () {
        this.content.slideDown(this.cfg.toggleSpeed, "easeInOutCirc")
    },
    slideLeft: function () {
        var a = this;
        this.originalWidth = this.jq.width();
        this.title.hide();
        this.toggler.hide();
        this.content.hide();
        this.jq.animate({
            width: "42px"
        }, this.cfg.toggleSpeed, "easeInOutCirc", function () {
            a.toggler.show();
            a.jq.addClass("ui-panel-collapsed-h")
        })
    },
    slideRight: function () {
        var a = this
                , b = this.originalWidth || "100%";
        this.toggler.hide();
        this.jq.animate({
            width: b
        }, this.cfg.toggleSpeed, "easeInOutCirc", function () {
            a.jq.removeClass("ui-panel-collapsed-h");
            a.title.show();
            a.toggler.show();
            a.content.css({
                visibility: "visible",
                display: "block",
                height: "auto"
            })
        })
    },
    toggleState: function (c, b, a) {
        this.toggler.children("span.ui-icon").removeClass(b).addClass(a);
        this.cfg.collapsed = c;
        this.toggleStateHolder.val(c);
        this.fireToggleEvent()
    },
    fireToggleEvent: function () {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.toggle;
            if (a) {
                a.call(this)
            }
        }
    },
    close: function () {
        if (this.visibleStateHolder) {
            this.visibleStateHolder.val(false)
        }
        var a = this;
        this.jq.fadeOut(this.cfg.closeSpeed, function (c) {
            if (a.cfg.behaviors) {
                var b = a.cfg.behaviors.close;
                if (b) {
                    b.call(a)
                }
            }
        })
    },
    show: function () {
        var a = this;
        $(this.jqId).fadeIn(this.cfg.closeSpeed, function () {
            PrimeFaces.invokeDeferredRenders(a.id)
        });
        this.visibleStateHolder.val(true)
    },
    bindToggler: function () {
        var a = this;
        this.toggler = $(this.jqId + "_toggler");
        this.toggleStateHolder = $(this.jqId + "_collapsed");
        this.toggler.click(function () {
            a.toggle()
        })
    },
    bindCloser: function () {
        var a = this;
        this.closer = $(this.jqId + "_closer");
        this.visibleStateHolder = $(this.jqId + "_visible");
        this.closer.click(function (b) {
            a.close();
            b.preventDefault()
        })
    }
});
PrimeFaces.widget.OrderList = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.list = this.jq.find(".ui-orderlist-list"),
                this.items = this.list.children(".ui-orderlist-item");
        this.input = $(this.jqId + "_values");
        this.cfg.effect = this.cfg.effect || "fade";
        this.cfg.disabled = this.jq.hasClass("ui-state-disabled");
        var b = this;
        if (!this.cfg.disabled) {
            this.generateItems();
            this.setupButtons();
            this.bindEvents();
            this.list.sortable({
                revert: 1,
                start: function (c, d) {
                    PrimeFaces.clearSelection()
                },
                update: function (c, d) {
                    b.onDragDrop(c, d)
                }
            })
        }
    },
    generateItems: function () {
        var a = this;
        this.list.children(".ui-orderlist-item").each(function () {
            var c = $(this)
                    , d = c.data("item-value")
                    , b = $('<option selected="selected"></option>');
            b.prop("value", d).text(d);
            a.input.append(b)
        })
    },
    bindEvents: function () {
        var a = this;
        this.items.on("mouseover.orderList", function (c) {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).addClass("ui-state-hover")
            }
        }).on("mouseout.orderList", function (c) {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).removeClass("ui-state-hover")
            }
        }).on("mousedown.orderList", function (c) {
            var b = $(this)
                    , d = (c.metaKey || c.ctrlKey);
            if (!d) {
                b.removeClass("ui-state-hover").addClass("ui-state-highlight").siblings(".ui-state-highlight").removeClass("ui-state-highlight");
                a.fireItemSelectEvent(b, c)
            } else {
                if (b.hasClass("ui-state-highlight")) {
                    b.removeClass("ui-state-highlight");
                    a.fireItemUnselectEvent(b)
                } else {
                    b.removeClass("ui-state-hover").addClass("ui-state-highlight");
                    a.fireItemSelectEvent(b, c)
                }
            }
        })
    },
    setupButtons: function () {
        var a = this;
        PrimeFaces.skinButton(this.jq.find(".ui-button"));
        this.jq.find(" .ui-orderlist-controls .ui-orderlist-button-move-up").click(function () {
            a.moveUp(a.sourceList)
        });
        this.jq.find(" .ui-orderlist-controls .ui-orderlist-button-move-top").click(function () {
            a.moveTop(a.sourceList)
        });
        this.jq.find(" .ui-orderlist-controls .ui-orderlist-button-move-down").click(function () {
            a.moveDown(a.sourceList)
        });
        this.jq.find(" .ui-orderlist-controls .ui-orderlist-button-move-bottom").click(function () {
            a.moveBottom(a.sourceList)
        })
    },
    onDragDrop: function (a, b) {
        b.item.removeClass("ui-state-highlight");
        this.saveState();
        this.fireReorderEvent()
    },
    saveState: function () {
        this.input.children().remove();
        this.generateItems()
    },
    moveUp: function () {
        var c = this
                , e = c.list.children(".ui-orderlist-item.ui-state-highlight")
                , d = e.length
                , b = 0
                , a = e.is(":first-child");
        if (a) {
            return
        }
        e.each(function () {
            var f = $(this);
            if (!f.is(":first-child")) {
                f.hide(c.cfg.effect, {}, "fast", function () {
                    f.insertBefore(f.prev()).show(c.cfg.effect, {}, "fast", function () {
                        b++;
                        if (d === b) {
                            c.saveState();
                            c.fireReorderEvent()
                        }
                    })
                })
            } else {
                d--
            }
        })
    },
    moveTop: function () {
        var d = this
                , f = d.list.children(".ui-orderlist-item.ui-state-highlight")
                , e = f.length
                , b = 0
                , a = f.is(":first-child")
                , c = f.eq(0).index();
        if (a) {
            return
        }
        f.each(function (h) {
            var i = $(this)
                    , g = (h === 0) ? 0 : (i.index() - c);
            if (!i.is(":first-child")) {
                i.hide(d.cfg.effect, {}, "fast", function () {
                    i.insertBefore(d.list.children(".ui-orderlist-item").eq(g)).show(d.cfg.effect, {}, "fast", function () {
                        b++;
                        if (e === b) {
                            d.saveState();
                            d.fireReorderEvent()
                        }
                    })
                })
            } else {
                e--
            }
        })
    },
    moveDown: function () {
        var c = this
                , e = $(c.list.children(".ui-orderlist-item.ui-state-highlight").get().reverse())
                , d = e.length
                , b = 0
                , a = e.is(":last-child");
        if (a) {
            return
        }
        e.each(function () {
            var f = $(this);
            if (!f.is(":last-child")) {
                f.hide(c.cfg.effect, {}, "fast", function () {
                    f.insertAfter(f.next()).show(c.cfg.effect, {}, "fast", function () {
                        b++;
                        if (d === b) {
                            c.saveState();
                            c.fireReorderEvent()
                        }
                    })
                })
            } else {
                d--
            }
        })
    },
    moveBottom: function () {
        var d = this
                , g = $(d.list.children(".ui-orderlist-item.ui-state-highlight").get().reverse())
                , f = g.length
                , c = 0
                , a = g.is(":last-child")
                , e = g.eq(0).index()
                , b = this.items.length;
        if (a) {
            return
        }
        g.each(function (i) {
            var j = $(this)
                    , h = (i === 0) ? b - 1 : (j.index() - e) - 1;
            if (!j.is(":last-child")) {
                j.hide(d.cfg.effect, {}, "fast", function () {
                    j.insertAfter(d.list.children(".ui-orderlist-item").eq(h)).show(d.cfg.effect, {}, "fast", function () {
                        c++;
                        if (f === c) {
                            d.saveState();
                            d.fireReorderEvent()
                        }
                    })
                })
            } else {
                f--
            }
        })
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    fireItemSelectEvent: function (b, d) {
        if (this.hasBehavior("select")) {
            var c = this.cfg.behaviors.select
                    , a = {
                        params: [{
                                name: this.id + "_itemIndex",
                                value: b.index()
                            }, {
                                name: this.id + "_metaKey",
                                value: d.metaKey
                            }, {
                                name: this.id + "_ctrlKey",
                                value: d.ctrlKey
                            }]
                    };
            c.call(this, a)
        }
    },
    fireItemUnselectEvent: function (c) {
        if (this.hasBehavior("unselect")) {
            var a = this.cfg.behaviors.unselect
                    , b = {
                        params: [{
                                name: this.id + "_itemIndex",
                                value: c.index()
                            }]
                    };
            a.call(this, b)
        }
    },
    fireReorderEvent: function () {
        if (this.hasBehavior("reorder")) {
            this.cfg.behaviors.reorder.call(this)
        }
    }
});
PrimeFaces.widget.OutputPanel = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.cfg.global = this.cfg.global || false;
        if (this.cfg.deferred) {
            if (this.cfg.deferredMode === "load") {
                this.loadContent()
            } else {
                if (this.cfg.deferredMode === "visible") {
                    if (this.visible()) {
                        this.loadContent()
                    } else {
                        this.bindScrollMonitor()
                    }
                }
            }
        }
    },
    loadContent: function () {
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    async: true,
                    ignoreAutoUpdate: true,
                    global: this.cfg.global,
                    params: [{
                            name: this.id + "_load",
                            value: true
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                this.jq.html(f)
                            }
                        });
                        return true
                    },
                    onerror: function (e, c, d) {
                        b.jq.html("")
                    }
                };
        if (this.cfg.delay) {
            setTimeout(function () {
                PrimeFaces.ajax.Request.handle(a)
            }, parseInt(this.cfg.delay))
        } else {
            PrimeFaces.ajax.Request.handle(a)
        }
    },
    bindScrollMonitor: function () {
        var b = this
                , a = $(window);
        a.off("scroll." + this.id).on("scroll." + this.id, function () {
            if (b.visible()) {
                b.unbindScrollMonitor();
                b.loadContent()
            }
        })
    },
    visible: function () {
        var e = $(window)
                , d = e.scrollTop()
                , a = e.height()
                , c = this.jq.offset().top
                , b = c + this.jq.innerHeight();
        if ((c >= d && c <= (d + a)) || (b >= d && b <= (d + a))) {
            return true
        }
    },
    unbindScrollMonitor: function () {
        $(window).off("scroll." + this.id)
    }
});
PrimeFaces.widget.OverlayPanel = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.content = this.jq.children("div.ui-overlaypanel-content");
        this.cfg.my = this.cfg.my || "left top";
        this.cfg.at = this.cfg.at || "left bottom";
        this.cfg.showEvent = this.cfg.showEvent || "click.ui-overlaypanel";
        this.cfg.hideEvent = this.cfg.hideEvent || "click.ui-overlaypanel";
        this.cfg.dismissable = (this.cfg.dismissable === false) ? false : true;
        if (this.cfg.showCloseIcon) {
            this.closerIcon = $('<a href="#" class="ui-overlaypanel-close ui-state-default" href="#"><span class="ui-icon ui-icon-closethick"></span></a>').appendTo(this.jq)
        }
        if (this.jq.length > 1) {
            $(document.body).children(this.jqId).remove();
            this.jq = $(this.jqId)
        }
        var b = $(this.jqId + "_modal");
        if (b.length > 0) {
            b.remove()
        }
        if (this.cfg.appendToBody) {
            this.jq.appendTo(document.body)
        }
        this.bindCommonEvents();
        if (this.cfg.target) {
            this.target = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.target);
            this.bindTargetEvents();
            this.setupDialogSupport()
        }
    },
    bindTargetEvents: function () {
        var d = this;
        this.target.data("primefaces-overlay-target", this.id).find("*").data("primefaces-overlay-target", this.id);
        if (this.cfg.showEvent === this.cfg.hideEvent) {
            var b = this.cfg.showEvent;
            this.target.on(b, function (f) {
                d.toggle()
            })
        } else {
            var a = this.cfg.showEvent + ".ui-overlaypanel"
                    , c = this.cfg.hideEvent + ".ui-overlaypanel";
            this.target.off(a + " " + c).on(a, function (f) {
                if (!d.isVisible()) {
                    d.show();
                    if (a === "contextmenu.ui-overlaypanel") {
                        f.preventDefault()
                    }
                }
            }).on(c, function (f) {
                if (d.isVisible()) {
                    d.hide()
                }
            })
        }
        d.target.off("keydown.ui-overlaypanel keyup.ui-overlaypanel").on("keydown.ui-overlaypanel", function (h) {
            var g = $.ui.keyCode
                    , f = h.which;
            if (f === g.ENTER || f === g.NUMPAD_ENTER) {
                h.preventDefault()
            }
        }).on("keyup.ui-overlaypanel", function (h) {
            var g = $.ui.keyCode
                    , f = h.which;
            if (f === g.ENTER || f === g.NUMPAD_ENTER) {
                d.toggle();
                h.preventDefault()
            }
        })
    },
    bindCommonEvents: function () {
        var c = this;
        if (this.cfg.showCloseIcon) {
            this.closerIcon.on("mouseover.ui-overlaypanel", function () {
                $(this).addClass("ui-state-hover")
            }).on("mouseout.ui-overlaypanel", function () {
                $(this).removeClass("ui-state-hover")
            }).on("click.ui-overlaypanel", function (d) {
                c.hide();
                d.preventDefault()
            }).on("focus.ui-overlaypanel", function () {
                $(this).addClass("ui-state-focus")
            }).on("blur.ui-overlaypanel", function () {
                $(this).removeClass("ui-state-focus")
            })
        }
        if (this.cfg.dismissable && !this.cfg.modal) {
            var b = "mousedown." + this.id;
            $(document.body).off(b).on(b, function (f) {
                if (c.jq.hasClass("ui-overlay-hidden")) {
                    return
                }
                if (c.target) {
                    var d = $(f.target);
                    if (c.target.is(d) || c.target.has(d).length > 0) {
                        return
                    }
                }
                var g = c.jq.offset();
                if (f.pageX < g.left || f.pageX > g.left + c.jq.outerWidth() || f.pageY < g.top || f.pageY > g.top + c.jq.outerHeight()) {
                    c.hide()
                }
            })
        }
        var a = "resize." + this.id;
        $(window).off(a).on(a, function () {
            if (c.jq.hasClass("ui-overlay-visible")) {
                c.align()
            }
        })
    },
    toggle: function () {
        if (!this.isVisible()) {
            this.show()
        } else {
            this.hide()
        }
    },
    show: function (a) {
        if (!this.loaded && this.cfg.dynamic) {
            this.loadContents(a)
        } else {
            this._show(a)
        }
    },
    _show: function (c) {
        var b = this
                , a = c || this.cfg.target;
        this.targetElement = $(document.getElementById(a));
        this.targetZindex = this.targetElement.zIndex();
        this.align(c);
        this.jq.removeClass("ui-overlay-hidden").addClass("ui-overlay-visible").css({
            display: "none",
            visibility: "visible"
        });
        if (this.cfg.showEffect) {
            this.jq.show(this.cfg.showEffect, {}, 200, function () {
                b.postShow()
            })
        } else {
            this.jq.show();
            this.postShow()
        }
        if (this.cfg.modal) {
            this.enableModality()
        }
    },
    align: function (e) {
        var c = this.jq.css("position") == "fixed"
                , d = $(window)
                , a = c ? "-" + d.scrollLeft() + " -" + d.scrollTop() : null
                , b = e || this.cfg.target;
        this.jq.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        }).position({
            my: this.cfg.my,
            at: this.cfg.at,
            of: document.getElementById(b),
            offset: a
        })
    },
    hide: function () {
        var a = this;
        if (this.cfg.hideEffect) {
            this.jq.hide(this.cfg.hideEffect, {}, 200, function () {
                if (a.cfg.modal) {
                    a.disableModality()
                }
                a.postHide()
            })
        } else {
            this.jq.hide();
            if (a.cfg.modal) {
                a.disableModality()
            }
            this.postHide()
        }
    },
    postShow: function () {
        if (this.cfg.onShow) {
            this.cfg.onShow.call(this)
        }
        this.applyFocus()
    },
    postHide: function () {
        this.jq.removeClass("ui-overlay-visible").addClass("ui-overlay-hidden").css({
            display: "block",
            visibility: "hidden"
        });
        if (this.cfg.onHide) {
            this.cfg.onHide.call(this)
        }
    },
    setupDialogSupport: function () {
        var a = this.target.closest(".ui-dialog");
        if (a.length == 1) {
            this.jq.css("position", "fixed");
            if (!this.cfg.appendToBody) {
                this.jq.appendTo(document.body)
            }
        }
    },
    loadContents: function (c) {
        var b = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_contentLoad",
                            value: true
                        }],
                    onsuccess: function (f, d, e) {
                        PrimeFaces.ajax.Response.handle(f, d, e, {
                            widget: b,
                            handle: function (g) {
                                this.content.html(g);
                                this.loaded = true
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        b._show(c)
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    },
    isVisible: function () {
        return this.jq.hasClass("ui-overlay-visible")
    },
    applyFocus: function () {
        this.jq.find(":not(:submit):not(:button):input:visible:enabled:first").focus()
    },
    enableModality: function () {
        var b = this
                , a = $(document);
        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay ui-overlaypanel-mask"></div>').children(this.jqId + "_modal").css("z-index", this.jq.css("z-index") - 1);
        this.blockEvents = "focus." + this.id + " mousedown." + this.id + " mouseup." + this.id;
        if (this.targetElement) {
            this.targetElement.css("z-index", this.jq.css("z-index"))
        }
        a.on("keydown." + this.id, function (e) {
            var f = $(e.target);
            if (e.which === $.ui.keyCode.TAB) {
                var d = b.getTabbables();
                if (d.length) {
                    var g = d.filter(":first")
                            , c = d.filter(":last")
                            , h = null;
                    if (g.is(":radio")) {
                        h = d.filter('[name="' + g.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            g = h
                        }
                    }
                    if (c.is(":radio")) {
                        h = d.filter('[name="' + c.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            c = h
                        }
                    }
                    if (f.is(document.body)) {
                        g.focus(1);
                        e.preventDefault()
                    } else {
                        if (e.target === c[0] && !e.shiftKey) {
                            g.focus(1);
                            e.preventDefault()
                        } else {
                            if (e.target === g[0] && e.shiftKey) {
                                c.focus(1);
                                e.preventDefault()
                            }
                        }
                    }
                }
            } else {
                if (!f.is(document.body) && (f.zIndex() < b.jq.zIndex())) {
                    e.preventDefault()
                }
            }
        }).on(this.blockEvents, function (c) {
            if ($(c.target).zIndex() < b.jq.zIndex()) {
                c.preventDefault()
            }
        })
    },
    disableModality: function () {
        if (this.targetElement) {
            this.targetElement.css("z-index", this.targetZindex)
        }
        $(document.body).children(this.jqId + "_modal").remove();
        $(document).off(this.blockEvents).off("keydown." + this.id)
    },
    getTabbables: function () {
        var a;
        if (this.targetElement && this.targetElement.is(":tabbable")) {
            a = this.targetElement
        }
        return this.jq.find(":tabbable").add(a)
    }
});
PrimeFaces.widget.Paginator = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this.cfg = b;
        this.jq = $();
        var a = this;
        $.each(this.cfg.id, function (c, d) {
            a.jq = a.jq.add($(PrimeFaces.escapeClientId(d)))
        });
        this.pagesContainer = this.jq.children(".ui-paginator-pages");
        this.pageLinks = this.pagesContainer.children(".ui-paginator-page");
        this.rppSelect = this.jq.children(".ui-paginator-rpp-options");
        this.jtpSelect = this.jq.children(".ui-paginator-jtp-select");
        this.firstLink = this.jq.children(".ui-paginator-first");
        this.prevLink = this.jq.children(".ui-paginator-prev");
        this.nextLink = this.jq.children(".ui-paginator-next");
        this.endLink = this.jq.children(".ui-paginator-last");
        this.currentReport = this.jq.children(".ui-paginator-current");
        this.cfg.rows = this.cfg.rows == 0 ? this.cfg.rowCount : this.cfg.rows;
        this.cfg.prevRows = this.cfg.rows;
        this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows) || 1;
        this.cfg.pageLinks = this.cfg.pageLinks || 10;
        this.cfg.currentPageTemplate = this.cfg.currentPageTemplate || "({currentPage} of {totalPages})";
        this.cfg.ariaPageLabel = PrimeFaces.getAriaLabel("paginator.PAGE");
        this.bindEvents()
    },
    bindEvents: function () {
        var a = this;
        this.jq.children("a.ui-state-default").on("mouseover.paginator", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout.paginator", function () {
            $(this).removeClass("ui-state-hover")
        }).on("focus.paginator", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-focus")
            }
        }).on("blur.paginator", function () {
            $(this).removeClass("ui-state-focus")
        }).on("keydown.paginator", function (d) {
            var b = d.which
                    , c = $.ui.keyCode;
            if ((b === c.ENTER || b === c.NUMPAD_ENTER)) {
                $(this).trigger("click");
                d.preventDefault()
            }
        });
        this.bindPageLinkEvents();
        PrimeFaces.skinSelect(this.rppSelect);
        this.rppSelect.change(function (b) {
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setRowsPerPage(parseInt($(this).val()))
            }
        });
        PrimeFaces.skinSelect(this.jtpSelect);
        this.jtpSelect.change(function (b) {
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setPage(parseInt($(this).val()))
            }
        });
        this.firstLink.click(function (b) {
            PrimeFaces.clearSelection();
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setPage(0)
            }
            b.preventDefault()
        });
        this.prevLink.click(function (b) {
            PrimeFaces.clearSelection();
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setPage(a.cfg.page - 1)
            }
            b.preventDefault()
        });
        this.nextLink.click(function (b) {
            PrimeFaces.clearSelection();
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setPage(a.cfg.page + 1)
            }
            b.preventDefault()
        });
        this.endLink.click(function (b) {
            PrimeFaces.clearSelection();
            if (!$(this).hasClass("ui-state-disabled")) {
                a.setPage(a.cfg.pageCount - 1)
            }
            b.preventDefault()
        })
    },
    bindPageLinkEvents: function () {
        var a = this
                , b = this.pagesContainer.children(".ui-paginator-page");
        b.each(function () {
            var d = $(this)
                    , c = parseInt(d.text());
            d.attr("aria-label", a.cfg.ariaPageLabel.replace("{0}", (c)))
        });
        b.on("click.paginator", function (f) {
            var d = $(this)
                    , c = parseInt(d.text());
            if (!d.hasClass("ui-state-disabled") && !d.hasClass("ui-state-active")) {
                a.setPage(c - 1)
            }
            f.preventDefault()
        }).on("mouseover.paginator", function () {
            var c = $(this);
            if (!c.hasClass("ui-state-disabled") && !c.hasClass("ui-state-active")) {
                c.addClass("ui-state-hover")
            }
        }).on("mouseout.paginator", function () {
            $(this).removeClass("ui-state-hover")
        }).on("focus.paginator", function () {
            $(this).addClass("ui-state-focus")
        }).on("blur.paginator", function () {
            $(this).removeClass("ui-state-focus")
        }).on("keydown.paginator", function (f) {
            var c = f.which
                    , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                $(this).trigger("click");
                f.preventDefault()
            }
        })
    },
    updateUI: function () {
        if (this.cfg.page === 0) {
            this.disableElement(this.firstLink);
            this.disableElement(this.prevLink)
        } else {
            this.enableElement(this.firstLink);
            this.enableElement(this.prevLink)
        }
        if (this.cfg.page === (this.cfg.pageCount - 1)) {
            this.disableElement(this.nextLink);
            this.disableElement(this.endLink)
        } else {
            this.enableElement(this.nextLink);
            this.enableElement(this.endLink)
        }
        var a = (this.cfg.rowCount === 0) ? 0 : (this.cfg.page * this.cfg.rows) + 1
                , c = (this.cfg.page * this.cfg.rows) + this.cfg.rows;
        if (c > this.cfg.rowCount) {
            c = this.cfg.rowCount
        }
        var d = this.cfg.currentPageTemplate.replace("{currentPage}", this.cfg.page + 1).replace("{totalPages}", this.cfg.pageCount).replace("{totalRecords}", this.cfg.rowCount).replace("{startRecord}", a).replace("{endRecord}", c);
        this.currentReport.text(d);
        if (this.cfg.prevRows !== this.cfg.rows) {
            this.rppSelect.filter(":not(.ui-state-focus)").children("option").filter("option[value=" + this.cfg.rows + "]").prop("selected", true);
            this.cfg.prevRows = this.cfg.rows
        }
        if (this.jtpSelect.length > 0) {
            this.jtpSelect.children().remove();
            for (var b = 0; b < this.cfg.pageCount; b++) {
                this.jtpSelect.append("<option value=" + b + ">" + (b + 1) + "</option>")
            }
            this.jtpSelect.children("option[value=" + (this.cfg.page) + "]").prop("selected", "selected")
        }
        this.updatePageLinks()
    },
    updatePageLinks: function () {
        var a, b, l, h = $(document.activeElement), c, d;
        if (h.hasClass("ui-paginator-page")) {
            var k = this.pagesContainer.index(h.parent());
            if (k >= 0) {
                c = this.pagesContainer.eq(k);
                d = h.index()
            }
        }
        this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows) || 1;
        var g = Math.min(this.cfg.pageLinks, this.cfg.pageCount);
        a = Math.max(0, Math.ceil(this.cfg.page - ((g) / 2)));
        b = Math.min(this.cfg.pageCount - 1, a + g - 1);
        l = this.cfg.pageLinks - (b - a + 1);
        a = Math.max(0, a - l);
        this.pagesContainer.children().remove();
        for (var e = a; e <= b; e++) {
            var f = "ui-paginator-page ui-state-default ui-corner-all"
                    , j = this.cfg.ariaPageLabel.replace("{0}", (e + 1));
            if (this.cfg.page == e) {
                f += " ui-state-active"
            }
            this.pagesContainer.append('<a class="' + f + '" aria-label="' + j + '" tabindex="0" href="#">' + (e + 1) + "</a>")
        }
        if (c) {
            c.children().eq(d).trigger("focus")
        }
        this.bindPageLinkEvents()
    },
    setPage: function (c, a) {
        if (c >= 0 && c < this.cfg.pageCount && this.cfg.page != c) {
            var b = {
                first: this.cfg.rows * c,
                rows: this.cfg.rows,
                page: c
            };
            if (a) {
                this.cfg.page = c;
                this.updateUI()
            } else {
                this.cfg.paginate.call(this, b)
            }
        }
    },
    setRowsPerPage: function (b) {
        var c = this.cfg.rows * this.cfg.page
                , a = parseInt(c / b);
        this.cfg.rows = b;
        this.cfg.pageCount = Math.ceil(this.cfg.rowCount / this.cfg.rows);
        this.cfg.page = -1;
        this.setPage(a)
    },
    setTotalRecords: function (a) {
        this.cfg.rowCount = a;
        this.cfg.pageCount = Math.ceil(a / this.cfg.rows) || 1;
        this.cfg.page = 0;
        this.updateUI()
    },
    updateTotalRecords: function (a) {
        this.cfg.rowCount = a;
        this.cfg.pageCount = Math.ceil(a / this.cfg.rows) || 1;
        this.updateUI()
    },
    getCurrentPage: function () {
        return this.cfg.page
    },
    getFirst: function () {
        return (this.cfg.rows * this.cfg.page)
    },
    getRows: function () {
        return this.cfg.rows
    },
    getContainerHeight: function (c) {
        var a = 0;
        for (var b = 0; b < this.jq.length; b++) {
            a += this.jq.eq(b).outerHeight(c)
        }
        return a
    },
    disableElement: function (a) {
        a.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("tabindex", -1);
        a.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("tabindex", -1)
    },
    enableElement: function (a) {
        a.removeClass("ui-state-disabled").attr("tabindex", 0)
    },
    next: function () {
        this.setPage(this.cfg.page + 1)
    },
    prev: function () {
        this.setPage(this.cfg.page - 1)
    }
});
PrimeFaces.widget.PickList = PrimeFaces.widget.BaseWidget.extend({
    init: function (c) {
        this._super(c);
        this.sourceList = this.jq.find("ul.ui-picklist-source");
        this.targetList = this.jq.find("ul.ui-picklist-target");
        this.sourceInput = $(this.jqId + "_source");
        this.targetInput = $(this.jqId + "_target");
        this.items = this.jq.find(".ui-picklist-item:not(.ui-state-disabled)");
        if (this.cfg.showCheckbox) {
            this.checkboxes = this.items.find("div.ui-chkbox > div.ui-chkbox-box")
        }
        this.focusedItem = null;
        this.ariaRegion = $(this.jqId + "_ariaRegion");
        var b = this.sourceList.prev(".ui-picklist-caption")
                , a = this.targetList.prev(".ui-picklist-caption");
        if (b.length) {
            var f = b.text();
            this.sourceList.attr("aria-label", f);
            this.sourceInput.attr("title", f)
        }
        if (a.length) {
            var f = a.text();
            this.targetList.attr("aria-label", f);
            this.targetInput.attr("title", f)
        }
        this.setTabIndex();
        this.generateItems(this.sourceList, this.sourceInput);
        this.generateItems(this.targetList, this.targetInput);
        if (this.cfg.disabled) {
            $(this.jqId + " li.ui-picklist-item").addClass("ui-state-disabled");
            $(this.jqId + " button").attr("disabled", "disabled").addClass("ui-state-disabled");
            $(this.jqId + " .ui-picklist-filter-container").addClass("ui-state-disabled").children("input").attr("disabled", "disabled")
        } else {
            var e = this
                    , d = true;
            $(this.jqId + " ul").sortable({
                cancel: ".ui-state-disabled,.ui-chkbox-box",
                connectWith: this.jqId + " .ui-picklist-list",
                revert: 1,
                update: function (g, h) {
                    e.unselectItem(h.item);
                    e.saveState();
                    if (d) {
                        e.fireReorderEvent();
                        d = false
                    }
                },
                receive: function (g, h) {
                    e.fireTransferEvent(h.item, h.sender, h.item.parents("ul.ui-picklist-list:first"), "dragdrop")
                },
                start: function (g, h) {
                    e.itemListName = e.getListName(h.item);
                    e.dragging = true
                },
                stop: function (g, h) {
                    e.dragging = false
                },
                beforeStop: function (g, h) {
                    if (e.itemListName !== e.getListName(h.item)) {
                        d = false
                    } else {
                        d = true
                    }
                }
            });
            this.bindItemEvents();
            this.bindButtonEvents();
            this.bindFilterEvents();
            this.bindKeyEvents()
        }
    },
    bindItemEvents: function () {
        var a = this;
        this.items.on("mouseover.pickList", function (c) {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).addClass("ui-state-hover")
            }
        }).on("mouseout.pickList", function (b) {
            $(this).removeClass("ui-state-hover")
        }).on("click.pickList", function (f) {
            if (a.checkboxClick || a.dragging) {
                a.checkboxClick = false;
                return
            }
            var l = $(this)
                    , j = l.parent()
                    , g = (f.metaKey || f.ctrlKey);
            if (!f.shiftKey) {
                if (!g) {
                    a.unselectAll()
                }
                if (g && l.hasClass("ui-state-highlight")) {
                    a.unselectItem(l, true)
                } else {
                    a.selectItem(l, true);
                    a.cursorItem = l
                }
            } else {
                a.unselectAll();
                if (a.cursorItem && (a.cursorItem.parent().is(l.parent()))) {
                    var h = l.index()
                            , m = a.cursorItem.index()
                            , k = (h > m) ? m : h
                            , d = (h > m) ? (h + 1) : (m + 1);
                    for (var c = k; c < d; c++) {
                        var b = j.children("li.ui-picklist-item").eq(c);
                        if (b.is(":visible")) {
                            if (c === (d - 1)) {
                                a.selectItem(b, true)
                            } else {
                                a.selectItem(b)
                            }
                        }
                    }
                } else {
                    a.selectItem(l, true);
                    a.cursorItem = l
                }
            }
            a.removeOutline();
            a.focusedItem = l;
            j.trigger("focus.pickList")
        }).on("dblclick.pickList", function () {
            var b = $(this);
            if ($(this).parent().hasClass("ui-picklist-source")) {
                a.transfer(b, a.sourceList, a.targetList, "dblclick")
            } else {
                a.transfer(b, a.targetList, a.sourceList, "dblclick")
            }
            a.removeOutline();
            a.focusedItem = null;
            PrimeFaces.clearSelection()
        });
        if (this.cfg.showCheckbox) {
            this.checkboxes.on("mouseover.pickList", function (c) {
                var b = $(this);
                if (!b.hasClass("ui-state-active")) {
                    b.addClass("ui-state-hover")
                }
            }).on("mouseout.pickList", function (b) {
                $(this).removeClass("ui-state-hover")
            }).on("click.pickList", function (c) {
                a.checkboxClick = true;
                var b = $(this).closest("li.ui-picklist-item");
                if (b.hasClass("ui-state-highlight")) {
                    a.unselectItem(b, true)
                } else {
                    a.selectItem(b, true)
                }
                a.focusedItem = b
            })
        }
    },
    bindKeyEvents: function () {
        var b = this
                , a = "ul.ui-picklist-source, ul.ui-picklist-target";
        this.jq.off("focus.pickList blur.pickList keydown.pickList", a).on("focus.pickList", a, null, function (d) {
            var c = $(this)
                    , f = b.focusedItem || c.children(".ui-state-highlight:visible:first");
            if (f.length) {
                b.focusedItem = f
            } else {
                b.focusedItem = c.children(".ui-picklist-item:visible:first")
            }
            PrimeFaces.scrollInView(c, b.focusedItem);
            b.focusedItem.addClass("ui-picklist-outline");
            b.ariaRegion.text(b.focusedItem.data("item-label"))
        }).on("blur.pickList", a, null, function () {
            b.removeOutline();
            b.focusedItem = null
        }).on("keydown.pickList", a, null, function (i) {
            if (!b.focusedItem) {
                return
            }
            var g = $(this)
                    , h = $.ui.keyCode
                    , f = i.which;
            switch (f) {
                case h.UP:
                    b.removeOutline();
                    if (!b.focusedItem.hasClass("ui-state-highlight")) {
                        b.selectItem(b.focusedItem)
                    } else {
                        var d = b.focusedItem.prevAll(".ui-picklist-item:visible:first");
                        if (d.length) {
                            b.unselectAll();
                            b.selectItem(d);
                            b.focusedItem = d;
                            PrimeFaces.scrollInView(g, b.focusedItem)
                        }
                    }
                    b.ariaRegion.text(b.focusedItem.data("item-label"));
                    i.preventDefault();
                    break;
                case h.DOWN:
                    b.removeOutline();
                    if (!b.focusedItem.hasClass("ui-state-highlight")) {
                        b.selectItem(b.focusedItem)
                    } else {
                        var c = b.focusedItem.nextAll(".ui-picklist-item:visible:first");
                        if (c.length) {
                            b.unselectAll();
                            b.selectItem(c);
                            b.focusedItem = c;
                            PrimeFaces.scrollInView(g, b.focusedItem)
                        }
                    }
                    b.ariaRegion.text(b.focusedItem.data("item-label"));
                    i.preventDefault();
                    break;
                case h.ENTER:
                case h.NUMPAD_ENTER:
                case h.SPACE:
                    if (b.focusedItem && b.focusedItem.hasClass("ui-state-highlight")) {
                        b.focusedItem.trigger("dblclick.pickList");
                        b.focusedItem = null
                    }
                    i.preventDefault();
                    break
            }
        })
    },
    removeOutline: function () {
        if (this.focusedItem && this.focusedItem.hasClass("ui-picklist-outline")) {
            this.focusedItem.removeClass("ui-picklist-outline")
        }
    },
    selectItem: function (b, a) {
        b.removeClass("ui-state-hover").addClass("ui-state-highlight");
        if (this.cfg.showCheckbox) {
            this.selectCheckbox(b.find("div.ui-chkbox-box"))
        }
        if (a) {
            this.fireItemSelectEvent(b)
        }
    },
    unselectItem: function (b, a) {
        b.removeClass("ui-state-hover ui-state-highlight");
        if (PrimeFaces.isIE(8)) {
            b.css("filter", "")
        }
        if (this.cfg.showCheckbox) {
            this.unselectCheckbox(b.find("div.ui-chkbox-box"))
        }
        if (a) {
            this.fireItemUnselectEvent(b)
        }
    },
    unselectAll: function () {
        var b = this.items.filter(".ui-state-highlight");
        for (var a = 0; a < b.length; a++) {
            this.unselectItem(b.eq(a))
        }
    },
    selectCheckbox: function (a) {
        a.removeClass("ui-state-hover").addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
    },
    unselectCheckbox: function (a) {
        a.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
    },
    generateItems: function (b, a) {
        b.children(".ui-picklist-item").each(function () {
            var f = $(this)
                    , g = PrimeFaces.escapeHTML(f.attr("data-item-value"))
                    , e = f.attr("data-item-label")
                    , d = (e) ? PrimeFaces.escapeHTML(e) : ""
                    , c = $('<option selected="selected"></option>');
            c.prop("value", g).text(d);
            a.append(c)
        })
    },
    bindButtonEvents: function () {
        var a = this;
        PrimeFaces.skinButton(this.jq.find(".ui-button"));
        $(this.jqId + " .ui-picklist-button-add").click(function () {
            a.add()
        });
        $(this.jqId + " .ui-picklist-button-add-all").click(function () {
            a.addAll()
        });
        $(this.jqId + " .ui-picklist-button-remove").click(function () {
            a.remove()
        });
        $(this.jqId + " .ui-picklist-button-remove-all").click(function () {
            a.removeAll()
        });
        if (this.cfg.showSourceControls) {
            $(this.jqId + " .ui-picklist-source-controls .ui-picklist-button-move-up").click(function () {
                a.moveUp(a.sourceList)
            });
            $(this.jqId + " .ui-picklist-source-controls .ui-picklist-button-move-top").click(function () {
                a.moveTop(a.sourceList)
            });
            $(this.jqId + " .ui-picklist-source-controls .ui-picklist-button-move-down").click(function () {
                a.moveDown(a.sourceList)
            });
            $(this.jqId + " .ui-picklist-source-controls .ui-picklist-button-move-bottom").click(function () {
                a.moveBottom(a.sourceList)
            })
        }
        if (this.cfg.showTargetControls) {
            $(this.jqId + " .ui-picklist-target-controls .ui-picklist-button-move-up").click(function () {
                a.moveUp(a.targetList)
            });
            $(this.jqId + " .ui-picklist-target-controls .ui-picklist-button-move-top").click(function () {
                a.moveTop(a.targetList)
            });
            $(this.jqId + " .ui-picklist-target-controls .ui-picklist-button-move-down").click(function () {
                a.moveDown(a.targetList)
            });
            $(this.jqId + " .ui-picklist-target-controls .ui-picklist-button-move-bottom").click(function () {
                a.moveBottom(a.targetList)
            })
        }
    },
    bindFilterEvents: function () {
        this.setupFilterMatcher();
        this.sourceFilter = $(this.jqId + "_source_filter");
        this.targetFilter = $(this.jqId + "_target_filter");
        var a = this;
        PrimeFaces.skinInput(this.sourceFilter);
        PrimeFaces.skinInput(this.targetFilter);
        this.sourceFilter.on("keyup", function (b) {
            a.filter(this.value, a.sourceList)
        }).on("keydown", this.blockEnterKey);
        this.targetFilter.on("keyup", function (b) {
            a.filter(this.value, a.targetList)
        }).on("keydown", this.blockEnterKey)
    },
    blockEnterKey: function (c) {
        var a = c.which
                , b = $.ui.keyCode;
        if ((a === b.ENTER || a === b.NUMPAD_ENTER)) {
            c.preventDefault()
        }
    },
    setupFilterMatcher: function () {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    filter: function (h, e) {
        var g = $.trim(h).toLowerCase()
                , f = e.children("li.ui-picklist-item")
                , b = this.isAnimated();
        if (g === "") {
            f.filter(":hidden").show()
        } else {
            for (var c = 0; c < f.length; c++) {
                var j = f.eq(c)
                        , a = j.attr("data-item-label")
                        , d = this.filterMatcher(a, g);
                if (d) {
                    if (b) {
                        j.fadeIn("fast")
                    } else {
                        j.show()
                    }
                } else {
                    if (b) {
                        j.fadeOut("fast")
                    } else {
                        j.hide()
                    }
                }
            }
        }
    },
    startsWithFilter: function (b, a) {
        return b.toLowerCase().indexOf(a) === 0
    },
    containsFilter: function (b, a) {
        return b.toLowerCase().indexOf(a) !== -1
    },
    endsWithFilter: function (b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    add: function () {
        var a = this.sourceList.children("li.ui-picklist-item.ui-state-highlight");
        this.transfer(a, this.sourceList, this.targetList, "command")
    },
    addAll: function () {
        var a = this.sourceList.children("li.ui-picklist-item:visible:not(.ui-state-disabled)");
        this.transfer(a, this.sourceList, this.targetList, "command")
    },
    remove: function () {
        var a = this.targetList.children("li.ui-picklist-item.ui-state-highlight");
        this.transfer(a, this.targetList, this.sourceList, "command")
    },
    removeAll: function () {
        var a = this.targetList.children("li.ui-picklist-item:visible:not(.ui-state-disabled)");
        this.transfer(a, this.targetList, this.sourceList, "command")
    },
    moveUp: function (f) {
        var b = this
                , e = b.isAnimated()
                , c = f.children(".ui-state-highlight")
                , a = c.length
                , d = 0;
        if (a) {
            c.each(function () {
                var g = $(this);
                if (!g.is(":first-child")) {
                    if (e) {
                        g.hide(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                            g.insertBefore(g.prev()).show(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                                d++;
                                if (d === a) {
                                    b.saveState();
                                    b.fireReorderEvent()
                                }
                            })
                        })
                    } else {
                        g.hide().insertBefore(g.prev()).show()
                    }
                }
            });
            if (!e) {
                this.saveState();
                this.fireReorderEvent()
            }
        }
    },
    moveTop: function (f) {
        var b = this
                , e = b.isAnimated()
                , c = f.children(".ui-state-highlight")
                , a = c.length
                , d = 0;
        if (a) {
            c.each(function () {
                var g = $(this);
                if (!g.is(":first-child")) {
                    if (e) {
                        g.hide(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                            g.prependTo(g.parent()).show(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                                d++;
                                if (d === a) {
                                    b.saveState();
                                    b.fireReorderEvent()
                                }
                            })
                        })
                    } else {
                        g.hide().prependTo(g.parent()).show()
                    }
                }
            });
            if (!e) {
                this.saveState();
                this.fireReorderEvent()
            }
        }
    },
    moveDown: function (f) {
        var b = this
                , e = b.isAnimated()
                , c = f.children(".ui-state-highlight")
                , a = c.length
                , d = 0;
        if (a) {
            $(c.get().reverse()).each(function () {
                var g = $(this);
                if (!g.is(":last-child")) {
                    if (e) {
                        g.hide(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                            g.insertAfter(g.next()).show(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                                d++;
                                if (d === a) {
                                    b.saveState();
                                    b.fireReorderEvent()
                                }
                            })
                        })
                    } else {
                        g.hide().insertAfter(g.next()).show()
                    }
                }
            });
            if (!e) {
                this.saveState();
                this.fireReorderEvent()
            }
        }
    },
    moveBottom: function (f) {
        var b = this
                , e = b.isAnimated()
                , c = f.children(".ui-state-highlight")
                , a = c.length
                , d = 0;
        if (a) {
            c.each(function () {
                var g = $(this);
                if (!g.is(":last-child")) {
                    if (e) {
                        g.hide(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                            g.appendTo(g.parent()).show(b.cfg.effect, {}, b.cfg.effectSpeed, function () {
                                d++;
                                if (d === a) {
                                    b.saveState();
                                    b.fireReorderEvent()
                                }
                            })
                        })
                    } else {
                        g.hide().appendTo(g.parent()).show()
                    }
                }
            });
            if (!e) {
                this.saveState();
                this.fireReorderEvent()
            }
        }
    },
    saveState: function () {
        this.sourceInput.children().remove();
        this.targetInput.children().remove();
        this.generateItems(this.sourceList, this.sourceInput);
        this.generateItems(this.targetList, this.targetInput);
        this.cursorItem = null
    },
    transfer: function (b, g, f, d) {
        var e = this
                , a = b.length
                , c = 0;
        if (this.isAnimated()) {
            b.hide(this.cfg.effect, {}, this.cfg.effectSpeed, function () {
                var h = $(this);
                e.unselectItem(h);
                h.appendTo(f).show(e.cfg.effect, {}, e.cfg.effectSpeed, function () {
                    c++;
                    if (c == a) {
                        e.saveState();
                        e.fireTransferEvent(b, g, f, d)
                    }
                })
            })
        } else {
            b.hide();
            if (this.cfg.showCheckbox) {
                b.each(function () {
                    e.unselectItem($(this))
                })
            }
            b.appendTo(f).show();
            this.saveState();
            this.fireTransferEvent(b, g, f, d)
        }
    },
    fireTransferEvent: function (e, g, h, f) {
        if (this.cfg.onTransfer) {
            var c = {};
            c.items = e;
            c.from = g;
            c.to = h;
            c.type = f;
            this.cfg.onTransfer.call(this, c)
        }
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.transfer;
            if (a) {
                var b = {
                    params: []
                }
                , d = this.id + "_transferred"
                        , i = g.hasClass("ui-picklist-source");
                e.each(function (j, k) {
                    b.params.push({
                        name: d,
                        value: $(k).attr("data-item-value")
                    })
                });
                b.params.push({
                    name: this.id + "_add",
                    value: i
                });
                a.call(this, b)
            }
        }
    },
    getListName: function (a) {
        return a.parent().hasClass("ui-picklist-source") ? "source" : "target"
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    fireItemSelectEvent: function (c) {
        if (this.hasBehavior("select")) {
            var d = this.cfg.behaviors.select
                    , a = this.getListName(c)
                    , e = (a === "source") ? this.sourceInput : this.targetInput
                    , b = {
                        params: [{
                                name: this.id + "_itemIndex",
                                value: c.index()
                            }, {
                                name: this.id + "_listName",
                                value: a
                            }],
                        onstart: function () {
                            if (!e.children().length) {
                                return false
                            }
                        }
                    };
            d.call(this, b)
        }
    },
    fireItemUnselectEvent: function (c) {
        if (this.hasBehavior("unselect")) {
            var a = this.cfg.behaviors.unselect
                    , b = {
                        params: [{
                                name: this.id + "_itemIndex",
                                value: c.index()
                            }, {
                                name: this.id + "_listName",
                                value: this.getListName(c)
                            }]
                    };
            a.call(this, b)
        }
    },
    fireReorderEvent: function () {
        if (this.hasBehavior("reorder")) {
            this.cfg.behaviors.reorder.call(this)
        }
    },
    isAnimated: function () {
        return (this.cfg.effect && this.cfg.effect != "none")
    },
    setTabIndex: function () {
        var a = (this.cfg.disabled) ? "-1" : (this.cfg.tabindex || "0");
        this.sourceList.attr("tabindex", a);
        this.targetList.attr("tabindex", a);
        $(this.jqId + " button").attr("tabindex", a);
        $(this.jqId + " .ui-picklist-filter-container > input").attr("tabindex", a)
    }
});
PrimeFaces.widget.ProgressBar = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.jqValue = this.jq.children(".ui-progressbar-value");
        this.jqLabel = this.jq.children(".ui-progressbar-label");
        this.value = this.cfg.initialValue;
        this.cfg.global = (this.cfg.global === false) ? false : true;
        if (this.cfg.ajax) {
            this.cfg.formId = this.jq.closest("form").attr("id")
        }
        this.enableARIA()
    },
    setValue: function (b) {
        if (b >= 0 && b <= 100) {
            if (b == 0) {
                this.jqValue.hide().css("width", "0%").removeClass("ui-corner-right");
                this.jqLabel.hide()
            } else {
                this.jqValue.show().animate({
                    width: b + "%"
                }, 500, "easeInOutCirc");
                if (this.cfg.labelTemplate) {
                    var a = this.cfg.labelTemplate.replace(/{value}/gi, b);
                    this.jqLabel.html(a).show()
                }
            }
            this.value = b;
            this.jq.attr("aria-valuenow", b)
        }
    },
    getValue: function () {
        return this.value
    },
    start: function () {
        var a = this;
        if (this.cfg.ajax) {
            this.progressPoll = setInterval(function () {
                var b = {
                    source: a.id,
                    process: a.id,
                    formId: a.cfg.formId,
                    global: a.cfg.global,
                    async: true,
                    oncomplete: function (f, c, d) {
                        var e = d[a.id + "_value"];
                        a.setValue(e);
                        if (e === 100) {
                            a.fireCompleteEvent()
                        }
                    }
                };
                PrimeFaces.ajax.AjaxRequest(b)
            }, this.cfg.interval)
        }
    },
    fireCompleteEvent: function () {
        clearInterval(this.progressPoll);
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.complete;
            if (a) {
                a.call(this)
            }
        }
    },
    cancel: function () {
        clearInterval(this.progressPoll);
        this.setValue(0)
    },
    enableARIA: function () {
        this.jq.attr("role", "progressbar").attr("aria-valuemin", 0).attr("aria-valuenow", this.value).attr("aria-valuemax", 100)
    }
});
PrimeFaces.widget.Rating = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.jqInput = $(this.jqId + "_input");
        this.value = this.getValue();
        this.stars = this.jq.children(".ui-rating-star");
        this.cancel = this.jq.children(".ui-rating-cancel");
        if (!this.cfg.disabled && !this.cfg.readonly) {
            this.bindEvents()
        }
        if (this.cfg.readonly) {
            this.jq.children().css("cursor", "default")
        }
    },
    bindEvents: function () {
        var a = this;
        this.stars.click(function () {
            var b = a.stars.index(this) + 1;
            a.setValue(b)
        });
        this.cancel.hover(function () {
            $(this).toggleClass("ui-rating-cancel-hover")
        }).click(function () {
            a.reset()
        })
    },
    unbindEvents: function () {
        this.stars.unbind("click");
        this.cancel.unbind("hover click")
    },
    getValue: function () {
        var a = this.jqInput.val();
        return a == "" ? null : parseInt(a)
    },
    setValue: function (c) {
        this.jqInput.val(c);
        this.stars.removeClass("ui-rating-star-on");
        for (var b = 0; b < c; b++) {
            this.stars.eq(b).addClass("ui-rating-star-on")
        }
        if (this.cfg.onRate) {
            this.cfg.onRate.call(this, c)
        }
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.rate;
            if (a) {
                a.call(this)
            }
        }
    },
    enable: function () {
        this.cfg.disabled = false;
        this.bindEvents();
        this.jq.removeClass("ui-state-disabled")
    },
    disable: function () {
        this.cfg.disabled = true;
        this.unbindEvents();
        this.jq.addClass("ui-state-disabled")
    },
    reset: function () {
        this.jqInput.val("");
        this.stars.filter(".ui-rating-star-on").removeClass("ui-rating-star-on");
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.cancel;
            if (a) {
                a.call(this)
            }
        }
    }
});
PrimeFaces.widget.Resizable = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this.cfg = b;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jqTarget = $(PrimeFaces.escapeClientId(this.cfg.target));
        if (this.cfg.ajaxResize) {
            this.cfg.formId = $(this.target).parents("form:first").attr("id")
        }
        if (this.cfg.isContainment) {
            this.cfg.containment = PrimeFaces.escapeClientId(this.cfg.parentComponentId)
        }
        var a = this;
        this.cfg.stop = function (c, d) {
            if (a.cfg.onStop) {
                a.cfg.onStop.call(a, c, d)
            }
            a.fireAjaxResizeEvent(c, d)
        }
        ;
        this.cfg.start = function (c, d) {
            if (a.cfg.onStart) {
                a.cfg.onStart.call(a, c, d)
            }
        }
        ;
        this.cfg.resize = function (c, d) {
            if (a.cfg.onResize) {
                a.cfg.onResize.call(a, c, d)
            }
        }
        ;
        this.jqTarget.resizable(this.cfg);
        this.removeScriptElement(this.id)
    },
    fireAjaxResizeEvent: function (c, d) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.resize;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_width",
                            value: parseInt(d.helper.width())
                        }, {
                            name: this.id + "_height",
                            value: parseInt(d.helper.height())
                        }]
                };
                a.call(this, b)
            }
        }
    }
});
PrimeFaces.widget.Slider = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        this.cfg.displayTemplate = this.cfg.displayTemplate || (this.cfg.range ? "{min} - {max}" : "{value}");
        if (this.cfg.range) {
            var a = this.cfg.input.split(",");
            this.input = $(PrimeFaces.escapeClientId(a[0]) + "," + PrimeFaces.escapeClientId(a[1]))
        } else {
            this.input = $(PrimeFaces.escapeClientId(this.cfg.input))
        }
        if (this.cfg.display) {
            this.output = $(PrimeFaces.escapeClientId(this.cfg.display))
        }
        this.jq.slider(this.cfg);
        this.bindEvents();
        if (PrimeFaces.env.touch) {
            this.bindTouchEvents()
        }
    },
    bindEvents: function () {
        var a = this;
        this.jq.bind("slide", function (b, c) {
            a.onSlide(b, c)
        });
        if (this.cfg.onSlideStart) {
            this.jq.bind("slidestart", function (b, c) {
                a.cfg.onSlideStart.call(this, b, c)
            })
        }
        this.jq.bind("slidestop", function (b, c) {
            a.onSlideEnd(b, c)
        });
        if (this.input.parent().hasClass("ui-inputnumber")) {
            this.input.parent().find("input:hidden").on("change", function () {
                a.setValue($(this).val())
            })
        } else {
            this.input.on("keydown.slider", function (f) {
                var d = $.ui.keyCode
                        , c = f.which;
                switch (c) {
                    case d.UP:
                    case d.DOWN:
                    case d.LEFT:
                    case d.RIGHT:
                    case d.BACKSPACE:
                    case d.DELETE:
                    case d.END:
                    case d.HOME:
                    case d.TAB:
                        break;
                    default:
                        var g = f.metaKey || f.ctrlKey
                                , b = (c >= 48 && c <= 57) || (c >= 96 && c <= 105);
                        if (f.altKey || (f.shiftKey && !(c === d.UP || c === d.DOWN || c === d.LEFT || c === d.RIGHT))) {
                            f.preventDefault()
                        }
                        if (!b && !g) {
                            f.preventDefault()
                        }
                        break
                }
            }).on("keyup.slider", function (b) {
                a.setValue(a.input.val())
            })
        }
    },
    bindTouchEvents: function () {
        var a = {
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        };
        this.jq.children(".ui-slider-handle").on("touchstart touchmove touchend", function (c) {
            var d = c.originalEvent.changedTouches[0];
            var b = document.createEvent("MouseEvent");
            b.initMouseEvent(a[c.originalEvent.type], true, true, window, 1, d.screenX, d.screenY, d.clientX, d.clientY, false, false, false, false, 0, null);
            d.target.dispatchEvent(b);
            c.preventDefault()
        })
    },
    onSlide: function (a, b) {
        if (this.cfg.onSlide) {
            this.cfg.onSlide.call(this, a, b)
        }
        if (this.cfg.range) {
            this.setInputValue(this.input.eq(0), b.values[0]);
            this.setInputValue(this.input.eq(1), b.values[1]);
            if (this.output) {
                this.output.html(this.cfg.displayTemplate.replace("{min}", b.values[0]).replace("{max}", b.values[1]))
            }
        } else {
            this.setInputValue(this.input, b.value);
            if (this.output) {
                this.output.html(this.cfg.displayTemplate.replace("{value}", b.value))
            }
        }
    },
    setInputValue: function (b, a) {
        if (b.parent().hasClass("ui-inputnumber")) {
            b.autoNumeric("set", a)
        } else {
            b.val(a)
        }
    },
    triggerOnchange: function (a) {
        if (a.parent().hasClass("ui-inputnumber")) {
            a.change()
        }
    },
    onSlideEnd: function (c, d) {
        if (this.cfg.onSlideEnd) {
            this.cfg.onSlideEnd.call(this, c, d)
        }
        if (this.cfg.range) {
            this.triggerOnchange(this.input.eq(0));
            this.triggerOnchange(this.input.eq(1))
        } else {
            this.triggerOnchange(this.input)
        }
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.slideEnd;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_slideValue",
                            value: d.value
                        }]
                };
                a.call(this, b)
            }
        }
    },
    getValue: function () {
        return this.jq.slider("value")
    },
    setValue: function (a) {
        this.jq.slider("value", a)
    },
    getValues: function () {
        return this.jq.slider("values")
    },
    setValues: function (a) {
        this.jq.slider("values", a)
    },
    enable: function () {
        this.jq.slider("enable")
    },
    disable: function () {
        this.jq.slider("disable")
    }
});
PrimeFaces.widget.Spinner = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.input = this.jq.children(".ui-spinner-input");
        this.upButton = this.jq.children("a.ui-spinner-up");
        this.downButton = this.jq.children("a.ui-spinner-down");
        this.cfg.step = this.cfg.step || 1;
        this.cursorOffset = this.cfg.prefix ? this.cfg.prefix.length : 0;
        if (parseInt(this.cfg.step) === 0) {
            this.cfg.precision = this.cfg.step.toString().split(/[,]|[.]/)[1].length
        }
        var b = this.input.attr("maxlength");
        if (b) {
            this.cfg.maxlength = parseInt(b)
        }
        this.updateValue();
        this.addARIA();
        if (this.input.prop("disabled") || this.input.prop("readonly")) {
            return
        }
        this.bindEvents();
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        PrimeFaces.skinInput(this.input)
    },
    bindEvents: function () {
        var a = this;
        this.jq.children(".ui-spinner-button").on("mouseover.spinner", function () {
            $(this).addClass("ui-state-hover")
        }).on("mouseout.spinner", function () {
            $(this).removeClass("ui-state-hover ui-state-active");
            if (a.timer) {
                clearInterval(a.timer)
            }
        }).on("mouseup.spinner", function () {
            clearInterval(a.timer);
            $(this).removeClass("ui-state-active").addClass("ui-state-hover");
            a.input.trigger("change")
        }).on("mousedown.spinner", function (d) {
            var c = $(this)
                    , b = c.hasClass("ui-spinner-up") ? 1 : -1;
            c.removeClass("ui-state-hover").addClass("ui-state-active");
            if (a.input.is(":not(:focus)")) {
                a.input.focus()
            }
            a.repeat(null, b);
            d.preventDefault()
        });
        this.input.on("keydown.spinner", function (c) {
            var b = $.ui.keyCode;
            switch (c.which) {
                case b.UP:
                    a.spin(1);
                    break;
                case b.DOWN:
                    a.spin(-1);
                    break;
                case b.ENTER:
                case b.NUMPAD_ENTER:
                    a.updateValue();
                    a.format();
                    break;
                default:
                    break
            }
        }).on("keyup.spinner", function (c) {
            a.updateValue();
            var b = $.ui.keyCode;
            if (c.which === b.UP || c.which === b.DOWN) {
                a.input.trigger("change")
            }
        }).on("blur.spinner", function (b) {
            a.format()
        }).on("mousewheel.spinner", function (b, c) {
            if (a.input.is(":focus")) {
                if (c > 0) {
                    a.spin(1)
                } else {
                    a.spin(-1)
                }
                return false
            }
        })
    },
    repeat: function (a, b) {
        var d = this
                , c = a || 500;
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
            d.repeat(40, b)
        }, c);
        this.spin(b)
    },
    toFixed: function (c, a) {
        var b = Math.pow(10, a || 0);
        return String(Math.round(c * b) / b)
    },
    spin: function (a) {
        var c = this.cfg.step * a
                , b = this.value ? this.value : 0
                , d = null;
        if (this.cfg.precision) {
            d = parseFloat(this.toFixed(b + c, this.cfg.precision))
        } else {
            d = parseInt(b + c)
        }
        if (this.cfg.maxlength !== undefined && d.toString().length > this.cfg.maxlength) {
            d = b
        }
        if (this.cfg.min !== undefined && d < this.cfg.min) {
            d = this.cfg.min
        }
        if (this.cfg.max !== undefined && d > this.cfg.max) {
            d = this.cfg.max
        }
        this.value = d;
        this.format();
        this.input.attr("aria-valuenow", d)
    },
    updateValue: function () {
        var b = this.input.val();
        if ($.trim(b) === "") {
            if (this.cfg.min !== undefined) {
                this.value = this.cfg.min
            } else {
                this.value = null
            }
        } else {
            if (this.cfg.prefix && b.indexOf(this.cfg.prefix) === 0) {
                b = b.substring(this.cfg.prefix.length, b.length)
            } else {
                var a = b.indexOf(this.cfg.suffix);
                if (this.cfg.suffix && a > -1 && a === (b.length - this.cfg.suffix.length)) {
                    b = b.substring(0, b.length - this.cfg.suffix.length)
                }
            }
            if (this.cfg.precision) {
                b = parseFloat(b)
            } else {
                b = parseInt(b)
            }
            if (!isNaN(b)) {
                if (this.cfg.max !== undefined && b > this.cfg.max) {
                    b = this.cfg.max
                }
                if (this.cfg.min !== undefined && b < this.cfg.min) {
                    b = this.cfg.min
                }
                this.value = b
            }
        }
    },
    format: function () {
        if (this.value !== null) {
            var a = this.value;
            if (this.cfg.prefix) {
                a = this.cfg.prefix + a
            }
            if (this.cfg.suffix) {
                a = a + this.cfg.suffix
            }
            this.input.val(a)
        }
    },
    addARIA: function () {
        this.input.attr("role", "spinner");
        this.input.attr("aria-multiline", false);
        this.input.attr("aria-valuenow", this.value);
        if (this.cfg.min !== undefined) {
            this.input.attr("aria-valuemin", this.cfg.min)
        }
        if (this.cfg.max !== undefined) {
            this.input.attr("aria-valuemax", this.cfg.max)
        }
        if (this.input.prop("disabled")) {
            this.input.attr("aria-disabled", true)
        }
        if (this.input.prop("readonly")) {
            this.input.attr("aria-readonly", true)
        }
    }
});
PrimeFaces.widget.Spotlight = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.target = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.target);
        this.eventsToBlock = "focus." + this.id + " mousedown." + this.id + " mouseup." + this.id;
        if (!$(document.body).children(".ui-spotlight").length) {
            this.createMasks()
        }
        if (this.cfg.active) {
            this.show()
        }
    },
    createMasks: function () {
        var a = $(document.body);
        a.append('<div class="ui-widget-overlay ui-spotlight ui-spotlight-top ui-helper-hidden"></div><div class="ui-widget-overlay ui-spotlight ui-spotlight-bottom ui-helper-hidden"></div><div class="ui-widget-overlay ui-spotlight ui-spotlight-left ui-helper-hidden"></div><div class="ui-widget-overlay ui-spotlight ui-spotlight-right ui-helper-hidden"></div>')
    },
    show: function () {
        this.calculatePositions();
        $(document.body).children("div.ui-spotlight").show();
        this.bindEvents()
    },
    calculatePositions: function () {
        var c = $(document)
                , b = $(document.body)
                , e = this.target.offset();
        b.children("div.ui-spotlight-top").css({
            left: 0,
            top: 0,
            width: b.width(),
            height: e.top
        });
        var d = e.top + this.target.outerHeight();
        b.children("div.ui-spotlight-bottom").css({
            left: 0,
            top: d,
            width: b.width(),
            height: c.height() - d
        });
        b.children("div.ui-spotlight-left").css({
            left: 0,
            top: e.top,
            width: e.left,
            height: this.target.outerHeight()
        });
        var a = e.left + this.target.outerWidth();
        b.children("div.ui-spotlight-right").css({
            left: a,
            top: e.top,
            width: b.width() - a,
            height: this.target.outerHeight()
        })
    },
    bindEvents: function () {
        var a = this;
        this.target.data("zindex", this.target.zIndex()).css("z-index", ++PrimeFaces.zindex);
        $(document).on("keydown." + this.id, function (d) {
            var e = $(d.target);
            if (d.which === $.ui.keyCode.TAB) {
                var c = a.target.find(":tabbable");
                if (c.length) {
                    var f = c.filter(":first")
                            , b = c.filter(":last");
                    if (e.is(document.body)) {
                        f.focus(1);
                        d.preventDefault()
                    } else {
                        if (d.target === b[0] && !d.shiftKey) {
                            f.focus(1);
                            d.preventDefault()
                        } else {
                            if (d.target === f[0] && d.shiftKey) {
                                b.focus(1);
                                d.preventDefault()
                            }
                        }
                    }
                }
            } else {
                if (!e.is(document.body) && (e.zIndex() < a.target.zIndex())) {
                    d.preventDefault()
                }
            }
        }).on(this.eventsToBlock, function (b) {
            if ($(b.target).zIndex() < a.target.zIndex()) {
                b.preventDefault()
            }
        });
        $(window).on("resize.spotlight", function () {
            a.calculatePositions()
        })
    },
    unbindEvents: function () {
        $(document).off(this.eventsToBlock).off("keydown." + this.id);
        $(window).off("resize.spotlight")
    },
    hide: function () {
        $(document.body).children(".ui-spotlight").hide();
        this.unbindEvents();
        this.target.css("z-index", this.target.zIndex())
    }
});
PrimeFaces.widget.Sticky = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.target = $(PrimeFaces.escapeClientId(this.cfg.target));
        this.cfg.margin = this.cfg.margin || 0;
        this.initialState = {
            top: this.target.offset().top,
            height: this.target.height()
        };
        this.bindEvents()
    },
    refresh: function (a) {
        this.target = $(PrimeFaces.escapeClientId(this.cfg.target));
        if (this.fixed) {
            this.ghost.remove();
            this.fix(true)
        }
    },
    bindEvents: function () {
        var d = this
                , c = $(window)
                , b = "scroll." + this.cfg.id
                , a = "resize." + this.cfg.id;
        c.off(b).on(b, function () {
            if (c.scrollTop() > d.initialState.top) {
                d.fix()
            } else {
                d.restore()
            }
        }).off(a).on(a, function () {
            if (d.fixed) {
                d.target.width(d.ghost.outerWidth() - (d.target.outerWidth() - d.target.width()))
            }
        })
    },
    fix: function (b) {
        if (!this.fixed || b) {
            var c = $(window)
                    , a = c.scrollTop();
            this.target.css({
                position: "fixed",
                top: this.cfg.margin,
                "z-index": ++PrimeFaces.zindex
            }).addClass("ui-shadow ui-sticky");
            this.ghost = $('<div class="ui-sticky-ghost"></div>').height(this.target.outerHeight()).insertBefore(this.target);
            this.target.width(this.ghost.outerWidth() - (this.target.outerWidth() - this.target.width()));
            this.fixed = true;
            c.scrollTop(a)
        }
    },
    restore: function () {
        if (this.fixed) {
            this.target.css({
                position: "static",
                top: "auto",
                width: "auto"
            }).removeClass("ui-shadow ui-sticky");
            this.ghost.remove();
            this.fixed = false
        }
    }
});
PrimeFaces.widget.TabView = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        this.panelContainer = this.jq.children(".ui-tabs-panels");
        this.stateHolder = $(this.jqId + "_activeIndex");
        this.cfg.selected = parseInt(this.stateHolder.val());
        this.focusedTabHeader = null;
        this.tabindex = this.cfg.tabindex || 0;
        if (this.cfg.scrollable) {
            this.navscroller = this.jq.children(".ui-tabs-navscroller");
            this.navcrollerLeft = this.navscroller.children(".ui-tabs-navscroller-btn-left");
            this.navcrollerRight = this.navscroller.children(".ui-tabs-navscroller-btn-right");
            this.navContainer = this.navscroller.children(".ui-tabs-nav");
            this.firstTab = this.navContainer.children(":first-child");
            this.lastTab = this.navContainer.children(":last-child");
            this.scrollStateHolder = $(this.jqId + "_scrollState")
        } else {
            this.navContainer = this.jq.children(".ui-tabs-nav")
        }
        this.bindEvents();
        if (this.cfg.dynamic && this.cfg.cache) {
            this.markAsLoaded(this.panelContainer.children().eq(this.cfg.selected))
        }
        this.renderDeferred()
    },
    renderDeferred: function () {
        if (this.jq.is(":visible")) {
            this._render()
        } else {
            var a = this.jq.parent().closest(".ui-hidden-container")
                    , b = this;
            if (a.length) {
                this.addDeferredRender(this.id, a, function () {
                    return b.render()
                })
            }
        }
    },
    _render: function () {
        if (this.cfg.scrollable) {
            this.initScrolling()
        }
    },
    bindEvents: function () {
        var a = this;
        this.navContainer.children("li").on("mouseover.tabview", function (c) {
            var b = $(this);
            if (!b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout.tabview", function (c) {
            var b = $(this);
            if (!b.hasClass("ui-state-disabled")) {
                b.removeClass("ui-state-hover")
            }
        }).on("click.tabview", function (d) {
            var c = $(this);
            if ($(d.target).is(":not(.ui-icon-close)")) {
                var b = c.index();
                if (!c.hasClass("ui-state-disabled") && b !== a.cfg.selected) {
                    a.select(b)
                }
            }
            d.preventDefault()
        });
        this.navContainer.find("li .ui-icon-close").on("click.tabview", function (d) {
            var b = $(this).parent().index();
            if (a.cfg.onTabClose) {
                var c = a.cfg.onTabClose.call(a, b);
                if (c !== false) {
                    a.remove(b)
                }
            } else {
                a.remove(b)
            }
            d.preventDefault()
        });
        if (this.cfg.scrollable) {
            this.navscroller.children(".ui-tabs-navscroller-btn").on("mouseover.tabview", function () {
                var b = $(this);
                if (!b.hasClass("ui-state-disabled")) {
                    $(this).addClass("ui-state-hover")
                }
            }).on("mouseout.tabview", function () {
                var b = $(this);
                if (!b.hasClass("ui-state-disabled")) {
                    $(this).removeClass("ui-state-hover ui-state-active")
                }
            }).on("mousedown.tabview", function () {
                var b = $(this);
                if (!b.hasClass("ui-state-disabled")) {
                    $(this).removeClass("ui-state-hover").addClass("ui-state-active")
                }
            }).on("mouseup.tabview", function () {
                var b = $(this);
                if (!b.hasClass("ui-state-disabled")) {
                    $(this).addClass("ui-state-hover").removeClass("ui-state-active")
                }
            }).on("focus.tabview", function () {
                $(this).addClass("ui-state-focus")
            }).on("blur.tabview", function () {
                $(this).removeClass("ui-state-focus")
            });
            this.navcrollerLeft.on("click.tabview", function (b) {
                a.scroll(100);
                b.preventDefault()
            });
            this.navcrollerRight.on("click.tabview", function (b) {
                a.scroll(-100);
                b.preventDefault()
            })
        }
        this.bindKeyEvents()
    },
    bindKeyEvents: function () {
        var b = this
                , a = this.navContainer.children("li");
        a.attr("tabindex", this.tabindex);
        a.on("focus.tabview", function (d) {
            var c = $(this);
            if (!c.hasClass("ui-state-disabled")) {
                c.addClass("ui-tabs-outline");
                if (b.cfg.scrollable) {
                    if (c.position().left + c.width() > b.navcrollerRight.position().left) {
                        b.navcrollerRight.trigger("click.tabview")
                    } else {
                        if (c.position().left < b.navcrollerLeft.position().left) {
                            b.navcrollerLeft.trigger("click.tabview")
                        }
                    }
                }
            }
        }).on("blur.tabview", function () {
            $(this).removeClass("ui-tabs-outline")
        }).on("keydown.tabview", function (g) {
            var f = $.ui.keyCode
                    , d = g.which
                    , c = $(this);
            if ((d === f.SPACE || d === f.ENTER || d === f.NUMPAD_ENTER) && !c.hasClass("ui-state-disabled")) {
                b.select(c.index());
                g.preventDefault()
            }
        });
        if (this.cfg.scrollable) {
            this.navcrollerLeft.on("keydown.tabview", function (f) {
                var d = $.ui.keyCode
                        , c = f.which;
                if (c === d.SPACE || c === d.ENTER || c === d.NUMPAD_ENTER) {
                    b.scroll(100);
                    f.preventDefault()
                }
            });
            this.navcrollerRight.on("keydown.tabview", function (f) {
                var d = $.ui.keyCode
                        , c = f.which;
                if (c === d.SPACE || c === d.ENTER || c === d.NUMPAD_ENTER) {
                    b.scroll(-100);
                    f.preventDefault()
                }
            })
        }
    },
    initScrolling: function () {
        if (this.panelContainer.children().length) {
            var a = ((this.lastTab.position().left + this.lastTab.width()) - this.firstTab.position().left) > this.navscroller.innerWidth();
            if (a) {
                this.navscroller.css("padding-left", "18px");
                this.navcrollerLeft.attr("tabindex", this.tabindex).show();
                this.navcrollerRight.attr("tabindex", this.tabindex).show();
                this.restoreScrollState()
            }
        }
    },
    scroll: function (c) {
        if (this.navContainer.is(":animated")) {
            return
        }
        var f = parseInt(this.navContainer.css("margin-left"))
                , b = f + c
                , a = this.navscroller.innerWidth()
                , d = this;
        if (c < 0) {
            var e = this.lastTab.position().left + parseInt(this.lastTab.innerWidth());
            if (e > a) {
                this.navContainer.animate({
                    "margin-left": b + "px"
                }, "fast", "easeInOutCirc", function () {
                    d.saveScrollState(b);
                    if ((e + c) < a) {
                        d.disableScrollerButton(d.navcrollerRight)
                    }
                    if (d.navcrollerLeft.hasClass("ui-state-disabled")) {
                        d.enableScrollerButton(d.navcrollerLeft)
                    }
                })
            }
        } else {
            if (b <= 0) {
                this.navContainer.animate({
                    "margin-left": b + "px"
                }, "fast", "easeInOutCirc", function () {
                    d.saveScrollState(b);
                    if (b === 0) {
                        d.disableScrollerButton(d.navcrollerLeft)
                    }
                    if (d.navcrollerRight.hasClass("ui-state-disabled")) {
                        d.enableScrollerButton(d.navcrollerRight)
                    }
                })
            }
        }
    },
    disableScrollerButton: function (a) {
        a.addClass("ui-state-disabled").removeClass("ui-state-hover ui-state-active ui-state-focus").attr("tabindex", -1)
    },
    enableScrollerButton: function (a) {
        a.removeClass("ui-state-disabled").attr("tabindex", this.tabindex)
    },
    saveScrollState: function (a) {
        this.scrollStateHolder.val(a)
    },
    restoreScrollState: function () {
        var a = parseInt(this.scrollStateHolder.val());
        if (a === 0) {
            this.disableScrollerButton(this.navcrollerLeft)
        }
        this.navContainer.css("margin-left", this.scrollStateHolder.val() + "px")
    },
    select: function (d, c) {
        if (this.cfg.onTabChange && !c) {
            var a = this.cfg.onTabChange.call(this, d);
            if (a === false) {
                return false
            }
        }
        var b = this.panelContainer.children().eq(d)
                , e = this.cfg.dynamic && !this.isLoaded(b);
        this.stateHolder.val(d);
        this.cfg.selected = d;
        if (e) {
            this.loadDynamicTab(b)
        } else {
            this.show(b);
            if (this.hasBehavior("tabChange") && !c) {
                this.fireTabChangeEvent(b)
            }
        }
        return true
    },
    show: function (c) {
        var f = this.navContainer.children()
                , e = f.filter(".ui-state-active")
                , b = f.eq(c.index())
                , d = this.panelContainer.children(".ui-tabs-panel:visible")
                , a = this;
        d.attr("aria-hidden", true);
        e.attr("aria-expanded", false);
        e.attr("aria-selected", false);
        c.attr("aria-hidden", false);
        b.attr("aria-expanded", true);
        b.attr("aria-selected", true);
        if (this.cfg.effect) {
            d.hide(this.cfg.effect, null, this.cfg.effectDuration, function () {
                e.removeClass("ui-tabs-selected ui-state-active");
                b.addClass("ui-tabs-selected ui-state-active");
                c.show(a.cfg.effect, null, a.cfg.effectDuration, function () {
                    a.postTabShow(c)
                })
            })
        } else {
            e.removeClass("ui-tabs-selected ui-state-active");
            d.hide();
            b.addClass("ui-tabs-selected ui-state-active");
            c.show();
            this.postTabShow(c)
        }
    },
    loadDynamicTab: function (a) {
        var d = this
                , c = a.index()
                , b = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_contentLoad",
                            value: true
                        }, {
                            name: this.id + "_newTab",
                            value: a.attr("id")
                        }, {
                            name: this.id + "_tabindex",
                            value: c
                        }],
                    onsuccess: function (h, f, g) {
                        PrimeFaces.ajax.Response.handle(h, f, g, {
                            widget: d,
                            handle: function (i) {
                                a.html(i);
                                if (this.cfg.cache) {
                                    this.markAsLoaded(a)
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        d.show(a)
                    }
                };
        if (this.hasBehavior("tabChange")) {
            var e = this.cfg.behaviors.tabChange;
            e.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    remove: function (d) {
        var h = this.navContainer.children().eq(d)
                , b = this.panelContainer.children().eq(d);
        h.remove();
        b.remove();
        var f = this.getLength();
        if (f > 0) {
            if (d < this.cfg.selected) {
                this.cfg.selected--
            } else {
                if (d === this.cfg.selected) {
                    var e = (this.cfg.selected === (f)) ? (this.cfg.selected - 1) : this.cfg.selected
                            , g = this.navContainer.children("li")
                            , c = g.eq(e);
                    if (c.hasClass("ui-state-disabled")) {
                        var a = g.filter(":not(.ui-state-disabled):first");
                        if (a.length) {
                            this.select(a.index(), true)
                        }
                    } else {
                        this.select(e, true)
                    }
                }
            }
        } else {
            this.cfg.selected = -1
        }
        this.fireTabCloseEvent(b.attr("id"), d)
    },
    getLength: function () {
        return this.navContainer.children().length
    },
    getActiveIndex: function () {
        return this.cfg.selected
    },
    fireTabChangeEvent: function (a) {
        var c = this.cfg.behaviors.tabChange
                , b = {
                    params: [{
                            name: this.id + "_newTab",
                            value: a.attr("id")
                        }, {
                            name: this.id + "_tabindex",
                            value: a.index()
                        }]
                };
        c.call(this, b)
    },
    fireTabCloseEvent: function (d, a) {
        if (this.hasBehavior("tabClose")) {
            var c = this.cfg.behaviors.tabClose
                    , b = {
                        params: [{
                                name: this.id + "_closeTab",
                                value: d
                            }, {
                                name: this.id + "_tabindex",
                                value: a
                            }]
                    };
            c.call(this, b)
        }
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] !== undefined
        }
        return false
    },
    markAsLoaded: function (a) {
        a.data("loaded", true)
    },
    isLoaded: function (a) {
        return a.data("loaded") === true
    },
    disable: function (a) {
        this.navContainer.children().eq(a).addClass("ui-state-disabled")
    },
    enable: function (a) {
        this.navContainer.children().eq(a).removeClass("ui-state-disabled")
    },
    postTabShow: function (a) {
        if (this.cfg.onTabShow) {
            this.cfg.onTabShow.call(this, a.index())
        }
        PrimeFaces.invokeDeferredRenders(this.id)
    }
});
PrimeFaces.widget.TagCloud = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        var a = this;
        this.jq.find("a").mouseover(function () {
            $(this).addClass("ui-state-hover")
        }).mouseout(function () {
            $(this).removeClass("ui-state-hover")
        }).click(function (d) {
            var c = $(this);
            if (c.attr("href") === "#") {
                a.fireSelectEvent(c);
                d.preventDefault()
            }
        })
    },
    fireSelectEvent: function (b) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.select;
            if (c) {
                var a = {
                    params: [{
                            name: this.id + "_itemIndex",
                            value: b.parent().index()
                        }]
                };
                c.call(this, a)
            }
        }
    }
});
PrimeFaces.widget.Tooltip = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.cfg.showEvent = this.cfg.showEvent ? this.cfg.showEvent + ".tooltip" : "mouseover.tooltip";
        this.cfg.hideEvent = this.cfg.hideEvent ? this.cfg.hideEvent + ".tooltip" : "mouseout.tooltip";
        this.cfg.showEffect = this.cfg.showEffect ? this.cfg.showEffect : "fade";
        this.cfg.hideEffect = this.cfg.hideEffect ? this.cfg.hideEffect : "fade";
        this.cfg.showDelay = this.cfg.showDelay || 150;
        this.cfg.hideDelay = this.cfg.hideDelay || 0;
        this.cfg.hideEffectDuration = this.cfg.target ? 250 : 1;
        this.cfg.position = this.cfg.position || "right";
        if (this.cfg.target) {
            this.bindTarget()
        } else {
            this.bindGlobal()
        }
        this.removeScriptElement(this.id)
    },
    refresh: function (a) {
        if (a.target) {
            if ($(PrimeFaces.escapeClientId(a.id)).length > 1) {
                $(document.body).children(PrimeFaces.escapeClientId(a.id)).remove()
            }
        } else {
            $(document.body).children(".ui-tooltip-global").remove()
        }
        this._super(a)
    },
    bindGlobal: function () {
        this.jq = $('<div class="ui-tooltip ui-tooltip-global ui-widget ui-tooltip-' + this.cfg.position + '"></div>').appendTo("body");
        this.jq.append('<div class="ui-tooltip-arrow"></div><div class="ui-tooltip-text ui-shadow ui-corner-all"></div>');
        this.cfg.globalSelector = this.cfg.globalSelector || "a,:input,:button";
        this.cfg.escape = (this.cfg.escape === undefined) ? true : this.cfg.escape;
        var b = this;
        $(document).off(this.cfg.showEvent + " " + this.cfg.hideEvent, this.cfg.globalSelector).on(this.cfg.showEvent, this.cfg.globalSelector, function (d) {
            var c = $(this);
            if (c.prop("disabled")) {
                return
            }
            if (b.cfg.trackMouse) {
                b.mouseEvent = d
            }
            var g = c.attr("title");
            if (g) {
                c.data("tooltip", g).removeAttr("title")
            }
            if (c.hasClass("ui-state-error")) {
                b.jq.children(".ui-tooltip-text").addClass("ui-state-error")
            }
            var f = c.data("tooltip");
            if (f) {
                if (b.cfg.escape) {
                    b.jq.children(".ui-tooltip-text").text(f)
                } else {
                    b.jq.children(".ui-tooltip-text").html(f)
                }
                b.globalTitle = f;
                b.target = c;
                b.show()
            }
        }).on(this.cfg.hideEvent + ".tooltip", this.cfg.globalSelector, function () {
            if (b.globalTitle) {
                b.hide();
                b.globalTitle = null;
                b.target = null;
                b.jq.removeClass("ui-state-error")
            }
        });
        var a = "resize.tooltip";
        $(window).unbind(a).bind(a, function () {
            if (b.jq.is(":visible")) {
                b.align()
            }
        })
    },
    bindTarget: function () {
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(this.jqId);
        this.target = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.target);
        var b = this;
        this.target.off(this.cfg.showEvent + " " + this.cfg.hideEvent).on(this.cfg.showEvent, function (c) {
            if (b.cfg.trackMouse) {
                b.mouseEvent = c
            }
            if ($.trim(b.jq.children(".ui-tooltip-text").html()) !== "") {
                b.show()
            }
        }).on(this.cfg.hideEvent + ".tooltip", function () {
            b.hide()
        });
        this.jq.appendTo(document.body);
        if ($.trim(this.jq.children(".ui-tooltip-text").html()) === "") {
            this.jq.children(".ui-tooltip-text").html(this.target.attr("title"))
        }
        this.target.removeAttr("title");
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function () {
            if (b.jq.is(":visible")) {
                b.align()
            }
        })
    },
    alignUsing: function (a, b) {
        this.jq.removeClass("ui-tooltip-left ui-tooltip-right ui-tooltip-top ui-tooltip-bottom");
        switch (this.cfg.position) {
            case "right":
            case "left":
                this.jq.addClass("ui-tooltip-" + (b.horizontal == "left" ? "right" : "left"));
                break;
            case "top":
            case "bottom":
                this.jq.addClass("ui-tooltip-" + (b.vertical == "top" ? "bottom" : "top"));
                break
        }
        this.jq.css({
            left: a.left,
            top: a.top
        })
    },
    align: function () {
        var c = this;
        this.jq.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        });
        if (this.cfg.trackMouse && this.mouseEvent) {
            this.jq.position({
                my: "left top+15",
                at: "right bottom",
                of: this.mouseEvent,
                collision: "flipfit",
                using: function (e, d) {
                    c.alignUsing.call(c, e, d)
                }
            });
            this.mouseEvent = null
        } else {
            var a, b;
            switch (this.cfg.position) {
                case "right":
                    a = "left center";
                    b = "right center";
                    break;
                case "left":
                    a = "right center";
                    b = "left center";
                    break;
                case "top":
                    a = "center bottom";
                    b = "center top";
                    break;
                case "bottom":
                    a = "center top";
                    b = "center bottom";
                    break
            }
            this.jq.position({
                my: a,
                at: b,
                of: this.target,
                collision: "flipfit",
                using: function (e, d) {
                    c.alignUsing.call(c, e, d)
                }
            })
        }
    },
    show: function () {
        if (this.target) {
            var a = this;
            this.clearTimeout();
            this.timeout = setTimeout(function () {
                a._show()
            }, this.cfg.showDelay)
        }
    },
    _show: function () {
        var b = this;
        if (this.cfg.beforeShow) {
            var a = this.cfg.beforeShow.call(this);
            if (a === false) {
                return
            }
        }
        this.align();
        if (this.cfg.trackMouse) {
            this.followMouse()
        }
        this.jq.show(this.cfg.showEffect, {}, 250, function () {
            if (b.cfg.onShow) {
                b.cfg.onShow.call()
            }
        })
    },
    hide: function () {
        var a = this;
        this.clearTimeout();
        if (this.cfg.hideDelay) {
            this.timeout = setTimeout(function () {
                a._hide()
            }, this.cfg.hideDelay)
        } else {
            this._hide()
        }
    },
    _hide: function () {
        var a = this;
        if (this.isVisible()) {
            this.jq.hide(this.cfg.hideEffect, {}, this.cfg.hideEffectDuration, function () {
                $(this).css("z-index", "");
                if (a.cfg.trackMouse) {
                    a.unfollowMouse()
                }
                if (a.cfg.onHide) {
                    a.cfg.onHide.call()
                }
            })
        }
    },
    clearTimeout: function () {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    },
    followMouse: function () {
        var a = this;
        this.target.on("mousemove.tooltip-track", function (b) {
            a.jq.position({
                my: "left top+15",
                at: "right bottom",
                of: b,
                collision: "flipfit"
            })
        })
    },
    unfollowMouse: function () {
        this.target.off("mousemove.tooltip-track")
    },
    isVisible: function () {
        return this.jq.is(":visible")
    }
});
PrimeFaces.widget.BaseTree = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.cfg.highlight = (this.cfg.highlight === false) ? false : true;
        this.focusedNode = null;
        if (this.cfg.selectionMode) {
            this.initSelection()
        }
        this.bindEvents();
        this.jq.data("widget", this)
    },
    initSelection: function () {
        this.selectionHolder = $(this.jqId + "_selection");
        var a = this.selectionHolder.val();
        this.selections = a === "" ? [] : a.split(",");
        if (this.isCheckboxSelection()) {
            this.preselectCheckbox()
        }
    },
    bindContextMenu: function (e, f, d, a) {
        var c = d + " .ui-tree-selectable"
                , b = a.nodeType ? a.event + ".treenode." + a.nodeType : a.event + ".treenode"
                , g = a.event + ".tree";
        $(document).off(b, c).on(b, c, null, function (i) {
            var h = $(this);
            if (a.nodeType === undefined || h.parent().data("nodetype") === a.nodeType) {
                f.nodeRightClick(i, h);
                e.show(i)
            }
        });
        $(document).off(g, this.jqTargetId).on(g, this.jqTargetId, null, function (h) {
            if (f.isEmpty()) {
                e.show(h)
            }
        })
    },
    expandNode: function (b) {
        var c = this;
        if (this.cfg.dynamic) {
            if (this.cfg.cache && c.getNodeChildrenContainer(b).children().length > 0) {
                this.showNodeChildren(b);
                return
            }
            if (b.data("processing")) {
                PrimeFaces.debug("Node is already being expanded, ignoring expand event.");
                return
            }
            b.data("processing", true);
            var a = {
                source: this.id,
                process: this.id,
                update: this.id,
                formId: this.cfg.formId,
                params: [{
                        name: this.id + "_expandNode",
                        value: c.getRowKey(b)
                    }],
                onsuccess: function (g, e, f) {
                    PrimeFaces.ajax.Response.handle(g, e, f, {
                        widget: c,
                        handle: function (h) {
                            var i = this.getNodeChildrenContainer(b);
                            i.append(h);
                            this.showNodeChildren(b);
                            if (this.cfg.draggable) {
                                this.makeDraggable(i.find("span.ui-treenode-content"))
                            }
                            if (this.cfg.droppable) {
                                this.makeDropPoints(i.find("li.ui-tree-droppoint"));
                                this.makeDropNodes(i.find("span.ui-treenode-droppable"))
                            }
                        }
                    });
                    return true
                },
                oncomplete: function () {
                    b.removeData("processing")
                }
            };
            if (this.hasBehavior("expand")) {
                var d = this.cfg.behaviors.expand;
                d.call(this, a)
            } else {
                PrimeFaces.ajax.Request.handle(a)
            }
        } else {
            this.showNodeChildren(b);
            this.fireExpandEvent(b)
        }
    },
    fireExpandEvent: function (b) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.expand;
            if (c) {
                var a = {
                    params: [{
                            name: this.id + "_expandNode",
                            value: this.getRowKey(b)
                        }]
                };
                c.call(this, a)
            }
        }
    },
    fireCollapseEvent: function (c) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.collapse;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_collapseNode",
                            value: this.getRowKey(c)
                        }]
                };
                a.call(this, b)
            }
        }
    },
    getNodeChildrenContainer: function (a) {
        throw "Unsupported Operation"
    },
    showNodeChildren: function (a) {
        throw "Unsupported Operation"
    },
    writeSelections: function () {
        this.selectionHolder.val(this.selections.join(","))
    },
    fireNodeSelectEvent: function (c) {
        if (this.isCheckboxSelection() && this.cfg.dynamic) {
            var e = this
                    , a = {
                        source: this.id,
                        process: this.id
                    };
            a.params = [{
                    name: this.id + "_instantSelection",
                    value: this.getRowKey(c)
                }];
            a.oncomplete = function (k, f, g) {
                if (g.descendantRowKeys && g.descendantRowKeys !== "") {
                    var j = g.descendantRowKeys.split(",");
                    for (var h = 0; h < j.length; h++) {
                        e.addToSelection(j[h])
                    }
                    e.writeSelections()
                }
            }
            ;
            if (this.hasBehavior("select")) {
                var d = this.cfg.behaviors.select;
                d.call(this, a)
            } else {
                PrimeFaces.ajax.AjaxRequest(a)
            }
        } else {
            if (this.hasBehavior("select")) {
                var d = this.cfg.behaviors.select
                        , b = {
                            params: [{
                                    name: this.id + "_instantSelection",
                                    value: this.getRowKey(c)
                                }]
                        };
                d.call(this, b)
            }
        }
    },
    fireNodeUnselectEvent: function (c) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.unselect;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_instantUnselection",
                            value: this.getRowKey(c)
                        }]
                };
                a.call(this, b)
            }
        }
    },
    fireContextMenuEvent: function (c) {
        if (this.hasBehavior("contextMenu")) {
            var b = this.cfg.behaviors.contextMenu
                    , a = {
                        params: [{
                                name: this.id + "_contextMenuNode",
                                value: this.getRowKey(c)
                            }]
                    };
            b.call(this, a)
        }
    },
    getRowKey: function (a) {
        return a.attr("data-rowkey")
    },
    isNodeSelected: function (a) {
        return $.inArray(this.getRowKey(a), this.selections) != -1
    },
    isSingleSelection: function () {
        return this.cfg.selectionMode == "single"
    },
    isMultipleSelection: function () {
        return this.cfg.selectionMode == "multiple"
    },
    isCheckboxSelection: function () {
        return this.cfg.selectionMode == "checkbox"
    },
    addToSelection: function (a) {
        if (!PrimeFaces.inArray(this.selections, a)) {
            this.selections.push(a)
        }
    },
    removeFromSelection: function (a) {
        this.selections = $.grep(this.selections, function (b) {
            return b !== a
        })
    },
    removeDescendantsFromSelection: function (c) {
        var a = [];
        for (var b = 0; b < this.selections.length; b++) {
            if (this.selections[b].indexOf(c + "_") !== 0) {
                a.push(this.selections[b])
            }
        }
        this.selections = a
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    nodeClick: function (f, a) {
        if ($(f.target).is(":not(.ui-tree-toggler)")) {
            var e = a.parent()
                    , b = a.hasClass("ui-tree-selectable");
            if (this.cfg.onNodeClick) {
                this.cfg.onNodeClick.call(this, e, f)
            }
            if (b && this.cfg.selectionMode) {
                var d = this.isNodeSelected(e)
                        , g = f.metaKey || f.ctrlKey
                        , c = f.shiftKey;
                if (this.isCheckboxSelection()) {
                    this.toggleCheckboxNode(e)
                } else {
                    if (d && (g)) {
                        this.unselectNode(e)
                    } else {
                        if (this.isSingleSelection() || (this.isMultipleSelection() && !g)) {
                            this.unselectAllNodes()
                        }
                        this.selectNode(e);
                        this.cursorNode = e
                    }
                }
                if ($(f.target).is(":not(:input:enabled)")) {
                    PrimeFaces.clearSelection();
                    this.focusNode(e)
                }
            }
        }
    },
    nodeRightClick: function (e, a) {
        PrimeFaces.clearSelection();
        if ($(e.target).is(":not(.ui-tree-toggler)")) {
            var d = a.parent()
                    , b = a.hasClass("ui-tree-selectable");
            if (b && this.cfg.selectionMode) {
                var c = this.isNodeSelected(d);
                if (!c) {
                    if (this.isCheckboxSelection()) {
                        this.toggleCheckboxNode(d)
                    } else {
                        this.unselectAllNodes();
                        this.selectNode(d, true)
                    }
                }
                this.fireContextMenuEvent(d)
            }
        }
    },
    bindEvents: function () {
        throw "Unsupported Operation"
    },
    selectNode: function (b, a) {
        throw "Unsupported Operation"
    },
    unselectNode: function (b, a) {
        throw "Unsupported Operation"
    },
    unselectAllNodes: function () {
        throw "Unsupported Operation"
    },
    preselectCheckbox: function () {
        throw "Unsupported Operation"
    },
    toggleCheckboxNode: function (a) {
        throw "Unsupported Operation"
    },
    isEmpty: function () {
        throw "Unsupported Operation"
    },
    toggleCheckboxState: function (b, a) {
        if (a) {
            this.uncheck(b)
        } else {
            this.check(b)
        }
    },
    partialCheck: function (d) {
        var b = d.children(".ui-chkbox-box")
                , a = b.children(".ui-chkbox-icon")
                , c = d.closest(".ui-treenode")
                , e = this.getRowKey(c);
        c.find("> .ui-treenode-content > .ui-treenode-label").removeClass("ui-state-highlight");
        a.removeClass("ui-icon-blank ui-icon-check").addClass("ui-icon-minus");
        c.removeClass("ui-treenode-selected ui-treenode-unselected").addClass("ui-treenode-hasselected").attr("aria-checked", false).attr("aria-selected", false);
        this.removeFromSelection(e)
    },
    check: function (d) {
        var b = d.children(".ui-chkbox-box")
                , a = b.children(".ui-chkbox-icon")
                , c = d.closest(".ui-treenode")
                , e = this.getRowKey(c);
        b.removeClass("ui-state-hover");
        a.removeClass("ui-icon-blank ui-icon-minus").addClass("ui-icon-check");
        c.removeClass("ui-treenode-hasselected ui-treenode-unselected").addClass("ui-treenode-selected").attr("aria-checked", true).attr("aria-selected", true);
        this.addToSelection(e)
    },
    uncheck: function (d) {
        var b = d.children(".ui-chkbox-box")
                , a = b.children(".ui-chkbox-icon")
                , c = d.closest(".ui-treenode")
                , e = this.getRowKey(c);
        b.removeClass("ui-state-hover");
        a.removeClass("ui-icon-minus ui-icon-check").addClass("ui-icon-blank");
        c.removeClass("ui-treenode-hasselected ui-treenode-selected").addClass("ui-treenode-unselected").attr("aria-checked", false).attr("aria-selected", false);
        this.removeFromSelection(e)
    },
    isExpanded: function (a) {
        return this.getNodeChildrenContainer(a).is(":visible")
    },
    focusNode: function () {
        throw "Unsupported Operation"
    }
});
PrimeFaces.widget.VerticalTree = PrimeFaces.widget.BaseTree.extend({
    init: function (a) {
        this._super(a);
        this.container = this.jq.children(".ui-tree-container");
        this.cfg.rtl = this.jq.hasClass("ui-tree-rtl");
        this.cfg.collapsedIcon = this.cfg.rtl ? "ui-icon-triangle-1-w" : "ui-icon-triangle-1-e";
        if (this.cfg.draggable) {
            this.initDraggable()
        }
        if (this.cfg.droppable) {
            this.initDroppable()
        }
    },
    bindEvents: function () {
        var e = this
                , b = ".ui-tree-toggler"
                , a = ".ui-tree-selectable .ui-treenode-label"
                , c = ".ui-treenode-content";
        this.jq.off("click.tree-toggle", b).on("click.tree-toggle", b, null, function (h) {
            var f = $(this)
                    , g = f.closest("li");
            if (f.hasClass(e.cfg.collapsedIcon)) {
                e.expandNode(g)
            } else {
                e.collapseNode(g)
            }
        });
        if (this.cfg.highlight && this.cfg.selectionMode) {
            this.jq.off("mouseout.tree mouseover.tree", a).on("mouseout.tree", a, null, function () {
                var f = $(this);
                f.removeClass("ui-state-hover");
                if (e.isCheckboxSelection()) {
                    f.siblings("div.ui-chkbox").children("div.ui-chkbox-box").removeClass("ui-state-hover")
                }
            }).on("mouseover.tree", a, null, function () {
                var f = $(this);
                $(this).addClass("ui-state-hover");
                if (e.isCheckboxSelection()) {
                    f.siblings("div.ui-chkbox").children("div.ui-chkbox-box").addClass("ui-state-hover")
                }
            })
        }
        if (this.isCheckboxSelection()) {
            var d = ".ui-chkbox-box:not(.ui-state-disabled)";
            this.jq.off("mouseout.tree-checkbox mouseover.tree-checkbox click.tree-checkbox", d).on("mouseout.tree-checkbox", d, null, function () {
                $(this).removeClass("ui-state-hover").parent().siblings("span.ui-treenode-label").removeClass("ui-state-hover")
            }).on("mouseover.tree-checkbox", d, null, function () {
                $(this).addClass("ui-state-hover").parent().siblings("span.ui-treenode-label").addClass("ui-state-hover")
            })
        }
        this.jq.off("click.tree-content", c).on("click.tree-content", c, null, function (f) {
            e.nodeClick(f, $(this))
        });
        if (this.cfg.filter) {
            this.filterInput = this.jq.find(".ui-tree-filter");
            PrimeFaces.skinInput(this.filterInput);
            this.filterInput.on("keydown.tree-filter", function (h) {
                var f = h.which
                        , g = $.ui.keyCode;
                if ((f === g.ENTER || f === g.NUMPAD_ENTER)) {
                    h.preventDefault()
                }
            }).on("keyup.tree-filter", function (h) {
                var g = $.ui.keyCode
                        , f = h.which;
                switch (f) {
                    case g.UP:
                    case g.LEFT:
                    case g.DOWN:
                    case g.RIGHT:
                    case g.ENTER:
                    case g.NUMPAD_ENTER:
                    case g.TAB:
                    case g.ESCAPE:
                    case g.SPACE:
                    case g.HOME:
                    case g.PAGE_DOWN:
                    case g.PAGE_UP:
                    case g.END:
                    case g.DELETE:
                    case 16:
                    case 17:
                    case 18:
                    case 91:
                    case 92:
                    case 93:
                    case 20:
                        break;
                    default:
                        if (f >= 112 && f <= 123) {
                            break
                        }
                        var i = h.metaKey || h.ctrlKey || h.shiftKey;
                        if (!i) {
                            if (e.filterTimeout) {
                                clearTimeout(e.filterTimeout)
                            }
                            e.filterTimeout = setTimeout(function () {
                                e.filter();
                                e.filterTimeout = null
                            }, 300)
                        }
                        break
                }
            })
        }
        this.bindKeyEvents()
    },
    bindKeyEvents: function () {
        var a = this
                , b = false;
        this.jq.on("mousedown.tree", function (c) {
            if ($(c.target).is(":not(:input:enabled)")) {
                c.preventDefault()
            }
        }).on("focus.tree", function () {
            if (!a.focusedNode && !b) {
                a.focusNode(a.getFirstNode())
            }
        });
        this.jq.off("keydown.tree blur.tree", ".ui-treenode-label").on("keydown.tree", ".ui-treenode-label", null, function (k) {
            if (!a.focusedNode) {
                return
            }
            var l = ""
                    , n = $.ui.keyCode;
            switch (k.which) {
                case n.LEFT:
                    var f = a.focusedNode.data("rowkey").toString()
                            , o = f.length;
                    if (a.isExpanded(a.focusedNode)) {
                        a.collapseNode(a.focusedNode)
                    } else {
                        var g = null;
                        for (var j = 1; j < parseInt(o / 2) + 1; j++) {
                            l = f.substring(0, o - 2 * j);
                            g = a.container.find("li:visible[data-rowkey = '" + l + "']");
                            if (g.length) {
                                a.focusNode(g);
                                break
                            }
                        }
                    }
                    k.preventDefault();
                    break;
                case n.RIGHT:
                    if (!a.focusedNode.hasClass("ui-treenode-leaf")) {
                        var f = a.focusedNode.data("rowkey").toString()
                                , o = f.length;
                        if (!a.isExpanded(a.focusedNode)) {
                            a.expandNode(a.focusedNode)
                        }
                        if (!a.isExpanded(a.focusedNode) && !a.cfg.dynamic) {
                            l = f + "_0";
                            var g = a.container.find("li:visible[data-rowkey = '" + l + "']");
                            if (g.length) {
                                a.focusNode(g)
                            }
                        }
                    }
                    k.preventDefault();
                    break;
                case n.UP:
                    var g = null
                            , c = a.focusedNode.prev();
                    if (c.length) {
                        g = c.find("li.ui-treenode:visible:last");
                        if (!g.length) {
                            g = c
                        }
                    } else {
                        g = a.focusedNode.closest("ul").parent("li")
                    }
                    if (g.length) {
                        a.focusNode(g)
                    }
                    k.preventDefault();
                    break;
                case n.DOWN:
                    var g = null
                            , d = a.focusedNode.find("> ul > li:visible:first");
                    if (d.length) {
                        g = d
                    } else {
                        if (a.focusedNode.next().length) {
                            g = a.focusedNode.next()
                        } else {
                            var f = a.focusedNode.data("rowkey").toString();
                            if (f.length !== 1) {
                                g = a.searchDown(a.focusedNode)
                            }
                        }
                    }
                    if (g && g.length) {
                        a.focusNode(g)
                    }
                    k.preventDefault();
                    break;
                case n.ENTER:
                case n.NUMPAD_ENTER:
                case n.SPACE:
                    if (a.cfg.selectionMode) {
                        var m = a.focusedNode.children(".ui-treenode-content").hasClass("ui-tree-selectable");
                        if (a.cfg.onNodeClick) {
                            a.cfg.onNodeClick.call(a, a.focusedNode, k)
                        }
                        if (m) {
                            var h = a.isNodeSelected(a.focusedNode);
                            if (a.isCheckboxSelection()) {
                                a.toggleCheckboxNode(a.focusedNode)
                            } else {
                                if (h) {
                                    a.unselectNode(a.focusedNode)
                                } else {
                                    if (a.isSingleSelection()) {
                                        a.unselectAllNodes()
                                    }
                                    a.selectNode(a.focusedNode);
                                    a.cursorNode = a.focusedNode
                                }
                            }
                        }
                    }
                    k.preventDefault();
                    break;
                case n.TAB:
                    b = true;
                    a.jq.focus();
                    setTimeout(function () {
                        b = false
                    }, 2);
                    break
            }
        }).on("blur.tree", ".ui-treenode-label", null, function (c) {
            if (a.focusedNode) {
                a.getNodeLabel(a.focusedNode).removeClass("ui-treenode-outline");
                a.focusedNode = null
            }
        })
    },
    searchDown: function (d) {
        var b = d.closest("ul").parent("li").next()
                , a = null;
        if (b.length) {
            a = b
        } else {
            if (d.hasClass("ui-treenode-leaf") && d.closest("ul").parent("li").length == 0) {
                a = d
            } else {
                var c = d.data("rowkey").toString();
                if (c.length !== 1) {
                    a = this.searchDown(d.closest("ul").parent("li"))
                }
            }
        }
        return a
    },
    collapseNode: function (h) {
        var b = this
                , e = h.find("> .ui-treenode-content")
                , g = e.find("> .ui-tree-toggler")
                , d = h.data("nodetype")
                , c = g.nextAll("span.ui-treenode-icon")
                , a = this.cfg.iconStates[d]
                , f = h.children(".ui-treenode-children");
        e.find("> .ui-treenode-label").attr("aria-expanded", false);
        g.addClass(b.cfg.collapsedIcon).removeClass("ui-icon-triangle-1-s");
        if (a) {
            c.removeClass(a.expandedIcon).addClass(a.collapsedIcon)
        }
        if (this.cfg.animate) {
            f.slideUp("fast", function () {
                b.postCollapse(h, f)
            })
        } else {
            f.hide();
            this.postCollapse(h, f)
        }
    },
    postCollapse: function (b, a) {
        if (this.cfg.dynamic && !this.cfg.cache) {
            a.empty()
        }
        this.fireCollapseEvent(b)
    },
    getNodeChildrenContainer: function (a) {
        return a.children(".ui-treenode-children")
    },
    showNodeChildren: function (f) {
        var d = f.find("> .ui-treenode-content")
                , e = d.find("> .ui-tree-toggler")
                , c = f.data("nodetype")
                , b = e.nextAll("span.ui-treenode-icon")
                , a = this.cfg.iconStates[c];
        d.find("> .ui-treenode-label").attr("aria-expanded", true);
        e.addClass("ui-icon-triangle-1-s").removeClass(this.cfg.collapsedIcon);
        if (a) {
            b.removeClass(a.collapsedIcon).addClass(a.expandedIcon)
        }
        if (this.cfg.animate) {
            f.children(".ui-treenode-children").slideDown("fast")
        } else {
            f.children(".ui-treenode-children").show()
        }
    },
    unselectAllNodes: function () {
        this.selections = [];
        this.jq.find(".ui-treenode-label.ui-state-highlight").each(function () {
            $(this).removeClass("ui-state-highlight").closest(".ui-treenode").attr("aria-selected", false)
        })
    },
    selectNode: function (b, a) {
        b.attr("aria-selected", true).find("> .ui-treenode-content > .ui-treenode-label").removeClass("ui-state-hover").addClass("ui-state-highlight");
        this.addToSelection(this.getRowKey(b));
        this.writeSelections();
        if (!a) {
            this.fireNodeSelectEvent(b)
        }
    },
    unselectNode: function (b, a) {
        var c = this.getRowKey(b);
        b.attr("aria-selected", false).find("> .ui-treenode-content > .ui-treenode-label").removeClass("ui-state-highlight ui-state-hover");
        this.removeFromSelection(c);
        this.writeSelections();
        if (!a) {
            this.fireNodeUnselectEvent(b)
        }
    },
    toggleCheckboxNode: function (b) {
        var d = this
                , c = b.find("> .ui-treenode-content > .ui-chkbox")
                , a = c.find("> .ui-chkbox-box > .ui-chkbox-icon").hasClass("ui-icon-check");
        this.toggleCheckboxState(c, a);
        if (this.cfg.propagateDown) {
            b.children(".ui-treenode-children").find(".ui-chkbox").each(function () {
                d.toggleCheckboxState($(this), a)
            });
            if (this.cfg.dynamic) {
                this.removeDescendantsFromSelection(b.data("rowkey"))
            }
        }
        if (this.cfg.propagateUp) {
            b.parents("li.ui-treenode-parent").each(function () {
                var e = $(this)
                        , f = e.find("> .ui-treenode-content > .ui-chkbox")
                        , g = e.find("> .ui-treenode-children > .ui-treenode");
                if (a) {
                    if (g.filter(".ui-treenode-unselected").length === g.length) {
                        d.uncheck(f)
                    } else {
                        d.partialCheck(f)
                    }
                } else {
                    if (g.filter(".ui-treenode-selected").length === g.length) {
                        d.check(f)
                    } else {
                        d.partialCheck(f)
                    }
                }
            })
        }
        this.writeSelections();
        if (a) {
            this.fireNodeUnselectEvent(b)
        } else {
            this.fireNodeSelectEvent(b)
        }
    },
    preselectCheckbox: function () {
        this.jq.find(".ui-chkbox-icon").not(".ui-icon-check").each(function () {
            var a = $(this)
                    , b = a.closest("li");
            if (b.children(".ui-treenode-children").find(".ui-chkbox-icon.ui-icon-check").length > 0) {
                b.addClass("ui-treenode-hasselected");
                a.removeClass("ui-icon-blank").addClass("ui-icon-minus")
            }
        })
    },
    check: function (a) {
        this._super(a);
        a.siblings("span.ui-treenode-label").addClass("ui-state-highlight").removeClass("ui-state-hover")
    },
    uncheck: function (a) {
        this._super(a);
        a.siblings("span.ui-treenode-label").removeClass("ui-state-highlight")
    },
    initDraggable: function () {
        this.makeDraggable(this.jq.find("span.ui-treenode-content"))
    },
    initDroppable: function () {
        this.makeDropPoints(this.jq.find("li.ui-tree-droppoint"));
        this.makeDropNodes(this.jq.find("span.ui-treenode-droppable"));
        this.initDropScrollers()
    },
    makeDraggable: function (b) {
        var c = this
                , a = this.cfg.dragdropScope || this.id;
        b.draggable({
            helper: function () {
                var d = $('<div class="ui-tree-draghelper ui-state-highlight"></div>');
                d.width(c.jq.width());
                d.height(20);
                return d
            },
            appendTo: document.body,
            zIndex: ++PrimeFaces.zindex,
            revert: true,
            scope: a
        }).data({
            dragsourceid: this.jqId,
            dragmode: this.cfg.dragMode
        })
    },
    makeDropPoints: function (b) {
        var c = this
                , a = this.cfg.dragdropScope || this.id;
        b.droppable({
            hoverClass: "ui-state-hover",
            accept: "span.ui-treenode-content",
            tolerance: "pointer",
            scope: a,
            drop: function (e, n) {
                var f = $(n.draggable.data("dragsourceid")).data("widget")
                        , m = n.draggable.data("dragmode")
                        , l = c
                        , p = $(this)
                        , o = p.closest("li.ui-treenode-parent")
                        , q = c.getRowKey(o)
                        , i = n.draggable.closest("li.ui-treenode")
                        , g = c.findTargetDragNode(i, m)
                        , k = c.getRowKey(g)
                        , d = g.next("li.ui-tree-droppoint")
                        , r = g.parent().closest("li.ui-treenode-parent")
                        , h = (f.id !== l.id);
                n.helper.remove();
                p.removeClass("ui-state-hover");
                var j = c.validateDropPoint(i, p);
                if (!j) {
                    return
                }
                g.hide().insertAfter(p);
                if (h) {
                    if (f.cfg.selectionMode) {
                        f.unselectSubtree(g)
                    }
                    d.remove();
                    c.updateDragDropBindings(g)
                } else {
                    d.insertAfter(g)
                }
                if (r.length && (r.find("> ul.ui-treenode-children > li.ui-treenode").length === 0)) {
                    c.makeLeaf(r)
                }
                g.fadeIn();
                if (c.isCheckboxSelection()) {
                    c.syncDNDCheckboxes(f, r, o)
                }
                c.syncDragDrop();
                if (h) {
                    f.syncDragDrop()
                }
                c.fireDragDropEvent({
                    dragNodeKey: k,
                    dropNodeKey: q,
                    dragSource: f.id,
                    dndIndex: p.prevAll("li.ui-treenode").length,
                    transfer: h
                })
            }
        })
    },
    makeDropNodes: function (b) {
        var c = this
                , a = this.cfg.dragdropScope || this.id;
        b.droppable({
            accept: ".ui-treenode-content",
            tolerance: "pointer",
            scope: a,
            over: function (d, e) {
                $(this).children(".ui-treenode-label").addClass("ui-state-hover")
            },
            out: function (d, e) {
                $(this).children(".ui-treenode-label").removeClass("ui-state-hover")
            },
            drop: function (e, o) {
                var f = $(o.draggable.data("dragsourceid")).data("widget")
                        , m = o.draggable.data("dragmode")
                        , l = c
                        , n = $(this)
                        , p = n.closest("li.ui-treenode")
                        , r = c.getRowKey(p)
                        , i = o.draggable.closest("li.ui-treenode")
                        , g = c.findTargetDragNode(i, m)
                        , k = c.getRowKey(g)
                        , d = g.next("li.ui-tree-droppoint")
                        , s = g.parent().closest("li.ui-treenode-parent")
                        , q = p.children(".ui-treenode-children")
                        , h = (f.id !== l.id);
                o.helper.remove();
                n.children(".ui-treenode-label").removeClass("ui-state-hover");
                var j = c.validateDropNode(i, p, s);
                if (!j) {
                    return
                }
                if (q.children("li.ui-treenode").length === 0) {
                    c.makeParent(p)
                }
                g.hide();
                q.append(g);
                if (s.length && (s.find("> ul.ui-treenode-children > li.ui-treenode").length === 0)) {
                    c.makeLeaf(s)
                }
                if (h) {
                    if (f.cfg.selectionMode) {
                        f.unselectSubtree(g)
                    }
                    d.remove();
                    c.updateDragDropBindings(g)
                } else {
                    q.append(d)
                }
                g.fadeIn();
                if (c.isCheckboxSelection()) {
                    c.syncDNDCheckboxes(f, s, p)
                }
                c.syncDragDrop();
                if (h) {
                    f.syncDragDrop()
                }
                c.fireDragDropEvent({
                    dragNodeKey: k,
                    dropNodeKey: r,
                    dragSource: f.id,
                    dndIndex: g.prevAll("li.ui-treenode").length,
                    transfer: h
                })
            }
        })
    },
    initDropScrollers: function () {
        var b = this
                , a = this.cfg.dragdropScope || this.id;
        this.jq.prepend('<div class="ui-tree-scroller ui-tree-scrollertop"></div>').append('<div class="ui-tree-scroller ui-tree-scrollerbottom"></div>');
        this.jq.children("div.ui-tree-scroller").droppable({
            accept: ".ui-treenode-content",
            tolerance: "pointer",
            scope: a,
            over: function () {
                var c = $(this).hasClass("ui-tree-scrollertop") ? -10 : 10;
                b.scrollInterval = setInterval(function () {
                    b.scroll(c)
                }, 100)
            },
            out: function () {
                clearInterval(b.scrollInterval)
            }
        })
    },
    scroll: function (a) {
        this.container.scrollTop(this.container.scrollTop() + a)
    },
    updateDragDropBindings: function (c) {
        c.after('<li class="ui-tree-droppoint ui-droppable"></li>');
        this.makeDropPoints(c.next("li.ui-tree-droppoint"));
        var b = c.find("li.ui-tree-droppoint");
        b.droppable("destroy");
        this.makeDropPoints(b);
        var a = c.find("span.ui-treenode-content");
        a.droppable("destroy");
        this.makeDropNodes(a);
        if (this.cfg.draggable) {
            a.data({
                dragsourceid: this.jqId,
                dragmode: this.cfg.dragMode
            })
        }
    },
    findTargetDragNode: function (b, c) {
        var a = null;
        if (c === "self") {
            a = b
        } else {
            if (c === "parent") {
                a = b.parent().closest("li.ui-treenode")
            } else {
                if (c === "ancestor") {
                    a = b.parent().parents("li.ui-treenode:last")
                }
            }
        }
        if (a.length === 0) {
            a = b
        }
        return a
    },
    findNodes: function (c) {
        var a = [];
        for (var b = 0; b < c.length; b++) {
            a.push($(this.jqId + "\\:" + c[b]))
        }
        return a
    },
    updateRowKeys: function () {
        var a = this.jq.find("> ul.ui-tree-container > li.ui-treenode");
        this.updateChildrenRowKeys(a, null)
    },
    updateChildrenRowKeys: function (b, a) {
        var c = this;
        b.each(function (f) {
            var e = $(this)
                    , g = e.attr("data-rowkey")
                    , d = (a === null) ? f.toString() : a + "_" + f;
            e.attr({
                id: c.id + ":" + d,
                "data-rowkey": d
            });
            if (e.hasClass("ui-treenode-parent")) {
                c.updateChildrenRowKeys(e.find("> ul.ui-treenode-children > li.ui-treenode"), d)
            }
        })
    },
    validateDropPoint: function (a, b) {
        if (a.next().get(0) === b.get(0) || a.prev().get(0) === b.get(0)) {
            return false
        }
        if (a.has(b.get(0)).length) {
            return false
        }
        if (this.cfg.dropRestrict) {
            if (this.cfg.dropRestrict === "sibling" && a.parent().get(0) !== b.parent().get(0)) {
                return false
            }
        }
        return true
    },
    validateDropNode: function (c, b, a) {
        if (a.get(0) === b.get(0)) {
            return false
        }
        if (c.has(b.get(0)).length) {
            return false
        }
        if (this.cfg.dropRestrict) {
            if (this.cfg.dropRestrict === "sibling") {
                return false
            }
        }
        return true
    },
    makeLeaf: function (a) {
        a.removeClass("ui-treenode-parent").addClass("ui-treenode-leaf");
        a.find("> .ui-treenode-content > .ui-tree-toggler").addClass("ui-treenode-leaf-icon").removeClass("ui-tree-toggler ui-icon ui-icon-triangle-1-s");
        a.children(".ui-treenode-children").hide().children().remove()
    },
    makeParent: function (a) {
        a.removeClass("ui-treenode-leaf").addClass("ui-treenode-parent");
        a.find("> span.ui-treenode-content > span.ui-treenode-leaf-icon").removeClass("ui-treenode-leaf-icon").addClass("ui-tree-toggler ui-icon ui-icon-triangle-1-e");
        a.children(".ui-treenode-children").append('<li class="ui-tree-droppoint ui-droppable"></li>');
        this.makeDropPoints(a.find("> ul.ui-treenode-children > li.ui-tree-droppoint"))
    },
    syncDragDrop: function () {
        var a = this;
        if (this.cfg.selectionMode) {
            var b = this.findNodes(this.selections);
            this.updateRowKeys();
            this.selections = [];
            $.each(b, function (c, d) {
                a.selections.push(d.attr("data-rowkey"))
            });
            this.writeSelections()
        } else {
            this.updateRowKeys()
        }
    },
    syncDNDCheckboxes: function (a, b, c) {
        if (b.length) {
            a.propagateDNDCheckbox(b)
        }
        if (c.length) {
            this.propagateDNDCheckbox(c)
        }
    },
    unselectSubtree: function (a) {
        var c = this;
        if (this.isCheckboxSelection()) {
            var b = a.find("> .ui-treenode-content > .ui-chkbox");
            this.toggleCheckboxState(b, true);
            a.children(".ui-treenode-children").find(".ui-chkbox").each(function () {
                c.toggleCheckboxState($(this), true)
            })
        } else {
            a.find(".ui-treenode-label.ui-state-highlight").each(function () {
                $(this).removeClass("ui-state-highlight").closest("li.ui-treenode").attr("aria-selected", false)
            })
        }
    },
    propagateDNDCheckbox: function (c) {
        var d = c.find("> .ui-treenode-content > .ui-chkbox")
                , a = c.find("> .ui-treenode-children > .ui-treenode");
        if (a.length) {
            if (a.filter(".ui-treenode-unselected").length === a.length) {
                this.uncheck(d)
            } else {
                if (a.filter(".ui-treenode-selected").length === a.length) {
                    this.check(d)
                } else {
                    this.partialCheck(d)
                }
            }
        }
        var b = c.parent().closest(".ui-treenode-parent");
        if (b.length) {
            this.propagateDNDCheckbox(b)
        }
    },
    fireDragDropEvent: function (c) {
        var d = this
                , b = {
                    source: this.id,
                    process: c.transfer ? this.id + " " + c.dragSource : this.id
                };
        b.params = [{
                name: this.id + "_dragdrop",
                value: true
            }, {
                name: this.id + "_dragNode",
                value: c.dragNodeKey
            }, {
                name: this.id + "_dragSource",
                value: c.dragSource
            }, {
                name: this.id + "_dropNode",
                value: c.dropNodeKey
            }, {
                name: this.id + "_dndIndex",
                value: c.dndIndex
            }];
        if (this.hasBehavior("dragdrop")) {
            var a = this.cfg.behaviors.dragdrop;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    isEmpty: function () {
        return (this.container.children().length === 0)
    },
    getFirstNode: function () {
        return this.jq.find("> ul.ui-tree-container > li:first-child")
    },
    getNodeLabel: function (a) {
        return a.find("> span.ui-treenode-content > span.ui-treenode-label")
    },
    focusNode: function (a) {
        if (this.focusedNode) {
            this.getNodeLabel(this.focusedNode).removeClass("ui-treenode-outline")
        }
        this.getNodeLabel(a).addClass("ui-treenode-outline").focus();
        this.focusedNode = a
    },
    filter: function () {
        var b = this
                , a = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    global: false,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_filtering",
                            value: true
                        }, {
                            name: this.id + "_encodeFeature",
                            value: true
                        }],
                    onsuccess: function (e, c, d) {
                        PrimeFaces.ajax.Response.handle(e, c, d, {
                            widget: b,
                            handle: function (f) {
                                b.container.html(f)
                            }
                        });
                        return true
                    }
                };
        PrimeFaces.ajax.Request.handle(a)
    }
});
PrimeFaces.widget.HorizontalTree = PrimeFaces.widget.BaseTree.extend({
    init: function (a) {
        this._super(a);
        if (PrimeFaces.isIE()) {
            this.drawConnectors()
        }
    },
    bindEvents: function () {
        var c = this
                , d = this.cfg.selectionMode
                , a = ".ui-tree-toggler"
                , b = ".ui-treenode-content.ui-tree-selectable";
        this.jq.off("click.tree-toggle", a).on("click.tree-toggle", a, null, function () {
            var e = $(this)
                    , f = e.closest("td.ui-treenode");
            if (f.hasClass("ui-treenode-collapsed")) {
                c.expandNode(f)
            } else {
                c.collapseNode(f)
            }
        });
        if (d && this.cfg.highlight) {
            this.jq.off("mouseout.tree mouseover.tree", b).on("mouseover.tree", b, null, function () {
                var e = $(this);
                if (!e.hasClass("ui-state-highlight")) {
                    e.addClass("ui-state-hover");
                    if (c.isCheckboxSelection()) {
                        e.children("div.ui-chkbox").children("div.ui-chkbox-box").addClass("ui-state-hover")
                    }
                }
            }).on("mouseout.tree", b, null, function () {
                var e = $(this);
                if (!e.hasClass("ui-state-highlight")) {
                    e.removeClass("ui-state-hover");
                    if (c.isCheckboxSelection()) {
                        e.children("div.ui-chkbox").children("div.ui-chkbox-box").removeClass("ui-state-hover")
                    }
                }
            })
        }
        this.jq.off("click.tree-content", b).on("click.tree-content", b, null, function (f) {
            c.nodeClick(f, $(this))
        })
    },
    showNodeChildren: function (e) {
        e.attr("aria-expanded", true);
        var c = e.next()
                , d = e.find("> .ui-treenode-content > .ui-tree-toggler")
                , b = e.data("nodetype")
                , a = this.cfg.iconStates[b];
        if (a) {
            d.nextAll("span.ui-treenode-icon").removeClass(a.collapsedIcon).addClass(a.expandedIcon)
        }
        d.addClass("ui-icon-minus").removeClass("ui-icon-plus");
        e.removeClass("ui-treenode-collapsed");
        c.show();
        if ($.browser.msie) {
            this.drawConnectors()
        }
    },
    collapseNode: function (e) {
        var c = e.next()
                , d = e.find("> .ui-treenode-content > .ui-tree-toggler")
                , b = e.data("nodetype")
                , a = this.cfg.iconStates[b];
        if (a) {
            d.nextAll("span.ui-treenode-icon").addClass(a.collapsedIcon).removeClass(a.expandedIcon)
        }
        d.removeClass("ui-icon-minus").addClass("ui-icon-plus");
        e.addClass("ui-treenode-collapsed");
        c.hide();
        if (this.cfg.dynamic && !this.cfg.cache) {
            c.children(".ui-treenode-children").empty()
        }
        this.fireCollapseEvent(e);
        if ($.browser.msie) {
            this.drawConnectors()
        }
    },
    getNodeChildrenContainer: function (a) {
        return a.next(".ui-treenode-children-container").children(".ui-treenode-children")
    },
    selectNode: function (b, a) {
        b.removeClass("ui-treenode-unselected").addClass("ui-treenode-selected").children(".ui-treenode-content").removeClass("ui-state-hover").addClass("ui-state-highlight");
        this.addToSelection(this.getRowKey(b));
        this.writeSelections();
        if (!a) {
            this.fireNodeSelectEvent(b)
        }
    },
    unselectNode: function (b, a) {
        var c = this.getRowKey(b);
        b.removeClass("ui-treenode-selected").addClass("ui-treenode-unselected").children(".ui-treenode-content").removeClass("ui-state-highlight");
        this.removeFromSelection(c);
        this.writeSelections();
        if (!a) {
            this.fireNodeUnselectEvent(b)
        }
    },
    unselectAllNodes: function () {
        this.selections = [];
        this.jq.find(".ui-treenode-content.ui-state-highlight").each(function () {
            $(this).removeClass("ui-state-highlight").closest(".ui-treenode").attr("aria-selected", false)
        })
    },
    preselectCheckbox: function () {
        var a = this;
        this.jq.find(".ui-chkbox-icon").not(".ui-icon-check").each(function () {
            var c = $(this)
                    , d = c.closest(".ui-treenode")
                    , b = a.getNodeChildrenContainer(d);
            if (b.find(".ui-chkbox-icon.ui-icon-check").length > 0) {
                c.removeClass("ui-icon-blank").addClass("ui-icon-minus")
            }
        })
    },
    toggleCheckboxNode: function (b) {
        var d = this
                , c = b.find("> .ui-treenode-content > .ui-chkbox")
                , a = c.find("> .ui-chkbox-box > .ui-chkbox-icon").hasClass("ui-icon-check");
        this.toggleCheckboxState(c, a);
        if (this.cfg.propagateDown) {
            b.next(".ui-treenode-children-container").find(".ui-chkbox").each(function () {
                d.toggleCheckboxState($(this), a)
            });
            if (this.cfg.dynamic) {
                this.removeDescendantsFromSelection(b.data("rowkey"))
            }
        }
        if (this.cfg.propagateUp) {
            b.parents("td.ui-treenode-children-container").each(function () {
                var f = $(this)
                        , e = f.prev(".ui-treenode-parent")
                        , g = e.find("> .ui-treenode-content > .ui-chkbox")
                        , h = f.find("> .ui-treenode-children > table > tbody > tr > td.ui-treenode");
                if (a) {
                    if (h.filter(".ui-treenode-unselected").length === h.length) {
                        d.uncheck(g)
                    } else {
                        d.partialCheck(g)
                    }
                } else {
                    if (h.filter(".ui-treenode-selected").length === h.length) {
                        d.check(g)
                    } else {
                        d.partialCheck(g)
                    }
                }
            })
        }
        this.writeSelections();
        if (a) {
            this.fireNodeUnselectEvent(b)
        } else {
            this.fireNodeSelectEvent(b)
        }
    },
    check: function (a) {
        this._super(a);
        a.parent(".ui-treenode-content").addClass("ui-state-highlight").removeClass("ui-state-hover")
    },
    uncheck: function (a) {
        this._super(a);
        a.parent(".ui-treenode-content").removeClass("ui-state-highlight")
    },
    drawConnectors: function () {
        this.jq.find("table.ui-treenode-connector-table").each(function () {
            var a = $(this);
            a.height(0).height(a.parent().height())
        })
    },
    isEmpty: function () {
        return this.jq.children("table").length === 0
    },
    focusNode: function (a) {},
    partialCheck: function (d) {
        var b = d.children(".ui-chkbox-box")
                , a = b.children(".ui-chkbox-icon")
                , c = d.closest(".ui-treenode")
                , e = this.getRowKey(c);
        c.find("> .ui-treenode-content").removeClass("ui-state-highlight");
        a.removeClass("ui-icon-blank ui-icon-check").addClass("ui-icon-minus");
        c.removeClass("ui-treenode-selected ui-treenode-unselected").addClass("ui-treenode-hasselected").attr("aria-checked", false).attr("aria-selected", false);
        this.removeFromSelection(e)
    }
});
PrimeFaces.widget.TreeTable = PrimeFaces.widget.DeferredWidget.extend({
    init: function (a) {
        this._super(a);
        this.thead = $(this.jqId + "_head");
        this.tbody = $(this.jqId + "_data");
        this.cfg.expandMode = this.cfg.expandMode || "children";
        this.renderDeferred()
    },
    _render: function () {
        if (this.cfg.scrollable) {
            this.setupScrolling()
        }
        if (this.cfg.resizableColumns) {
            this.setupResizableColumns()
        }
        if (this.cfg.stickyHeader) {
            this.setupStickyHeader()
        }
        if (this.cfg.editable) {
            this.bindEditEvents()
        }
        this.bindEvents()
    },
    refresh: function (a) {
        this.columnWidthsFixed = false;
        this.init(a)
    },
    bindEvents: function () {
        var c = this
                , a = "> tr > td:first-child > .ui-treetable-toggler";
        this.tbody.off("click.treeTable-toggle", a).on("click.treeTable-toggle", a, null, function (g) {
            var f = $(this)
                    , d = f.closest("tr");
            if (!d.data("processing")) {
                d.data("processing", true);
                if (f.hasClass("ui-icon-triangle-1-e")) {
                    c.expandNode(d)
                } else {
                    c.collapseNode(d)
                }
            }
        });
        if (this.cfg.selectionMode) {
            this.jqSelection = $(this.jqId + "_selection");
            var b = this.jqSelection.val();
            this.selections = b === "" ? [] : b.split(",");
            this.cfg.disabledTextSelection = this.cfg.disabledTextSelection === false ? false : true;
            this.bindSelectionEvents()
        }
        this.bindSortEvents();
        if (this.cfg.paginator) {
            this.cfg.paginator.paginate = function (d) {
                c.handlePagination(d)
            }
            ;
            this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator)
        }
    },
    handlePagination: function (d) {
        var c = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    params: [{
                            name: this.id + "_pagination",
                            value: true
                        }, {
                            name: this.id + "_first",
                            value: d.first
                        }, {
                            name: this.id + "_rows",
                            value: d.rows
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: c,
                            handle: function (h) {
                                this.tbody.html(h)
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.paginator.cfg.page = d.page;
                        c.paginator.updateUI()
                    }
                };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    getPaginator: function () {
        return this.paginator
    },
    bindSelectionEvents: function () {
        var c = this
                , a = "> tr.ui-treetable-selectable-node";
        this.tbody.off("mouseover.treeTable mouseout.treeTable click.treeTable", a).on("mouseover.treeTable", a, null, function (f) {
            var d = $(this);
            if (!d.hasClass("ui-state-highlight")) {
                d.addClass("ui-state-hover");
                if (c.isCheckboxSelection() && !c.cfg.nativeElements) {
                    d.find("> td:first-child > div.ui-chkbox > div.ui-chkbox-box").addClass("ui-state-hover")
                }
            }
        }).on("mouseout.treeTable", a, null, function (f) {
            var d = $(this);
            if (!d.hasClass("ui-state-highlight")) {
                d.removeClass("ui-state-hover");
                if (c.isCheckboxSelection() && !c.cfg.nativeElements) {
                    d.find("> td:first-child > div.ui-chkbox > div.ui-chkbox-box").removeClass("ui-state-hover")
                }
            }
        }).on("click.treeTable", a, null, function (d) {
            c.onRowClick(d, $(this))
        });
        if (this.isCheckboxSelection()) {
            var b = this.cfg.nativeElements ? "> tr.ui-treetable-selectable-node > td:first-child :checkbox" : "> tr.ui-treetable-selectable-node > td:first-child div.ui-chkbox-box";
            this.tbody.off("click.treeTable-checkbox", b).on("click.treeTable-checkbox", b, null, function (f) {
                var d = $(this).closest("tr.ui-treetable-selectable-node");
                c.toggleCheckboxNode(d)
            });
            if (this.cfg.nativeElements) {
                this.indeterminateNodes(this.tbody.children("tr.ui-treetable-partialselected"))
            }
        }
    },
    bindSortEvents: function () {
        var a = this;
        this.sortableColumns = this.thead.find("> tr > th.ui-sortable-column");
        this.sortableColumns.filter(".ui-state-active").each(function () {
            var c = $(this)
                    , d = c.children("span.ui-sortable-column-icon")
                    , b = null;
            if (d.hasClass("ui-icon-triangle-1-n")) {
                b = "ASCENDING"
            } else {
                b = "DESCENDING"
            }
            c.data("sortorder", b)
        });
        this.sortableColumns.on("mouseenter.treeTable", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseleave.treeTable", function () {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.removeClass("ui-state-hover")
            }
        }).on("click.treeTable", function (d) {
            if ($(d.target).is("th,span:not(.ui-c)")) {
                PrimeFaces.clearSelection();
                var c = $(this)
                        , b = c.data("sortorder") || "DESCENDING";
                if (b === "ASCENDING") {
                    b = "DESCENDING"
                } else {
                    if (b === "DESCENDING") {
                        b = "ASCENDING"
                    }
                }
                a.sort(c, b)
            }
        })
    },
    bindContextMenu: function (e, f, b, a) {
        var d = b + " .ui-treetable-data > " + (a.nodeType ? "tr.ui-treetable-selectable-node." + a.nodeType : "tr.ui-treetable-selectable-node");
        var c = a.event + ".treetable";
        $(document).off(c, d).on(c, d, null, function (g) {
            f.onRowRightClick(g, $(this));
            e.show(g)
        })
    },
    setupStickyHeader: function () {
        var b = this.thead.parent()
                , f = b.offset()
                , d = $(window)
                , c = this
                , e = "scroll." + this.id
                , a = "resize.sticky-" + this.id;
        this.stickyContainer = $('<div class="ui-treetable ui-treetable-sticky ui-widget"><table></table></div>');
        this.clone = this.thead.clone(false);
        this.stickyContainer.children("table").append(this.thead);
        b.append(this.clone);
        this.stickyContainer.css({
            position: "absolute",
            width: b.outerWidth(),
            top: f.top,
            left: f.left,
            "z-index": ++PrimeFaces.zindex
        });
        this.jq.prepend(this.stickyContainer);
        if (this.cfg.resizableColumns) {
            this.relativeHeight = 0
        }
        d.off(e).on(e, function () {
            var h = d.scrollTop()
                    , g = b.offset();
            if (h > g.top) {
                c.stickyContainer.css({
                    position: "fixed",
                    top: "0px"
                }).addClass("ui-shadow ui-sticky");
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = h - g.top
                }
                if (h >= (g.top + c.tbody.height())) {
                    c.stickyContainer.hide()
                } else {
                    c.stickyContainer.show()
                }
            } else {
                c.stickyContainer.css({
                    position: "absolute",
                    top: g.top
                }).removeClass("ui-shadow ui-sticky");
                if (c.stickyContainer.is(":hidden")) {
                    c.stickyContainer.show()
                }
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = 0
                }
            }
        }).off(a).on(a, function () {
            c.stickyContainer.width(b.outerWidth())
        })
    },
    bindEditEvents: function () {
        var c = this;
        this.cfg.cellSeparator = this.cfg.cellSeparator || " ";
        if (this.cfg.editMode === "row") {
            var a = "> tr > td > div.ui-row-editor";
            this.tbody.off("click.treetable", a).on("click.treetable", a, null, function (f) {
                var d = $(f.target)
                        , g = d.closest("tr");
                if (d.hasClass("ui-icon-pencil")) {
                    c.switchToRowEdit(g);
                    d.hide().siblings().show()
                } else {
                    if (d.hasClass("ui-icon-check")) {
                        c.saveRowEdit(g)
                    } else {
                        if (d.hasClass("ui-icon-close")) {
                            c.cancelRowEdit(g)
                        }
                    }
                }
                f.preventDefault()
            })
        } else {
            if (this.cfg.editMode === "cell") {
                var b = "> tr > td.ui-editable-column";
                this.tbody.off("click.treetable-cell", b).on("click.treetable-cell", b, null, function (f) {
                    if (!$(f.target).is("span.ui-c")) {
                        c.incellClick = true;
                        var d = $(this);
                        if (!d.hasClass("ui-cell-editing")) {
                            c.showCellEditor($(this))
                        }
                    }
                });
                $(document).off("click.treetable-cell-blur" + this.id).on("click.treetable-cell-blur" + this.id, function (d) {
                    if ((!c.incellClick && c.currentCell && !c.contextMenuClick)) {
                        c.saveCell(c.currentCell)
                    }
                    c.incellClick = false;
                    c.contextMenuClick = false
                })
            }
        }
    },
    sort: function (d, a) {
        var e = this
                , b = {
                    source: this.id,
                    update: this.id,
                    process: this.id,
                    params: [{
                            name: this.id + "_sorting",
                            value: true
                        }, {
                            name: this.id + "_sortKey",
                            value: d.attr("id")
                        }, {
                            name: this.id + "_sortDir",
                            value: a
                        }],
                    onsuccess: function (h, f, g) {
                        PrimeFaces.ajax.Response.handle(h, f, g, {
                            widget: e,
                            handle: function (i) {
                                this.tbody.html(i);
                                d.siblings().filter(".ui-state-active").removeData("sortorder").removeClass("ui-state-active").find(".ui-sortable-column-icon").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s");
                                d.removeClass("ui-state-hover").addClass("ui-state-active").data("sortorder", a);
                                var j = d.find(".ui-sortable-column-icon");
                                if (a === "DESCENDING") {
                                    j.removeClass("ui-icon-triangle-1-n").addClass("ui-icon-triangle-1-s")
                                } else {
                                    if (a === "ASCENDING") {
                                        j.removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-n")
                                    }
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function (h, f, g) {
                        if (e.cfg.selectionMode && g.selection) {
                            e.selections = g.selection.split(",");
                            e.writeSelections()
                        }
                    }
                };
        if (this.hasBehavior("sort")) {
            var c = this.cfg.behaviors.sort;
            c.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    expandNode: function (c) {
        var d = this
                , b = c.attr("data-rk")
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    params: [{
                            name: this.id + "_expand",
                            value: b
                        }],
                    onsuccess: function (h, f, g) {
                        PrimeFaces.ajax.Response.handle(h, f, g, {
                            widget: d,
                            handle: function (i) {
                                if (d.cfg.expandMode === "self") {
                                    c.replaceWith(i)
                                } else {
                                    c.after(i)
                                }
                                c.find(".ui-treetable-toggler:first").addClass("ui-icon-triangle-1-s").removeClass("ui-icon-triangle-1-e");
                                c.attr("aria-expanded", true);
                                d.indeterminateNodes(d.tbody.children("tr.ui-treetable-partialselected"));
                                if (this.cfg.scrollable) {
                                    this.alignScrollBody()
                                }
                            }
                        });
                        return true
                    },
                    oncomplete: function () {
                        c.data("processing", false)
                    }
                };
        if (this.hasBehavior("expand")) {
            var e = this.cfg.behaviors.expand;
            e.call(this, a)
        } else {
            PrimeFaces.ajax.Request.handle(a)
        }
    },
    collapseNode: function (g) {
        var d = g.attr("data-rk")
                , h = g.nextAll();
        for (var e = 0; e < h.length; e++) {
            var b = h.eq(e)
                    , c = b.attr("data-rk");
            if (c.indexOf(d) !== -1) {
                b.remove()
            } else {
                break
            }
        }
        g.attr("aria-expanded", false).find(".ui-treetable-toggler:first").addClass("ui-icon-triangle-1-e").removeClass("ui-icon-triangle-1-s");
        g.data("processing", false);
        if (this.cfg.scrollable) {
            this.alignScrollBody()
        }
        if (this.hasBehavior("collapse")) {
            var a = this.cfg.behaviors.collapse
                    , d = g.attr("data-rk");
            var f = {
                params: [{
                        name: this.id + "_collapse",
                        value: d
                    }]
            };
            a.call(this, f)
        }
    },
    onRowClick: function (d, c) {
        if ($(d.target).is("td,span:not(.ui-c)")) {
            var b = c.hasClass("ui-state-highlight")
                    , e = d.metaKey || d.ctrlKey
                    , a = d.shiftKey;
            if (this.isCheckboxSelection()) {
                this.toggleCheckboxNode(c)
            } else {
                if (b && e) {
                    this.unselectNode(c)
                } else {
                    if (this.isSingleSelection() || (this.isMultipleSelection() && !e)) {
                        this.unselectAllNodes()
                    }
                    if (this.isMultipleSelection() && a) {
                        this.selectNodesInRange(c)
                    } else {
                        this.selectNode(c);
                        this.cursorNode = c
                    }
                }
            }
            if (this.cfg.disabledTextSelection) {
                PrimeFaces.clearSelection()
            }
        }
    },
    onRowRightClick: function (c, b) {
        var a = b.hasClass("ui-state-highlight");
        if (this.isCheckboxSelection()) {
            if (!a) {
                this.toggleCheckboxNode(b)
            }
        } else {
            if (this.isSingleSelection() || !a) {
                this.unselectAllNodes()
            }
            this.selectNode(b)
        }
        if (this.cfg.disabledTextSelection) {
            PrimeFaces.clearSelection()
        }
    },
    selectNode: function (c, a) {
        var b = c.attr("data-rk");
        c.removeClass("ui-state-hover ui-treetable-partialselected").addClass("ui-state-highlight").attr("aria-selected", true);
        this.addToSelection(b);
        this.writeSelections();
        if (this.isCheckboxSelection()) {
            if (this.cfg.nativeElements) {
                c.find("> td:first-child > :checkbox").prop("checked", true).prop("indeterminate", false)
            } else {
                c.find("> td:first-child > div.ui-chkbox > div.ui-chkbox-box").removeClass("ui-state-hover").children("span.ui-chkbox-icon").removeClass("ui-icon-blank ui-icon-minus").addClass("ui-icon-check")
            }
        }
        if (!a) {
            this.fireSelectNodeEvent(b)
        }
    },
    unselectNode: function (c, a) {
        var b = c.attr("data-rk");
        c.removeClass("ui-state-highlight ui-treetable-partialselected").attr("aria-selected", false);
        this.removeSelection(b);
        this.writeSelections();
        if (this.isCheckboxSelection()) {
            if (this.cfg.nativeElements) {
                c.find("> td:first-child > :checkbox").prop("checked", false).prop("indeterminate", false)
            } else {
                c.find("> td:first-child > div.ui-chkbox > div.ui-chkbox-box > span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check ui-icon-minus")
            }
        }
        if (!a) {
            this.fireUnselectNodeEvent(b)
        }
    },
    unselectAllNodes: function () {
        var b = this.tbody.children("tr.ui-state-highlight");
        for (var a = 0; a < b.length; a++) {
            this.unselectNode(b.eq(a), true)
        }
        this.selections = [];
        this.writeSelections()
    },
    selectNodesInRange: function (d) {
        if (this.cursorNode) {
            this.unselectAllNodes();
            var g = d.index()
                    , c = this.cursorNode.index()
                    , f = (g > c) ? c : g
                    , e = (g > c) ? (g + 1) : (c + 1)
                    , a = this.tbody.children();
            for (var b = f; b < e; b++) {
                this.selectNode(a.eq(b), true)
            }
        } else {
            this.selectNode(d)
        }
    },
    indeterminateNodes: function (a) {
        for (var b = 0; b < a.length; b++) {
            a.eq(b).find("> td:first-child > :checkbox").prop("indeterminate", true)
        }
    },
    toggleCheckboxNode: function (e) {
        var d = e.hasClass("ui-state-highlight")
                , g = e.data("rk");
        if (d) {
            this.unselectNode(e, true)
        } else {
            this.selectNode(e, true)
        }
        var f = this.getDescendants(e);
        for (var b = 0; b < f.length; b++) {
            var c = f[b];
            if (d) {
                this.unselectNode(c, true)
            } else {
                this.selectNode(c, true)
            }
        }
        if (d) {
            this.removeDescendantsFromSelection(e.data("rk"))
        }
        var a = this.getParent(e);
        if (a) {
            this.propagateUp(a)
        }
        this.writeSelections();
        if (d) {
            this.fireUnselectNodeEvent(g)
        } else {
            this.fireSelectNodeEvent(g)
        }
    },
    getDescendants: function (e) {
        var c = e.attr("data-rk")
                , g = e.nextAll()
                , f = [];
        for (var d = 0; d < g.length; d++) {
            var a = g.eq(d)
                    , b = a.attr("data-rk");
            if (b.indexOf(c) != -1) {
                f.push(a)
            } else {
                break
            }
        }
        return f
    },
    getChildren: function (f) {
        var c = f.attr("data-rk")
                , g = f.nextAll()
                , e = [];
        for (var d = 0; d < g.length; d++) {
            var a = g.eq(d)
                    , b = a.attr("data-prk");
            if (b === c) {
                e.push(a)
            }
        }
        return e
    },
    propagateUp: function (d) {
        var b = this.getChildren(d)
                , j = true
                , f = false
                , g = this.cfg.nativeElements ? d.find("> td:first-child > :checkbox") : d.find("> td:first-child > div.ui-chkbox > div.ui-chkbox-box > span.ui-chkbox-icon");
        for (var e = 0; e < b.length; e++) {
            var a = b[e]
                    , c = a.hasClass("ui-state-highlight");
            j = j && c;
            f = f || c || a.hasClass("ui-treetable-partialselected")
        }
        if (j) {
            d.removeClass("ui-treetable-partialselected");
            this.selectNode(d, true)
        } else {
            if (f) {
                d.removeClass("ui-state-highlight").addClass("ui-treetable-partialselected");
                if (this.cfg.nativeElements) {
                    g.prop("indeterminate", true)
                } else {
                    g.removeClass("ui-icon-blank ui-icon-check").addClass("ui-icon-minus")
                }
                this.removeSelection(d.attr("data-rk"))
            } else {
                d.removeClass("ui-state-highlight ui-treetable-partialselected");
                if (this.cfg.nativeElements) {
                    g.prop("indeterminate", false).prop("checked", false)
                } else {
                    g.addClass("ui-icon-blank").removeClass("ui-icon-check ui-icon-minus")
                }
                this.removeSelection(d.attr("data-rk"))
            }
        }
        var h = this.getParent(d);
        if (h) {
            this.propagateUp(h)
        }
    },
    getParent: function (b) {
        var a = $(this.jqId + "_node_" + b.attr("data-prk"));
        return a.length === 1 ? a : null
    },
    hasBehavior: function (a) {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[a] != undefined
        }
        return false
    },
    removeDescendantsFromSelection: function (a) {
        this.selections = $.grep(this.selections, function (b) {
            return b.indexOf(a + "_") !== 0
        })
    },
    removeSelection: function (a) {
        this.selections = $.grep(this.selections, function (b) {
            return b !== a
        })
    },
    addToSelection: function (a) {
        if (!this.isSelected(a)) {
            this.selections.push(a)
        }
    },
    isSelected: function (a) {
        return PrimeFaces.inArray(this.selections, a)
    },
    isSingleSelection: function () {
        return this.cfg.selectionMode == "single"
    },
    isMultipleSelection: function () {
        return this.cfg.selectionMode == "multiple"
    },
    isCheckboxSelection: function () {
        return this.cfg.selectionMode == "checkbox"
    },
    writeSelections: function () {
        this.jqSelection.val(this.selections.join(","))
    },
    fireSelectNodeEvent: function (b) {
        if (this.isCheckboxSelection()) {
            var e = this
                    , a = {
                        source: this.id,
                        process: this.id
                    };
            a.params = [{
                    name: this.id + "_instantSelection",
                    value: b
                }];
            a.oncomplete = function (k, f, g) {
                if (g.descendantRowKeys && g.descendantRowKeys !== "") {
                    var j = g.descendantRowKeys.split(",");
                    for (var h = 0; h < j.length; h++) {
                        e.addToSelection(j[h])
                    }
                    e.writeSelections()
                }
            }
            ;
            if (this.hasBehavior("select")) {
                var d = this.cfg.behaviors.select;
                d.call(this, a)
            } else {
                PrimeFaces.ajax.AjaxRequest(a)
            }
        } else {
            if (this.hasBehavior("select")) {
                var d = this.cfg.behaviors.select
                        , c = {
                            params: [{
                                    name: this.id + "_instantSelection",
                                    value: b
                                }]
                        };
                d.call(this, c)
            }
        }
    },
    fireUnselectNodeEvent: function (b) {
        if (this.hasBehavior("unselect")) {
            var a = this.cfg.behaviors.unselect
                    , c = {
                        params: [{
                                name: this.id + "_instantUnselection",
                                value: b
                            }]
                    };
            a.call(this, c)
        }
    },
    setupScrolling: function () {
        this.scrollHeader = this.jq.children("div.ui-treetable-scrollable-header");
        this.scrollBody = this.jq.children("div.ui-treetable-scrollable-body");
        this.scrollFooter = this.jq.children("div.ui-treetable-scrollable-footer");
        this.scrollStateHolder = $(this.jqId + "_scrollState");
        this.scrollHeaderBox = this.scrollHeader.children("div.ui-treetable-scrollable-header-box");
        this.scrollFooterBox = this.scrollFooter.children("div.ui-treetable-scrollable-footer-box");
        this.headerTable = this.scrollHeaderBox.children("table");
        this.bodyTable = this.scrollBody.children("table");
        this.footerTable = this.scrollFooterBox.children("table");
        this.headerCols = this.headerTable.find("> thead > tr > th");
        this.footerCols = this.footerTable.find("> tfoot > tr > td");
        var c = this;
        if (this.cfg.scrollHeight) {
            if (this.cfg.scrollHeight.indexOf("%") !== -1) {
                this.adjustScrollHeight()
            }
            var b = this.getScrollbarWidth() + "px";
            this.scrollHeaderBox.css("margin-right", b);
            this.scrollFooterBox.css("margin-right", b);
            this.alignScrollBody()
        }
        this.fixColumnWidths();
        if (this.cfg.scrollWidth) {
            if (this.cfg.scrollWidth.indexOf("%") !== -1) {
                this.adjustScrollWidth()
            } else {
                this.setScrollWidth(parseInt(this.cfg.scrollWidth))
            }
        }
        this.cloneHead();
        this.restoreScrollState();
        this.scrollBody.scroll(function () {
            var d = c.scrollBody.scrollLeft();
            c.scrollHeaderBox.css("margin-left", -d);
            c.scrollFooterBox.css("margin-left", -d);
            c.saveScrollState()
        });
        this.scrollHeader.on("scroll.treeTable", function () {
            c.scrollHeader.scrollLeft(0)
        });
        this.scrollFooter.on("scroll.treeTable", function () {
            c.scrollFooter.scrollLeft(0)
        });
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function () {
            if (c.jq.is(":visible")) {
                if (c.percentageScrollHeight) {
                    c.adjustScrollHeight()
                }
                if (c.percentageScrollWidth) {
                    c.adjustScrollWidth()
                }
            }
        })
    },
    cloneHead: function () {
        this.theadClone = this.headerTable.children("thead").clone();
        this.theadClone.find("th").each(function () {
            var a = $(this);
            a.attr("id", a.attr("id") + "_clone")
        });
        this.theadClone.removeAttr("id").addClass("ui-treetable-scrollable-theadclone").height(0).prependTo(this.bodyTable)
    },
    fixColumnWidths: function () {
        var a = this;
        if (!this.columnWidthsFixed) {
            if (this.cfg.scrollable) {
                this.headerCols.each(function () {
                    var e = $(this)
                            , b = e.index()
                            , c = e.width();
                    e.width(c);
                    if (a.footerCols.length > 0) {
                        var d = a.footerCols.eq(b);
                        d.width(c)
                    }
                })
            } else {
                this.jq.find("> table > thead > tr > th").each(function () {
                    var b = $(this);
                    b.width(b.width())
                })
            }
            this.columnWidthsFixed = true
        }
    },
    adjustScrollHeight: function () {
        var d = this.jq.parent().innerHeight() * (parseInt(this.cfg.scrollHeight) / 100)
                , e = this.jq.children(".ui-treetable-header").outerHeight(true)
                , b = this.jq.children(".ui-treetable-footer").outerHeight(true)
                , c = (this.scrollHeader.outerHeight(true) + this.scrollFooter.outerHeight(true))
                , a = (d - (c + e + b));
        this.scrollBody.height(a)
    },
    adjustScrollWidth: function () {
        var a = parseInt((this.jq.parent().innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
        this.setScrollWidth(a)
    },
    setOuterWidth: function (a, b) {
        var c = a.outerWidth() - a.width();
        a.width(b - c)
    },
    hasVerticalOverflow: function () {
        return (this.cfg.scrollHeight && this.bodyTable.outerHeight() > this.scrollBody.outerHeight())
    },
    setScrollWidth: function (a) {
        var b = this;
        this.jq.children(".ui-widget-header").each(function () {
            b.setOuterWidth($(this), a)
        });
        this.scrollHeader.width(a);
        this.scrollBody.css("padding-right", 0).width(a);
        this.scrollFooter.width(a)
    },
    alignScrollBody: function () {
        if (!this.cfg.scrollWidth) {
            if (this.hasVerticalOverflow()) {
                this.scrollBody.css("padding-right", 0)
            } else {
                this.scrollBody.css("padding-right", this.getScrollbarWidth())
            }
        }
    },
    getScrollbarWidth: function () {
        return $.browser.webkit ? "15" : PrimeFaces.calculateScrollbarWidth()
    },
    restoreScrollState: function () {
        var a = this.scrollStateHolder.val()
                , b = a.split(",");
        this.scrollBody.scrollLeft(b[0]);
        this.scrollBody.scrollTop(b[1])
    },
    saveScrollState: function () {
        var a = this.scrollBody.scrollLeft() + "," + this.scrollBody.scrollTop();
        this.scrollStateHolder.val(a)
    },
    setupResizableColumns: function () {
        this.fixColumnWidths();
        if (!this.cfg.liveResize) {
            this.resizerHelper = $('<div class="ui-column-resizer-helper ui-state-highlight"></div>').appendTo(this.jq)
        }
        this.thead.find("> tr > th.ui-resizable-column:not(:last-child)").prepend('<span class="ui-column-resizer">&nbsp;</span>');
        var a = this.thead.find("> tr > th > span.ui-column-resizer")
                , b = this;
        a.draggable({
            axis: "x",
            start: function () {
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "col-resize")
                } else {
                    var d = b.cfg.stickyHeader ? b.clone : b.thead
                            , c = b.cfg.scrollable ? b.scrollBody.height() : d.parent().height() - d.height() - 1;
                    if (b.cfg.stickyHeader) {
                        c = c - b.relativeHeight
                    }
                    b.resizerHelper.height(c);
                    b.resizerHelper.show()
                }
            },
            drag: function (c, d) {
                if (b.cfg.liveResize) {
                    b.resize(c, d)
                } else {
                    b.resizerHelper.offset({
                        left: d.helper.offset().left + d.helper.width() / 2,
                        top: b.thead.offset().top + b.thead.height()
                    })
                }
            },
            stop: function (d, f) {
                var e = f.helper.parent();
                f.helper.css("left", "");
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "default")
                } else {
                    b.resize(d, f);
                    b.resizerHelper.hide()
                }
                var c = {
                    source: b.id,
                    process: b.id,
                    params: [{
                            name: b.id + "_colResize",
                            value: true
                        }, {
                            name: b.id + "_columnId",
                            value: e.attr("id")
                        }, {
                            name: b.id + "_width",
                            value: e.width()
                        }, {
                            name: b.id + "_height",
                            value: e.height()
                        }]
                };
                if (b.hasBehavior("colResize")) {
                    b.cfg.behaviors.colResize.call(b, c)
                }
                if (b.cfg.stickyHeader) {
                    b.reclone()
                }
            },
            containment: this.jq
        })
    },
    resize: function (a, i) {
        var c = i.helper.parent()
                , e = c.next()
                , h = null
                , d = null
                , f = null;
        if (this.cfg.liveResize) {
            h = c.outerWidth() - (a.pageX - c.offset().left),
                    d = (c.width() - h),
                    f = (e.width() + h)
        } else {
            h = (i.position.left - i.originalPosition.left),
                    d = (c.width() + h),
                    f = (e.width() - h)
        }
        if (d > 15 && f > 15) {
            c.width(d);
            e.width(f);
            var j = c.index();
            if (this.cfg.scrollable) {
                this.theadClone.find(PrimeFaces.escapeClientId(c.attr("id") + "_clone")).width(d);
                this.theadClone.find(PrimeFaces.escapeClientId(e.attr("id") + "_clone")).width(f);
                if (this.footerCols.length > 0) {
                    var g = this.footerCols.eq(j)
                            , b = g.next();
                    g.width(d);
                    b.width(f)
                }
            }
        }
    },
    reclone: function () {
        this.clone.remove();
        this.clone = this.thead.clone(false);
        this.jq.children("table").append(this.clone)
    },
    switchToRowEdit: function (c) {
        this.showRowEditors(c);
        if (this.hasBehavior("rowEditInit")) {
            var b = this.cfg.behaviors.rowEditInit
                    , d = c.data("rk");
            var a = {
                params: [{
                        name: this.id + "_rowEditIndex",
                        value: d
                    }]
            };
            b.call(this, a)
        }
    },
    showRowEditors: function (a) {
        a.addClass("ui-state-highlight ui-row-editing").children("td.ui-editable-column").each(function () {
            var b = $(this);
            b.find(".ui-cell-editor-output").hide();
            b.find(".ui-cell-editor-input").show()
        })
    },
    saveRowEdit: function (a) {
        this.doRowEditRequest(a, "save")
    },
    cancelRowEdit: function (a) {
        this.doRowEditRequest(a, "cancel")
    },
    doRowEditRequest: function (a, d) {
        var f = a.closest("tr")
                , g = f.data("rk")
                , b = f.hasClass("ui-expanded-row")
                , e = this
                , c = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_rowEditIndex",
                            value: g
                        }, {
                            name: this.id + "_rowEditAction",
                            value: d
                        }],
                    onsuccess: function (j, h, i) {
                        PrimeFaces.ajax.Response.handle(j, h, i, {
                            widget: e,
                            handle: function (k) {
                                if (b) {
                                    this.collapseRow(f)
                                }
                                this.updateRows(f, k)
                            }
                        });
                        return true
                    },
                    oncomplete: function (j, h, i) {
                        if (i && i.validationFailed) {
                            e.invalidateRow(g)
                        }
                    }
                };
        if (d === "save") {
            this.getRowEditors(f).each(function () {
                c.params.push({
                    name: this.id,
                    value: this.id
                })
            })
        }
        if (d === "save" && this.hasBehavior("rowEdit")) {
            this.cfg.behaviors.rowEdit.call(this, c)
        } else {
            if (d === "cancel" && this.hasBehavior("rowEditCancel")) {
                this.cfg.behaviors.rowEditCancel.call(this, c)
            } else {
                PrimeFaces.ajax.Request.handle(c)
            }
        }
    },
    updateRows: function (b, a) {
        this.tbody.children("tr").filter('[data-prk^="' + b.data("rk") + '"]').remove();
        b.replaceWith(a)
    },
    invalidateRow: function (a) {
        this.tbody.children("tr").eq(a).addClass("ui-widget-content ui-row-editing ui-state-error")
    },
    getRowEditors: function (a) {
        return a.find("div.ui-cell-editor")
    },
    collapseRow: function (a) {
        a.removeClass("ui-expanded-row").next(".ui-expanded-row-content").remove()
    },
    showCellEditor: function (g) {
        this.incellClick = true;
        var k = null
                , h = this;
        if (g) {
            k = g;
            if (this.contextMenuCell) {
                this.contextMenuCell.parent().removeClass("ui-state-highlight")
            }
        } else {
            k = this.contextMenuCell
        }
        if (this.currentCell) {
            h.saveCell(this.currentCell)
        }
        this.currentCell = k;
        var b = k.children("div.ui-cell-editor")
                , a = b.children("div.ui-cell-editor-output")
                , l = b.children("div.ui-cell-editor-input")
                , e = l.find(":input:enabled")
                , f = e.length > 1;
        k.addClass("ui-state-highlight ui-cell-editing");
        a.hide();
        l.show();
        e.eq(0).focus().select();
        if (f) {
            var j = [];
            for (var d = 0; d < e.length; d++) {
                j.push(e.eq(d).val())
            }
            k.data("multi-edit", true);
            k.data("old-value", j)
        } else {
            k.data("multi-edit", false);
            k.data("old-value", e.eq(0).val())
        }
        if (!k.data("edit-events-bound")) {
            k.data("edit-events-bound", true);
            e.on("keydown.treetable-cell", function (o) {
                var n = $.ui.keyCode
                        , m = o.shiftKey
                        , i = o.which
                        , c = $(this);
                if (i === n.ENTER || i == n.NUMPAD_ENTER) {
                    h.saveCell(k);
                    o.preventDefault()
                } else {
                    if (i === n.TAB) {
                        if (f) {
                            var p = m ? c.index() - 1 : c.index() + 1;
                            if (p < 0 || (p === e.length)) {
                                h.tabCell(k, !m)
                            } else {
                                e.eq(p).focus()
                            }
                        } else {
                            h.tabCell(k, !m)
                        }
                        o.preventDefault()
                    }
                }
            }).on("focus.treetable-cell click.treetable-cell", function (c) {
                h.currentCell = k
            })
        }
    },
    tabCell: function (a, d) {
        var b = d ? a.next() : a.prev();
        if (b.length == 0) {
            var c = d ? a.parent().next() : a.parent().prev();
            b = d ? c.children("td.ui-editable-column:first") : c.children("td.ui-editable-column:last")
        }
        this.showCellEditor(b)
    },
    saveCell: function (a) {
        var c = a.find("div.ui-cell-editor-input :input:enabled")
                , f = false
                , e = this;
        if (a.data("multi-edit")) {
            var b = a.data("old-value");
            for (var d = 0; d < c.length; d++) {
                if (c.eq(d).val() != b[d]) {
                    f = true;
                    break
                }
            }
        } else {
            f = (c.eq(0).val() != a.data("old-value"))
        }
        if (f) {
            e.doCellEditRequest(a)
        } else {
            e.viewMode(a)
        }
        this.currentCell = null
    },
    viewMode: function (a) {
        var b = a.children("div.ui-cell-editor")
                , d = b.children("div.ui-cell-editor-input")
                , c = b.children("div.ui-cell-editor-output");
        a.removeClass("ui-cell-editing ui-state-error ui-state-highlight");
        c.show();
        d.hide();
        a.removeData("old-value").removeData("multi-edit")
    },
    doCellEditRequest: function (a) {
        var e = a.children(".ui-cell-editor")
                , f = e.attr("id")
                , d = a.index()
                , c = a.closest("tr").data("rk") + "," + d
                , g = this;
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                    name: this.id + "_cellInfo",
                    value: c
                }, {
                    name: f,
                    value: f
                }],
            onsuccess: function (j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: g,
                    handle: function (k) {
                        e.children(".ui-cell-editor-output").html(k)
                    }
                });
                return true
            },
            oncomplete: function (j, h, i) {
                if (i.validationFailed) {
                    a.addClass("ui-state-error")
                } else {
                    g.viewMode(a)
                }
            }
        };
        if (this.hasBehavior("cellEdit")) {
            this.cfg.behaviors.cellEdit.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    }
});
PrimeFaces.widget.Wizard = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        this.content = $(this.jqId + "_content");
        this.backNav = $(this.jqId + "_back");
        this.nextNav = $(this.jqId + "_next");
        this.cfg.formId = this.jq.parents("form:first").attr("id");
        this.currentStep = this.cfg.initialStep;
        var a = this;
        if (this.cfg.showStepStatus) {
            this.stepControls = $(this.jqId + " .ui-wizard-step-titles li.ui-wizard-step-title")
        }
        if (this.cfg.showNavBar) {
            var c = this.getStepIndex(this.currentStep);
            PrimeFaces.skinButton(this.backNav);
            PrimeFaces.skinButton(this.nextNav);
            this.backNav.click(function () {
                a.back()
            });
            this.nextNav.click(function () {
                a.next()
            });
            if (c == 0) {
                this.backNav.hide()
            } else {
                if (c == this.cfg.steps.length - 1) {
                    this.nextNav.hide()
                }
            }
        }
    },
    back: function () {
        if (this.cfg.onback) {
            var c = this.cfg.onback.call(this);
            if (c === false) {
                return
            }
        }
        var a = this.getStepIndex(this.currentStep) - 1;
        if (a >= 0) {
            var b = this.cfg.steps[a];
            this.loadStep(b, true)
        }
    },
    next: function () {
        if (this.cfg.onnext) {
            var c = this.cfg.onnext.call(this);
            if (c === false) {
                return
            }
        }
        var a = this.getStepIndex(this.currentStep) + 1;
        if (a < this.cfg.steps.length) {
            var b = this.cfg.steps[a];
            this.loadStep(b, false)
        }
    },
    loadStep: function (c, b) {
        var d = this
                , a = {
                    source: this.id,
                    process: this.id,
                    update: this.id,
                    formId: this.cfg.formId,
                    params: [{
                            name: this.id + "_wizardRequest",
                            value: true
                        }, {
                            name: this.id + "_stepToGo",
                            value: c
                        }],
                    onsuccess: function (g, e, f) {
                        PrimeFaces.ajax.Response.handle(g, e, f, {
                            widget: d,
                            handle: function (h) {
                                this.content.html(h)
                            }
                        });
                        return true
                    },
                    oncomplete: function (h, e, f) {
                        d.currentStep = f.currentStep;
                        if (!f.validationFailed) {
                            var g = d.getStepIndex(d.currentStep);
                            if (d.cfg.showNavBar) {
                                if (g === d.cfg.steps.length - 1) {
                                    d.hideNextNav();
                                    d.showBackNav()
                                } else {
                                    if (g === 0) {
                                        d.hideBackNav();
                                        d.showNextNav()
                                    } else {
                                        d.showBackNav();
                                        d.showNextNav()
                                    }
                                }
                            }
                            if (d.cfg.showStepStatus) {
                                d.stepControls.removeClass("ui-state-highlight");
                                $(d.stepControls.get(g)).addClass("ui-state-highlight")
                            }
                        }
                    }
                };
        if (b) {
            a.params.push({
                name: this.id + "_backRequest",
                value: true
            })
        }
        PrimeFaces.ajax.Request.handle(a)
    },
    getStepIndex: function (b) {
        for (var a = 0; a < this.cfg.steps.length; a++) {
            if (this.cfg.steps[a] == b) {
                return a
            }
        }
        return -1
    },
    showNextNav: function () {
        this.nextNav.fadeIn()
    },
    hideNextNav: function () {
        this.nextNav.fadeOut()
    },
    showBackNav: function () {
        this.backNav.fadeIn()
    },
    hideBackNav: function () {
        this.backNav.fadeOut()
    }
});
PrimeFaces.widget.TriStateCheckbox = PrimeFaces.widget.BaseWidget.extend({
    init: function (b) {
        this._super(b);
        this.input = $(this.jqId + "_input");
        this.box = this.jq.find(".ui-chkbox-box");
        this.icon = this.box.children(".ui-chkbox-icon");
        this.itemLabel = this.jq.find(".ui-chkbox-label");
        this.disabled = this.input.is(":disabled");
        this.fixedMod = function (d, c) {
            return ((d % c) + c) % c
        }
        ;
        var a = this;
        if (!this.disabled) {
            this.box.mouseover(function () {
                a.box.addClass("ui-state-hover")
            }).mouseout(function () {
                a.box.removeClass("ui-state-hover")
            }).click(function (c) {
                a.toggle(1);
                if (c.preventDefault) {
                    c.preventDefault()
                } else {
                    c.returnValue = false
                }
            });
            this.itemLabel.click(function () {
                a.toggle(1);
                if (event.preventDefault) {
                    event.preventDefault()
                } else {
                    event.returnValue = false
                }
            });
            this.box.bind("keydown", function (c) {
                switch (c.keyCode) {
                    case 38:
                        a.toggle(1);
                        if (c.preventDefault) {
                            c.preventDefault()
                        } else {
                            c.returnValue = false
                        }
                        break;
                    case 40:
                        a.toggle(-1);
                        if (c.preventDefault) {
                            c.preventDefault()
                        } else {
                            c.returnValue = false
                        }
                        break;
                    case 39:
                        a.toggle(1);
                        if (c.preventDefault) {
                            c.preventDefault()
                        } else {
                            c.returnValue = false
                        }
                        break;
                    case 37:
                        a.toggle(-1);
                        if (c.preventDefault) {
                            c.preventDefault()
                        } else {
                            c.returnValue = false
                        }
                        break;
                    case 32:
                        a.toggle(1);
                        if (c.preventDefault) {
                            c.preventDefault()
                        } else {
                            c.returnValue = false
                        }
                        break
                }
            });
            if (this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors)
            }
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    toggle: function (d) {
        if (!this.disabled) {
            var a = parseInt(this.input.val());
            var c = this.fixedMod((a + d), 3);
            this.input.val(c);
            if (c == 0) {
                this.box.removeClass("ui-state-active")
            } else {
                this.box.addClass("ui-state-active")
            }
            var e = this.box.data("iconstates");
            this.icon.removeClass(e[a]).addClass(e[c]);
            var b = this.box.data("titlestates");
            if (b != null && b.length > 0) {
                this.box.attr("title", b[c])
            }
            this.input.change()
        }
    }
});
PrimeFaces.widget.Chips = PrimeFaces.widget.BaseWidget.extend({
    init: function (a) {
        this._super(a);
        this.input = $(this.jqId + "_input");
        this.hinput = $(this.jqId + "_hinput");
        this.itemContainer = this.jq.children("ul");
        this.inputContainer = this.itemContainer.children(".ui-chips-input-token");
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.hinput.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.bindEvents()
    },
    bindEvents: function () {
        var b = this;
        this.itemContainer.hover(function () {
            $(this).addClass("ui-state-hover")
        }, function () {
            $(this).removeClass("ui-state-hover")
        }).click(function () {
            b.input.focus()
        });
        this.input.on("focus.chips", function () {
            b.itemContainer.addClass("ui-state-focus")
        }).on("blur.chips", function () {
            b.itemContainer.removeClass("ui-state-focus")
        }).on("keydown.chips", function (g) {
            var f = $(this).val();
            switch (g.which) {
                case 8:
                    if (f.length === 0 && b.hinput.children("option") && b.hinput.children("option").length > 0) {
                        var c = b.hinput.children("option:last")
                                , d = c.index();
                        $(b.itemContainer.children("li.ui-chips-token").get(d)).remove();
                        c.remove()
                    }
                    break;
                case 13:
                    if (f && f.trim().length && (!b.cfg.max || b.cfg.max > b.hinput.children("option").length)) {
                        b.addItem(f)
                    }
                    g.preventDefault();
                    break;
                default:
                    if (b.cfg.max && b.cfg.max === b.hinput.children("option").length) {
                        g.preventDefault()
                    }
                    break
            }
        });
        var a = "> li.ui-chips-token > .ui-chips-token-icon";
        this.itemContainer.off("click", a).on("click", a, null, function (c) {
            b.removeItem($(this).parent())
        })
    },
    addItem: function (c) {
        var b = PrimeFaces.escapeHTML(c);
        var a = '<li class="ui-chips-token ui-state-active ui-corner-all">';
        a += '<span class="ui-chips-token-icon ui-icon ui-icon-close" />';
        a += '<span class="ui-chips-token-label">' + b + "</span></li>";
        this.inputContainer.before(a);
        this.input.val("").focus();
        this.hinput.append('<option value="' + b + '" selected="selected"></option>');
        this.invokeItemSelectBehavior(b)
    },
    removeItem: function (b) {
        var a = this.itemContainer.children("li.ui-chips-token").index(b);
        var c = b.find("span.ui-autocomplete-token-label").html();
        $this = this;
        this.hinput.children("option").eq(a).remove();
        b.fadeOut("fast", function () {
            var d = $(this);
            d.remove();
            $this.invokeItemUnselectBehavior(c)
        })
    },
    invokeItemSelectBehavior: function (c) {
        if (this.cfg.behaviors) {
            var b = this.cfg.behaviors.itemSelect;
            if (b) {
                var a = {
                    params: [{
                            name: this.id + "_itemSelect",
                            value: c
                        }]
                };
                b.call(this, a)
            }
        }
    },
    invokeItemUnselectBehavior: function (c) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.itemUnselect;
            if (a) {
                var b = {
                    params: [{
                            name: this.id + "_itemUnselect",
                            value: c
                        }]
                };
                a.call(this, b)
            }
        }
    }
});
