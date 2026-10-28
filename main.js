/*jslint browser */

// Адрес сервиса сохранения форм (formcarry / formspree / getform и т. п.).
// Замените YOUR_FORM_ID на идентификатор своей формы из предыдущих заданий.
const FORM_ENDPOINT = "https://formcarry.com/s/BDutpn4fT4g";
const STORAGE_KEY = "drupal-coder-form";
const MOBILE_QUERY = "(max-width: 1023px)";

function pad(num) {
    return String(num).padStart(2, "0");
}

/* ---------- Мобильное меню ---------- */
function initMobileMenu() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav");
    const links = nav.querySelectorAll("a");

    function setOpen(isOpen) {
        nav.classList.toggle("is-open", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
        burger.setAttribute(
            "aria-label",
            (
                isOpen
                ? "Закрыть меню"
                : "Открыть меню"
            )
        );
        document.body.classList.toggle("menu-open", isOpen);
    }

    burger.addEventListener("click", function () {
        setOpen(!nav.classList.contains("is-open"));
    });

    links.forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.matchMedia(MOBILE_QUERY).matches) {
                setOpen(false);
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
            setOpen(false);
            burger.focus();
        }
    });

    window.matchMedia(MOBILE_QUERY).addEventListener("change", function () {
        setOpen(false);
    });
}

/* ---------- Видео в шапке ---------- */
function initVideo() {
    const video = document.querySelector(".hero__video");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing;

    if (!video) {
        return;
    }
    if (reduce.matches) {
        video.removeAttribute("autoplay");
        video.pause();
        return;
    }
    playing = video.play();
    if (playing !== undefined) {
        playing.catch(function () {
            video.setAttribute("controls", "");
        });
    }
}

/* ---------- Слайдер отзывов ---------- */
function initSlider() {
    const slider = document.querySelector("[data-slider]");
    let track;
    let slides;
    let current;
    let total;
    let index = 0;
    let startX = null;

    function render() {
        track.style.transform = "translateX(" + (-100 * index) + "%)";
        current.textContent = pad(index + 1);
        slides.forEach(function (slide, i) {
            slide.setAttribute("aria-hidden", String(i !== index));
        });
    }

    function go(step) {
        index = (index + step + slides.length) % slides.length;
        render();
    }

    if (!slider) {
        return;
    }
    track = slider.querySelector(".slider__track");
    slides = Array.from(slider.querySelectorAll(".review"));
    current = slider.querySelector(".slider__current");
    total = slider.querySelector(".slider__total");
    total.textContent = " / " + pad(slides.length);

    slider.querySelector(".slider__btn--prev").addEventListener(
        "click",
        function () {
            go(-1);
        }
    );
    slider.querySelector(".slider__btn--next").addEventListener(
        "click",
        function () {
            go(1);
        }
    );

    track.addEventListener("touchstart", function (event) {
        startX = event.touches[0].clientX;
    }, {passive: true});

    track.addEventListener("touchend", function (event) {
        let diff;
        if (startX === null) {
            return;
        }
        diff = event.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 40) {
            go(
                diff < 0
                ? 1
                : -1
            );
        }
        startX = null;
    });

    render();
}

/* ---------- FAQ (аккордеон) ---------- */
function initFaq() {
    const items = document.querySelectorAll(".faq__item");

    function close(item) {
        const panel = item.querySelector(".faq__a");
        panel.style.height = panel.scrollHeight + "px";
        panel.getBoundingClientRect();
        panel.style.height = "0px";
        item.classList.remove("is-open");
        item.querySelector(".faq__btn").setAttribute("aria-expanded", "false");
    }

    function open(item) {
        const panel = item.querySelector(".faq__a");
        item.classList.add("is-open");
        item.querySelector(".faq__btn").setAttribute("aria-expanded", "true");
        panel.style.height = "0px";
        panel.getBoundingClientRect();
        panel.style.height = panel.scrollHeight + "px";
    }

    items.forEach(function (item) {
        const panel = item.querySelector(".faq__a");

        panel.addEventListener("transitionend", function () {
            if (item.classList.contains("is-open")) {
                panel.style.height = "auto";
            }
        });

        item.querySelector(".faq__btn").addEventListener(
            "click",
            function () {
                const wasOpen = item.classList.contains("is-open");
                items.forEach(function (other) {
                    if (other.classList.contains("is-open")) {
                        close(other);
                    }
                });
                if (!wasOpen) {
                    open(item);
                }
            }
        );
    });
}

/* ---------- Форма обратной связи ---------- */
function initForm() {
    const form = document.getElementById("contact-form");
    let fields;
    let agree;
    let submit;
    let status;

    function saveDraft() {
        const data = {};
        fields.forEach(function (field) {
            data[field.name] = field.value;
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (ignore) {
            return;
        }
    }

    function loadDraft() {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch (ignore) {
            data = {};
        }
        fields.forEach(function (field) {
            if (typeof data[field.name] === "string") {
                field.value = data[field.name];
            }
        });
    }

    function setStatus(text, type) {
        status.textContent = text;
        status.className = "form__status" + (
            type
            ? " is-" + type
            : ""
        );
    }

    function validate() {
        let firstInvalid = null;
        const email = form.elements.email;
        const phone = form.elements.phone;

        fields.forEach(function (field) {
            field.classList.remove("is-invalid");
        });
        agree.classList.remove("is-invalid");

        fields.forEach(function (field) {
            if (field.required && field.value.trim() === "") {
                field.classList.add("is-invalid");
                firstInvalid = firstInvalid || field;
            }
        });

        if (
            email.value.trim() !== ""
            && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email.value.trim())
        ) {
            email.classList.add("is-invalid");
            firstInvalid = firstInvalid || email;
        }

        if (
            phone.value.trim() !== ""
            && phone.value.replace(/\D/g, "").length < 10
        ) {
            phone.classList.add("is-invalid");
            firstInvalid = firstInvalid || phone;
        }

        if (!agree.checked) {
            agree.classList.add("is-invalid");
            firstInvalid = firstInvalid || agree;
        }

        if (firstInvalid) {
            firstInvalid.focus();
            setStatus(
                "Пожалуйста, заполните отмеченные поля и дайте согласие "
                + "на обработку данных.",
                "error"
            );
            return false;
        }
        return true;
    }

    function setLoading(isLoading) {
        submit.disabled = isLoading;
        submit.classList.toggle("is-loading", isLoading);
        submit.setAttribute("aria-busy", String(isLoading));
    }

    if (!form) {
        return;
    }
    fields = Array.from(form.querySelectorAll(".form__field"));
    agree = form.elements.agree;
    submit = form.querySelector(".form__submit");
    status = form.querySelector(".form__status");

    loadDraft();
    form.addEventListener("input", function (event) {
        event.target.classList.remove("is-invalid");
        saveDraft();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!validate()) {
            return;
        }
        setLoading(true);
        setStatus("Отправляем заявку…", "");

        fetch(FORM_ENDPOINT, {
            body: new FormData(form),
            headers: {Accept: "application/json"},
            method: "POST"
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }
            return response.json();
        }).then(function () {
            form.reset();
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (ignore) {
                setStatus("", "");
            }
            setStatus(
                "Спасибо! Заявка отправлена, менеджер свяжется с вами.",
                "success"
            );
        }).catch(function () {
            setStatus(
                "Не удалось отправить заявку. Пожалуйста, "
                + "попробуйте отправить форму ещё раз.",
                "error"
            );
        }).finally(function () {
            setLoading(false);
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initVideo();
    initSlider();
    initFaq();
    initForm();
});
