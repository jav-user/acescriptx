// ==UserScript==
// @name H2RManga
// @namespace H2RManga Script
// @match https://hentai2read.com/*
//// @require https://code.jquery.com/jquery-3.5.1.js
// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.js
// @require https://cdn.jsdelivr.net/npm/alasql@0.6.5/dist/alasql.min.js
// @require https://nesmdev.github.io/ndev/ndev.1.0.1.js
// @grant none
// ==/UserScript==

const Manga = {};

const blackTags = {
	futa: ["futa*"],
	ntr: ["netorare"],
	yaoi: ["yaoi"],
};

const favTags = {
	anime: ["%anime%"],
	bath: ["bath%"],
	beach: ["beach%"],
	bikini: ["bikini%", "swimsuit%"],
	busty: ["big breasts"],
	color: ["full color"],
	cen: ["censored"],
	doujin: ["doujin%"],
	harem: ["harem%"],
	incest: [
		"%brother%",
		"%daughter%",
		"%family%",
		"%father%",
		"%incest%",
		"%mother%",
		"%sibling%",
		"%sister%",
	],
	korea: ["korea%"],
	lesb: ["yuri%"],
	loli: ["loli%"],
	lovey: [
		"first love",
		"%friends%",
		"happy sex",
		"love at first sight",
		"romance",
		"seduction",
		"sudden confession",
	],
	mix: ["collection%", "compilation"],
	nudism: ["exhibitionism", "public nudity"],
	pcen: ["partial censorship"],
	public: ["public%", "outdoor%"],
	rape: ["%rape%", "sexual assault", "sexual abuse"],
	serie: ["serialized"],
	sis: ["%sister%", "%sibling%"],
	school: ["cheerleaders", "%school%", "%student%"],
	shota: ["shota%"],
	shy: ["shy%"],
	spring: ["spring"],
	unc: ["un-censored", "un censored"],
	virgin: ["defloration", "virgin%"],
	xray: ["x-ray", "x ray"],
};

var path = _.trim(window.location.pathname, "/");

if (path == "download") {
	return false;
}

var $list = $("ul.list.list-simple-mini");

if (!$list.length) return false;

var url = new nurl(window.location.href);
var hash = url.getHash();
//alert(hash);

function setRawData() {
	var $elements = $list.children("li");

	$elements.each((i, el) => {
		var vals = Array.from($(el).children()).map((child) => $(child).text());
		if (vals[0]) {
			Manga[vals[0].toLowerCase()] = _(vals)
				.drop()
				.map(_.trim)
				.map(_.lowerCase)
				.value();
		}
	});
}

function formatData() {
	var title = $("h3.block-title > a")
		.clone() //clone the element
		.children() //select all the children
		.remove() //remove all the children
		.end() //again go back to selected element
		.text();

	Manga.title = title;
	var _title = _(Manga.title.split(" ")).map(_.trim).map(_.lowerCase).value();
	Manga._tags = _([Manga.category, Manga.content, _title])
		.flatten()
		.compact()
		.unique()
		.sort()
		.value();

	var Tags = [];

	var customTags = _.assign(favTags, blackTags) 
	for (var key in customTags) {
		var ctags = customTags[key];
		for (var ctag of ctags) {
			var found = alasql(`select * from ? where name like "${ctag}"`, [
				Manga._tags.map((tag) => {
					return {
						name: tag,
					};
				}),
			]);

			if (found.length) {
				Tags.push(key);
				break;
			}
		}
	}

	Manga.tags = Tags;
}

function bookmark() {
	$(".dropdown-menu.text-left").children("li").find("a")[0].click();
}

function formatChapters() {
	$(".nav-chapters .btn.btn-default.btn-circle").each((i, a) => {
		$(a).attr("target", "_blank");
	});
}

$(document).ready(function () {
	formatChapters();
	setRawData();
	formatData();
	MANGA = Manga;
});
