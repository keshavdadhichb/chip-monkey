// ==========================================
// Google Apps Script - Finance & Journal Backend
// ==========================================
// Instructions:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code into Code.gs
// 4. Click Deploy > New Deployment
// 5. Select type: "Web App"
// 6. Description: "v1"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (Required for local development to access it without OAuth flow)
// 9. Copy the "Web App URL" and provide it to the frontend.
// ==========================================

const SHEET_ID = '1pfvierNDVc0Nv1WU47mxS7yKl4KQ4eSbuIEn2qpjo5I'; // Setup your Sheet ID

function doGet(e) {
  const op = e.parameter.op;
  
  if (op === 'get_all') {
    return getContent();
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid op'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const op = data.op;
    
    if (op === 'add_transaction') {
      return addTransaction(data.transaction);
    } else if (op === 'update_journal') {
      return updateJournal(data.entry);
    }
    
    return jsonResponse({status: 'error', message: 'Invalid op'});
  } catch (err) {
    return jsonResponse({status: 'error', message: err.toString()});
  }
}

// Read all data
function getContent() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // 1. Transactions
  const txnSheet = ensureSheet(ss, 'Transactions', ['Date', 'Type', 'Category', 'Amount', 'From_Account', 'To_Account', 'Notes', 'Timestamp']);
  const txnData = txnSheet.getDataRange().getValues();
  const headers = txnData.shift(); // remove headers
  const transactions = txnData.map(row => ({
    date: row[0],
    type: row[1],
    category: row[2],
    amount: row[3],
    fromAccount: row[4],
    toAccount: row[5],
    notes: row[6],
    id: row[7]
  }));

  // 2. Balances (Optional - calculated on frontend usually, but good to have snapshots)
  // For now we just return transactions and let frontend compute "Current State"
  
  // 3. Journal
  const journalSheet = ensureSheet(ss, 'Journal', ['Date', 'Text_Entry', 'Diet', 'Fitness', 'Productive', 'Business', 'StockMarket', 'Tech', 'Md', 'Mood', 'Social']);
  const jData = journalSheet.getDataRange().getValues();
  jData.shift();
  const journalInfo = jData.map(row => ({
    date: row[0], // String YYYY-MM-DD
    text: row[1],
    habits: {
      diet: row[2],
      fitness: row[3],
      productive: row[4],
      business: row[5],
      stockMarket: row[6],
      tech: row[7],
      md: row[8],
      mood: row[9],
      social: row[10]
    }
  }));

  return jsonResponse({
    status: 'success',
    data: {
      transactions: transactions,
      journal: journalInfo
    }
  });
}

// Add Transaction
function addTransaction(txn) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Transactions');
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([
    txn.date,
    txn.type,
    txn.category,
    txn.amount,
    txn.fromAccount,
    txn.toAccount,
    txn.notes,
    timestamp
  ]);
  
  return jsonResponse({status: 'success', message: 'Transaction added'});
}

// Update Journal (Upsert)
function updateJournal(entry) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Journal');
  const data = sheet.getDataRange().getValues();
  
  // Find if date exists (Column A)
  let rowIndex = -1;
  // Skip header
  for (let i = 1; i < data.length; i++) {
    // Check Date string match
    // entry.date should be YYYY-MM-DD
    // sheet date might be Date object or string. We assume formatting ensures standardized string usage or we compare formatted.
    // Ideally user sends 'YYYY-MM-DD'.
    const rowDate = data[i][0]; 
    if (formatDate(rowDate) === entry.date) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }
  
  const rowData = [
    entry.date,
    entry.text,
    entry.habits.diet,
    entry.habits.fitness,
    entry.habits.productive,
    entry.habits.business,
    entry.habits.stockMarket,
    entry.habits.tech,
    entry.habits.md,
    entry.habits.mood,
    entry.habits.social
  ];
  
  if (rowIndex > 0) {
    // Update existing
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Append new
    sheet.appendRow(rowData);
  }
  
  return jsonResponse({status: 'success', message: 'Journal updated'});
}

// ———————————————— Helpers ————————————————

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function formatDate(dateInput) {
  // Simple helper to try and match YYYY-MM-DD
  if (!dateInput) return '';
  if (typeof dateInput === 'string') return dateInput; 
  // If it's a Google Sheet Date object:
  try {
     return Utilities.formatDate(dateInput, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return dateInput.toString();
  }
}
