// Poster mosaic background — mimics OnboardingPosterMosaic.swift
(function () {
    'use strict';

    // Popular TV show TMDB poster paths (w342 size) — fetched from TMDB API
    const POSTERS = [
        '/z4jgyI5TpoRZiJTNchkVkMrGQyz.jpg',
        '/acb9g0rlsFhy3LBPDvMF7Tso9Q0.jpg',
        '/eyTu5c8LniVciRZIOSHTvvkkgJa.jpg',
        '/uWpG7GqfKGQqX4YMAo3nv5OrglV.jpg',
        '/u40gJarLPlIkwouKlzGdobQOV9k.jpg',
        '/4uaguchJwBK0bl4zjluU6af8J7V.jpg',
        '/hjJkrLXhWvGHpLeLBDFznpBTY1S.jpg',
        '/mBcu8d6x6zB1el3MPNl7cZQEQ31.jpg',
        '/haJ9eHytVO3H3JooMJG1DiWwDNm.jpg',
        '/iofokHZoUB4Qhik4PflvJl8TT6a.jpg',
        '/70kTz0OmjjZe7zHvIDrq2iKW7PJ.jpg',
        '/sBVfyRYPmKSARRTodsTbwHqgcRA.jpg',
        '/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg',
        '/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
        '/gYAb6GCVEFsU9hzMCG5rxaxoIv3.jpg',
        '/i5hmoRjHNWady4AtAGICTUXknKH.jpg',
        '/7sizkzLu7RNowjfojv6eUn2tAzA.jpg',
        '/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg',
        '/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg',
        '/nD1ZQBKbgKSmKcrAkWTofohsScj.jpg',
        '/ixcfyK7it6FjRM36Te4OdblAq4X.jpg',
        '/4tblBrslcKSifMVZ3TmtT2ukMor.jpg',
        '/kIi3T7X0kmiV9vGDme146P2d979.jpg',
        '/acYXu4KaDj1NIkMgObnhe4C4a0T.jpg',
        '/3KUjDt8XY7w2Ku70UE0SECmv1zP.jpg',
        '/1N4o5PmmqhlVDrcdJ2RlCFWbLGX.jpg',
        '/w8enSKCf6Zm0topeQ2XPccDqsqp.jpg',
        '/2DIBDFHiKQawz4WPsYekl9DHwyA.jpg',
        '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
        '/9ZN1P32SHviL3SV51qLivxycvcx.jpg',
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
