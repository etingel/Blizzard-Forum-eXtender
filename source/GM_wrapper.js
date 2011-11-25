function BFX_getVersion()
{
    return BFXcrVer;
}

function BFX_backendAPIname()
{
    return "chrome";
}

function GM_setValue(prefName,value)
{
	var key = "BFX_GM_" + prefName + ".value";
    var typeKey = "BFX_GM_" + prefName + ".type";
    var prefType=typeof(value);
    switch (prefType) {
        case "string": localStorage.setItem(key, value); localStorage.setItem(typeKey, prefType); break;
        case "boolean": localStorage.setItem(key, value); localStorage.setItem(typeKey, prefType); break;
        case "number": 
            if (value % 1 != 0) {
                throw new Error("Cannot set preference to non integral number");
            }
            localStorage.setItem(key, value);
			localStorage.setItem(typeKey, prefType); break;
        default:
            throw new Error("Cannot set preference with datatype: " + prefType);
    }
}
function GM_getValue(prefName, defaultValue)
{
    var key = "BFX_GM_" + prefName + ".value";
    var typeKey = "BFX_GM_" + prefName + ".type";
	if (localStorage.getItem(key) == null)
	    return defaultValue;
    var prefType = localStorage.getItem(typeKey);
	var stringedValue = localStorage.getItem(key);
	if (prefType == null && defaultValue != null)
	    prefType = typeof(defaultValue);
    switch (prefType) {
        case "string": return stringedValue;
        case "boolean": 
			if (stringedValue == "true" || "1") {return true;}
			else if (stringedValue == "false" || "0") {return false;} //if it's not "true", "1", "false", or "0", just let it return the defaultValue in the last line of this function.
        case "number": return parseInt(stringedValue);
    }
	return defaultValue; //if the type pref is lost or is of an unhandled type and we can't guess the type from the defaultValue, we'll pretend that the pref just isn't there.
}

function GM_openInTab(url)
{
	var port = chrome.extension.connect({name: "GM_openInTab"});
    port.postMessage({url: url});
}

function GM_xmlhttpRequest(options)
{
    var onload = options["onload"];
	var onerror = options["onerror"];
	//alert(typeof onerror);
    chrome.extension.sendRequest({name: "GM_xmlhttpRequest", method: options["method"], url: options["url"], headers: options["headers"]}, function(resp) {
        switch(resp.callbackType)
	    {
	    case "onload":
		  if(typeof onload == "function")
		    onload(resp);
		  break;
		case "onerror":
		  if(typeof onerror == "function")
		    onerror(resp);
		  break;
		} 
    });
};
/*var chromexmlhttp;
function GM_xmlhttpRequest(options)
{
    var onload = options["onload"];
    chromexmlhttp = new XMLHttpRequest();
    chromexmlhttp.open(options["method"], options["url"], true);
	//alert(typeof onload);
    chromexmlhttp.onload = function(resp) {
    var resptext = chromexmlhttp.responseText;
    var responseDetails = { responseText : resptext }
    onload(responseDetails);
    };
chromexmlhttp.send(null);
}*/

function updateLocalPrefs(runBFX)//async; tells the background page to send us the current preferences
{
	chrome.extension.sendRequest({name: "updateLocalPrefs"}, function(resp) {
		BFXcrVer = resp.BFXversion;
		prefObject = resp;
		if (runBFX) 
		{
			BFXmain();
		}
	});
}
var BFXcrVer;
var prefObject;
updateLocalPrefs(true);