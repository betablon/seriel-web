// Poster mosaic background — mimics OnboardingPosterMosaic.swift
(function () {
    'use strict';

    // Popular TV show TMDB poster paths (w342 size)
    const POSTERS = [
        '/bQLrHIRNEVE3PdIWQrZbL96SOuk.jpg',  // Breaking Bad
        '/u3bZgnGQ9T01sWNhyveQz0wH0Ht.jpg',  // Game of Thrones
        '/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',  // Stranger Things
        '/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg',  // The Last of Us
        '/aQ2Z2Y39jq5cTBb6jnM9YzGe4YE.jpg',  // Severance
        '/qGQf2OHIBh81vQ5alPBUSHr23kx.jpg',  // The Bear
        '/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',  // Arcane
        '/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',  // Wednesday
        '/uDgy6hyPd82kOHh6I95FLtM8gZp.jpg',  // House of the Dragon
        '/f5uNbUC76oGt1nFBZQS0QjSWaQD.jpg',  // Succession
        '/fwTv3RPRAIy0maOMns5eYRRwnDk.jpg',  // Shogun
        '/hJfI6sGbl80HB6FkyIl1yI2MLcG.jpg',  // Dark
        '/58PB4IYI7mB18UPMWq4VxcAZ1co.jpg',  // Chernobyl
        '/z0iCS5Znx7TeRwlYSd4c01Z0lFp.jpg',  // Yellowjackets
        '/sjx6zjQI2dLGYNkay6PxSnKWYNh.jpg',  // True Detective
        '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',  // The Mandalorian
        '/wRbjVBdDo5qHAQZKbNfU8VUmMQo.jpg',  // Peaky Blinders
        '/4Tavsh0YPFPTH7YUqMwiGGxyYyS.jpg',  // Reacher
        '/jtnfNzqZwGjTFnRvtJFEHaAVgsC.jpg',  // Euphoria
        '/t6jVlbPMtZOJoAqDYT9LfdYzibW.jpg',  // Loki
        '/gmbsR4SsHTDqYMCJuMxMI7GXUXA.jpg',  // Ted Lasso
        '/6kbAMLteGO8yyewYau6bJ683sw7.jpg',  // The Boys
        '/6tfT03sGp9k4c0J3dypjrI8TSAI.jpg',  // Fargo
        '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',   // Better Call Saul
        '/oKt4J3TFjWirVwBqoHyIvv5IImd.jpg',  // Slow Horses
    ];

    const TMDB_BASE = 'https://image.tmdb.org/t/p/w342';
    const COLUMN_COUNT = 5;
    const POSTERS_PER_COLUMN = 8;

    function buildMosaic() {
        const container = document.getElementById('mosaic');
        if (!container) return;

        const columnsWrapper = document.createElement('div');
        columnsWrapper.className = 'mosaic-columns';

        // Distribute posters across columns round-robin
        const columns = Array.from({ length: COLUMN_COUNT }, () => []);
        const shuffled = [...POSTERS].sort(() => Math.random() - 0.5);

        for (let i = 0; i < COLUMN_COUNT * POSTERS_PER_COLUMN; i++) {
            const poster = shuffled[i % shuffled.length];
            columns[i % COLUMN_COUNT].push(poster);
        }

        columns.forEach((posters) => {
            const col = document.createElement('div');
            col.className = 'mosaic-column';

            // Duplicate posters for seamless loop
            const allPosters = [...posters, ...posters];
            allPosters.forEach((path) => {
                const img = document.createElement('img');
                img.className = 'mosaic-poster';
                img.src = TMDB_BASE + path;
                img.alt = '';
                img.loading = 'lazy';
                img.decoding = 'async';
                col.appendChild(img);
            });

            columnsWrapper.appendChild(col);
        });

        // Insert before the overlay
        const overlay = container.querySelector('.mosaic-overlay');
        container.insertBefore(columnsWrapper, overlay);
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildMosaic);
    } else {
        buildMosaic();
    }
})();
