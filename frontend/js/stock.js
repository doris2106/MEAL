console.log('✅ stock.js LOADED v3 - top of file');

/**
 * Stock Management Module
 * Handles inventory/stock management UI and API integration
 */

const STOCK_API_URL = 'http://localhost:5000/api/stock';

/**
 * Load all stock items
 */
async function loadStockItems() {
  try {
    console.log('loadStockItems: Starting...');
    const token = localStorage.getItem('token');
    console.log('loadStockItems: Token available:', !!token);
    
    const response = await fetch(STOCK_API_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log('loadStockItems: HTTP Status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('loadStockItems: Data received:', data);
    console.log('loadStockItems: data.success =', data.success, ', data.data length =', data.data?.length);

    if (data.success && Array.isArray(data.data)) {
      console.log(`loadStockItems: Displaying ${data.data.length} items`);
      displayStockItems(data.data);
      updateStockSummary(data.data);
      console.log('loadStockItems: Complete');
    } else {
      console.error('loadStockItems: Invalid response format or API returned error:', data);
      showAlert('Failed to load stock data - invalid response', 'error');
    }
  } catch (error) {
    console.error('loadStockItems: ERROR -', error);
    console.error('loadStockItems: Error stack:', error.stack);
    showAlert(`Failed to load stock data: ${error.message}`, 'error');
  }
}

/**
 * Add new stock item
 */
async function addStockItem() {
  const itemName = document.getElementById('stockItem').value;
  const quantity = document.getElementById('stockQty').value;

  // Validation
  if (!itemName) {
    showAlert('Please select an item', 'warning');
    return;
  }

  if (!quantity || parseFloat(quantity) <= 0) {
    showAlert('Quantity must be greater than 0', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(STOCK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        itemName,
        addedQty: parseFloat(quantity),
        unit: 'kg',
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert(`${itemName} added successfully!`, 'success');
      document.getElementById('stockItem').value = '';
      document.getElementById('stockQty').value = '';
      await loadStockItems();
    } else {
      showAlert(data.message || 'Failed to add stock', 'error');
    }
  } catch (error) {
    console.error('Error adding stock:', error);
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Update used quantity for a stock item
 */
async function useStock(stockId, itemName) {
  const qty = prompt(`How much ${itemName} was used? (kg)`, '0');

  if (!qty || parseFloat(qty) <= 0) {
    showAlert('Invalid quantity', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${STOCK_API_URL}/use/${stockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        usedQty: parseFloat(qty),
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Stock usage updated!', 'success');
      await loadStockItems();
    } else {
      showAlert(data.message || 'Failed to update stock', 'error');
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Delete stock item
 */
async function deleteStockItem(stockId, itemName) {
  if (!confirm(`Delete ${itemName} from stock?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${STOCK_API_URL}/${stockId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Stock item deleted!', 'success');
      await loadStockItems();
    } else {
      showAlert(data.message || 'Failed to delete stock', 'error');
    }
  } catch (error) {
    console.error('Error deleting stock:', error);
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Display stock items in table
 */
function displayStockItems(stocks) {
  console.log('displayStockItems: Starting with', stocks);
  const tbody = document.getElementById('stockTableBody');
  
  if (!tbody) {
    console.error('displayStockItems: ERROR - stockTableBody element NOT found in DOM');
    console.error('displayStockItems: Checking if stockTable exists:', !!document.getElementById('stockTable'));
    console.error('displayStockItems: Checking if stockView exists:', !!document.getElementById('stockView'));
    return;
  }
  
  console.log('displayStockItems: stockTableBody found, proceeding...');

  if (!stocks || stocks.length === 0) {
    console.log('displayStockItems: No stocks to display (empty or null)');
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem;">No stock items yet</td>
      </tr>
    `;
    console.log('displayStockItems: Empty state HTML set');
    return;
  }

  console.log(`displayStockItems: Processing ${stocks.length} stock items`);
  
  const rowsHTML = stocks
    .map(
      (stock) => `
    <tr>
      <td><strong>${stock.itemName}</strong></td>
      <td>${parseFloat(stock.addedQty).toFixed(2)}</td>
      <td>${parseFloat(stock.usedQty).toFixed(2)}</td>
      <td style="color: #27ae60; font-weight: bold;">${parseFloat(stock.remainingQty).toFixed(2)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-small" onclick="useStock('${stock._id}', '${stock.itemName}')">
            🍽️ Use
          </button>
          <button class="btn btn-small btn-danger" onclick="deleteStockItem('${stock._id}', '${stock.itemName}')">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
    `
    )
    .join('');
  
  console.log(`displayStockItems: Generated HTML (${rowsHTML.length} chars):`, rowsHTML.substring(0, 200) + '...');
  tbody.innerHTML = rowsHTML;
  console.log('displayStockItems: Table innerHTML updated successfully');
}

/**
 * Update stock summary cards
 */
function updateStockSummary(stocks) {
  console.log('updateStockSummary: Starting with', stocks);
  const totalAdded = stocks.reduce((sum, item) => sum + item.addedQty, 0);
  const totalUsed = stocks.reduce((sum, item) => sum + item.usedQty, 0);
  const totalRemaining = stocks.reduce((sum, item) => sum + item.remainingQty, 0);
  
  console.log(`updateStockSummary: Totals - Added: ${totalAdded}, Used: ${totalUsed}, Remaining: ${totalRemaining}`);

  const totalAddedQtyEl = document.getElementById('totalAddedQty');
  const totalUsedQtyEl = document.getElementById('totalUsedQty');
  const totalRemainingQtyEl = document.getElementById('totalRemainingQty');

  console.log('updateStockSummary: Elements found -', {
    totalAddedQtyEl: !!totalAddedQtyEl,
    totalUsedQtyEl: !!totalUsedQtyEl,
    totalRemainingQtyEl: !!totalRemainingQtyEl
  });

  if (totalAddedQtyEl) {
    totalAddedQtyEl.textContent = totalAdded.toFixed(2);
    console.log('updateStockSummary: Set totalAddedQty to', totalAdded.toFixed(2));
  } else {
    console.warn('updateStockSummary: totalAddedQty element not found');
  }
  
  if (totalUsedQtyEl) {
    totalUsedQtyEl.textContent = totalUsed.toFixed(2);
    console.log('updateStockSummary: Set totalUsedQty to', totalUsed.toFixed(2));
  } else {
    console.warn('updateStockSummary: totalUsedQty element not found');
  }
  
  if (totalRemainingQtyEl) {
    totalRemainingQtyEl.textContent = totalRemaining.toFixed(2);
    console.log('updateStockSummary: Set totalRemainingQty to', totalRemaining.toFixed(2));
  } else {
    console.warn('updateStockSummary: totalRemainingQty element not found');
  }
  
  console.log('updateStockSummary: Complete');
}

// Initialize stock view on page load
document.addEventListener('DOMContentLoaded', () => {
  // Stock view will be loaded when tab is switched
});
