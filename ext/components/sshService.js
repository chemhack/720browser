// Based on https://developer.mozilla.org/en/How_to_Build_an_XPCOM_Component_in_Javascript
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
const timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
const proxyService= Components.classes["@720browser.com/proxyService;1"].getService().wrappedJSObject;
function SshService() { // constructor
	this.wrappedJSObject = this;
	this.init();
}

function elog(aMessage) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage("[t20brs] " + aMessage);
}

SshService.prototype = {
	classDescription: "720Browser Add-on XPCOM Component",
	classID: Components.ID("{72036cf4-a0a6-48ad-85ae-061aa201f008}"),
	contractID: "@720browser.com/sshService;1",
	_xpcom_categories: [{category: "profile-after-change", entry: "720Browser"}],
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIStartupMaster]),
	service: true,
	process:null,
	status:'idle', //either idle, connecting, connected, failed, reconnect
	clientIP:'', //client ip through proxy detected from https://720browser.com/ip.php
	connectAttempStart:0,
	reconnectInfo:{},
	observerService:Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService),
	prefs:Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.t20brs."),
	prompts:Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
	kAuthURL:"http://127.0.0.1:8080/auth",
	kActivateURL:"http://127.0.0.1:8080/activate",
	
	ssh: function(server,username,password,localport,remoteport) {
		if(this.status=='connected'){
			this.disconnect();
		}
		this.status='connecting';
		this.notifyStatus();
		this.connectAttempStart=new Date().getTime();
		this.reconnectInfo={'server':server,'username':username,'password':password,'localport':localport,'remoteport':remoteport};
		var arguments = new Array();
		arguments[0] = '-ssh';
		arguments[1] = '-l';
		arguments[2] = username;
		arguments[3] = '-pw';
		arguments[4] = password;
		arguments[5] = '-D';
		arguments[6] = localport;
		arguments[7] = '-N';
		arguments[8] = '-C';
		arguments[9] = '-batch';
		arguments[10] = server;
		var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
						 getService(Components.interfaces.nsIProperties); 
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
		elog(plinkPath);
		var executable = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		executable.initWithPath(plinkPath);
		if (!executable.exists()) {
			elog(plinkPath+" not exists");
			this.status='failed';
			this.notifyStatus();
			return;
		} else {
			if(!executable.isExecutable()){
				executable.permissions=755;
			}
			if(this.process&&this.process.isRunning){
				this.process.kill();
			}
			var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
			process.init(executable);
			process.runAsync(arguments, arguments.length,this);
			this.process=process;
			// var netp = Components.classes["@mozilla.org/preferences-service;1"].
			// 	getService(Components.interfaces.nsIPrefService).getBranch("network.proxy.");
			// netp.setCharPref("socks", "127.0.0.1");
			// netp.setIntPref("socks_port", 2333);
			// netp.setIntPref("type", 1);
			// netp.setBoolPref("socks_remote_dns",true);
			
			var this_=this;
			var event = {
				notify: function(timer) {
					this_.detectConnectionStatus.call(this_);
				}
			};
			timer.initWithCallback(event,1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		}
	},
	
	detectConnectionStatus:function(){
		var req = new XMLHttpRequest();
		req.open('GET', 'https://720browser.com/ip.php', true);
		req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
		req.timeout=10000;
		var this_=this;
		req.onreadystatechange=function(evt){
			this_.onTestHttpRequestLoad.call(this_,req);
		};
		req.send();
	},
	
	onTestHttpRequestLoad:function(req){
		if(this.status=='connecting'){
			if(req.readyState==4){
				elog("status:"+req.status);
				elog("time:"+(new Date().getTime()-this.connectAttempStart));			
				if(req.status==200){
					this.clientIP=req.responseText;
					this.status='connected';
					this.notifyStatus();				
				}else{
					if((new Date().getTime()-this.connectAttempStart)>20000){
						this.status='failed';
						this.notifyStatus();
						this.disconnect();				
					}else{
						var this_=this;
						var event = {
							notify: function(timer) {
								this_.detectConnectionStatus.call(this_);
							}
						};
						timer.initWithCallback(event,500, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
					}
				}
			}
		}
	},
	
	disconnect:function(){
		// var netp = Components.classes["@mozilla.org/preferences-service;1"].
		// 	getService(Components.interfaces.nsIPrefService).getBranch("network.proxy.");
		// netp.setIntPref("type", 5);
		if(this.process&&this.process.isRunning){
			this.process.kill();
		}
		this.clientIP='';
		this.status='idle';
		this.notifyStatus();
	},
	
	activate: function() {
		try {
			var hwid = "dummy-hwid"; // TODO: using a C written executable to obtain true hwid
			var input = {value: ""};
			var check = {value: false};
			var result = this.prompts.prompt(null, "Type Your Activation Code", "123-321-456-987-000", input, null, check);
			if (!result) {
				this.prompts.alert(null, "Error", "Can not continue without Activation");
				return;
			}
			var code = input.value;
			if (code.length!=15)
				code = code.replace('-','');
			if (code.length!=15) {
				this.prompts.alert(null, "Error", "Activation Code not correct. It should be a 15 digits string looks like 123-321-456-987-000");
				return;
			}

			this.prefs.setCharPref("hwid", hwid);
			var req = new XMLHttpRequest();
			req.open('POST', this.kActivateURL, true);
			req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
			req.timeout=10000;
			var this_=this;
			var ret = true;
			req.onreadystatechange=function(evt){
				this_.onActivateHttpRequestLoad.call(this_,req);
			};
			req.send(JSON.stringify({hwid:hwid, code:code}));
		} catch(err) {
			Components.utils.reportError(err);
		}
	},

	onActivateHttpRequestLoad: function(req) {
		if(req.readyState!=4)
			return;
		if(req.status==200) {
			var json = JSON.parse(req.responseText);
			if (json["status"]=="OK") {
				elog("json original: "+req.responseText);
				var account = json["account"];
				var token = json["token"];
				elog("json: "+account+":"+token);
				this.prefs.setCharPref("token", token);
				this.prefs.setCharPref("account", account);
				this.getAuth();
			} else {
				elog("status not OK, json original: "+req.responseText);
				this.prompts.alert(null, "Error", "Activation Code incorrect.");
				this.prefs.setCharPref("token", "");
				this.prefs.setCharPref("account", "");
				this.prefs.setCharPref("hwid", "");
			}
		} else
			elog("Activate failed. HTTP status : "+req.status);	
	},

	getAuth: function() {
		try {
			var hwid = this.prefs.getCharPref("hwid").toLowerCase();
			var token = this.prefs.getCharPref("token").toLowerCase();
			var account = this.prefs.getCharPref("account");
			if (hwid == null || hwid.length == 0 || account == null || account.length == 0 || token == null || token.length == 0) {
				this.activate();
				return;
			}
			var req = new XMLHttpRequest();
			req.open('POST', this.kAuthURL, true);
			req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
			req.timeout=10000;
			var this_=this;
			req.onreadystatechange=function(evt){
				this_.onAuthHttpRequestLoad.call(this_,req);
			};
			req.send(JSON.stringify({account:account, token:token, hwid:hwid}));
		} catch(err) {
			Components.utils.reportError(err);
		}
	},

	onAuthHttpRequestLoad: function(req) {
		if(req.readyState!=4)
			return;
		if(req.status==200) {
			var json = JSON.parse(req.responseText);
			if (json["status"]=="OK") {
				elog("json original: "+req.responseText);
				var unix_name = json["unix_name"];
				var unix_password = json["unix_password"];
				elog("json: "+unix_name+":"+unix_password);
				this.ssh('106.187.103.253',/*'kcome','kcome233',*/unix_name,unix_password,'2333','22');
			} else 
				elog("status not OK, json original: "+req.responseText);
		} else
			elog("Auth failed. HTTP status : "+req.status);	
	},
	
	launch: function() {
		try {
			this.getAuth();
		} catch(err) {
			Components.utils.reportError(err);
		}
	},

	init: function() {
		var enable = true;
		try {
			enable = this.prefs.getBoolPref("enable");
		} catch(err) {
			Components.utils.reportError(err);
		}
		if(enable) {
			proxyService.init('socks','127.0.0.1','2333')
			// this.launch();
			this.register();
		}
	},
	
	observe: function(subject, topic, data) {
		if(topic=='quit-application'){
			this.disconnect();
		}
		if(topic=='process-failed'){
			elog('process-failed');
		}
		if(topic=='process-finished'&&subject==this.process){
			if(this.status=='connecting'){
				this.status='fail';
				elog(subject.exitValue);
				this.notifyStatus();
			}else if(this.status=='connected'){
				this.status='reconnect';
				this.notifyStatus();
				this.ssh(this.reconnectInfo.server,this.reconnectInfo.username,this.reconnectInfo.password,this.reconnectInfo.localport,this.reconnectInfo.remoteport);
			}
		}
	},
	register: function() {
		this.observerService.addObserver(this, "quit-application", false);
	},
	unregister: function() {
		this.observerService.removeObserver(this, "quit-application");
	},
	notifyStatus:function(){
		this.observerService.notifyObservers(null, "ssh-connection", "refresh");
	}
}

var components = [SshService];
if (XPCOMUtils.generateNSGetFactory) 
	var NSGetFactory = XPCOMUtils.generateNSGetFactory(components); // FF4, Gecko 2
else 
	var NSGetModule = XPCOMUtils.generateNSGetModule(components); // FF3, Gecko 1.9
