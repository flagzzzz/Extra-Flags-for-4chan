// ==UserScript==
// @name        Extra Flags for int Region and City Flags
// @namespace   com.whatisthisimnotgoodwithcomputers.extraflagsforint
// @description Extra Flags for int with flags for both cities and regions visible if the user has a city selected
// @include     http*://boards.4chan.org/int/*
// @include     http*://boards.4chan.org/sp/*
// @include     http*://boards.4chan.org/pol/*
// @exclude     http*://boards.4chan.org/int/catalog
// @exclude     http*://boards.4chan.org/sp/catalog
// @exclude     http*://boards.4chan.org/pol/catalog
// @version     0.09
// @grant       GM_xmlhttpRequest
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @run-at      document-end
// @updateURL	https://github.com/flagzzzz/Extra-Flags-for-4chan/raw/master/Extra_Flags_for_int_2_flag.user.js
// @downloadURL	https://github.com/flagzzzz/Extra-Flags-for-4chan/raw/master/Extra_Flags_for_int_2_flag.user.js
// ==/UserScript==

//updates at http://pastebin.com/PLtKPQc6

var region = "";
var allPostsOnPage = new Array();
var postNrs = new Array();
var postRemoveCounter = 60;
var requestRetryInterval = 5000;
var flegsBaseUrl = 'https://raw.githubusercontent.com/flaghunters/Extra-Flags-for-int-/master/flegs/';
var navigatorIsWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
var backendBaseUrl = 'https://whatisthisimnotgoodwithcomputers.com/';

/* region setup thing */
var setup = {
	namespace: 'com.whatisthisimnotgoodwithcomputers.extraflagsforint',
	id: "ExtraFlags-setup",
	html: function () {
		return '<div>Extra Flags for /int/</div><ul>Region: <li><input type="text" name="region" value="' + region + '"></li>Leave blank to use geolocation</ul><div><button name="save">Save settings</button></div></div>';
	},
	q: function(n) {
		return document.querySelector('#' + this.id + ' *[name="' + n + '"]');
	},
	show: function() {
		/* remove setup window if existing */
		var setup_el = document.getElementById(setup.id);
		if (setup_el) {
			setup_el.parentNode.removeChild(setup_el);
		}
		/* create new setup window */
		GM_addStyle('\
			#'+setup.id+' { position:fixed;z-index:10001;top:40px;right:40px;padding:20px 30px;background-color:white;width:auto;border:1px solid black }\
			#'+setup.id+' * { color:black;text-align:left;line-height:normal;font-size:12px }\
			#'+setup.id+' div { text-align:center;font-weight:bold;font-size:14px }\
			#'+setup.id+' ul { margin:15px 0 15px 0;padding:0;list-style:none }\
			#'+setup.id+' li { margin:0;padding:3px 0 3px 0;vertical-align:middle }'
		);
		setup_el = document.createElement('div');
		setup_el.id = setup.id;
		setup_el.innerHTML = setup.html();
		document.body.appendChild(setup_el);
		/* save listener */
		setup.q('save').addEventListener('click', function() {
			this.disabled = true;
			this.innerHTML = 'Saving...';
			region = setup.q('region').value.trim();
			if (!region) {
				getRegion();
			}
			setup.save('region', region);
			setup_el.parentNode.removeChild(setup_el);
		}, false);
	},
	save: function(k, v) {
		GM_setValue(setup.namespace + k, v);
	},
	load: function(k) {
		return GM_getValue(setup.namespace + k);
	},
	init: function() {
		GM_registerMenuCommand('Set up Extra Flags for /int/', setup.show);
	}
};

/* get geoip region if not set */
if (region == "") {
	region = setup.load('region');
	if (!region) {
		getRegion();
	}
}

function getRegion() {
	GM_xmlhttpRequest({
		method:     "GET",
		url:        "http://ipinfo.io/region",
		headers: {
			"User-Agent" : "curl/7.9.8", // If not specified, navigator.userAgent will be used.
		},
		onload: function (response) {
			if (response.status == 200) {
				region=response.responseText.trim();
				setup.save('region', region);
				setTimeout(function () {
					if (setup.load('firstrun') !== "true") {
						setup.save('firstrun', "true");
						if (window.confirm("Detected region: \"" + region + "\"\nDo you want to set it manually?\nIf you want to change it later you'll find the menu option by clicking on the Greasemonkey/Tampermonkey icon") === true) {
							setup.show();
						}
					}
				}, 3000);
			} else {
				//console.log("Location error: " + response.status);
				//console.log(response.statusText);
			}
		}
	});
}

function getRegionSuper(region, country) {
	var cities;
	if (country == "United States") {
		cities = [{name:"Albequerque", super:"New Mexico"},
							{name:"Anchorage", super:"Alaska"},
							{name:"Atlanta", super:"Georgia"},
							{name:"Augusta", super:"Maine"},
							{name:"Austin", super:"Texas"},
							{name:"Bakersfield", super:"California"},
							{name:"Baltimore", super:"Maryland"},
							{name:"Baton Rouge", super:"Louisiana"},
							{name:"Bellevue", super:"Washington"},
							{name:"Billings", super:"Montana"},
							{name:"Birmingham", super:"Alabama"},
							{name:"Bismarck", super:"North Dakota"},
							{name:"Boston", super:"Massachusetts"},
							{name:"Bronx", super:"New York"},
							{name:"Brooklyn", super:"New York"},
							{name:"Buffalo", super:"New York"},
							{name:"Charlotte", super:"North Carolina"},
							{name:"Chesapeake", super:"Virginia"},
							{name:"Chicago", super:"Illinois"},
							{name:"Cincinnati", super:"Ohio"},
							{name:"Cleveland", super:"Ohio"},
							{name:"Colorado Springs", super:"Colorado"},
							{name:"Columbia", super:"South Carolina"},
							{name:"Columbus", super:"Ohio"},
							{name:"Dallas", super:"Texas"},
							{name:"Des Moines", super:"Iowa"},
							{name:"Detroit", super:"Michigan"},
							{name:"Dover", super:"Delaware"},
							{name:"Durham", super:"North Carolina"},
							{name:"El Paso", super:"Texas"},
							{name:"Fargo", super:"North Dakota"},
							{name:"Fort Wayne", super:"Indiana"},
							{name:"Fort Worth", super:"Texas"},
							{name:"Frederick County", super:"Maryland"},
							{name:"Fresno", super:"California"},
							{name:"Grand Fork", super:"North Dakota"},
							{name:"Grand Rapids", super:"Michigan"},
							{name:"Greensboro", super:"North Carolina"},
							{name:"Helena", super:"Montana"},
							{name:"Hialeah", super:"Florida"},
							{name:"Honolulu", super:"Hawaii"},
							{name:"Houston", super:"Texas"},
							{name:"Indianapolis", super:"Indiana"},
							{name:"Iroquois", super:"New York"},
							{name:"Jackson", super:"Mississippi"},
							{name:"Jacksonville", super:"Florida"},
							{name:"Joliet", super:"Texas"},
							{name:"Kansas City", super:"Missouri"},
							{name:"Key West", super:"Florida"},
							{name:"Las Vegas", super:"Nevada"},
							{name:"Lincoln", super:"Nebraska"},
							{name:"Little Rock", super:"Arkansas"},
							{name:"Los Angeles", super:"California"},
							{name:"Louisville", super:"Kentucky"},
							{name:"Madison", super:"Wisconsin"},
							{name:"Memphis", super:"Tennessee"},
							{name:"Miami", super:"Florida"},
							{name:"Milwaukee", super:"Wisconsin"},
							{name:"Mobile", super:"Alabama"},
							{name:"Montgomery County", super:"Maryland"},
							{name:"Montgomery", super:"Alabama"},
							{name:"Napersville", super:"Illinois"},
							{name:"Nashville", super:"Tennessee"},
							{name:"New Orleans", super:"Louisiana"},
							{name:"New York City", super:"New York"},
							{name:"Newark", super:"New Jersey"},
							{name:"Oklahoma City", super:"Oklahoma"},
							{name:"Olathe", super:"Kansas"},
							{name:"Omaha", super:"Nebraska"},
							{name:"Orlando", super:"Florida"},
							{name:"Palm Beach", super:"Florida"},
							{name:"Peoria", super:"Illinois"},
							{name:"Philadelphia", super:"Pennsylvania"},
							{name:"Pheonix", super:"Arizona"},
							{name:"Pittsburgh", super:"Pennsylvania"},
							{name:"Portland", super:"Oregon"},
							{name:"Provo", super:"Utah"},
							{name:"Puyallup", super:"Washington"},
							{name:"Raleigh", super:"North Carolina"},
							{name:"Richmond", super:"Virginia"},
							{name:"Riverside", super:"California"},
							{name:"Rochester", super:"New York"},
							{name:"Sacramento", super:"California"},
							{name:"Salt Lake City", super:"Utah"},
							{name:"San Antonio", super:"Texas"},
							{name:"San Diego", super:"California"},
							{name:"San Francisco", super:"California"},
							{name:"Savannah", super:"Georgia"},
							{name:"Schaumburg", super:"Illinois"},
							{name:"Seattle", super:"Washington"},
							{name:"St. Louis", super:"Missouri"},
							{name:"St. Paul", super:"Minnesota"},
							{name:"St. Petersburg", super:"Florida"},
							{name:"Tacoma", super:"Washington"},
						  {name:"Tampa", super:"Florida"},
							{name:"Toledo", super:"Ohio"},
							{name:"Topeka", super:"Kansas"},
							{name:"Tulsa", super:"Oklahoma"},
							{name:"Tybee", super:"Georgia"},
							{name:"Vancouver", super:"Washington"},
						  {name:"Virginia Beach", super:"Virginia"},
							{name:"Wichita", super:"Kansas"},
							{name:"Wilmington", super:"Delaware"},
							{name:"Winston-Salem", super:"North Carolina"},
							{name:"Worcester", super:"Massachusetts"},
							{name:"Yakima", super:"Washington"},
						  {name:"Yonkers", super:"New York"},];
		
	} else if (country == "Australia") {
		cities = [{name:"Adelaide", super:"South Australia"},
						 {name:"Alice Springs", super:"Northern Territory"},
						 {name:"Brisbane", super:"Queensland"},
						 {name:"Greater Melbourne", super:"Victoria"},
						 {name:"Greater Sydney", super:"New South Wales"},
						 {name:"Hobart", super:"Tasmania"},
						 {name:"Lord Howe Island", super:"New South Wales"},
						 {name:"Mackay", super:"Victoria"},
						 {name:"Melbourne", super:"Victoria"},
						 {name:"Sydney", super:"New South Wales"},];
		
	} else if (country == "Brazil") {
		cities = [{name:"Abreu e Lima", super:"Pernambuco"},
						 {name:"Ananindeua", super:"Para"},
						 {name:"Americana", super:"Sao Paulo"},
						 {name:"Anapolis", super:"Goias"},
						 {name:"Cidade de Sao Paulo", super:"Sao Paulo"},
			       			 {name:"Cidade do Rio de Janeiro", super:"Rio de Janeiro"},
						 {name:"Florianopolis", super:"Santa Catarina"},
						 {name:"Jacarezinho", super:"Parana"},
						 {name:"Niteroi", super:"Rio de Janeiro"},
						 {name:"Porto Alegre", super:"Rio Grande do Sul"},
						 {name:"Votorantim", super:"Sao Paulo"}];
		
		
	} else if (country == "Canada") {
		cities = [{name:"Brampton", super:"Ontario"},
						 {name:"Burnaby", super:"British Columbia"},
						 {name:"Calgary", super:"Alberta"},
						 {name:"Cornwall", super:"Ontario"},
						 {name:"Edmonton", super:"Alberta"},
						 {name:"Gatineau", super:"Quebec"},
						 {name:"Halifax", super:"Nova Scotia"},
						 {name:"Hamilton", super:"Ontario"},
						 {name:"Iqaluit", super:"Nunavut"},
						 {name:"Iroquois", super:"Ontario"},
						 {name:"Kitchener", super:"Ontario"},
						 {name:"Laval", super:"Quebec"},
						 {name:"London", super:"Ontario"},
						 {name:"Longueuil", super:"Quebec"},
						 {name:"Markham", super:"Ontario"},
						 {name:"Mississauga", super:"Ontario"},
						 {name:"Montreal", super:"Quebec"},
						 {name:"North Vancouver", super:"British Columbia"},
						 {name:"Ottawa", super:"Ontario"},
			       			 {name:"Petersborough", super:"Ontario"},
						 {name:"Quebec City", super:"Quebec"},
						 {name:"Regina", super:"Saskatchewan"},
						 {name:"Richmond", super:"British Columbia"},
						 {name:"Saskatoon", super:"Saskatchewan"},
						 {name:"Sudbury", super:"Ontario"},
						 {name:"Surrey", super:"British Columbia"},
			       			 {name:"Toronto", super:"Ontario"},
						 {name:"Vancouver", super:"British Columbia"},
						 {name:"Vaughan", super:"Ontario"},
						 {name:"Victoria", super:"British Columbia"},
						 {name:"Whitehorse", super:"Yukon"},
						 {name:"Windsor", super:"Ontario"},
						 {name:"Winnipeg", super:"Manitoba"},
						 {name:"Yellowknife", super:"Northwest Territories"}];
		
	} else if (country == "Germany") {
		cities = [{name:"Aachen", super:"Nordrhein-Westfalen"},
						 {name:"Braunscheig", super:"Niedersaschen"},
			       			 {name:"Dortmund", super:"Nordrhein-Westfalen"},
						 {name:"Kiel", super:"Schleswig-Holstein"},
						 {name:"Kreis Minden-Lubbecke", super:"Nordrhein-Westfalen"},
						 {name:"Kreis Unna", super:"Nordrhein-Westfalen"},
						 {name:"Lunen", super:"Nordrhein-Westfalen"},
						 {name:"Schwalm-Eder-Kreis", super:"Hessen"}];
		
	} else if (country == "Italy") {
	  cities = [{name:"Rome", super:"Lazio"}];
		
  }	else if (country == "Netherlands") {
		cities = [{name:"Alkmaar", super:"Noord-Holland"},
			       {name:"Almere", super:"Flevoland"},
						 {name:"Alphen aan de Rijn", super:"Zuid-Holland"},
						 {name:"Ameland", super:"Friesland"},
						 {name:"Amersfoort", super:"Utrecht"},
						 {name:"Apeldoorn", super:"Gelderland"},
						 {name:"Amsterdam", super:"Noord-Holland"},
						 {name:"Arnhem", super:"Gelderland"},
			       {name:"Baarn", super:"Utrecht"},
						 {name:"Breda", super:"Noord-Brabant"},
						 {name:"Delft", super:"Zuid-Holland"},
						 {name:"Den Bosch", super:"Noord-Brabant"},
						 {name:"Den Haag", super:"Zuid-Holland"},
						 {name:"Dordrecht",super:"Zuid-Holland"},
						 {name:"Ede",super:"Gelderland"},
						 {name:"Enschede",super:"Overijssel"},
						 {name:"Emmen",super:"Drenthe"},
						 {name:"Eindhoven", super:"Noord-Brabant"},
						 {name:"Gorredijk", super:"Friesland"},
						 {name:"Haarlemmermeer",super:"Noord-Holland"},
						 {name:"Haarlem", super:"Noord-Holland"},
						 {name:"Harderwijk", super:"Gelderland"},
						 {name:"Heerenveen", super:"Friesland"},
						 {name:"Heerlen", super:"Limburg"},
						 {name:"Kampen", super:"Overijssel"},
						 {name:"Katwijk", super:"Zuid-Holland"},
						 {name:"Leeuwarden", super:"Friesland"},
						 {name:"Leiden", super:"Zuid-Holland"},
						 {name:"Maastricht", super:"Limburg"},
						 {name:"Meppel", super:"Drenthe"},
						 {name:"Middelburg", super:"Zeeland"},
						 {name:"Nijmegen",super:"Gelderland"},
						 {name:"Oegstgeest", super:"Zuid-Holland"},
						 {name:"Oldeberkoop", super:"Friesland"},
						 {name:"Ooststellingwerf", super:"Friesland"},
						 {name:"Opsterland", super:"Friesland"},
						 {name:"Rijswijk", super:"Gelderland"},
						 {name:"Rotterdam", super:"Zuid-Holland"},
						 {name:"Schiermonnikoog", super:"Friesland"},
						 {name:"Stad Groningen",super:"Groningen"},
						 {name:"Stavoren", super:"Friesland"},
						 {name:"Terneuzen", super:"Zeeland"},
						 {name:"Terschelling", super:"Friesland"},
						 {name:"Texel", super:"Noord-Holland"},
						 {name:"Tilburg", super:"Noord-Brabant"},
						 {name:"Velsen", super:"Noord-Holland"},
						 {name:"Venlo",super:"Limburg"},
						 {name:"Vlieland", super:"Friesland"},
						 {name:"Volendam", super:"Noord-Brabant"},
						 {name:"Westland",super:"Zuid-Holland"},
						 {name:"Weststellingwerf", super:"Friesland"},
						 {name:"Zaandam",super:"Noord-Holland"},
						 {name:"Zoetermeer", super:"Zuid-Holland"},
						 {name:"Zutphen", super:"Gelderland"},
						 {name:"Zwolle", super:"Overijssel"},];
		
	} else if (country == "Poland") {
		cities = [{name:"Bialystok", super:"Podlaskie"},
			 {name:"Bydgoszcz", super:"Kujawsko-pomorskie"},
			 {name:"Gdansk", super:"Pomorskie"},
			 {name:"Gniezno", super:"Wielkopolskie"},
			 {name:"Gorzow Wielkopolski", super:"Lubuskie"},
			 {name:"Katowice", super:"Slaskie"},
			 {name:"Krakow", super:"Malopolskie"},
			 {name:"Lodz", super:"Lodzkie"},
			 {name:"Lublin", super:"Lubelskie"},
			 {name:"Olsztyn", super:"Warminsko-mazurskie"},
			 {name:"Opole", super:"Opolskie"},
			 {name:"Rzeszow", super:"Podkarpackie"},
			 {name:"Szczecin", super:"Zachodniopomorskie"},
			 {name:"Torun", super:"Kujawsko-pomorskie"},
			 {name:"Warsaw", super:"Mazowieckie"},
			 {name:"Wroclaw", super:"Dolnoslaskie"},
			 {name:"Zielona Gora", super:"Lubuskie"}];
		
	} else if (country == "United Kingdom") {
		cities = [{name:"Birmingham", super:"West Midlands", super2:"England"},
						 {name:"Black Country", super:"West Midlands", super2:"England"},
						 {name:"Bridgend", super:"Glamorgen", super2:"Wales"},
						 {name:"Cambridgeshire", super2:"England"},
						 {name:"Ceredigion", super2:"Wales"},
						 {name:"Chester", super:"Cheshire", super2:"England"},
			       			 {name:"City of London", super:"Greater London", super2:"England"},
			       			 {name:"Cornwall", super2:"England"},
			       		 	 {name:"Isle of Portland", super:"Dorset", super2:"England"},
			       		 	 {name:"Devon", super2:"England"},
	           				 {name:"Durham City", super:"Durham", super2:"England"},
						 {name:"East Riding of Yorkshire", super:"Yorkshire", super2:"England"},
						 {name:"Greater Manchester", super2:"England"},
						 {name:"Hertfordshire", super2:"England"},
						 {name:"Horningsea", super:"Cambridgeshire", super2:"England"},
						 {name:"Huntingdonshire", super:"Cambridgeshire", super2:"England"},
			       			 {name:"Isle of Scilly", super:"Cornwall", super2:"England"},
			       			 {name:"Lancashire", super2:"England"},
			       			 {name:"Leicestershire", super2:"England"},
			       			 {name:"Merseyside", super2:"England"},
			       			 {name:"Newport", super:"Monmouthshire", super2:"Wales"},
			       			 {name:"Norfolk", super2:"England"},
			       			 {name:"North Riding of Yorkshire", super:"Yorkshire", super2:"England"},
						 {name:"Norwich", super:"Norfolk", super2:"England"},
						 {name:"Orkney", super2:"Scotland"},
						 {name:"Oxfordshire", super2:"England"},
						 {name:"South Yorkshire", super2:"England"},
						 {name:"St Annes on the Sea", super:"Lancashire", super2:"England"},
						 {name:"West Midlands", super2:"England"},
						 {name:"West Riding of Yorkshire", super:"Yorkshire", super2:"England"},
						 {name:"Wing", super:"Rutland", super2:"England"},
						 {name:"Worcestershire", super2:"England"},
						 {name:"Wroxton", super:"Oxfordshire", super2:"England"}];
		
	} else { //no cities/super pairing
		return " ";
	}
	
	if (cities.length == 0){
		return " ";
	}	else {
		for (var i = 0; i < cities.length; i++) {
			if (cities[i].name === region) {
				return cities[i];
				break;
			}
	  }
		return " "; //did not find
	}
}

/* fix flag alignment on chrome */
if (navigatorIsWebkit) {
   addGlobalStyle('.flag{top: 0px !important;left: -1px !important}');
}

function addGlobalStyle(css) {
	var head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

/* parse the posts already on the page before thread updater kicks in */
function parseOriginalPosts() {
	var tempAllPostsOnPage = document.getElementsByClassName('postContainer');
	allPostsOnPage = Array.prototype.slice.call(tempAllPostsOnPage); //convert from element list to javascript array
	postNrs = allPostsOnPage.map(function (p) {
		return p.id.replace("pc", "");
	});                                         //extract post numbers
}

parseOriginalPosts();
resolveRefFlags();

/* the function to get the flags from the db
 * uses postNrs
 * member variable might not be very nice but I'm gonna do it anyways! */
function onFlagsLoad(response) {
	//exit on error
	if(response.status !== 200) {
		console.log("Could not fetch flags, status: " + response.status);
		console.log(response.statusText);
		setTimeout(resolveRefFlags, requestRetryInterval);
		return;
	}
	
	//parse returned data
	//host22 sends crap about analytics which needs to be cut off
	var removeNonJsonSlug = response.responseText.split(']');
	var jsonData = JSON.parse(removeNonJsonSlug[0] + ']');
	
	jsonData.forEach(function (post) {
		var postToAddFlagTo = document.getElementById("pc" + post.post_nr);
		var postInfo = postToAddFlagTo.getElementsByClassName('postInfo')[0];
		var nameBlock = postInfo.getElementsByClassName('nameBlock')[0];
		var currentFlag = nameBlock.getElementsByClassName('flag')[0];
		
		//var regionSuper = getRegionSuper(post.region, currentFlag.title);
		var city = getRegionSuper(post.region, currentFlag.title);
		if (city === " ") {
			var regionSuper = " ";
		} else if (typeof city.super !== 'undefined' && city.super !== null) {
			var regionSuper = city.super;
		} else {
			regionSuper = " ";
		}
		
		if (typeof city.super2 !== 'undefined' && city.super2 !== null) {
			 var regionSuper2 = city.super2;
		} else {
			 var regionSuper2 = " ";
		}
		
		if (regionSuper2 !== " ") {
			var newRegionFlag2 = document.createElement('c');
			nameBlock.appendChild(newRegionFlag2);
			newRegionFlag2.title = regionSuper2;
			var newRegionFlagImgOpts2 = 'onerror="(function () {var extraFlagsImgEl = document.getElementById(\'pc' + post.post_nr + '\').getElementsByClassName(\'extraRegionFlag2\')[0].firstElementChild; if (!/\\/empty\\.png$/.test(extraFlagsImgEl.src)) {extraFlagsImgEl.src = \'' + flegsBaseUrl + 'empty.png\';}})();"';
			newRegionFlag2.innerHTML = "<img src='" + flegsBaseUrl + currentFlag.title + "/" + regionSuper2 + ".png'" + newRegionFlagImgOpts2 + ">";
			newRegionFlag2.className = "extraRegionFlag2";
			newRegionFlag2.href = "https://www.google.com/search?q=" + regionSuper2 + ", " + currentFlag.title;
			newRegionFlag2.target = '_blank';
			newRegionFlag2.style = "padding: 0px 0px 0px 5px; vertical-align:;display: inline-block; width: 16px; height: 11px; position: relative; top: 1px;";
		}
		
		if (regionSuper !== " ") {
		  var newRegionFlag = document.createElement('b');
		  nameBlock.appendChild(newRegionFlag);
		  newRegionFlag.title = regionSuper;
		  var newRegionFlagImgOpts = 'onerror="(function () {var extraFlagsImgEl = document.getElementById(\'pc' + post.post_nr + '\').getElementsByClassName(\'extraRegionFlag\')[0].firstElementChild; if (!/\\/empty\\.png$/.test(extraFlagsImgEl.src)) {extraFlagsImgEl.src = \'' + flegsBaseUrl + 'empty.png\';}})();"';
		  newRegionFlag.innerHTML = "<img src='" + flegsBaseUrl + currentFlag.title + "/" + regionSuper + ".png'" + newRegionFlagImgOpts + ">";
		  newRegionFlag.className = "extraRegionFlag";
		  newRegionFlag.href = "https://www.google.com/search?q=" + regionSuper + ", " + currentFlag.title;
		  newRegionFlag.target = '_blank';
		  newRegionFlag.style = "padding: 0px 0px 0px 5px; vertical-align:;display: inline-block; width: 16px; height: 11px; position: relative; top: 1px;";
		}
		
		var newFlag = document.createElement('a');
		nameBlock.appendChild(newFlag);
		newFlag.title = post.region;
		var newFlagImgOpts = 'onerror="(function () {var extraFlagsImgEl = document.getElementById(\'pc' + post.post_nr + '\').getElementsByClassName(\'extraFlag\')[0].firstElementChild; if (!/\\/empty\\.png$/.test(extraFlagsImgEl.src)) {extraFlagsImgEl.src = \'' + flegsBaseUrl + 'empty.png\';}})();"';
		newFlag.innerHTML = "<img src='" + flegsBaseUrl + currentFlag.title + "/" + post.region + ".png'" + newFlagImgOpts + ">";
		newFlag.className = "extraFlag";
		newFlag.href = "https://www.google.com/search?q=" + post.region + ", " + currentFlag.title;
		newFlag.target = '_blank';
		//padding format: TOP x RIGHT_OF x BOTTOM x LEFT_OF
		newFlag.style = "padding: 0px 0px 0px 5px; vertical-align:;display: inline-block; width: 16px; height: 11px; position: relative; top: 1px;";

		console.log("resolved " + post.region);
    
		//remove flag from postNrs
		var index = postNrs.indexOf(post.post_nr);
		if (index > -1) {
			postNrs.splice(index, 1);
		}
	});
	
	//cleaning up the postNrs variable here
	//conditions are checked one plus resolved (removed above, return handler) or older than 60s (removed here), keeping it simple

	var timestampMinusFortyFive = Math.round(+new Date()/1000) - postRemoveCounter;

	postNrs.forEach(function (post_nr) {
		var postToAddFlagTo = document.getElementById("pc" + post_nr);
		var postInfo = postToAddFlagTo.getElementsByClassName('postInfo')[0];
		var dateTime = postInfo.getElementsByClassName('dateTime')[0];
		
		if (dateTime.getAttribute("data-utc") < timestampMinusFortyFive) {
			var index = postNrs.indexOf(post_nr);
			if (index > -1) {
				postNrs.splice(index, 1);
			}
		}
	});
}

/* fetch flags from db */
function resolveRefFlags() {
	
	var boardID = window.location.pathname.split('/')[1];
	if (boardID === "int" || boardID === "sp" || boardID === "pol") {
	
		GM_xmlhttpRequest({
			method:     "POST",
			url:        backendBaseUrl + "get_flags.php",
			data:       "post_nrs=" + encodeURIComponent (postNrs)
						+ "&" + "board=" + encodeURIComponent (boardID)
			,
			headers:    {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload: onFlagsLoad
		});
	}
}

/* send flag to system on 4chan x (v2, loadletter, v3 untested) post
 * handy comment to save by ccd0
 * console.log(e.detail.boardID);  // board name    (string)
 * console.log(e.detail.threadID); // thread number (integer in ccd0, string in loadletter)
 * console.log(e.detail.postID);   // post number   (integer in ccd0, string in loadletter) */
document.addEventListener('QRPostSuccessful', function(e) {
	//setTimeout to support greasemonkey 1.x
	setTimeout(function () {
		GM_xmlhttpRequest({
			method:     "POST",
			url:        backendBaseUrl + "post_flag.php",
			data:       "post_nr=" + encodeURIComponent (e.detail.postID)
						+ "&" + "board=" + encodeURIComponent (e.detail.boardID)
						+ "&" + "region=" + encodeURIComponent (region)
						,
			headers:    {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:     function (response) {
				//hide spam, debug purposes only
				//console.log(response.responseText);
			}
		});
	}, 0);
}, false);

/* send flag to system on 4chan inline post */
document.addEventListener('4chanQRPostSuccess', function(e) {
	
	var boardID = window.location.pathname.split('/')[1];
	var evDetail = e.detail || e.wrappedJSObject.detail;
	//setTimeout to support greasemonkey 1.x
	setTimeout(function () {
		GM_xmlhttpRequest({
			method:     "POST",
			url:        backendBaseUrl + "post_flag.php",
			data:       "post_nr=" + encodeURIComponent (evDetail.postId)
						+ "&" + "board=" + encodeURIComponent (boardID)
						+ "&" + "region=" + encodeURIComponent (region)
						,
			headers:    {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:     function (response) {
				//hide spam, debug only
				//console.log(response.responseText);
			}
		});
	}, 0);
}, false);

/* Listen to post updates from the thread updater for 4chan x v2 (loadletter) and v3 (ccd0 + ?) */
document.addEventListener('ThreadUpdate', function(e) {
	
	//console.log("ThreadUpdate");
	
	var evDetail = e.detail || e.wrappedJSObject.detail;
	
	var evDetailClone = typeof cloneInto === 'function' ? cloneInto(evDetail, unsafeWindow) : evDetail;
	//console.log(evDetailClone);
	
	//ignore if 404 event
	if (evDetail[404] === true) {
		return;
	}
	
	setTimeout(function() {
	
		//add to temp posts and the DOM element to allPostsOnPage
		evDetailClone.newPosts.forEach(function (post_board_nr) {
			var post_nr = post_board_nr.split('.')[1];
			postNrs.push(post_nr);
			var newPostDomElement = document.getElementById("pc" + post_nr);
			allPostsOnPage.push(newPostDomElement);
		});
	
	}, 0);
	//setTimeout to support greasemonkey 1.x
	setTimeout(resolveRefFlags, 0);
	
}, false);

//Listen to post updates from the thread updater for inline extension
document.addEventListener('4chanThreadUpdated', function(e) {
	var evDetail = e.detail || e.wrappedJSObject.detail;
	
	var threadID = window.location.pathname.split('/')[3]; //get thread ID
	var postsContainer = Array.prototype.slice.call(document.getElementById('t'  + threadID).childNodes); //get an array of postcontainers
	var lastPosts = postsContainer.slice(Math.max(postsContainer.length - evDetail.count, 1)); //get the last n elements (where n is evDetail.count)

	//add to temp posts and the DOM element to allPostsOnPage
	lastPosts.forEach(function (post_container) {
		var post_nr = post_container.id.replace("pc", "");
		postNrs.push(post_nr);
		allPostsOnPage.push(post_container);
	});
	//setTimeout to support greasemonkey 1.x
	setTimeout(resolveRefFlags, 0);
	
}, false);

setup.init();
