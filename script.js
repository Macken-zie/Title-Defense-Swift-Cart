let scannedItems = [];
let lastScannedTime = 0; // Store last scan timestamp
let currentBarcode = '';

const productMap = {
    '1431431431436': { name: 'I Love You Aquisha', price: ∞, weight: ∞ }, // weight in grams
    '4806518335346': { name: 'Belo', price: 600, weight: 100 }, // weight in grams
    '4800010075069': { name: 'Cream O', price: 10, weight: 50 }, // weight in grams
    '4800016644801': { name: 'Piattos', price: 25, weight: 45 }, // weight in grams
    '4806028510158': { name: 'Weslysy Gummy Burger', price: 20, weight: 15 }, // weight in grams
    '4800016603280': { name: 'Vcut Onion Garlic', price: 25, weight: 25 }, // weight in grams
    '0792649260074': { name: 'Weslysy Gummy Snake', price: 20, weight: 15 }, // weight in grams
    // add more mappings here
};

// Function to navigate between tabs
function navigateTo(tab) {
    const tabs = document.querySelectorAll('.tab-content');

    tabs.forEach(tc => tc.classList.remove('active'));

    document.getElementById(tab).classList.add('active');

    // Start scanner when switching to Scan tab
    if (tab === 'scan') {
        startBarcodeScanner();
    } else {
        Quagga.stop(); // Stop scanner when leaving scan tab
    }
}

// Function to hide welcome message
function hideWelcome() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('logo-name').style.display = 'block';
}

// Function to hide logo
function hideLogo() {
    document.getElementById('logo').style.display = 'none';
}

// Function to start barcode scanner
function startBarcodeScanner() {
    Quagga.init({
        inputStream: { 
            name: "Live", 
            type: "LiveStream", 
            target: "#barcode-scanner", 
            constraints: { 
                facingMode: ["environment"], // Use back camera
                width: { ideal: 400, max: 640 },
                height: { ideal: 480, max: 720 }
            }} ,
        decoder: { 
            readers: ["ean_reader", "upc_reader", "code_128_reader", "ean_8_reader"]
        },
        frequency: 10,  
        locator: { patchSize: "large", halfSample: true }, 
        numOfWorkers: 4 
    }, function(err) {
        if (err) { 
            console.error(err); 
            return; 
        }
        Quagga.start();
    });

    // On barcode detected
    Quagga.onDetected(function(result) {
        const barcode = result.codeResult.code;
        const currentTime = new Date().getTime();

        // Prevent spamming scans (2-second interval)
        if (currentTime - lastScannedTime < 2000) return;
        lastScannedTime = currentTime;

        const existingItem = scannedItems.find(item => item.barcode === barcode);

        if (existingItem) {
            // Show notification for existing item
            const notification = document.createElement('div');
            notification.textContent = `You already have ${existingItem.quantity} ${productMap[barcode] ? productMap[barcode].name : 'Unknown Product'} in your cart.`;
            notification.style.position = 'fixed';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            notification.style.color = 'white';
            notification.style.padding = '10px';
            notification.style.borderRadius = '10px';
            notification.style.zIndex = '1000';

            document.body.appendChild(notification);

            // Remove notification after 2 seconds
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 2000);

            document.getElementById('popup').style.display = 'flex';
            document.getElementById('quantity').value = 1;
        } else {
            if (productMap[barcode]) {
                currentBarcode = barcode;
                document.getElementById('popup').style.display = 'flex';
                document.getElementById('quantity').value = 1;
            } else {
                // Removed alert notification
            }
        }
    });

    // On barcode processed
    Quagga.onProcessed(function(result) {
        if (result.codeResult) {
            return;
        }

        // Show notification for invalid barcode scan
        const notification = document.createElement('div');
        notification.textContent = 'I cant read it properly, please scan again';
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        notification.style.color = 'white';
        notification.style.padding = '10px';
        notification.style.borderRadius = '10px';
        notification.style.zIndex = '1000';

        document.body.appendChild(notification);

        // Remove notification after 2 seconds
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 2000);
    });
}

// Function to add quantity
function addQuantity() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const barcode = currentBarcode;
    const existingItem = scannedItems.find(item => item.barcode === barcode);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        if (productMap[barcode]) {
            const price = productMap[barcode].price;
            scannedItems.push({ barcode, quantity, price });
        } else {
            // Removed alert notification
            return;
        }
    }

    document.getElementById('popup').style.display = 'none';
    updateCart();
    if (scannedItems.length > 0) {
        document.getElementById('proceed-button').style.display = 'block';
    }

    // Show notification for added item
    const notification = document.createElement('div');
    notification.textContent = `Added ${quantity} ${productMap[barcode] ? productMap[barcode].name : 'Unknown Product'} to cart.`;
    notification.classList.add('notification');

    document.getElementById('scan').appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(function() {
        document.getElementById('scan').removeChild(notification);
    }, 5000);
}

// Function to cancel quantity
function cancelQuantity() {
    document.getElementById('popup').style.display = 'none';
    navigateTo('scan');
    startBarcodeScanner();
}

// Function to update cart table
function updateCart() {
    const cartTable = document.getElementById('cartTable');
    const totalPriceElement = document.getElementById('totalPrice');
    const totalWeightElement = document.getElementById('totalWeight');
    cartTable.innerHTML = ''; // Clear table

    let total = 0;
    let totalWeight = 0;
    scannedItems.forEach((item, index) => {
        let row = `<tr style="border-radius: 12px; background: #f9f9f9;">
            <td style="padding: 12px; text-align: center;">${productMap[item.barcode] ? productMap[item.barcode].name : 'Unknown Product'}</td>
            <td style="padding: 12px; text-align: center;">
                <div class="quantity-modifier">
                    <img src="./assets/${item.quantity <= 1 ? 'minus.png' : 'minus.png'}" onclick="${item.quantity <= 1 ? 'deleteItem(' + index + ')' : 'decrementQuantity(' + index + ')'}">
                    <span>${item.quantity}</span>
                    <img src="./assets/plus.png" onclick="incrementQuantity(${index})">
                </div>
            </td>
            <td style="padding: 12px; text-align: center;">${productMap[item.barcode] ? productMap[item.barcode].weight * item.quantity : 0}g</td>
            <td style="padding: 12px; text-align: center;">₱${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
        cartTable.innerHTML += row;
        total += parseFloat(item.price) * item.quantity;
        totalWeight += productMap[item.barcode] ? productMap[item.barcode].weight * item.quantity : 0;
    });

    totalPriceElement.textContent = `Total: ₱${total.toFixed(2)}`;
    totalWeightElement.textContent = `Total Weight: ${totalWeight}g`;
}

// Function to increment quantity
function incrementQuantity(index) {
    scannedItems[index].quantity++;
    updateCart();
}

// Function to decrement quantity
function decrementQuantity(index) {
    if (scannedItems[index].quantity > 1) {
        scannedItems[index].quantity--;
        updateCart();
    }
}

// Function to delete item
function deleteItem(index) {
    scannedItems.splice(index, 1);
    updateCart();
}

// Function to increment quantity in popup
function incrementQuantityPopup() {
    const quantity = parseInt(document.getElementById('quantity').value);
    document.getElementById('quantity').value = quantity + 1;
}

// Function to decrement quantity in popup
function decrementQuantityPopup() {
    const quantity = parseInt(document.getElementById('quantity').value);
    if (quantity > 1) {
        document.getElementById('quantity').value = quantity - 1;
    }
}

// Function to generate QR codes for large data
function generateQRForLargeData(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous QR codes

    const chunkSize = 2953; // Maximum data size for QR code version 40 with error correction level L
    const chunks = splitData(data, chunkSize);

    chunks.forEach((chunk, index) => {
        const qrCode = document.createElement('div');
        qrCode.id = `qrCode${index}`;
        container.appendChild(qrCode);

        new QRCode(qrCode, {
            text: chunk,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
            encoding: 'UTF-8'
        });

        // Add a separator between QR codes
        if (index < chunks.length - 1) {
            container.appendChild(document.createElement('br'));
        }
    });
}

// Function to save data to a text file
function saveDataToFile(data, filename) {
    const blob = new Blob([data], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function checkout() {
    navigateTo('checkout');
    const cartTable = document.getElementById('cartTable');
    const qrCodeData = [];

    // Get data from cart table
    for (let i = 0; i < scannedItems.length; i++) {
        const item = scannedItems[i];
        const product = productMap[item.barcode] ? productMap[item.barcode].name : 'Unknown Product';
        const quantity = item.quantity;
        const weight = productMap[item.barcode] ? productMap[item.barcode].weight * item.quantity : 0;
        const price = item.price * item.quantity;

        // Format data for QR code and text file
        const dataString = `${product} x ${quantity} - ${weight}g - ₱${price.toFixed(2)}`;
        qrCodeData.push(dataString);
    }

    const dataString = qrCodeData.join('\n');

    // Save data to a text file
    saveDataToFile(dataString, 'cart_data.txt');

    // Split data into smaller chunks
    const chunkSize = 2953; // Maximum data size for QR code version 40 with error correction level L
    const chunks = [];
    for (let i = 0; i < dataString.length; i += chunkSize) {
        chunks.push(dataString.slice(i, i + chunkSize));
    }

    // Generate QR codes for each chunk
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = ''; // Clear previous QR code

    chunks.forEach((chunk, index) => {
        const qrCode = document.createElement('div');
        qrCode.id = `qrCode${index}`;
        qrCodeContainer.appendChild(qrCode);

        new QRCode(qrCode, {
            text: chunk,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.L,
            encoding: 'UTF-8',
            version: 40
        });

        // Add a separator between QR codes
        if (index < chunks.length - 1) {
            qrCodeContainer.appendChild(document.createElement('br'));
        }
    });
}

// Function to close QR popup
function closeQRPopup() {
    navigateTo('start');
    scannedItems = []; // Reset scanned items array

    // Reset cart table
    const cartTable = document.getElementById('cartTable');
    cartTable.innerHTML = '';

    // Reset total price
    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.textContent = 'Total: ₱0.00';

    // Reset total weight
    const totalWeightElement = document.getElementById('totalWeight');
    totalWeightElement.textContent = 'Total Weight: 0g';

    // Hide the proceed button
    document.getElementById('proceed-button').style.display = 'none';

    lastScannedTime = 0; // Reset last scanned time
}

// Function to proceed to cart
function proceedToCart() {
    navigateTo('cart');
}

// Inside the last inline script (index 4)
// ... existing code ...

// Add this code at the end of the script:
const canvas = document.querySelector('canvas.drawingBuffer');
if (canvas) {
  canvas.style.width = '100%';a
}

// Initialize scanner when page loads
window.onload = () => navigateTo('start');
