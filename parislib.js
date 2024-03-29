(function() {



function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}



var book = {
    'gencod': gencod,
};

let modalroot = document.getElementById("myModal5");


let btn_line = document.getElementsByClassName("choixregion")[0];
let toolbar = document.getElementById("filtre_recherche_lib")

var maphtml = browser.runtime.getURL("map.html");

let iframe = document.createElement("iframe")
iframe.id = "parislibmap";
iframe.style.width = "100%";
iframe.style.height = "720px";
iframe.style.overflowY = "hidden";
iframe.style.display = "none";
iframe.src = maphtml

let display_text = "Afficher la carte";
let hide_text = "Cacher la carte";
let add_text = "Ajouter à la carte";


toolbar.appendChild(iframe);


let displaymap_btn = htmlToElement('<div class="pull-left" style="display:flex;"> <button class="btn pull-right" type="button" id="extension_displaymap"><i class="far fa-map" aria-hidden="true"></i>&nbsp; <span id="displaybtn_text" class="hidden-xs">'+display_text+'</span></button></div>')

function display_iframe() {
    iframe.src = iframe.src; // reload
    iframe.style.display = "block" ;
    document.getElementById("displaybtn_text").innerText = hide_text;
}

function hide_iframe() {
    iframe.style.display = "none" ;
    document.getElementById("displaybtn_text").textContent = display_text;
}


displaymap_btn.addEventListener('click', function() {

    if (iframe.style.display ==  "none") {

        display_iframe();

    } else {

        hide_iframe();

    }



})

let addtomap_btn = htmlToElement('<div class="pull-left" style="display:flex;"> <button class="btn pull-right" type="button" id="extension_addtomap"><i class="far"><span class="far fa-plus" aria-hidden="true"></span><span class="far fa-map" aria-hidden="true"></span></i><span class="hidden-xs">&nbsp; '+add_text+'</span></button></div>')

addtomap_btn.addEventListener('click', function() {

    let libraries = modalroot.querySelectorAll(".detail_librairie");

    let couv_elt = document.querySelector('img[src*="'+gencod+'"][alt]')

    book['thumb'] = couv_elt.getAttribute("src");
    book['title'] = couv_elt.getAttribute("alt");

    if (document.URL.includes("/livre/" + gencod)) {
        book['url'] = document.URL;
    }
    else {
        let link_elt = document.querySelector('a[href^="/livre/'+gencod+'"]')
        book['url'] = "https://www.parislibrairies.fr"+ link_elt.getAttribute("href");
    }



    let libs_avail = [];

    libraries.forEach( (library) => {

        let dispo_p = library.querySelector(".dispo_list_lib > p");

        if (!dispo_p)
            return;


        if (dispo_p.textContent.trim() == "En stock") {

            var bloc_nom = library.querySelector(".bloc_nom_lib  a")
            var lname = bloc_nom.textContent.trim();
            var lurl = bloc_nom.getAttribute("href");
            var plan_url = library.querySelector(".btnPlan" ).getAttribute("href");

            var addr = library.querySelector(".adresse_lib").innerText;
            var hours = library.querySelector(".libItem-horaires-icone").innerText;

            var latlg = plan_url.match(/\/@(.+),(.+),.+\//);

            libs_avail.push({
                'name': lname,
                'lat': latlg[1],
                'long': latlg[2],
                'lib_url': lurl,
                'map_url': plan_url,
                'addr' : addr,
                'hours': hours
            });

        }

    });

    book['avail'] = libs_avail;

    function onGot(items, book) {

        books = items.books || {}

        books[book['gencod']] = book

        browser.storage.local.set( { 'books': books } );

        display_iframe();


    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }


    browser.storage.local.get("books").then( (books) => onGot(books, book), onError);


})

toolbar.prepend(displaymap_btn);
toolbar.prepend(addtomap_btn);


})();
