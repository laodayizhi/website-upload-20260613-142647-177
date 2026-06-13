(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('is-nav-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                return;
            }
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var current = 0;
        var timer = null;

        var setHero = function (next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === current);
            });
            thumbs.forEach(function (thumb, index) {
                thumb.classList.toggle('is-active', index === current);
            });
        };

        var startHero = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setHero(current + 1);
            }, 5200);
        };

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var next = parseInt(thumb.getAttribute('data-hero-thumb'), 10);
                setHero(next);
                startHero();
            });
        });

        startHero();
    }

    var searchList = document.querySelector('[data-search-list]');

    if (searchList) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(searchList.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var title = document.getElementById('search-title');
        var input = document.querySelector('[data-search-input]');
        var visibleCount = 0;

        if (input && query) {
            input.value = params.get('q') || '';
        }

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search-text') || '').toLowerCase();
            var visible = !query || text.indexOf(query) !== -1;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (title && query) {
            title.textContent = '搜索结果：' + (params.get('q') || '');
        }

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('[data-player-video]');
        var startButton = player.querySelector('[data-player-start]');
        var mediaSource = window.__MOVIE_SOURCE__ || '';
        var loaded = false;
        var hlsInstance = null;

        var loadMedia = function () {
            if (!video || loaded || !mediaSource) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(mediaSource);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaSource;
            } else {
                video.src = mediaSource;
            }

            video.controls = true;
        };

        var playMedia = function () {
            if (!video) {
                return;
            }

            loadMedia();

            if (startButton) {
                startButton.classList.add('is-hidden');
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    if (startButton) {
                        startButton.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (startButton) {
            startButton.addEventListener('click', playMedia);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playMedia();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
})();
