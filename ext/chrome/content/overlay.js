const t20brs=Components.classes["@720browser.com/sshService;1"].getService().wrappedJSObject;

function sshObserver()
{
	this.register();
}

sshObserver.prototype = {
	observe: function(subject, topic, data) {
		myDump("topic: "+topic+" data: "+data);
	
		if(topic=='ssh-connection' && data=='refresh'){
			var status=t20brs.status;
			if(status=='connecting'){
				document.getElementById('t20brs-connect-button').disabled=true;
			}else{
				document.getElementById('t20brs-connect-button').disabled=false;
				
			}
			document.getElementById('t20brs-connectection-status').value=status;
			document.getElementById('t20brs-connectection-clientIP').value=t20brs.clientIP;
		}
	},
	register: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "ssh-connection", false);
	}
}

function myDump(aMessage) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("t20brs: " + aMessage);
}

function connect(){
	var server=document.getElementById('t20brs-serverlist').value;
	myDump(server);
	t20brs.disconnect();
	t20brs.ssh(server,'kcome','kcome233','2333','22');
}

function init(){
	myDump("init");
	var observer = new sshObserver();
	t20brs.notifyStatus();	
}

window.addEventListener("load", function(e) { init(); }, false);

