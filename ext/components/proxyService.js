Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
function ProxyService() { 
  this.wrappedJSObject = this;
}
ProxyService.prototype = {
  classDescription: "Proxy switching component",
  classID:          Components.ID("{4E10EBDB-8977-4F4C-83E4-C7C0C6FECC92}"),
  contractID:       "@720browser.com/proxyService;1",
  QueryInterface:   XPCOMUtils.generateQI(),
  service: true,
  switchToGfwList:function(){
  	
  },
  switchToGlobal:function(){
  	
  },
  switchToDirect:function(){
  	
  }
};

var components = [ProxyService];
if (XPCOMUtils.generateNSGetFactory) 
	var NSGetFactory = XPCOMUtils.generateNSGetFactory(components); // FF4, Gecko 2
else 
	var NSGetModule = XPCOMUtils.generateNSGetModule(components); // FF3, Gecko 1.9
