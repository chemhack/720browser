Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const pps = Components.classes["@mozilla.org/network/protocol-proxy-service;1"].getService(Components.interfaces.nsIProtocolProxyService);
function ProxyService() { 
  this.wrappedJSObject = this;
}
ProxyService.prototype = {
  classDescription: "Proxy switching component",
  classID:          Components.ID("{4E10EBDB-8977-4F4C-83E4-C7C0C6FECC92}"),
  contractID:       "@720browser.com/proxyService;1",
  QueryInterface:   XPCOMUtils.generateQI([Components.interfaces.nsIProtocolProxyFilter]),
  service: true,
  inited:false,
  proxyInfo:null,
  switchPolicy:'direct',
  switchToGfwList:function(){
	  //TODO by kcome
  },
  switchToGlobal:function(){
   	this.switchPolicy='global';
  },
  switchToDirect:function(){
  	this.switchPolicy='direct';
  },
  init:function(proxyType,host,port){
	this.proxyInfo=pps.newProxyInfo(proxyType,host,port,Components.interfaces.nsIProxyInfo.RANSPARENT_PROXY_RESOLVES_HOST,30,null);
	pps.registerFilter(this,0);
	this.inited=true;
  },
  applyFilter: function(aProxyService, aURI, aProxy) {
	if(aURI.asciiSpec=='https://720browser.com/ip.php'){
	  return this.proxyInfo;
	}
	if(this.inited&&this.switchPolicy=='global'){
	  return this.proxyInfo;	  	
	}
	return aProxy;
  }
};

var components = [ProxyService];
if (XPCOMUtils.generateNSGetFactory) 
	var NSGetFactory = XPCOMUtils.generateNSGetFactory(components); // FF4, Gecko 2
else 
	var NSGetModule = XPCOMUtils.generateNSGetModule(components); // FF3, Gecko 1.9
