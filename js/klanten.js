let orderItemsContainer = null;
let totalPriceElement = null;
const emptyOrderMessage = '<p>Uw order is leeg.</p>';
let currentTotal = 0;
const orderItems = [];
let lastQuote = null;

function updateTotalPrice() {
    if (!totalPriceElement) {
        return;
    }
    totalPriceElement.textContent = `€${currentTotal.toFixed(2)}`;
}

function addOrderItem(name, price, meta = {}) {
    if (!orderItemsContainer) {
        return;
    }

    if (orderItemsContainer.innerHTML.includes(emptyOrderMessage)) {
        orderItemsContainer.innerHTML = '';
    }

    const priceNumber = parseFloat(price);
    currentTotal += priceNumber;
    orderItems.push({
        name,
        price: priceNumber,
        ...meta,
    });

    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
        <span>${name}</span>
        <strong>€${priceNumber.toFixed(2)}</strong>
    `;

    orderItemsContainer.appendChild(orderItem);
    updateTotalPrice();
}

document.addEventListener('DOMContentLoaded', function() {
    // Re-use hamburger menu logic
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('open');
        });
    }

    orderItemsContainer = document.getElementById('order-items');
    totalPriceElement = document.getElementById('total-price');

    // --- Package Selection ---
    const packageList = document.getElementById('package-list');
    if (packageList) {
        packageList.addEventListener('click', function(event) {
            const button = event.target.closest('.add-to-order');
            if (!button) {
                return;
            }

            const packageItem = button.closest('.package-item');
            if (!packageItem) {
                return;
            }

            const name = packageItem.dataset.packageName || packageItem.querySelector('h4').textContent;
            const price = packageItem.dataset.packagePrice || packageItem.querySelector('.price').textContent.replace('€', '');
            const packageId = packageItem.dataset.packageId ? Number(packageItem.dataset.packageId) : null;
            const description = packageItem.dataset.packageDescription || '';

            addOrderItem(name, price, {
                type: 'package',
                packageId,
                description,
            });
            button.textContent = 'Toegevoegd';
            button.disabled = true;
        });
    }

    // --- Custom Quote Form ---
    const quoteForm = document.getElementById('quote-form');
    const quoteResultContainer = document.getElementById('quote-result');

    if (quoteForm) {
        quoteForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const m2Gras = parseFloat(document.getElementById('m2-gras').value) || 0;
            const m2Tegels = parseFloat(document.getElementById('m2-tegels').value) || 0;
            const metersHeg = parseFloat(document.getElementById('meters-heg').value) || 0;

            // Example pricing
            const priceGras = 5;    // €5 per m²
            const priceTegels = 20; // €20 per m²
            const priceHeg = 15;    // €15 per meter

            const totalQuote = (m2Gras * priceGras) + (m2Tegels * priceTegels) + (metersHeg * priceHeg);

            if (totalQuote > 0) {
                lastQuote = {
                    m2gras: m2Gras.toString(),
                    m2tegels: m2Tegels.toString(),
                    heg: metersHeg.toString(),
                    prijs: totalQuote.toFixed(2),
                };
                quoteResultContainer.innerHTML = `
                    <p>Geschatte kosten: <strong>€${totalQuote.toFixed(2)}</strong></p>
                    <button id="add-quote-to-order" class="btn">Voeg toe aan order</button>
                `;
                
                document.getElementById('add-quote-to-order').addEventListener('click', function() {
                    addOrderItem('Offerte op maat', totalQuote.toFixed(2), {
                        type: 'offerte',
                        offerte: lastQuote,
                    });
                    this.textContent = 'Toegevoegd!';
                    this.disabled = true;
                });

            } else {
                quoteResultContainer.innerHTML = '<p>Voer alstublieft waarden in om een offerte te berekenen.</p>';
            }
        });
    }

    loadPackages();
    createOrder();
});

function loadPackages() {
    fetch('http://localhost:3000/api/packages')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            const packageList = document.getElementById('package-list');
            
            if (packageList) {
                packageList.innerHTML = data.packages.map(pkg => `
                    <div class="package-item" data-package-id="${pkg.id}" data-package-name="${pkg.name}" data-package-description="${pkg.description}" data-package-price="${pkg.price}">
                        <h4>${pkg.name}</h4>
                        <p>${pkg.description}</p>
                        <span class="price">€${pkg.price}</span>
                        <button class="add-to-order btn">Voeg toe aan order</button>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

function createOrder() {
    const form = document.getElementById("customer-form");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const packageItem = orderItems.find((item) => item.type === 'package');
        const offerteItem = orderItems.find((item) => item.type === 'offerte');

        const packagePayload = packageItem
            ? {
                type: packageItem.name,
                details: packageItem.description || '',
                id: packageItem.packageId || null,
            }
            : false;

        const offertePayload = offerteItem ? offerteItem.offerte : false;

        const order = {
            id: Date.now(),
            client: data["client-name"],
            adress: data["client-address"],
            email: data["client-email"],
            phone: data["client-phone"] || "",
            package: packagePayload,
            offerte: offertePayload,
            items: orderItems.map((item) => ({
                type: item.type || 'manual',
                name: item.name,
                price: item.price,
                packageId: item.packageId || null,
                description: item.description || '',
                offerte: item.offerte || null,
            })),
            total: currentTotal,
            datum: new Date().toISOString().split("T")[0],
            status: "In behandeling"
        };

        try {
            const response = await fetch("http://localhost:3000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            });

            const result = await response.json();
            console.log("Succes:", result);

        } catch (error) {
            console.error("Error:", error);
        }
    });
}