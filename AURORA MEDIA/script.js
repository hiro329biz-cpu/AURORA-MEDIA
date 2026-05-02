    // ---- ハンバーガーメニュー ----
    (function () {
      var btn  = document.getElementById('hamburger');
      var menu = document.getElementById('sp-menu');
      function toggleMenu(open) {
        btn.classList.toggle('open', open);
        menu.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      }
      btn.addEventListener('click', function () { toggleMenu(!menu.classList.contains('open')); });
      // SP メニュー内リンクをクリックしたら閉じる
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { toggleMenu(false); });
      });
    })();

    // ---- スムーススクロール (全 a[href^="#"]) ----
    (function () {
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
          var href = this.getAttribute('href');
          // トップへ戻る (#, #header)
          if (!href || href === '#' || href === '#header') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          var target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          var headerH = document.getElementById('header') ? document.getElementById('header').offsetHeight : 0;
          var extra = (href === '#news-section') ? 24 : 0;
          var top = target.getBoundingClientRect().top + window.scrollY - headerH - extra;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
      });
    })();

    // ---- Header: transparent → white frosted on scroll ----
    (function () {
      const header = document.getElementById('header');
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
    })();

    // ---- アニメーション (east-daily.jp の show/done パターン忠実再現) ----
    (function () {
      var EffectH = 120; // ウィンドウ下端から何px上で発火するか

      // ----- カーテンリビール対象 -----
      var curtains = document.querySelectorAll('.curtain');

      // ----- セクションヘッド対象 -----
      var heads = document.querySelectorAll('.sec-head, .promo-header, .sol-header');

      // ----- リスト項目 -----
      var infoItems = document.querySelectorAll('.info-item');

      // 各要素グループにインデックスを付与（スタガー用）
      curtains.forEach(function (el, i) {
        el.dataset.curtainIdx = i;
      });

      function isInView(el) {
        var rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight - EffectH) && rect.bottom > 0;
      }

      function triggerCurtain(el) {
        if (el.classList.contains('show')) return;
        el.classList.add('show');
        // east-daily.jp の delay(500) 再現 — doneクラスは現在不使用
      }

      function triggerFade(el, delay) {
        if (el.classList.contains('show')) return;
        if (delay) {
          setTimeout(function () { el.classList.add('show'); }, delay);
        } else {
          el.classList.add('show');
        }
      }

      function checkAll() {
        // カーテンリビール — グリッド行単位でスタガー
        var rowMap = {};
        curtains.forEach(function (el) {
          if (el.classList.contains('show')) return;
          if (!isInView(el)) return;

          // 同じ親コンテナ内での位置からスタガー計算
          var parent = el.parentElement;
          var siblings = Array.from(parent.querySelectorAll('.curtain'));
          var idx = siblings.indexOf(el);
          var col = idx % 2;
          var delay = col * 120; // 列ごとに120ms遅延（隣の扉は少し後）

          setTimeout(function () {
            triggerCurtain(el);
          }, delay);
        });

        // セクションヘッド
        heads.forEach(function (el) {
          if (isInView(el)) triggerFade(el, 0);
        });

        // info-item スタガー
        var visibleItems = [];
        infoItems.forEach(function (el) {
          if (!el.classList.contains('show') && isInView(el)) {
            visibleItems.push(el);
          }
        });
        visibleItems.forEach(function (el, i) {
          triggerFade(el, i * 80);
        });
      }

      // ----- 会社概要セクション オレンジシャッター -----
      var companyShutter = document.querySelector('.company-shutter');
      var shutterCont = document.querySelector('#company_cont_wrapper .shutter_cont');

      function checkCompanyShutter() {
        if (!companyShutter || companyShutter.classList.contains('open')) return;
        if (!shutterCont) return;
        var rect = shutterCont.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          companyShutter.classList.add('open');
        }
      }

      // スクロール + ロード時に判定（east-daily.jp と同じ）
      window.addEventListener('scroll', function () {
        checkAll();
        checkCompanyShutter();
      }, { passive: true });
      window.addEventListener('load', function () {
        checkAll();
        checkCompanyShutter();
      });
      // 初回チェック
      setTimeout(function () {
        checkAll();
        checkCompanyShutter();
      }, 100);
    })();

    // ---- Hero metrics counter ----
    (function () {
      function animateCounter(el) {
        var target = parseInt(el.dataset.target, 10);
        var start = null;
        var duration = 1400;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      }
      // Start after intro overlay finishes (≈2.75s)
      setTimeout(function () {
        document.querySelectorAll('.hero-metric__num').forEach(animateCounter);
      }, 2750);
    })();

    // ---- Anchor: SCROLL DOWN / PAGE TOP (east-daily.jp 忠実再現) ----
    (function () {
      var anchor = document.getElementById('anchor');
      var showPos = 120;

      function updateAnchor() {
        if (window.scrollY >= showPos) {
          anchor.classList.add('now_pagetop');
          anchor.classList.remove('now_scroll');
        } else {
          anchor.classList.add('now_scroll');
          anchor.classList.remove('now_pagetop');
        }
      }

      // PAGE TOP クリックでトップへスムーズスクロール
      var pagetopLink = anchor.querySelector('.pagetop a');
      if (pagetopLink) {
        pagetopLink.addEventListener('click', function (e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // SCROLL DOWN クリックで最初のセクションへスムーズスクロール
      var scrollLink = anchor.querySelector('.scroll a');
      if (scrollLink) {
        scrollLink.addEventListener('click', function (e) {
          e.preventDefault();
          var target = document.getElementById('our_solution');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
      }

      window.addEventListener('scroll', updateAnchor, { passive: true });
      window.addEventListener('load', updateAnchor);
      updateAnchor();
    })();
