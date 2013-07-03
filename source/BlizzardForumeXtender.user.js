// ==UserScript==
// @name          Blizzard Forum eXtender
// @namespace     http://maged.lordaeron.org/bfx/
// @description   Adds useful features to Blizzard Entertainment forums.
// @include       http://*.battle.net/*/forum/*
// @include       https://*.battle.net/*/forum/*
// @icon          http://maged.lordaeron.org/bfx/bfx-icon32.png
// @require       http://maged.lordaeron.org/bfx/libs/jquery-1.6.2.min.js
// @version       0.6.1
// ==/UserScript==

//To-do: 
// add an alert saying settings were saved
// use em units when possible for sizes
// make source a toggle
// add default settings page for main forum list and 404
// make Signature function an array for random quotations?

//Changes made in 0.6.0:
// Refactored some code that was origially hacked in
// toBML can now handle [url] tags
// Added option to continue striping out [url] tags, since non-Blizzard people can't use them anyway.
// Fixed options not showing save or reset buttons right after posting
// Upgraded BFX for the new forum

//Changes made since last release (0.6.0):
// None

//alert($); // check if the dollar (jquery) function works
//alert($().jquery); // check jQuery version
function BFXmain() {
  if (/^http(s)?:\/\/(\w)+\.battle\.net\/(\w)+\/(\w)+\/forum\/[0-9]+\/$/.test(document.location.href))
	{
	    //BFXboard();
	}
  if (/^http(s)?:\/\/(\w)+\.battle\.net\/((\w)+\/)?(\w)+\/forum\/topic\/[0-9]+/.test(document.location.href))
	{
	    BFXthread();
	}
	if (/^http(s)?:\/\/(\w)+\.battle\.net\/((\w)+\/)?(\w)+\/forum\/[0-9]+\/topic$/.test(document.location.href))
	{
	    BFXnewtopic();
	}
	if (/^http(s)?:\/\/(\w)+\.battle\.net\/((\w)+\/)?(\w)+\/forum\/[0-9]+\/topic\?bfx-options$/.test(document.location.href))
	{
	    BFXoptions();
	}
  //alert(JSON.stringify(parseForumURL(document.location.href)));
  //add BFX options link.
	$('.service-welcome').append('\n|  <a href="' + getNewTopicURL() + '?bfx-options" tabindex="50" accesskey="3">BFX Options</a>');
	
	//add BFX support bar
	$('.support-nav').append('<li><a href="http://code.google.com/p/bfx/issues/list" tabindex="55" class="support-category"><strong class="support-caption">BFX Issues</strong>Report issues with Blizzard Forum eXtender here.</a></li>');

//====Migrated code from BFH:====
  //==Lengthen Search Box==
  var search = document.getElementById("search-field");
	search.maxLength = "99999";
}

function BFXthread() {
	var postList = [];
  var index;
	$('#thread div[id|="post"]').each(function(index) {
    //For old forum version
    //Put every detected post into a Post object, and add that object to the postList array.
    //This includes deleted posts, so check Post.deleted to filter them out, if necessary
		postList[index] = new Post(this);
	})
  $('#post-list div[id|="post"]').each(function(index) {
    //For new forum version 2/1/2013
    //Put every detected post into a Post object, and add that object to the postList array.
    //This includes deleted posts, so check Post.deleted to filter them out, if necessary
		postList[index] = new Post(this);
	})
  //use to check if the thread is locked
  var locked = ((!($('.ui-button.disabled[href="javascript:;"]')[0] == null)) && ($('.ui-button[href="#new-post"]')[0] == null))
	//alert(locked);
  //if the instaquote preference is on, add the BML version of posts to the cache that Blizzard so graciously provided.
  if (GM_getValue("instaquote", true))
	{
    var cachedQuotes = {}; //instant quote cache
    var pLlen=postList.length;
    var currentpost;
    for (index=0;index<pLlen;index++)
    {
      currentpost = postList[index];
      if (!currentpost.deleted)
        {cachedQuotes[currentpost.postId] = {"name":currentpost.author,"detail":currentpost.orginalContentBmlBody};}
    }
    //Inject the cached quotes we made locally
    document.body.appendChild(document.createElement("script")).innerHTML="if(typeof Cms != 'undefined'){ Cms.Topic.cachedQuotes = " + JSON.stringify(cachedQuotes) + ";} else if (typeof ForumTopic != 'undefined') {ForumTopic.cachedQuotes = " + JSON.stringify(cachedQuotes) + ";}";
	}
  
  //add the "Source" button, so that people can easily see the BML for locked posts
  addViewSourceBtns(postList);
  
	if (GM_getValue("signature_toggle", false))
	{
	    addSigCode(true/*is a reply*/);
	}
}

function BFXnewtopic() {
    if (GM_getValue("signature_toggle", false))
	{
	    addSigCode(false/*is a new post*/);
	}
}

function BFXoptions() {
	//set the page title
	document.title = document.title.replace(/^New Topic/,"BFX Forum Options");
	//change New Topic link in nav to BFX Forum Options
	var newTopicJQNode = $("a:contains('New Topic')");
	var newTopicUrl = newTopicJQNode.attr("href");
	newTopicJQNode.attr("href",newTopicUrl+"?bfx-options");
	newTopicJQNode.html("BFX Forum Options");
	//change Create Thread heading to BFX Forum Options
	createThreadJQNode = $("div.form-title h3.header-3"); //new forum support
  if (createThreadJQNode.length < 1)
  {
      createThreadJQNode = $("div.post-user-details h4"); //old forum support
  }
  
  createThreadJQNode.html("BFX Forum Options");
	//draw main UI
	var settingsHTML = '<div align="center">Need help? Check out the Blizzard Forum eXtender <a href="http://code.google.com/p/bfx/">homepage</a>!<br />\nBlizzard Forum eXtender created by <a href="http://maged.lordaeron.org/">Maged</a> and <a href="http://www.sixen.org/">Sixen</a>.</div>\n';
	settingsHTML += '<h1 style="font-size: 19px; font-weight: normal; padding: 6px; position: relative; right: 6px;">General:</h1>\n';
     	settingsHTML += '<div style="position:relative; left: 12px;">\n';
     	settingsHTML += '<input type="checkbox" name="signature" value="signature" id="signature" />Enable signature<br />\n';
     	//settingsHTML += '<input type="checkbox" name="stripsig" value="stripsig" id="stripsig"/>Display signatures<br />\n';
     	//settingsHTML += '<input type="checkbox" name="exbml" value="exbml" id="exbml"/>Enable exBML<br />\n';
     	//settingsHTML += '<input type="checkbox" name="degrade" value="degrade" id="degrade"/>Gracefully degrade exBML<br />\n';
     	settingsHTML += '<input type="checkbox" name="instaquote" value="instaquote" id="instaquote"/>Generate quotes locally<br />\n';
      settingsHTML += '<input type="checkbox" name="stripurltags" value="stripurltags" id="stripurltags"/>Strip [url] tags from generated quotes<br />\n';
     	settingsHTML += '</div>\n';
     	settingsHTML += '<div class="talkback-btm" style="padding-bottom: 20px;"/>\n';
     	settingsHTML += '<h1 style="font-size: 19px; font-weight: normal; padding: 0px; position:relative; right: 0px;">Signature:</h1>\n';
	$('div#post-edit').parent().prepend(settingsHTML);
	$('.post-subject').remove();
	$('.post-editor').attr("style","height: 112px; width: 562px;");
	
	var buttonHTML = '<button class="ui-button button1" type="submit" id="save"><span class="button-left"><span class="button-right">Save</span></span></button> <button class="ui-button button1" type="submit" id="reset"><span class="button-left"><span class="button-right">Reset</span></span></button>';
  
  submitBtnJQNode = $('table.submit-post tr td'); //new forum support
  if (submitBtnJQNode.length < 1)
  {
      submitBtnJQNode = $('div.submit-post'); //new forum countdown support 
  }
  if (submitBtnJQNode.length < 1)
  {
      submitBtnJQNode = $('#submitBtn'); //old forum support 
  }
  submitBtnJQNode.html(buttonHTML);
  
  //for old forum:
  //if you've posted in the last 60 seconds, this will unhide the save and reset buttons
  submitBtnJQNode.attr("style","display: block; "); 
  var countdownnode = $('#postCountdown');
  if (countdownnode.html() != null)
  {
    countdownnode.attr("style","display: none; ");
  }
  
	//load options
	loadOptions();
	
	//set change detection for sig checkbox
	var currentEnteredSig = GM_getValue("signature_text","");
	$('#signature').change(function() {
	  if (document.getElementById('signature').checked) 
    {
	    $('.post-editor').removeAttr("disabled");
	    document.getElementById('postCommand.detail').value = currentEnteredSig;
	  } else {
	    $('.post-editor').attr("disabled","disabled");
			currentEnteredSig = document.getElementById('postCommand.detail').value
		  document.getElementById('postCommand.detail').value = 'The Signature feature is currently disabled. To enable, check "Enable Signature" in the above General section of the Settings.';
	    }
    });
	$("#save").click(function () {
	    saveOptions();
		return false;
	});
	$("#reset").click(function () {
	    loadOptions();
		return false;
	});
}

function saveOptions() {
  //use setIfChanged so we know if the user changed from the default value at some point, in case we change the default settings in the future.
	setIfChanged("signature_toggle",false, document.getElementById('signature').checked);
	//setIfChanged("stripsig",true, document.getElementById('stripsig').checked);
	//setIfChanged("exbml_toggle",true, document.getElementById('exbml').checked);
	//setIfChanged("degradebml",true, document.getElementById('degrade').checked);
	setIfChanged("instaquote",true, document.getElementById('instaquote').checked);
  setIfChanged("stripurltags",true, document.getElementById('stripurltags').checked);
	if (document.getElementById('signature').checked) {
	    setIfChanged("signature_text","", document.getElementById('postCommand.detail').value);
	}
}
function setIfChanged(prefName,defaultValue,value) {
    if (GM_getValue(prefName,defaultValue) != value) {
	    //alert(prefName+": "+GM_getValue(prefName,defaultValue)+" -> "+value);
		  GM_setValue(prefName,value);
    }
}
function loadOptions() {
	document.getElementById('signature').checked = GM_getValue("signature_toggle",false);
	//document.getElementById('stripsig').checked = GM_getValue("stripsig",true);
	//document.getElementById('exbml').checked = GM_getValue("exbml_toggle",true);
	//document.getElementById('degrade').checked = GM_getValue("degradebml",true);
	document.getElementById('instaquote').checked = GM_getValue("instaquote",true);
  document.getElementById('stripurltags').checked = GM_getValue("stripurltags",true);
	if (GM_getValue("signature_toggle", false)) {
	  $('.post-editor').removeAttr("disabled");
	  document.getElementById('postCommand.detail').value = GM_getValue("signature_text","");
	}
	else {
	  $('.post-editor').attr("disabled","disabled");
		document.getElementById('postCommand.detail').value = 'The Signature feature is currently disabled. To enable, check "Enable Signature" in the above General section of the Settings.';
	}
}

function Post(baseNode) {
  this.baseNode = baseNode;
	this.postId = $(this.baseNode).attr('id').split("-")[1];
  this.relPostNum = parseInt($('span[id]',this.baseNode).attr('id'));
	if ($('.post-interior',this.baseNode).html().replace(/\n/g,"") != "")
	{
		this.contentNode = $('.post-detail',this.baseNode);
    if (this.contentNode.html() != null)
    {
      this.deleted = false;
	  	this.orginalContentHtml = this.contentNode.html().replace(/(^\s+|\s+$)/g, "");
	  	this.orginalContentBml = BML.toBml($('.post-detail',this.baseNode).html().replace(/(^\s+|\s+$)/g, ""));
      var sigJSON = getSig(this.orginalContentBml);
      this.orginalContentBmlBody = sigJSON.body;
      this.orginalContentBmlSeparator = sigJSON.separator;
      this.orginalContentBmlSig = sigJSON.sig;
      
	  	this.author = $('.context-link',this.baseNode).text().replace(/\n/g,"").replace(/(^\s+|\s+$)/g, "");
    } else {
	    this.deleted = true;
	  }
	} else {
	  this.deleted = true;
	}
  
  //alert("relPostNum: " + this.relPostNum + " deleted: " + this.deleted);
}

function addViewSourceBtns(postList) {
    var pLlen=postList.length;
    var index;
    for (index=0;index<pLlen;index++)
    {
      if (!postList[index].deleted)
      {
        btnhtml = '<div style="float: left;"><a class="ui-button button2 " id="srcbtn-' + index + '" href="#' + postList[index].relPostNum + '" style="float: left;"><span class="button-left"><span class="button-right">Source</span></span></a></div>';
        $('.post-options',postList[index].baseNode).prepend(btnhtml);
        $('a[id|="srcbtn"]',postList[index].baseNode).bind('click', {i: index}, function(event) {
          txtareaId = "bmlsrc-" + event.data.i;
          postList[event.data.i].contentNode.html('<textarea disabled="disabled" cols="65" id="'+txtareaId+'" style="height: '+(postList[event.data.i].contentNode.height() + 20) +'px;"></textarea>');
          document.getElementById(txtareaId).value = '[quote="'+postList[event.data.i].postId+'"]'+postList[event.data.i].orginalContentBmlBody+'[/quote]';
		      return false;
        });
      }
    }
}
function parseForumURL(inputURL) {
  var rawparseddata = /((^http(?:s)?:\/\/(\w+)\.battle\.net)\/(?:(\w+)\/)?(\w+)\/forum)(?:(?:\/([0-9]+))|(?:\/topic\/([0-9]+))){0,1}/.exec(inputURL);
  var returndata = {"forumbase":rawparseddata[1],"base":rawparseddata[2],"region":rawparseddata[3],"game":rawparseddata[4],"lang":rawparseddata[5]}
  var URLboard = rawparseddata[6];
  if (URLboard)
    returndata.board = URLboard;
  var URLtopic = rawparseddata[7];
  if (URLtopic)
    returndata.topic = URLtopic;
  return returndata;
}
function getNewTopicURL() {
  var URLdata = parseForumURL(document.location.href);
  var newTopicUrl = "";
  if (URLdata.board) {
    newTopicUrl = "" + URLdata.forumbase + "\/" + URLdata.board + "\/topic";
  } else {
    var currentBoardJQNode = $(".ui-breadcrumb a[href*=\"/forum/\"]");
    var testUrlData;
    currentBoardJQNode.each(function(index) {
      testUrlData = parseForumURL(this.href);
      if (testUrlData.board) {
        newTopicUrl = testUrlData.forumbase + "\/" + testUrlData.board + "\/topic";
      }
	  })
  } //else {
    //var firstBoardJQNode = $(".forum-link");
  //}
  return newTopicUrl;
}
Post.prototype.contentHtml = function() {
    return this.contentNode.html();
};
Post.prototype.contentBml = function() {
    return BML.toBml($('.post-detail',this.baseNode).html());
};

function verboseEscape(string) {
	string = string.replace(/\n/g, "\\n")
	.replace(/\r/g, "\\r")
	.replace(/\t/g, "\\t");
	return string;
}

function getSig(postBodyString)
{
  var postContent = "";
  var sig = null;
  var sigSeparator = "";
  if (/(\n)_{48}\n/.test(postBodyString))
  {
    postContent = "";
		var sigList = postBodyString.split("\n________________________________________________\n");
		for (i=0;i<sigList.length-1;i++)
		{
		  if (i == 0)
			{
			  postContent = postContent + sigList[i];
			} else {
			  postContent = postContent + "\n________________________________________________\n" + sigList[i];
			}
		}
    sig = sigList[sigList.length-1];
    sigSeparator = "\n________________________________________________\n";
	}
	else
	{
    postContent = postBodyString.replace(/(^|\n)(_{10,}|-{10,})(\n[^\n]*){1,5}$/, "");
    if (postContent != postBodyString)
    {
      sigregresult = (/(^|\n)(_{10,}|-{10,})(\n[^\n]*){1,5}$/).exec(postBodyString);
      sigSeparator = sigregresult[1] + sigregresult[2];
      sig = sigregresult[3];
    } else {
      sig = null;
    }
	}
  quoteOpenRegex = /\[quote(?:=(?:[^\]]+)?)?\]/gi;
  quoteCloseRegex = /\[\/quote\]/gi;
  if (sig != null)
  {
    var numOpenTags,numCloseTags;
    
    openTags = sig.match(quoteOpenRegex)
    if (openTags == null)
    {
      numOpenTags = 0;
    } else {
      numOpenTags = openTags.length;
    }
    
    closeTags = sig.match(quoteCloseRegex)
    if (closeTags == null)
    {
      numCloseTags = 0;
    } else {
      numCloseTags = closeTags.length;
    }
    
    if (numOpenTags == numCloseTags)
    {
      return {"body":postContent,"separator":sigSeparator,"sig":sig};
    } else { //if the quote tags don't match up within the prospective sig, the sig is probably within a quote of a post by someone else
      return {"body":(postContent + sigSeparator + sig),"separator":null,"sig":null};
    }
  } else {
    return {"body":postContent,"separator":null,"sig":null};
  }
}

function addSigCode(isReply)
{
  //new forum code
  submitbuttonjqnode = $(".ui-button.button1[type=submit]");
  if (submitbuttonjqnode.length == 1)
  {
    submitbuttonjqnode.click(function(event)
    {
        var txtBox = "detail";
        if(!isReply)
        {
	        //for new topics
	        txtBox = "postCommand.detail";
        }
        else
        {
        	//for replies
        	txtBox = "detail";
        }

        originalMessageNode = document.getElementById(txtBox);
        newMessageNode = originalMessageNode.cloneNode(true);
        originalMessageNode.removeAttribute("name");
        if (document.getElementById("newmessage") == null)
        {
            newMessageNode.id = "newmessage";
            hiddenDiv = document.createElement("div");
            hiddenDiv.style.display = "none";
            originalMessageNode.parentNode.appendChild(hiddenDiv);
            hiddenDiv.appendChild(newMessageNode);
        }
        else
        {
            newMessageNode.setAttribute("name", txtBox);
            oldHiddenMessage = document.getElementById("newmessage");
            parentDiv = oldHiddenMessage.parentNode;
            parentDiv.replaceChild(newMessageNode, oldHiddenMessage);
            newMessageNode.id = "newmessage";
        }
        messageNode = document.getElementById("newmessage");
        messageNode.value = originalMessageNode.value;
        messageNode.value = addSig(messageNode.value)
    });
  }
  //code migrated from BNSQ 2.1, hence the lack of jQuery...
  //old forum code
  else if (document.getElementById("submitBtn") != null) //check if the submit button is even on the page (the post could be locked)
  {
    var submit = document.getElementById("submitBtn").getElementsByTagName("button")[0];
    submit.addEventListener('click', function(event)
    {
        var txtBox = "detail";
        if(!isReply)
        {
	        //for new topics
	        txtBox = "postCommand.detail";
        }
        else
        {
        	//for replies
        	txtBox = "detail";
        }

        originalMessageNode = document.getElementById(txtBox);
        newMessageNode = originalMessageNode.cloneNode(true);
        originalMessageNode.removeAttribute("name");
        if (document.getElementById("newmessage") == null)
        {
            newMessageNode.id = "newmessage";
            hiddenDiv = document.createElement("div");
            hiddenDiv.style.display = "none";
            originalMessageNode.parentNode.appendChild(hiddenDiv);
            hiddenDiv.appendChild(newMessageNode);
        }
        else
        {
            newMessageNode.setAttribute("name", txtBox);
            oldHiddenMessage = document.getElementById("newmessage");
            parentDiv = oldHiddenMessage.parentNode;
            newMessageNode.id = "newmessage";
            parentDiv.replaceChild(newMessageNode, oldHiddenMessage);
        }
        messageNode = document.getElementById("newmessage");
        messageNode.value = originalMessageNode.value;
        messageNode.value = addSig(messageNode.value)
    }, false);
  }
}
function addSig(postBox)
{
	postBox += "\n"; //Separates post from Signature
	postBox += "________________________________________________\n"; //Separates post from Signature
	postBox += GM_getValue("signature_text","");

	return postBox; //Leave this here so we can return the sig
}

var BML = {
    /**
     * Transform the code loosely to HTML.
     *
     * @param string content
     * @return string
     */
    toHtml: function(content) {
        if (!content)
            content = BML.textarea.val();

        content = BML.encode(content);
        content = content.replace(/\[b\]/gi, '<strong>');
        content = content.replace(/\[\/b\]/gi, '</strong>');
        content = content.replace(/\[i\]/gi, '<em>');
        content = content.replace(/\[\/i\]/gi, '</em>');
        content = content.replace(/\[u\]/gi, '<span class="underline">');
        content = content.replace(/\[\/u\]/gi, '</span>');
        content = content.replace(/\[li\]/gi, '<li>');
        content = content.replace(/\[\/li\]/gi, '</li>');
        content = content.replace(/\[ul\]/gi, '<ul>');
        content = content.replace(/\[\/ul\]/gi, '</ul>');
        content = content.replace(/\[quote="(.*?)" id="(.*?)" page="(.*?)"\]/gi, '<blockquote><strong>'+ Msg.bml.quoteBy.replace('{0}', '$1') +'</strong><br />');
        content = content.replace(/\[quote="(.*?)"\]/gi, '<blockquote><strong>'+ Msg.bml.quoteBy.replace('{0}', '$1') +'</strong><br />');
        content = content.replace(/\[quote\]/gi, '<blockquote>');
        content = content.replace(/\[\/quote\]/gi, '</blockquote>');
        content = content.replace(/\n/gi, '<br />');
        content = content.replace(/\r/gi, '<br />');

        // Cleanup
        content = content.replace(/<ul><br(.*?)>/gim, '<ul>');
        content = content.replace(/<\/li><br(.*?)>/gim, '</li>');
        
        return content;
    },

    /**
     * Transform the HTML loosely to BML.
     *
     * @param string content
     * @return string
     */
    toBml: function(content) {
        content = content.replace(/ xmlns="(.*?)"/gi, ''); // Remove xhtml namespace
		content = content.replace(/<blockquote data-quote=\"([0-9]*)\"[^><]*><div>(?:<span class=\"bml-quote-date\">([^><]*)<\/span>)?Posted by (?:<a [^#]*#*([0-9]*)[^><]*>)?([^><]*)(?:<\/a>)?<\/div>/gim, '[quote="$1"]');
		content = content.replace(/<span class="truncated"><\/span>/gim, "");
    if (!GM_getValue("stripurltags", true))
      {content = content.replace(/<a href="([^"]*)" class="bml-link-url2">((?:(?:[^<>])*(?:<(?:\/)?[^a<>\/](?:[^<>])*>)*)*)?\<\/a>/gi, '[url="$1"]$2[/url]');}
		content = content.replace(/<\/?a[^><]*>/g,"");//filter out any links still present, since the only ones that are parsed with this are ones added by the forum
        content = content.replace(/<strong>/gi, '[b]');
        content = content.replace(/<\/strong>/gi, '[/b]');
        content = content.replace(/<em>/gi, '[i]');
        content = content.replace(/<\/em>/gi, '[/i]');
        content = content.replace(/<span class="?underline"?>/gi, '[u]');
        content = content.replace(/<\/span>/gi, '[/u]');
        content = content.replace(/<li>/gi, '[li]');
        content = content.replace(/<\/li>/gi, '[/li]');
        content = content.replace(/<ul>/gi, '[ul]');
        content = content.replace(/<\/ul>/gi, '[/ul]');
        //content = content.replace(/<blockquote[^><]*>(.*?)<div class="?quote-author"?>(.*?)<\/div>/gim, '[quote="$2"]');
        content = content.replace(/<blockquote[^><]*>/gi, '[quote]');
        content = content.replace(/<\/blockquote>/gi, '[/quote]');
		content = content.replace(/<code>/gi, '[code]');
        content = content.replace(/<\/code>/gi, '[/code]');
        content = content.replace(/(\n<br(.*?)>)|(<br(.*?)>\n)|(<br(.*?)>)/gi, "\n");
        content = BML.decode(content);

        return content;
    },

    /**
     * Encode HTML strings.
     *
     * @param string string
     */
    encode: function(string) {
        return string.replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/&/gi, '&amp;').replace(/"/gi, '&quot;');
    },
    decode: function(string) {
        return string.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"');
    }
};

//Finally, run the script.
BFXmain();