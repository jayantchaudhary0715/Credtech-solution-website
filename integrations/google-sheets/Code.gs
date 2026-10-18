// Credtech website forms -> Google Sheet.
// Each form subject gets its own tab. Columns come from the form field names.
var NOTIFY_EMAIL = 'info@credtechsolutions.com'; // set to '' to turn off email alerts

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = e.parameter || {};
    if (p._gotcha) {
      return reply({ ok: true });
    }

    var tabName = String(p._subject || 'Website enquiry');
    tabName = tabName.split('/').join(' ').split(':').join(' ').split('?').join(' ');
    tabName = tabName.split('*').join(' ').split('[').join(' ').split(']').join(' ');
    tabName = tabName.substring(0, 90);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }

    var keys = [];
    for (var k in p) {
      if (k !== '_gotcha' && k !== '_subject') {
        keys.push(k);
      }
    }

    var header = ['Received'];
    if (sheet.getLastColumn() > 0) {
      header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    for (var i = 0; i < keys.length; i++) {
      if (header.indexOf(keys[i]) < 0) {
        header.push(keys[i]);
      }
    }
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    var row = [];
    for (var j = 0; j < header.length; j++) {
      if (j === 0) {
        row.push(new Date());
      } else {
        var v = p[header[j]] === undefined ? '' : String(p[header[j]]);
        var first = v.charAt(0);
        if (first === '=' || first === '+' || first === '-' || first === '@') {
          v = "'" + v; // stop formula injection from visitors
        }
        row.push(v);
      }
    }
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      var lines = [];
      for (var m = 0; m < keys.length; m++) {
        lines.push(keys[m] + ': ' + p[keys[m]]);
      }
      MailApp.sendEmail(NOTIFY_EMAIL, 'New: ' + tabName, lines.join('\n'));
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply({ ok: true, service: 'credtech-forms' });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
