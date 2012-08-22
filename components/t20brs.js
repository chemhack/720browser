// Based on https://developer.mozilla.org/en/How_to_Build_an_XPCOM_Component_in_Javascript

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function t20brs() {
  // constructor
  this.init();
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
  		alert("Error - executable '" + path + "' not found");
  		return;
  	} else {
  		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
  		process.init(executable);
  		var pid = new Object();
  		process.run(false, arguments, arguments.length, pid);
  	}
  },

  launch: function() {
    try {
        this.say('greetings');
    } catch(err) {
		alert(" Error - couldn't execute '" + path + "'");
		alert(" err "+err);
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
    } else this.say('disabled');
  }
}

if(XPCOMUtils.generateNSGetFactory) {
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([t20brs]);
}
