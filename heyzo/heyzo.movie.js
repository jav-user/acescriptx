// ==UserScript==
// @name HeyzoMovie
// @namespace HeyzoMovie Scripts
// @match https://en.heyzo.com/moviepages/*/index.html
// @require https://jav-user.github.io/scripts/nes/nes_functions.js
// @require https://www.gstatic.com/firebasejs/7.14.4/firebase-app.js
// @require https://www.gstatic.com/firebasejs/7.14.4/firebase-database.js
// @require https://www.gstatic.com/firebasejs/7.14.4/firebase-firestore.js
// @require https://jav-user.github.io/scripts/fire/config.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @grant none
// ==/UserScript==
//

nes.addStyle(
	"https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css",
	"jq-ui-base"
);

$("body").prepend(
	$(`
  <style>
    #feedback { font-size: 1.4em; }
    [name=selectable-save] .ui-selecting { background: #FECA40; }
    [name=selectable-save] .ui-selected { background: #F39814; color: white; }
    [name=selectable-save] { list-style-type: none; margin: 0; padding: 0; width: 60%; }
    [name=selectable-save] li { margin: 3px; padding: 0.4em; font-size: 1.4em; height: 18px; }
  </style>
`)
);

const JavRef = db.collection("javhd");
const JavStarsRef = db.collection("jav_stars");
const JavCatsRef = db.collection("javhd_categories");
const JavMyCatsRef = db.collection("javhd_mycategories");
const JavSeriesRef = db.collection("javhd_series");

function customHtml() {
	$(".capture img").attr(
		"style",
		"opacity: 1 !important; filter: blur(0) !important"
	);

	var $gallery = $("img.onGallery");
	var $nonmember = $("img.nonmember");

	var imgfull = $gallery.parent().attr("href");
	var _num = imgfull.match("[0-9]{1,}.jpg$")[0].replace(".jpg", "");
	var zero = "0000000000000000";
	var size = _num.length;
	var width = 250;

	$gallery.each((i, img) => {
		var current = i + 1;
		var num = (zero + current).substr(-1 * size);
		var newimg = imgfull.replace(/[0-9]{1,}.jpg$/, num + ".jpg");

		$(img).attr("src", newimg).attr("width", width);
	});

	var init = $gallery.size();
	$nonmember.each((i, img) => {
		var current = init + i + 1;

		var num = (zero + current).substr(-1 * size);
		//     console.log(num)
		var newimg = imgfull.replace(/[0-9]{1,}.jpg$/, num + ".jpg");
		//     console.log(newimg)
		$(img)
			.wrap(`<a target="_blank" href="${newimg}"></a>`)
			.removeClass("nonmember")
			.attr("src", newimg)
			.attr("width", width);
	});

	var code = window.location.pathname.match("[0-9]{4}")[0];
	var q = "torrent heyzo " + code;
	var search = "https://www.google.com/search?q=" + q;
	var $el = $(`
        <div>
        <a
         title="search ${q}"
         target="_blank" 
         href="${search}">
            <button style="background-color:green;color:white;padding:5px;font-weight:bold">Search torrent</button>
        </a>
          <ol name="selectable-save">
            <li class="ui-widget-content">Save</li>
            <li class="ui-widget-content">Downloading Torrent</li>
            <li class="ui-widget-content">Downloading (Other)</li>
            <li class="ui-widget-content">Favorite</li>
            <li class="ui-widget-content">Remove</li>
          </ol>
        <hr/>
        </div>
    `);
	const $selectable = $el.find("[name=selectable-save]");
	$selectable.selectable({
		stop: function () {
			var result = [];
			$(".ui-selected", this).each(function () {
				result.push($(this).text());
			});
			console.log(result);
		},
	});
	//console.log("$btn",$btn[0])
	//$btn.on("click",saveJav)
	//console.log(search);

	$("#section_gallery").before($el);
	//.before($el.clone(true, true));
}

function getInfo() {
	const Movie = {};
	const movieInfo = {};
	const movieInfoHtml = {};

	var categories_fav = {
		affair: ["affair"],
		bath: ["bath"],
		bikini: ["swimming wear"],
		busty: ["big tits", "tit fuck"],
		creampie: ["creampie"],
		firstsex: ["first sex"],
		foreigner: ["foreign"],
		dance: ["dancing"],
		dirtytalk: ["dirty talk"],
		host: ["host"],
		hotel: ["hotel"],
		house: ["house"],
		iterview: ["interview"],
		kimono: ["kimono"],
		lesbian: ["lesbian"],
		lotion: ["lotion"],
		massage: ["esthetician", "massage"],
		office: ["office", "secretary"],
		outdoor: ["exposure", "outdoor"],
		retire: ["retire"],
		shaved: ["glabrousness"],
		shower: ["shower"],
		soap: ["soapland"],
		sport: ["sport"],
		spy: ["voyeur"],
		squirt: ["squirt"],
		teacher: ["teacher"],
		travel: ["travel"],
		whiteskin: ["fair-skinned"],
	};

	var categories_others = {
		amat: ["amateur"],
		milf: ["milf"],
		nonude: ["non nude"],
		orgy: ["orgy"],
		pro: ["porn star"],
		trio: ["threesome"],
		young: ["young"],
	};

	const categories_nofav = {
		//nonude:["non nude"],
		pov: ["pov"],
	};

	const categories_all = $.extend(
		categories_fav,
		categories_others,
		categories_nofav
	);

	$(".movieInfo tbody")
		.children("tr")
		.each((i, tr) => {
			var $tds = $(tr).children("td");
			var key = $tds.eq(0).text().trim().toLowerCase();
			var val = $tds.eq(1).text().trim();
			var html = $tds.eq(1).html();
			movieInfo[key] = val;
			movieInfoHtml[key] = html ? "<div>" + html.trim() + "</div>" : html;
		});

	var getId = function (url, type) {
		return url
			.match(type + "_[0-9_]{1,}.html")[0]
			.replace(".html", "")
			.replace(type + "_", "");
	};

	var actresses = {};

	$(movieInfoHtml["actress(es)"])
		.find("a")
		.each((i, a) => {
			var url = a.href;
			var id = getId(a.href, "actor");

			actresses[id] = {
				name: a.innerText.trim(),
				url: url,
				id: id,
			};
		});

	var series = {};
	var serie = $(movieInfoHtml["series"]).find("a")[0];
	if (serie) {
		var serieid = getId(serie.href, "series");
		series = {
			name: serie.innerText,
			url: serie.href,
			id: serieid,
		};
	}

	const categories = {};

	$(movieInfoHtml["type"])
		.add($(movieInfoHtml["sex styles"]))
		.add($(movieInfoHtml["theme"]))
		.find("a")
		.each((i, a) => {
			var url = a.href;
			var id = getId(a.href, "category");

			categories[id] = {
				name: a.innerText.trim(),
				url: url,
				id: id,
			};
		});

	const myCategories = [];

	for (var i in categories_all) {
		var ci = categories_all[i];
		for (var j in categories) {
			var cj = categories[j];
			if (cj.name.toLowerCase().includesSome(ci)) {
				myCategories.push(i);
			}
		}
	}

	var name = $("h1").eq(0).text().trim().toValidFileName();
	name = name.split("-")[0].trim() + " - " + name.split("-")[1].trim();
	Movie.name = name;
	Movie.code = window.location.pathname.match(/[0-9]{4}/)[0];
	Movie.actresses = actresses;
	Movie.series = series;
	Movie.categories = categories;
	Movie.myCategories = myCategories.unique();
	console.log(Movie);
	return Movie;
}

const saveJav = function () {
	alert("saved!");
	console.log(getInfo());
};

$(document).ready(() => {
	customHtml();
	// var Movie = getInfo();
	// console.log(Movie)
	addCustomName();
});
//setTimeout(loadAScript,3000)

function addCustomName() {
	var tr = Array.from($(".movieInfo tbody tr")).reverse()[1];
	var Movie = getInfo();
	var custom = `heyz-${Movie.code} ${
		Movie.name
	} [ ${Movie.myCategories.sort().join(", ")} ]`;
	console.log(custom);
	$(tr).after(
		$(`
            <tr>
                <td>Custom</td>
                <td><input type="text" 
                    value="${custom}" 
                    size=${custom.length}/></td>
            </tr>
         `)
	);
}
