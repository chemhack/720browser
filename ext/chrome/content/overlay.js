function sshObserver()
{
	this.register();
}

sshObserver.prototype = {
	observe: function(subject, topic, data) {
		myDump("topic: "+topic+" data: "+data);
	
		if(topic=='ssh-connection' && data=='online'){
			myDump("online");
			document.getElementById('t20brs-connectection-status').value='已连接';
			myDump("OK");
		}
		else if(topic=='xul-overlay-merged'){
			myDump("xul-overlay-merged");
		}
	},
	register: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "ssh-connection", false);
		observerService.addObserver(this, "xul-overlay-merged", false);
	}
}

function myDump(aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("t20brs: " + aMessage);
}

function init(){
	myDump("init");
	observer = new sshObserver();
	Components.classes["@720browser.com/t20brs;1"].getService().wrappedJSObject.notifyStatus();	
}
window.addEventListener("load", function(e) { init(); }, false);

