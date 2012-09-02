// Based on https://developer.mozilla.org/en/How_to_Build_an_XPCOM_Component_in_Javascript
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function t20brs() { // constructor
    this.init();
}

function myDump(aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("t20brs: " + aMessage);
}

t20brs.prototype = {
    classDescription: "720Browser Add-on XPCOM Component",
    classID: Components.ID("{72036cf4-a0a6-48ad-85ae-061aa201f008}"),
    contractID: "@720browser.com/t20brs;1",
    _xpcom_categories: [{category: "profile-after-change", entry: "720Browser"}],
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIStartupMaster]),

    say: function(word) {
        var path = "/usr/bin/say";
        var arguments = new Array();
        arguments[0] = word;
        var executable = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        executable.initWithPath(path);
        if (!executable.exists()) {
            console.log(path + "' not found");
            return;
        } else {
            var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
            process.init(executable);
            var pid = new Object();
            process.run(false, arguments, arguments.length, pid);
        }
    },

    ssh: function() {
        var arguments = new Array();
        arguments[0] = '-ssh';
        arguments[1] = '-l';
        arguments[2] = 'kcome';
        arguments[3] = '-pw';
        arguments[4] = 'kcome233';
        arguments[5] = '-D';
        arguments[6] = '2333';
        arguments[7] = '-N';
        arguments[8] = '-C';
        arguments[9] = '96.47.2.142';
        var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
                         getService(Components.interfaces.nsIProperties); 
        // var appDirFile = dirService.get("AChrom", Components.interfaces.nsIFile); // returns an nsIFile object
	    var osString = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var plinkFileName='';
		if(osString=='Darwin'){
			plinkFileName='/plink-mac';
		}else if(osString=='WINNT'){
			plinkFileName='\\plink-win.exe';
		}else{
			plinkFileName='/plink-linux';
		}
        var plinkPath = Components.classes["@mackerron.com/getExtDir;1"].createInstance().wrappedJSObject.getExtDir().path+plinkFileName;
        myDump(plinkPath);
        var executable = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        executable.initWithPath(plinkPath);
        if (!executable.exists()) {
            myDump(plinkPath+" not exists");
            return;
        } else {
			//TODO: check permission
            var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
            process.init(executable);
            var pid = new Object();
            process.run(false, arguments, arguments.length, pid);

            var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefService).getBranch("network.proxy.");
            prefs.setCharPref("socks", "127.0.0.1");
            prefs.setIntPref("socks_port", 2333);
            prefs.setIntPref("type", 1);
        }
    },

    launch: function() {
        try {
            this.ssh();
        } catch(err) {
            Components.utils.reportError(err);
        }
    },

    init: function() {
        var enable = true;
        try {
            var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
            enable = prefs.getBoolPref("extensions.t20brs.enable");
        } catch(err) {
        }
        if(enable) {
            this.launch();
        }
    }
}

if(XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([t20brs]);
}
