//To-do: Make Submit/Reset buttons function, check if Signature is enabled before adding it to a post
//	fix checkboxes (always stuck to true?), and make Signature function an array?

//alert($); // check if the dollar (jquery) function works
//alert($().jquery); // check jQuery version
function BFXmain() {
    if (/^http(s)?:\/\/(\w)+\.battle\.net\/(\w)+\/(\w)+\/forum\/topic/.test(document.location.href))
	{
	    BFXthread();
	}
	if (/^http(s)?:\/\/(\w)+\.battle\.net\/(\w)+\/(\w)+\/forum\/[0-9]+\/topic$/.test(document.location.href))
	{
	    BFXnewtopic();
	}
	if (/^http(s)?:\/\/(\w)+\.battle\.net\/(\w)+\/(\w)+\/forum\/[0-9]+\/topic\?bfx-options$/.test(document.location.href))
	{
	    BFXoptions();
	}
}

function BFXthread() {
	cachedQuotes = {}; //instant quote cache
	postList = [];
	$('#thread div[id|="post"]').each(function(index) {
		postList[index] = new Post(this);
	})
  locked = ((!($('.ui-button.disabled[href="javascript:;"]')[0] == null)) && ($('.ui-button[href="#new-post"]')[0] == null))
	if (GM_getValue("instaquote", true))
	{
	    //Inject the cached quotes we made locally
	    document.body.appendChild(document.createElement("script")).innerHTML="Cms.Topic.cachedQuotes = " + JSON.stringify(cachedQuotes) + ";";
	}
  
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
	$("div.post-user-details h4").html("BFX Forum Options");
	//draw main UI
	var settingsHTML = '<div align="center">Need help? Check out the Blizzard Forum eXtender <a href="http://code.google.com/p/bfx/">homepage</a>!<br />\nBlizzard Forum eXtender created by <a href="http://maged.lordaeron.org/">Maged</a> and <a href="http://www.sixen.org/">Sixen</a>.</div>\n';
	settingsHTML += '<h1 style="font-size: 19px; font-weight: normal; padding: 6px; position: relative; right: 6px;">General:</h1>\n';
     	settingsHTML += '<div style="position:relative; left: 12px;">\n';
     	settingsHTML += '<input type="checkbox" name="signature" value="signature" id="signature" />Enable signature<br />\n';
     	settingsHTML += '<input type="checkbox" name="stripsig" value="stripsig" id="stripsig"/>Display signatures<br />\n';
     	settingsHTML += '<input type="checkbox" name="exbml" value="exbml" id="exbml"/>Enable exBML<br />\n';
     	settingsHTML += '<input type="checkbox" name="degrade" value="degrade" id="degrade"/>Gracefully degrade exBML<br />\n';
     	settingsHTML += '<input type="checkbox" name="instaquote" value="instaquote" id="instaquote"/>Generate quotes locally<br />\n';
     	settingsHTML += '</div>\n';
     	settingsHTML += '<div class="talkback-btm" style="padding-bottom: 20px;"/>\n';
     	settingsHTML += '<h1 style="font-size: 19px; font-weight: normal; padding: 0px; position:relative; right: 0px;">Signature:</h1>\n';
	$('.post-edit').prepend(settingsHTML);
	$('.post-subject').remove();
	$('.post-editor').attr("style","height: 112px; width: 562px;");
	
	var buttonHTML = '<button class="ui-button button1" type="submit" id="save"><span><span>Save</span></span></button><button class="ui-button button1" type="submit" id="reset"><span><span>Reset</span></span></button>';
	$('#submitBtn').html(buttonHTML);

	//add BFX options link. Note: I cheated here. Will change once I standardize this for every page.
	$('.service-welcome').append('\n|  <a href="?bfx-options" tabindex="50" accesskey="3">BFX Options</a>');
	
	//same here
	$('.support-nav').append('<li><a href="http://code.google.com/p/bfx/issues/list" tabindex="55" class="support-category"><strong class="support-caption">BFX Issues</strong>Report issues within the BFX here.</a></li>');

	//load options
	loadOptions();
	
	//set change detection for sig checkbox
	var currentEnteredSig = GM_getValue("signature_text","");
	$('#signature').change(function() {
	    if (document.getElementById('signature').checked) {
	        $('.post-editor').removeAttr("disabled");
	        document.getElementById('postCommand.detail').value = currentEnteredSig;
	    }
	    else {
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
	setIfChanged("stripsig",true, document.getElementById('stripsig').checked);
	setIfChanged("exbml_toggle",true, document.getElementById('exbml').checked);
	setIfChanged("degradebml",true, document.getElementById('degrade').checked);
	setIfChanged("instaquote",true, document.getElementById('instaquote').checked);
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
	document.getElementById('stripsig').checked = GM_getValue("stripsig",true);
	document.getElementById('exbml').checked = GM_getValue("exbml_toggle",true);
	document.getElementById('degrade').checked = GM_getValue("degradebml",true);
	document.getElementById('instaquote').checked = GM_getValue("instaquote",true);
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
      sigJSON = getSig(this.orginalContentBml);
      this.orginalContentBmlBody = sigJSON.body;
      this.orginalContentBmlSeparator = sigJSON.separator;
      this.orginalContentBmlSig = sigJSON.sig;
      
	  	this.author = $('.context-link',this.baseNode).text().replace(/\n/g,"").replace(/(^\s+|\s+$)/g, "");
		
	  	if (GM_getValue("instaquote", true))
	  	{
	  	  cachedQuotes[this.postId] = {"name":this.author,"detail":this.orginalContentBmlBody};
	  	}
    } else {
	    this.deleted = true;
	  }
	} else {
	  this.deleted = true;
	}
}

function addViewSourceBtns(postList) {
    pLlen=postList.length;
    for (index=0;index<pLlen;index++)
    {
      if (!postList[index].deleted)
      {
        btnhtml = '<div style="float: left;"><a class="ui-button button2 " id="srcbtn-' + index + '" href="#' + postList[index].relPostNum + '" style="float: left;"><span><span>Source</span></span></a></div>';
        $('.post-options',postList[index].baseNode).prepend(btnhtml);
        $('a[id|="srcbtn"]',postList[index].baseNode).bind('click', {i: index}, function(event) {
          txtareaId = "bmlsrc-" + event.data.i;
          postList[event.data.i].contentNode.html('<textarea disabled="disabled" cols="68" id="'+txtareaId+'" style="height: '+(postList[event.data.i].contentNode.height() + 20) +'px;"></textarea>');
          document.getElementById(txtareaId).value = '[quote="'+postList[event.data.i].postId+'"]'+postList[event.data.i].orginalContentBmlBody+'[/quote]';
		      return false;
        });
      }
    }
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
  if (/(^|\n)_{48}\n/.test(postBodyString))
  {
    postContent = "";
		var sigList = postBodyString.split("________________________________________________");
		for (i=0;i<sigList.length-1;i++)
		{
		  if (i == 0)
			{
			  postContent = postContent + sigList[i];
			} else {
			  postContent = postContent + "________________________________________________" + sigList[i];
			}
		}
    sig = sigList[sigList.length-1];
    sigSeparator = "________________________________________________";
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
  //code migrated from BNSQ 2.1, hence the lack of jQuery...
  if (document.getElementById("submitBtn") != null) //check if the submit button is even on the page (the post could be locked)
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
		content = content.replace(/<\/?a[^><]*>/g,"");//filter out any links already present, since the only ones that are parsed with this are ones added by the forum
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