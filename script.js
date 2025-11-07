document.addEventListener('DOMContentLoaded', function() {
    let cart = [];
    let selectedOccasion = null;
    let selectedAllergies = [];
    let selectedPayment = null;
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartShippingElement = document.getElementById('cart-shipping');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutButton = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotalElement = document.getElementById('checkout-subtotal');
    const checkoutShippingElement = document.getElementById('checkout-shipping');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkout-form');
    const cartIcon = document.getElementById('cart-icon');
    const shippingMessage = document.getElementById('shipping-message');
    const checkoutShippingMessage = document.getElementById('checkout-shipping-message');
    
    const SHIPPING_COST = 5000;
    const FREE_SHIPPING_THRESHOLD = 80000;
    
    // Añadir productos al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id,
                    name,
                    price,
                    quantity: 1
                });
            }
            
            updateCart();
            
            // Efecto visual de añadido al carrito
            const originalText = this.textContent;
            const originalBgColor = this.style.backgroundColor;
            
            this.textContent = "✓ Añadido";
            this.style.backgroundColor = "#28a745";
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = originalBgColor;
            }, 1500);
        });
    });
    
    // Seleccionar ocasión
    document.querySelectorAll('.celebration').forEach(celebration => {
        celebration.addEventListener('click', function() {
            document.querySelectorAll('.celebration').forEach(c => {
                c.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedOccasion = this.getAttribute('data-occasion');
            updateCheckoutButton();
        });
    });
    
    // Abrir modal de checkout
    checkoutButton.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Por favor, añade productos al carrito antes de proceder al pago.');
            return;
        }
        
        if (!selectedOccasion) {
            alert('Por favor, selecciona una ocasión de celebración.');
            return;
        }
        
        updateCheckoutSummary();
        checkoutModal.style.display = 'block';
    });
    
    // Cerrar modal de checkout
    closeCheckout.addEventListener('click', function() {
        checkoutModal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    // Seleccionar alergias
    document.querySelectorAll('.allergy-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
            const ingredient = this.getAttribute('data-ingredient');
            
            if (this.classList.contains('selected')) {
                if (!selectedAllergies.includes(ingredient)) {
                    selectedAllergies.push(ingredient);
                }
            } else {
                selectedAllergies = selectedAllergies.filter(a => a !== ingredient);
            }
        });
    });
    
    // Seleccionar método de pago
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(o => {
                o.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedPayment = this.getAttribute('data-method');
        });
    });
    
    // Enviar formulario de checkout
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedPayment) {
            alert('Por favor, selecciona un método de pago.');
            return;
        }
        
        // Validar fecha de entrega
        const deliveryDate = document.getElementById('delivery-date').value;
        const today = new Date().toISOString().split('T')[0];
        
        if (deliveryDate <= today) {
            alert('Por favor, selecciona una fecha de entrega futura.');
            return;
        }
        
        // Simular envío de datos
        const customerName = document.getElementById('customer-name').value;
        const total = calculateTotal();
        
        alert(`¡Gracias por tu compra ${customerName}!\n\nTu pedido para ${getOccasionName(selectedOccasion)} ha sido confirmado.\nTotal: $${total.toLocaleString()}\n\nTe contactaremos pronto para confirmar los detalles.`);
        
        // Reiniciar todo
        resetCart();
    });
    
    // Ir al carrito al hacer clic en el icono
    cartIcon.addEventListener('click', function() {
        document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Calcular costo de envío
    function calculateShippingCost(subtotal) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            return 0;
        }
        return SHIPPING_COST;
    }
    
    // Calcular total
    function calculateTotal() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingCost = calculateShippingCost(subtotal);
        return subtotal + shippingCost;
    }
    
    // Actualizar carrito
    function updateCart() {
        // Limpiar contenedor
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-message">Tu carrito está vacío. ¡Añade algunos productos!</div>';
            cartSubtotalElement.textContent = '0';
            cartShippingElement.textContent = '0';
            cartTotalElement.textContent = '0';
            cartCountElement.textContent = '0';
            updateCheckoutButton();
            updateShippingMessage(0);
            return;
        }
        
        let subtotal = 0;
        
        // Añadir items al carrito
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong> - $${item.price.toLocaleString()} x ${item.quantity}
                </div>
                <div>
                    $${itemTotal.toLocaleString()}
                    <button class="remove-btn" data-id="${item.id}">Eliminar</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        const shippingCost = calculateShippingCost(subtotal);
        const total = subtotal + shippingCost;
        
        // Actualizar valores
        cartSubtotalElement.textContent = subtotal.toLocaleString();
        cartShippingElement.textContent = shippingCost.toLocaleString();
        cartTotalElement.textContent = total.toLocaleString();
        
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });
        
        updateCheckoutButton();
        updateShippingMessage(subtotal);
    }
    
    // Actualizar mensaje de envío
    function updateShippingMessage(subtotal) {
        const missingAmount = FREE_SHIPPING_THRESHOLD - subtotal;
        
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            shippingMessage.textContent = '🎉 ¡Felicidades! Tienes envío gratis.';
            shippingMessage.style.display = 'block';
            shippingMessage.style.backgroundColor = '#e8f5e9';
            shippingMessage.style.color = '#2e7d32';
        } else if (missingAmount > 0) {
            shippingMessage.textContent = `¡Falta solo $${missingAmount.toLocaleString()} para envío gratis!`;
            shippingMessage.style.display = 'block';
            shippingMessage.style.backgroundColor = '#fff3cd';
            shippingMessage.style.color = '#856404';
        } else {
            shippingMessage.style.display = 'none';
        }
    }
    
    // Actualizar resumen de checkout
    function updateCheckoutSummary() {
        checkoutItemsContainer.innerHTML = '';
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const checkoutItemElement = document.createElement('div');
            checkoutItemElement.className = 'checkout-item';
            checkoutItemElement.innerHTML = `
                <div>${item.name} x ${item.quantity}</div>
                <div>$${itemTotal.toLocaleString()}</div>
            `;
            
            checkoutItemsContainer.appendChild(checkoutItemElement);
        });
        
        const shippingCost = calculateShippingCost(subtotal);
        const total = subtotal + shippingCost;
        
        checkoutSubtotalElement.textContent = subtotal.toLocaleString();
        checkoutShippingElement.textContent = shippingCost.toLocaleString();
        checkoutTotalElement.textContent = total.toLocaleString();
        
        // Actualizar mensaje de envío en checkout
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            checkoutShippingMessage.textContent = '🎉 ¡Envío gratis aplicado!';
            checkoutShippingMessage.style.display = 'block';
        } else {
            checkoutShippingMessage.style.display = 'none';
        }
    }
    
    // Eliminar productos del carrito
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }
    
    // Actualizar estado del botón de pago
    function updateCheckoutButton() {
        if (cart.length > 0 && selectedOccasion) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Proceder al Pago";
        } else {
            checkoutButton.disabled = true;
            
            if (cart.length === 0) {
                checkoutButton.textContent = "Añade productos al carrito";
            } else if (!selectedOccasion) {
                checkoutButton.textContent = "Selecciona una celebración";
            }
        }
    }
    
    // Obtener nombre de la ocasión
    function getOccasionName(occasionKey) {
        const occasions = {
            'cumpleaños': 'Cumpleaños',
            'san-valentin': 'San Valentín',
            'dia-madre': 'Día de la Madre',
            'dia-padre': 'Día del Padre',
            'halloween': 'Halloween'
        };
        
        return occasions[occasionKey] || 'la celebración';
    }
    
    // Reiniciar carrito
    function resetCart() {
        cart = [];
        selectedOccasion = null;
        selectedAllergies = [];
        selectedPayment = null;
        
        document.querySelectorAll('.celebration').forEach(c => {
            c.classList.remove('selected');
        });
        
        document.querySelectorAll('.allergy-option').forEach(o => {
            o.classList.remove('selected');
        });
        
        document.querySelectorAll('.payment-option').forEach(o => {
            o.classList.remove('selected');
        });
        
        checkoutForm.reset();
        checkoutModal.style.display = 'none';
        updateCart();
    }
});