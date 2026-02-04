document.addEventListener('DOMContentLoaded', function() {
    // Re-use hamburger menu logic
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('open');
        });
    }

    const orderItemsContainer = document.getElementById('order-items');
    const totalPriceElement = document.getElementById('total-price');
    const emptyOrderMessage = '<p>Uw order is leeg.</p>';
    let currentTotal = 0;

    // --- Helper Functions ---
    function updateTotalPrice() {
        totalPriceElement.textContent = `€${currentTotal.toFixed(2)}`;
    }

    function addOrderItem(name, price) {
        if (orderItemsContainer.innerHTML.includes(emptyOrderMessage)) {
            orderItemsContainer.innerHTML = ''; // Clear the 'empty' message
        }

        const priceNumber = parseFloat(price);
        currentTotal += priceNumber;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${name}</span>
            <strong>€${priceNumber.toFixed(2)}</strong>
        `;

        orderItemsContainer.appendChild(orderItem);
        updateTotalPrice();
    }

    // --- Package Selection ---
    const addToOrderButtons = document.querySelectorAll('.add-to-order');
    addToOrderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageItem = this.closest('.package-item');
            const name = packageItem.querySelector('h4').textContent;
            const price = packageItem.querySelector('.price').textContent.replace('€', '');
            
            addOrderItem(name, price);
            // Optional: disable button after adding
            this.textContent = 'Toegevoegd';
            this.disabled = true;
        });
    });

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
                quoteResultContainer.innerHTML = `
                    <p>Geschatte kosten: <strong>€${totalQuote.toFixed(2)}</strong></p>
                    <button id="add-quote-to-order" class="btn">Voeg toe aan order</button>
                `;
                
                document.getElementById('add-quote-to-order').addEventListener('click', function() {
                    addOrderItem('Offerte op maat', totalQuote.toFixed(2));
                    this.textContent = 'Toegevoegd!';
                    this.disabled = true;
                });

            } else {
                quoteResultContainer.innerHTML = '<p>Voer alstublieft waarden in om een offerte te berekenen.</p>';
            }
        });
    }
});
