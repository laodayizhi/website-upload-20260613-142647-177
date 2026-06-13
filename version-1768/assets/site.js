(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function closest(element, selector) {
        while (element && element.nodeType === 1) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initSearchForms() {
        selectAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-target") || "search.html";
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }
        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                schedule();
            });
        });
        show(0);
        schedule();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initCardFilter() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = selectAll("[data-movie-card]", grid);
        var empty = document.querySelector("[data-empty-state]");
        var inputs = selectAll("input, select", panel);
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            var qInput = panel.querySelector("input[name='q']");
            if (qInput) {
                qInput.value = q;
            }
        }
        function apply() {
            var keyword = normalize((panel.querySelector("input[name='q']") || {}).value);
            var region = normalize((panel.querySelector("select[name='region']") || {}).value);
            var type = normalize((panel.querySelector("select[name='type']") || {}).value);
            var year = normalize((panel.querySelector("select[name='year']") || {}).value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year"));
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
                    matched = false;
                }
                if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
                    matched = false;
                }
                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
            input.addEventListener("change", apply);
        });
        apply();
    }

    window.SitePlayer = {
        bind: function (mediaUrl) {
            var video = document.querySelector("[data-movie-video]");
            var trigger = document.querySelector("[data-player-trigger]");
            if (!video || !trigger || !mediaUrl) {
                return;
            }
            var loaded = false;
            function loadVideo() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(mediaUrl);
                    hls.attachMedia(video);
                    video.hls = hls;
                    return;
                }
                video.src = mediaUrl;
            }
            function playVideo() {
                loadVideo();
                trigger.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }
            trigger.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    playVideo();
                }
            });
            document.addEventListener("keydown", function (event) {
                if ((event.key === "Enter" || event.key === " ") && closest(document.activeElement, "[data-player-trigger]")) {
                    event.preventDefault();
                    playVideo();
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initSearchForms();
        initHeroSlider();
        initCardFilter();
    });
}());
