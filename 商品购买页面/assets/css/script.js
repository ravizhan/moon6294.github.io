'use strict';

/**
 * Add event on element or NodeList
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem instanceof NodeList || Array.isArray(elem)) {
    elem.forEach(el => el.addEventListener(type, callback));
  } else if (elem instanceof Element) {
    elem.addEventListener(type, callback);
  } else {
    console.error("addEventOnElem: Invalid element", elem);
  }
};

/**
 * Wait until the DOM is fully loaded before executing all logic
 */
document.addEventListener('DOMContentLoaded', function () {

  /** ------------ Navbar Toggle ------------ **/
  const navbar = document.querySelector("[data-navbar]");
  const navToggler = document.querySelectorAll("[data-nav-toggler]");
  const overlay = document.querySelector("[data-overlay]");

  if (navbar && overlay && navToggler.length > 0) {
    const toggleNav = function () {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    };
    addEventOnElem(navToggler, "click", toggleNav);
  } else {
    console.warn("Navbar or overlay elements are missing!");
  }

  /** ------------ Slider Functionality ------------ **/
  const slider = document.querySelector("[data-slider]");
  const nextBtn = document.querySelector("[data-next]");
  const prevBtn = document.querySelector("[data-prev]");

  if (slider && nextBtn && prevBtn) {
    let sliderPos = 0;
    const totalSliderItems = 2;

    const slideToNext = function () {
      if (sliderPos < totalSliderItems - 1) {
        sliderPos++;
        slider.style.transform = `translateX(-${sliderPos}00%)`;
        sliderEnd();
      }
    };

    const slideToPrev = function () {
      if (sliderPos > 0) {
        sliderPos--;
        slider.style.transform = `translateX(-${sliderPos}00%)`;
        sliderEnd();
      }
    };

    addEventOnElem(nextBtn, "click", slideToNext);
    addEventOnElem(prevBtn, "click", slideToPrev);

    function sliderEnd() {
      nextBtn.classList.toggle("disabled", sliderPos >= totalSliderItems - 1);
      prevBtn.classList.toggle("disabled", sliderPos <= 0);
    }

    sliderEnd();
  } else {
    console.warn("Slider elements are missing!");
  }

  /** ------------ 自动根据数量更新总价 ------------ **/
  const totalPriceElem = document.querySelector("[data-total-price]");
  const qtyElem = document.querySelector("[data-qty]");
  const minusBtn = document.querySelector("[data-qty-minus]");
  const plusBtn = document.querySelector("[data-qty-plus]");

  if (totalPriceElem && qtyElem && minusBtn && plusBtn) {
    let initialTotalPrice = parseFloat(totalPriceElem.textContent.replace(/[^\d.]/g, "")) || 0;
    let qty = parseInt(qtyElem.textContent) || 1;
    let unitPrice = initialTotalPrice / qty;

    function update() {
      qtyElem.textContent = qty;
      const newTotal = (unitPrice * qty).toFixed(2);
      totalPriceElem.textContent = `¥${newTotal}`;
    }

    minusBtn.addEventListener("click", () => {
      if (qty > 1) {
        qty--;
        update();
      }
    });

    plusBtn.addEventListener("click", () => {
      qty++;
      update();
    });

  } else {
    console.warn("Some price or quantity elements are missing!");
  }

});

/** ------------ 添加加入购物车功能 ------------ **/
document.addEventListener('DOMContentLoaded', function () {
  const addToCartBtns = document.querySelectorAll("[data-add-to-cart], .cart-btn"); // 兼容类名为cart-btn的按钮

  if (addToCartBtns.length > 0) {
    addEventOnElem(addToCartBtns, "click", function (event) {
      const button = event.currentTarget;

      // 从商品页面中动态提取信息
      const productNameElem = document.querySelector(".product-title");
      const productPriceElem = document.querySelector("[data-total-price]");

      if (!productNameElem || !productPriceElem) {
        alert("无法获取商品信息");
        return;
      }

      const productName = productNameElem.textContent.trim();
      const productPrice = parseFloat(productPriceElem.textContent.replace(/[^\d.]/g, "")).toFixed(2);
      const productId = productName + "_" + productPrice; // 简单拼接生成唯一id
      const qtyElem = document.querySelector("[data-qty]");
      const qty = qtyElem ? parseInt(qtyElem.textContent) : 1;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // 检查是否已存在，存在则更新数量
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        cart.push({ id: productId, name: productName, price: productPrice, qty });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      alert("已加入购物车！");
    });
  } else {
    console.warn("未找到加入购物车按钮");
  }
});

